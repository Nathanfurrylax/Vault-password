document.addEventListener('DOMContentLoaded', () => {
  let accountsData = [];
  let revealedSet = new Set();

  const csvFileInput = document.getElementById('csvFileInput');
  const btnImport = document.getElementById('btnImport');
  const btnDemo = document.getElementById('btnDemo');
  const btnEmptyDemo = document.getElementById('btnEmptyDemo');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const btnHideAll = document.getElementById('btnHideAll');
  const btnClearData = document.getElementById('btnClearData');

  const statTotal = document.getElementById('statTotal');
  const statFiltered = document.getElementById('statFiltered');
  const statRevealed = document.getElementById('statRevealed');

  const emptyState = document.getElementById('emptyState');
  const cardsGrid = document.getElementById('cardsGrid');
  const toastContainer = document.getElementById('toastContainer');

  if (window.lucide) lucide.createIcons();

  btnImport.addEventListener('click', () => csvFileInput.click());
  csvFileInput.addEventListener('change', handleFileSelect);
  btnDemo.addEventListener('click', loadDemoData);
  if (btnEmptyDemo) btnEmptyDemo.addEventListener('click', loadDemoData);

  searchInput.addEventListener('input', renderAccounts);
  sortSelect.addEventListener('change', renderAccounts);
  btnHideAll.addEventListener('click', () => { revealedSet.clear(); renderAccounts(); });
  btnClearData.addEventListener('click', () => {
    if (confirm("Effacer tous les identifiants en mémoire ?")) {
      accountsData = [];
      revealedSet.clear();
      renderAccounts();
    }
  });

  function detectDelimiter(text) {
    const line = text.split(/\r\n|\n|\r/)[0] || '';
    if ((line.match(/;/g) || []).length > (line.match(/,/g) || []).length) return ';';
    if ((line.match(/\t/g) || []).length > (line.match(/,/g) || []).length) return '\t';
    return ',';
  }

  function parseCSV(text) {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const delim = detectDelimiter(text);
    const rows = [];
    let curRow = [], curToken = '', inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i], next = text[i+1];
      if (c === '"') {
        if (inQuotes && next === '"') { curToken += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (c === delim && !inQuotes) {
        curRow.push(curToken.trim()); curToken = '';
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        curRow.push(curToken.trim());
        if (curRow.some(x => x.length > 0)) rows.push(curRow);
        curRow = []; curToken = '';
      } else { curToken += c; }
    }
    if (curToken.length > 0 || curRow.length > 0) {
      curRow.push(curToken.trim());
      if (curRow.some(x => x.length > 0)) rows.push(curRow);
    }

    if (rows.length === 0) throw new Error("Fichier vide");
    const headers = rows[0].map(h => h.toLowerCase().replace(/^["']|["']$/g, '').trim());
    const required = ['name', 'url', 'username', 'password', 'note'];
    const missing = required.filter(f => !headers.includes(f));
    if (missing.length > 0) throw new Error(`Colonnes manquantes: ${missing.join(', ')}`);

    const idxs = {
      name: headers.indexOf('name'),
      url: headers.indexOf('url'),
      user: headers.indexOf('username'),
      pass: headers.indexOf('password'),
      note: headers.indexOf('note')
    };

    return rows.slice(1).map((r, i) => ({
      id: i + 1,
      name: r[idxs.name] || 'Sans nom',
      url: r[idxs.url] || '',
      username: r[idxs.user] || '—',
      password: r[idxs.pass] || '',
      note: r[idxs.note] || ''
    }));
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        accountsData = parseCSV(evt.target.result);
        revealedSet.clear();
        renderAccounts();
        showToast(`${accountsData.length} identifiant(s) chargé(s).`);
      } catch (err) {
        showToast(`Erreur: ${err.message}`);
      }
      csvFileInput.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  }

  function loadDemoData() {
    accountsData = [
      { id: 1, name: "ProtonMail (Démo)", url: "https://mail.proton.me", username: "alex.demo@proton.me", password: "pW9#kL!2$vN8qZ5x", note: "Compte principal démo" },
      { id: 2, name: "GitHub Enterprise (Démo)", url: "https://github.com", username: "dev-vault-demo", password: "ghp_DemoToken1234567890", note: "Token PAT démo" },
      { id: 3, name: "AWS Console (Démo)", url: "https://aws.amazon.com", username: "admin-demo", password: "C3#m9!pL@82xZ$qA", note: "Accès administration" }
    ];
    revealedSet.clear();
    renderAccounts();
    showToast("Démo chargée.");
  }

  function renderAccounts() {
    const q = searchInput.value.toLowerCase().trim();
    let filtered = accountsData.filter(a => 
      !q || a.name.toLowerCase().includes(q) || a.url.toLowerCase().includes(q) || a.username.toLowerCase().includes(q) || a.note.toLowerCase().includes(q)
    );

    statTotal.textContent = accountsData.length;
    statFiltered.textContent = filtered.length;
    statRevealed.textContent = revealedSet.size;

    if (accountsData.length === 0) {
      emptyState.classList.remove('hidden');
      cardsGrid.classList.add('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    cardsGrid.classList.remove('hidden');

    cardsGrid.innerHTML = filtered.map(acc => {
      const isRev = revealedSet.has(acc.id);
      return `
        <article class="account-card">
          <div class="card-header">
            <div class="card-avatar">${escapeHTML(acc.name.charAt(0))}</div>
            <div>
              <h3>${escapeHTML(acc.name)}</h3>
              <a href="${escapeHTML(acc.url)}" target="_blank" rel="noopener" style="font-size:0.8rem; color:var(--text-muted);">${escapeHTML(acc.url)}</a>
            </div>
          </div>
          <div class="card-body">
            <div>
              <span class="field-label">Identifiant</span>
              <div class="field-value-row">
                <span class="field-value">${escapeHTML(acc.username)}</span>
                <button class="btn-icon-only" onclick="navigator.clipboard.writeText('${escapeHTML(acc.username)}')"><i data-lucide="copy" style="width:14px;height:14px;"></i></button>
              </div>
            </div>
            <div>
              <span class="field-label">Mot de passe</span>
              <div class="field-value-row">
                <span class="field-value">${isRev ? escapeHTML(acc.password) : '••••••••••••'}</span>
                <div>
                  <button class="btn-icon-only btn-toggle" data-id="${acc.id}"><i data-lucide="${isRev ? 'eye-off' : 'eye'}" style="width:14px;height:14px;"></i></button>
                  <button class="btn-icon-only" onclick="navigator.clipboard.writeText('${escapeHTML(acc.password)}')"><i data-lucide="key-round" style="width:14px;height:14px;"></i></button>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    document.querySelectorAll('.btn-toggle').forEach(b => {
      b.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        if (revealedSet.has(id)) revealedSet.delete(id); else revealedSet.add(id);
        renderAccounts();
      });
    });
  }

  function escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = msg;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
});
