// Shared UI helpers: modal + toast
const UI = {
  toast(message, type = 'info') {
    let host = document.getElementById('toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'toast-host';
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 250); }, 2600);
  },

  // Resolves to the modal body element when confirmed, otherwise null.
  modal({ title, bodyHtml = '', confirmText = 'Onayla', danger = false, hideCancel = false }) {
    return new Promise(resolve => {
      const overlay = document.getElementById('modal-overlay');
      const body = document.getElementById('modal-body');
      const confirmBtn = document.getElementById('modal-confirm');
      const cancelBtn = document.getElementById('modal-cancel');
      const closeBtn = overlay.querySelector('.modal-close');
      document.getElementById('modal-title').textContent = title;
      body.innerHTML = bodyHtml;
      confirmBtn.textContent = confirmText;
      confirmBtn.className = danger ? 'btn-danger' : 'btn-primary';
      cancelBtn.style.display = hideCancel ? 'none' : '';
      overlay.classList.remove('hidden');
      const first = body.querySelector('input, textarea, select');
      if (first) setTimeout(() => first.focus(), 30);

      const done = ok => {
        overlay.classList.add('hidden');
        confirmBtn.onclick = cancelBtn.onclick = closeBtn.onclick = overlay.onclick = null;
        document.removeEventListener('keydown', onKey);
        resolve(ok ? body : null);
      };
      const onKey = e => {
        if (e.key === 'Escape') done(false);
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') done(true);
      };
      document.addEventListener('keydown', onKey);
      confirmBtn.onclick = () => done(true);
      cancelBtn.onclick = closeBtn.onclick = () => done(false);
      overlay.onclick = e => { if (e.target === overlay) done(false); };
    });
  },

  confirm(title, message, confirmText = 'Evet', danger = true) {
    return this.modal({ title, bodyHtml: `<p>${Utils.escapeHtml(message)}</p>`, confirmText, danger })
      .then(r => !!r);
  },

  async prompt(title, label, value = '', confirmText = 'Kaydet') {
    const body = await this.modal({
      title, confirmText,
      bodyHtml: `<label class="field"><span>${Utils.escapeHtml(label)}</span>
        <input type="text" id="prompt-input" value="${Utils.escapeHtml(value)}"></label>`
    });
    return body ? body.querySelector('#prompt-input').value.trim() : null;
  }
};
