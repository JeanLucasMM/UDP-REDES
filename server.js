const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

app.use(express.static(path.join(__dirname, 'public')));

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Novo cliente conectado');

  ws.on('message', (message) => {
    console.log(`Mensagem recebida: ${message}`);
    for (let client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Cliente desconectado');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
