const GATEWAY_URL = "wss://bot.ecomatehome.com";
const RELAY_URL = "wss://relay.ecomatehome.com/extension";
const TOKEN = "b5b2560e5484e01615681d30470fac5d82d792d849d230ce";

let chatWs = null;
let relayWs = null;

function connectChat() {
    chatWs = new WebSocket(GATEWAY_URL);
    chatWs.onopen = () => {
        document.getElementById('status-dot').classList.add('online');
        chatWs.send(JSON.stringify({ kind: "auth", token: TOKEN }));
    };
    chatWs.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.kind === "message") addMessage(data.text, 'mavis');
    };
    chatWs.onclose = () => {
        document.getElementById('status-dot').classList.remove('online');
        setTimeout(connectChat, 3000);
    };
}

function connectRelay() {
    relayWs = new WebSocket(RELAY_URL);
    relayWs.onopen = () => {
        console.log("Relay connected");
        relayWs.send(JSON.stringify({ kind: "auth", token: TOKEN }));
    };
    relayWs.onclose = () => setTimeout(connectRelay, 3000);
}

document.getElementById('send').onclick = () => {
    const input = document.getElementById('input');
    const text = input.value;
    if (text && chatWs && chatWs.readyState === WebSocket.OPEN) {
        chatWs.send(JSON.stringify({ kind: "agentTurn", message: text }));
        addMessage(text, 'boss');
        input.value = '';
    }
};

function addMessage(text, role) {
    const chat = document.getElementById('chat');
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

connectChat();
connectRelay();
