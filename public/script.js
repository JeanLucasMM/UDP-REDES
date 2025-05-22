const socket = new WebSocket('ws://localhost:3000');

const usersList = document.getElementById('users-list');
const newUserInput = document.getElementById('new-user-name');
const addUserBtn = document.getElementById('add-user-btn');

const chatDiv = document.getElementById('chat');
const msgInput = document.getElementById('msg');
const userSelect = document.getElementById('user-select');

let users = ['EuJean'];
let messages = [];

function renderUsers() {
  usersList.innerHTML = '';
  for (const user of users) {
    const li = document.createElement('li');
    li.textContent = user;
    li.classList.add('user-item');
    li.title = `Usuário: ${user}`;
    usersList.appendChild(li);
  }
}

function renderUserSelect() {
  userSelect.innerHTML = '';
  for (const user of users) {
    const option = document.createElement('option');
    option.value = user;
    option.textContent = user;
    userSelect.appendChild(option);
  }
}

function renderMessages() {
  chatDiv.innerHTML = '';
  for (const msg of messages) {
    const msgEl = document.createElement('div');
    msgEl.classList.add('chat-message');

    const time = new Date(msg.timestamp).toLocaleTimeString();
    msgEl.innerHTML = `
      <span class="chat-room">[${msg.room}]</span>
      <span class="chat-time">[${time}]</span>
      <span class="chat-text">${sanitize(msg.text)}</span>
    `;

    chatDiv.appendChild(msgEl);
  }
  chatDiv.scrollTop = chatDiv.scrollHeight;
}

function sanitize(text) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

addUserBtn.addEventListener('click', () => {
  const newUser = newUserInput.value.trim();
  if (!newUser) return alert('Digite o nome do usuário!');
  if (users.includes(newUser)) return alert('Usuário já existe!');

  users.push(newUser);
  newUserInput.value = '';
  renderUsers();
  renderUserSelect();
});

msgInput.addEventListener('keypress', e => {
  if (e.key === 'Enter' && msgInput.value.trim()) {
    const messageObj = {
      room: userSelect.value,
      text: msgInput.value.trim(),
      timestamp: new Date().toISOString(),
    };
    socket.send(JSON.stringify(messageObj));
    addMessageLocally(messageObj);
    msgInput.value = '';
  }
});

socket.addEventListener('message', event => {
  try {
    const messageObj = JSON.parse(event.data);
    addMessageLocally(messageObj);
  } catch (err) {
    console.error('Erro ao reseber mensagem:', err);
  }
});

function addMessageLocally(messageObj) {
  messages.push(messageObj);
  renderMessages();
}

renderUsers();
renderUserSelect();
