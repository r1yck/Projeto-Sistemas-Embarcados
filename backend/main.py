from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import serial

app = FastAPI()

# Adicionando o CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permite apenas o frontend local
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos HTTP
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

# Tarifa fixa (pode ser alterada conforme necessário)
TARIFA_KWH = 0.824  # R$ por kWh

# Variável para armazenar a conexão serial
arduino = None

# Função para garantir que a conexão está aberta
def obter_conexao_arduino():
    global arduino
    try:
        if arduino is None or not arduino.is_open:
            arduino = serial.Serial("COM3", 9600, timeout=1)  # Altere "COM3" conforme necessário
        return arduino
    except serial.SerialException:
        return None

# Função para verificar se o Arduino está conectado
def verificar_arduino():
    arduino = obter_conexao_arduino()
    return arduino is not None

@app.get("/status")
def verificar_status():
    conectado = verificar_arduino()
    return {"conectado": conectado}

@app.get("/dados")
def obter_dados():
    arduino = obter_conexao_arduino()
    if arduino is None:
        return {"corrente": 0, "potencia": 0, "tensao": 127}

    try:
        linha = arduino.readline().decode().strip()
        print(f"Linha recebida do Arduino: {linha}")  # Linha para depuração
        
        # O Arduino envia os dados no formato "Corrente=1.20A, Potencia=152.81W"
        dados = linha.split(", ")  # Separar pela vírgula
        corrente = 0
        potencia = 0
        
        if len(dados) == 2:
            corrente_str = dados[0].split('=')[1].replace('A', '').strip()
            potencia_str = dados[1].split('=')[1].replace('W', '').strip()
            
            try:
                corrente = float(corrente_str)
                potencia = float(potencia_str)
            except ValueError:
                print(f"Erro de conversão: Corrente={corrente_str}, Potencia={potencia_str}")

        return {
            "corrente": corrente,
            "potencia": potencia,
            "tensao": 127,  # Tensão fixa de acordo com o código Arduino
        }
    except Exception as e:
        print(f"Erro ao obter dados: {e}")
        return {"corrente": 0, "potencia": 0, "tensao": 127}

TARIFA_KWH = 0.821  # Defina o valor da tarifa de energia em R$/kWh (ajuste conforme necessário)

@app.get("/consumo")
def calcular_consumo(potencia: float, tempo_horas: float):
    if potencia <= 0 or tempo_horas <= 0:
        return {"consumo": 0, "valor (R$)": 0}

    # Cálculo do consumo em kWh
    consumo_kWh = (potencia * tempo_horas) / 1000
    
    # Cálculo do valor baseado na tarifa
    valor = consumo_kWh * TARIFA_KWH

    return {"consumo": round(consumo_kWh, 6), "valor (R$)": round(valor, 6)}
