const WebSocket = require('ws');

// Config simulating the Extension
const GATEWAY_URL = "ws://127.0.0.1:18789"; // Testing local port first to bypass Cloudflare for logic check
const TOKEN = "b5b2560e5484e01615681d30470fac5d82d792d849d230ce";

const ws = new WebSocket(GATEWAY_URL);

ws.on('open', function open() {
  console.log('Connected to Gateway');

  // Step 1: Handshake (Exact protocol from docs)
  const handshake = {
    type: "req",
    id: "req-1",
    method: "connect",
    params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: { id: "openclaw-control-ui", version: "1.2.3", platform: "browser", mode: "ui" },
        role: "operator",
        scopes: ["operator.read", "operator.write"],
        auth: { token: TOKEN }
    }
  };

  console.log('Sending Handshake:', JSON.stringify(handshake));
  ws.send(JSON.stringify(handshake));
});

ws.on('message', function incoming(data) {
  const msg = JSON.parse(data);
  console.log('Received:', msg);

  if (msg.type === 'res' && msg.id === 'req-1' && msg.ok) {
      console.log('✅ Handshake SUCCESS!');
      
      // Step 2: Try sending a message
      const chatMsg = {
          type: "req",
          id: "req-2",
          method: "agent.chat",
          params: {
              message: "Test message from Script",
              label: "main"
          }
      };
      console.log('Sending Chat:', JSON.stringify(chatMsg));
      ws.send(JSON.stringify(chatMsg));
  }
});

ws.on('error', (err) => {
    console.error('❌ Error:', err.message);
});
