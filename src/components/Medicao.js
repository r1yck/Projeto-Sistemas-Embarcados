import axios from "axios";

// Função para verificar se o Arduino está conectado
export async function verificarArduino() {
  try {
    const response = await axios.get("http://localhost:8000/status");
    return response.data.conectado;
  } catch (error) {
    console.error("Erro ao verificar conexão com o Arduino:", error);
    return false;
  }
}

// Função para buscar os dados do Arduino
export async function fetchDados() {
  try {
    const response = await axios.get("http://localhost:8000/dados");
    return response.data;
  } catch (error) {
    console.error("Erro ao obter dados:", error);
    return null;
  }
}

// Função para calcular o consumo e o valor em R$
export function calcularConsumo(potencia, tempo_horas, tarifa_kWh = 0.824) {
  if (!potencia || potencia <= 0) return { consumo: 0, valor: 0 };
  
  const consumo_kWh = (potencia * tempo_horas) / 1000;
  const valor_R$ = consumo_kWh * tarifa_kWh;

  return { consumo: consumo_kWh.toFixed(6), valor: valor_R$.toFixed(2) };
}
