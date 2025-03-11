import { useEffect, useState } from "react";
import { verificarArduino, fetchDados, calcularConsumo } from "./components/Medicao";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./App.css";
import logo from "./assets/logo.png";
import superChoque from "./assets/superchoque.png";

function App() {
  const [dados, setDados] = useState(null);
  const [arduinoConectado, setArduinoConectado] = useState(false);
  const [consumo, setConsumo] = useState(null);
  const [tempo, setTempo] = useState(0);
  const [medindo, setMedindo] = useState(false);
  const [historicoPotencia, setHistoricoPotencia] = useState([]);
  const [valorPorMinuto, setValorPorMinuto] = useState(null); // Estado para valor por minuto

  // Verifica a conexão com o Arduino a cada 5 segundos
  useEffect(() => {
    const checkArduino = async () => {
      try {
        const conectado = await verificarArduino();
        setArduinoConectado(conectado); // Atualiza diretamente o estado
      } catch (error) {
        console.error("Erro ao verificar Arduino:", error);
      }
    };

    checkArduino();
    const intervalArduino = setInterval(checkArduino, 5000);
    return () => clearInterval(intervalArduino);
  }, []);

  // Atualiza os dados do Arduino a cada 2 segundos
  useEffect(() => {
    const updateDados = async () => {
      if (arduinoConectado) {
        try {
          const novosDados = await fetchDados();
          if (novosDados && novosDados.corrente) {
            setDados(novosDados);
            const potenciaCalculada = 220 * novosDados.corrente;
            setHistoricoPotencia((prev) => [
              ...prev.slice(-50), 
              { tempo, potencia: potenciaCalculada },
            ]);
          }
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        }
      }
    };

    const intervalDados = setInterval(updateDados, 2000);
    return () => clearInterval(intervalDados);
  }, [arduinoConectado, tempo]);

  // Controla o incremento do tempo durante a medição
  useEffect(() => {
    let interval;
    if (medindo) {
      interval = setInterval(() => {
        setTempo((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setTempo(0); // Reseta o tempo quando a medição é parada
    }
    return () => clearInterval(interval);
  }, [medindo]);

  const handleCalcularConsumo = async () => {
    if (dados && dados.corrente && tempo > 0) {
      const potencia = 220 * dados.corrente; // Potência em W
      const tempoEmHoras = tempo / 3600; // Convertendo tempo de segundos para horas
      const resultado = await calcularConsumo(potencia, tempoEmHoras);
  
      // Verifique o que está sendo retornado
      console.log("Resultado do cálculo de consumo:", resultado);
  
      setConsumo(resultado);
  
      // Verifique se o valor do consumo e o tempo são válidos antes de calcular o valor por minuto
      if (resultado && resultado['valor (R$)'] && tempo > 0) {
        console.log("Valor retornado pelo backend:", resultado['valor (R$)']);
  
        // Calcula o valor por minuto
        const valorPorMinutoCalculado = (resultado['valor (R$)'] / tempo) * 60;
        console.log("Valor por minuto calculado:", valorPorMinutoCalculado);
  
        // Formata o valor para 6 casas decimais
        const valorPorMinutoFormatado = valorPorMinutoCalculado.toFixed(6);
        console.log("Valor por minuto formatado:", valorPorMinutoFormatado);
  
        setValorPorMinuto(valorPorMinutoFormatado); // Atualiza o estado com o valor formatado
      } else {
        setValorPorMinuto("0.000000"); // Se o valor for inválido ou muito pequeno, define como 0.000000
      }
    }
  };
  
  
  return (
    <div className="app-container">
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="title">WattsUP - Medidor de Consumo</h1>
        <img src={superChoque} alt="Super Choque" className="super-choque" />
      </header>

      <div className="content">
        <div className="left-panel">
          <div className="display-bcd">{dados?.corrente ? (220 * dados.corrente).toFixed(2) : "--"} W</div>
          <div className="display-cronometro">{tempo}</div>
          <div className="chart-container" style={{ backgroundColor: 'black', padding: '20px', borderRadius: '10px' }}>
            <Line
              data={{
                labels: historicoPotencia.map((d) => d.tempo),
                datasets: [{
                  label: "Potência (W)",
                  data: historicoPotencia.map((d) => d.potencia),
                  borderColor: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  fill: true,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      color: 'white',
                    },
                  },
                  tooltip: {
                    bodyColor: 'white',
                    backgroundColor: 'black',
                    titleColor: 'white',
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      color: 'white',
                    },
                    grid: {
                      color: 'gray',
                    },
                  },
                  y: {
                    ticks: {
                      color: 'white',
                    },
                    grid: {
                      color: 'gray',
                    },
                  },
                },
                elements: {
                  line: {
                    borderColor: 'white',
                  },
                  point: {
                    borderColor: 'white',
                    backgroundColor: 'white',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="right-panel">
          <div className={`box ${dados ? 'visible' : ''}`}>
            <p><strong>Volts:</strong> 220V</p>
            <p><strong>Corrente:</strong> {dados?.corrente?.toFixed(2) || "--"} A</p>
            <p><strong>Potência:</strong> {dados?.corrente ? (220 * dados.corrente).toFixed(2) : "--"} W</p>
            <p><strong>Tempo de Medição:</strong> {tempo} s</p>
            {!arduinoConectado && <p className="alert">⚠ Conecte o Arduino para ver os dados reais!</p>}
            {arduinoConectado && (
              <>
                {!medindo ? (
                  <button className="button" onClick={() => setMedindo(true)}>Iniciar Medição</button>
                ) : (
                  <button className="button" onClick={() => {
                    setMedindo(false);
                    handleCalcularConsumo();
                  }}>Parar Medição</button>
                )}
                {consumo && (
                  <>
                    <p><strong>Consumo:</strong> {consumo.consumo} kWh</p>
                    <p><strong>Valor:</strong> R$ 0,821/kWh</p>
                    {valorPorMinuto && (
                      <p className="valor-minuto"><strong>Esse equipamento gasta:</strong> R$ {valorPorMinuto} por minuto</p>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
