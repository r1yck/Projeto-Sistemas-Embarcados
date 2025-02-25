import { useEffect, useState } from "react";
import { verificarArduino, fetchDados, calcularConsumo } from "./components/Medicao";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./App.css";
import logo from "./assets/logo.png";
import superChoque from "./assets/superchoque.png";

function App() {
  const [dados, setDados] = useState(null);
  const [arduinoConectado, setArduinoConectado] = useState(null);
  const [consumo, setConsumo] = useState(null);
  const [tempo, setTempo] = useState(0);
  const [medindo, setMedindo] = useState(false);
  const [historicoPotencia, setHistoricoPotencia] = useState([]);

  useEffect(() => {
    const checkArduino = async () => {
      const conectado = await verificarArduino();
      setArduinoConectado(conectado);
    };
    checkArduino();
    const intervalArduino = setInterval(checkArduino, 5000);
    return () => clearInterval(intervalArduino);
  }, []);

  useEffect(() => {
    const updateDados = async () => {
      if (arduinoConectado) {
        const novosDados = await fetchDados();
        setDados(novosDados);
        if (novosDados?.corrente) {
          const potenciaCalculada = 220 * novosDados.corrente;
          setHistoricoPotencia((prev) => [...prev.slice(-50), { tempo, potencia: potenciaCalculada }]);
        }
      }
    };
    const intervalDados = setInterval(updateDados, 2000);
    return () => clearInterval(intervalDados);
  }, [arduinoConectado, tempo]);

  useEffect(() => {
    let interval;
    if (medindo) {
      interval = setInterval(() => {
        setTempo((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [medindo]);

  const handleCalcularConsumo = () => {
    if (dados && dados.corrente) {
      const potencia = 220 * dados.corrente;
      const resultado = calcularConsumo(potencia, tempo / 3600);
      setConsumo(resultado);
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
                    <p><strong>Valor:</strong> R$ {consumo.valor}</p>
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
