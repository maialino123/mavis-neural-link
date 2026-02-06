const GATEWAY_URL = "wss://bot.ecomatehome.com";
const TOKEN = "b5b2560e5484e01615681d30470fac5d82d792d849d230ce";

let ws = null;
let reqId = 1;

function connect() {
    ws = new WebSocket(GATEWAY_URL);
    
    ws.onopen = () => {
        // Step 1: Protocol Connect (Handshake)
        sendRequest("connect", {
            minProtocol: 3,
            maxProtocol: 3,
            client: { id: "mavis-extension", version: "1.2.0", platform: "browser", mode: "operator" },
            role: "operator",
            scopes: ["operator.read", "operator.write"],
            auth: { token: TOKEN }
        });
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("In:", data);
        
        // Handle handshake success
        if (data.type === "res" && data.payload?.type === "hello-ok") {
            document.getElementById('status-dot').classList.add('online');
            addMessage("Neural Link Established.", "mavis");
        }
        
        // Handle incoming messages from Mavis
        if (data.type === "event" && data.event === "agent.message") {
            addMessage(data.payload.text, 'mavis');
        }
    };

    ws.onclose = () => {
        document.getElementById('status-dot').classList.remove('online');
        setTimeout(connect, 3000);
    };
}

function sendRequest(method, params) {
    const id = `req-${reqId++}`;
    ws.send(JSON.stringify({ type: "req", id, method, params }));
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
    if (text && ws && ws.readyState === WebSocket.OPEN) {
        // Step 2: Send User Message via Protocol
        sendRequest("agent.chat", {
            message: text,
            label: "main"
        });
        addMessage(text, 'boss');
        input.value = '';
    }
};

connect();
