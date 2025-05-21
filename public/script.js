const socket = new WebSocket('ws://localhost:3000');

const roomsList = document.getElementById('rooms-list');
const newRoomInput = document.getElementById('new-room-name');
const addRoomBtn = document.getElementById('add-room-btn');

const chatDiv = document.getElementById('chat');
const msgInput = document.getElementById('msg');

let currentRoom = '';
const messages = {};

function renderRooms() {
  roomsList.innerHTML = '';
  for (const room of Object.keys(messages)) {
    const li = document.createElement('li');
    li.textContent = room;
    li.dataset.room = room;
    li.classList.toggle('active', room === currentRoom);
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      changeRoom(room);
    });
    roomsList.appendChild(li);
  }
}

function renderMessages() {
  chatDiv.innerHTML = '';
  if (!messages[currentRoom]) return;
  for (const msg of messages[currentRoom]) {
    const div = document.createElement('div');
    div.textContent = msg;
    chatDiv.appendChild(div);
  }
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

function changeRoom(room) {
  currentRoom = room;
  renderRooms();
  renderMessages();
}

addRoomBtn.addEventListener('click', () => {
  const roomName = newRoomInput.value.trim();
  if (!roomName) return alert('Digite um nome para a sala!');
  if (messages[roomName]) {
    alert('Essa sala já existe!');
    return;
  }
  messages[roomName] = [];
  newRoomInput.value = '';
  changeRoom(roomName);
});

msgInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && msgInput.value.trim() !== '') {
    const text = msgInput.value.trim();
    const messageObj = {
      room: currentRoom,
      text,
      timestamp: new Date().toISOString(),
    };
    socket.send(JSON.stringify(messageObj));
    addMessageLocally(messageObj);
    msgInput.value = '';
  }
});

socket.addEventListener('message', (event) => {
  try {
    const messageObj = JSON.parse(event.data);
    addMessageLocally(messageObj);
  } catch (err) {
    console.error('Erro ao receber mensagem:', err);
  }
});

function addMessageLocally(messageObj) {
  const { room, text, timestamp } = messageObj;
  if (!messages[room]) messages[room] = [];
  const time = new Date(timestamp).toLocaleTimeString();
  messages[room].push(`[${time}] ${text}`);

  if (room === currentRoom) {
    renderMessages();
  }
}

