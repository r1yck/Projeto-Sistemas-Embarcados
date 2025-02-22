import { useEffect, useState } from "react";
import { verificarArduino, fetchDados, calcularConsumo } from "./components/Medicao";
import styles from "./styles.module.css";

function App() {
  const [dados, setDados] = useState(null);
  const [arduinoConectado, setArduinoConectado] = useState(null);
  const [consumo, setConsumo] = useState(null);

  useEffect(() => {
    const checkArduino = async () => {
      const conectado = await verificarArduino();
      setArduinoConectado(conectado);
    };

    const updateDados = async () => {
      if (arduinoConectado) {
        const novosDados = await fetchDados();
        setDados(novosDados);
      }
    };

    checkArduino();
    const intervalArduino = setInterval(checkArduino, 5000);

    if (arduinoConectado) {
      updateDados();
      const intervalDados = setInterval(updateDados, 2000);
      return () => clearInterval(intervalDados);
    }

    return () => clearInterval(intervalArduino);
  }, [arduinoConectado]);

  const handleCalcularConsumo = () => {
    if (dados && dados.potencia) {
      const resultado = calcularConsumo(dados.potencia, 1); // Considerando 1h de uso
      setConsumo(resultado);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Contador Elétrico</h1>

      <div className={styles.box}>
        <p><strong>Corrente:</strong> 5.0 A</p> {/* Campo fixo */}

        {!arduinoConectado && (
          <p className={styles.alert}>⚠ Conecte o Arduino para ver os dados!</p>
        )}

        {arduinoConectado && dados && (
          <>
            <p><strong>Tensão:</strong> {dados.tensao?.toFixed(2) || 0} V</p>
            <p><strong>Potência:</strong> {dados.potencia?.toFixed(2) || 0} W</p>

            {/* O botão só aparece se o Arduino estiver conectado */}
            {arduinoConectado && (
              <button className={styles.button} onClick={handleCalcularConsumo}>
                Calcular Consumo
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
