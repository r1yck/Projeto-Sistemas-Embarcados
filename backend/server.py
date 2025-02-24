from fastapi import FastAPI
import serial
import json

app = FastAPI()

# Configuração da porta serial do Arduino
try:
    arduino = serial.Serial("COM3", 9600, timeout=1)  # Altere "COM3" conforme necessário
    ARDUINO_CONECTADO = True
except:
    ARDUINO_CONECTADO = False

# Tarifa fixa (pode ser alterada conforme necessário)
TARIFA_KWH = 0.824  # R$ por kWh

@app.get("/status")
def verificar_status():
    return {"conectado": ARDUINO_CONECTADO}

@app.get("/dados")
def obter_dados():
    if not ARDUINO_CONECTADO:
        return {"corrente": 0, "potencia": 0}

    try:
        arduino.write(b"GET_DADOS\n")  # Envia comando para o Arduino
        linha = arduino.readline().decode().strip()  # Lê a resposta
        if linha:
            dados = json.loads(linha)
            corrente = dados.get("corrente", 0)
            potencia = dados.get("potencia", 0)

            return {
                "corrente": corrente,
                "potencia": potencia,
                "tensao": 220,  # Tensão fixa
            }
    except Exception as e:
        print("Erro ao obter dados:", e)

    return {"corrente": 0, "potencia": 0}

@app.get("/consumo")
def calcular_consumo(potencia: float, tempo_horas: float):
    if potencia <= 0:
        return {"consumo": 0, "valor": 0}

    consumo_kWh = (potencia * tempo_horas) / 1000
    valor = consumo_kWh * TARIFA_KWH

    return {"consumo": round(consumo_kWh, 6), "valor (R$)": round(valor, 2)}

