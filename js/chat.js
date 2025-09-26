(function () {
  // Basic DOM guards
  const msgsEl = document.getElementById('msgs');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');

  if (!msgsEl || !form || !input) {
    console.error('Chat init error: missing #msgs, #chat-form, or #chat-input');
    return;
  }

  // Stable session per browser
  const SID_KEY = 'automators_sid';
  let sid = localStorage.getItem(SID_KEY) || (crypto.randomUUID?.() || String(Date.now()));
  try { localStorage.setItem(SID_KEY, sid); } catch (_) {}

  function addBubble(role, text) {
    const el = document.createElement('div');
    el.className = 'bubble ' + (role === 'me' ? 'me' : 'bot');
    el.textContent = text;
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return el;
  }

  addBubble('bot', 'Hi! I’m your site assistant. Ask me about Automators.');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = (input.value || '').trim();
    if (!text) return;

    addBubble('me', text);
    input.value = '';

    const typing = addBubble('bot', '…');

    try {
      if (!window.N8N_URL) {
        typing.textContent = '(N8N_URL is not set in js/config.js)';
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      if (window.API_KEY) headers['X-API-Key'] = window.API_KEY; // optional (adds preflight)

      const res = await fetch(window.N8N_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: sid,
          messages: [{ text: { body: text } }]
        })
      });

      const reply = await res.text();
      typing.textContent = reply || '(no response)';
    } catch (err) {
      console.error(err);
      typing.textContent = '(error, try again)';
    }
  });
})();
