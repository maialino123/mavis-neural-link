const GATEWAY_URL = "wss://bot.ecomatehome.com";
const TOKEN = "b5b2560e5484e01615681d30470fac5d82d792d849d230ce";

let ws = null;

function connect() {
    ws = new WebSocket(GATEWAY_URL);
    
    ws.onopen = () => {
        document.getElementById('status-dot').classList.add('online');
        // Auth immediately
        ws.send(JSON.stringify({
            kind: "auth",
            token: TOKEN
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.kind === "message") {
            addMessage(data.text, 'mavis');
        }
    };

    ws.onclose = () => {
        document.getElementById('status-dot').classList.remove('online');
        setTimeout(connect, 3000);
    };
}

function addMessage(text, role) {
    const chat = document.getElementById('chat');
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

document.getElementById('send').onclick = () => {
    const input = document.getElementById('input');
    const text = input.value;
    if (text && ws) {
        ws.send(JSON.stringify({
            kind: "agentTurn",
            message: text
        }));
        addMessage(text, 'boss');
        input.value = '';
    }
};

connect();
