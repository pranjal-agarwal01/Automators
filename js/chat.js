import { N8N_URL, API_KEY } from './config.js';

const msgsEl = document.getElementById('msgs');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');

const SID_KEY = 'automators_sid';
const sid = localStorage.getItem(SID_KEY) || (crypto.randomUUID?.() || String(Date.now()));
localStorage.setItem(SID_KEY, sid);

function add(role, text){
  const el = document.createElement('div');
  el.className = 'bubble ' + (role === 'me' ? 'me' : 'bot');
  el.innerText = text;
  msgsEl.appendChild(el);
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

add('bot','Hi! I’m your site assistant. Ask me about Automators.');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  add('me', text);
  input.value = '';

  const typing = document.createElement('div');
  typing.className = 'bubble bot';
  typing.innerText = '…';
  msgsEl.appendChild(typing);
  msgsEl.scrollTop = msgsEl.scrollHeight;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (API_KEY) headers['X-API-Key'] = API_KEY; // optional shared secret (adds preflight)

    const r = await fetch(N8N_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sessionId: sid,
        messages: [{ text: { body: text } }]
      })
    });
    const reply = await r.text();
    typing.innerText = reply || '(no response)';
  } catch (err) {
    typing.innerText = '(error, try again)';
  }
});
