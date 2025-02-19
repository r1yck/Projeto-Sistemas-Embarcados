# Medidor de Consumo de Energia

Este projeto é um sistema embarcado utilizando **Arduino** para medir o consumo de eletricidade de aparelhos eletrônicos. O sistema conta com um **frontend em React** para exibição dos dados e um **backend em Python** para comunicação com o sensor via porta serial.

## 📌 Funcionalidades
- **Medição de Consumo**: Mede a corrente e potência elétrica de um aparelho.
- **Cálculo de Custo**: Exibe o custo em R$ por kWh.
- **Início da Medição**: Botão para iniciar a medição e contador de tempo.
- **Visualização Gráfica**: Exibição de gráficos de consumo em tempo real.

## 🛠️ Tecnologias Utilizadas

### 🔹 Frontend (React)
- React.js
- Recharts (gráficos)
- Axios (requisições HTTP)
- TailwindCSS ou Material UI (estilização)

### 🔹 Backend (Python)
- Flask (API para comunicação)
- PySerial (comunicação com o Arduino)
- Flask-CORS (para integração com o frontend)

## 🚀 Como Executar o Projeto

### 📌 Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/medidor-consumo.git
cd medidor-consumo
```

### 🔹 Configuração do Backend (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows
pip install flask pyserial flask-cors
python server.py
```
O backend será iniciado em: `http://127.0.0.1:5000`

### 🔹 Configuração do Frontend (React)
```bash
cd medidor-consumo
npm install
npm start
```
O frontend será iniciado em: `http://localhost:3000`

## 📊 Exemplo de Exibição
A interface terá um gráfico mostrando o consumo em tempo real e exibição dos dados coletados do sensor.

## 📜 Licença
Este projeto está sob a licença MIT.