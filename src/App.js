import { useEffect, useState } from "react";
import { verificarArduino, fetchDados, calcularConsumo } from "./components/Medicao";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "./App.css";

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
        if (novosDados?.potencia) {
          setHistoricoPotencia((prev) => [
            ...prev.slice(-50), // Mantém apenas os últimos 50 pontos
            { tempo, potencia: novosDados.potencia },
          ]);
        }
      } else {
        // Simulação de dados quando Arduino não está conectado
        const simulados = { corrente: 5, potencia: 1100 };
        setDados(simulados);
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
    if (dados && dados.potencia) {
      const resultado = calcularConsumo(dados.potencia, tempo / 3600);
      setConsumo(resultado);
    }
  };

  const iniciarMedicao = () => {
    setMedindo(true);
    setTempo(0);
    setHistoricoPotencia([]);
  };

  const pararMedicao = () => {
    setMedindo(false);
    handleCalcularConsumo();
  };

  const data = {
    labels: historicoPotencia.map((d) => d.tempo),
    datasets: [
      {
        label: "Potência (W)",
        data: historicoPotencia.map((d) => d.potencia),
        borderColor: "#61dafb",
        backgroundColor: "rgba(97, 218, 251, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="container">
      <h1 className="title">Medidor de Consumo</h1>
      <div className="display-bcd">{tempo}</div>
      <div className="box">
        <p><strong>Volts:</strong> 220V</p>
        <p><strong>Corrente:</strong> {dados?.corrente?.toFixed(2) || "--"} A</p>
        <p><strong>Potência:</strong> {dados?.potencia?.toFixed(2) || "--"} W</p>
        <p><strong>Tempo de Medição:</strong> {tempo} s</p>

        {!arduinoConectado && (
          <p className="alert">⚠ Conecte o Arduino para ver os dados reais!</p>
        )}

        <div className="chart-container" style={{ width: "100%", height: "400px" }}>
          <Line data={data} />
        </div>

        {arduinoConectado && (
          <>
            {!medindo ? (
              <button className="button" onClick={iniciarMedicao}>
                Iniciar Medição
              </button>
            ) : (
              <button className="button" onClick={pararMedicao}>
                Parar Medição
              </button>
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
  );
}

export default App;
