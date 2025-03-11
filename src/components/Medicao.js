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

export async function calcularConsumo(potencia, tempo_horas) {
  try {
    const response = await axios.get("http://localhost:8000/consumo", {
      params: { potencia, tempo_horas }
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao calcular consumo:", error);
    return { consumo: 0, valor: 0 };
  }
}
