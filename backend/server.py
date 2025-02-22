import serial
import time
from fastapi import FastAPI
from pydantic import BaseModel
import serial.tools.list_ports

# Configuração da porta serial (ajuste para a sua porta)
arduino = serial.Serial("COM3", 9600, timeout=1)  # Altere para sua porta, ex: "/dev/ttyUSB0" no Linux
time.sleep(2)  # Aguarda a inicialização do Arduino

app = FastAPI()

# Tenta encontrar o Arduino automaticamente
def encontrar_arduino():
    portas = serial.tools.list_ports.comports()
    for porta in portas:
        if "Arduino" in porta.description:  # Pode variar conforme o modelo
            return porta.device
    return None

@app.get("/status")
def status_arduino():
    porta_arduino = encontrar_arduino()
    if porta_arduino:
        return {"conectado": True, "porta": porta_arduino}
    return {"conectado": False}

# Configuração da corrente fixa (exemplo: 5A)
CORRENTE_FIXA = 5.0  # Ampères
CUSTO_ENERGIA = 0.824  # R$ por kWh

class DadosResposta(BaseModel):
    tensao: float
    corrente: float
    potencia: float
    consumo_kwh: float

@app.get("/dados", response_model=DadosResposta)
def obter_dados():
    try:
        arduino.write(b"t")  # Envia um comando para o Arduino enviar a tensão
        leitura = arduino.readline().decode().strip()  # Lê a resposta
        
        if leitura:
            tensao = float(leitura)
            potencia = tensao * CORRENTE_FIXA  # P = V * I
            consumo_kwh = potencia * (1/3600) * CUSTO_ENERGIA  # Aproximando consumo por segundo
            
            return DadosResposta(
                tensao=tensao,
                corrente=CORRENTE_FIXA,
                potencia=potencia,
                consumo_kwh=consumo_kwh
            )
    except Exception as e:
        return {"erro": str(e)}

# Para rodar a API: uvicorn server:app --reload
