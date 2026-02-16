// === SESSION JOURNAL + THREAD TRACKER ===
const Journal = (() => {
  const JKEY = 'ttrpg_journal';
  const TKEY = 'ttrpg_threads';
  let sessions = [];
  let activeSessionId = null;
  let threads = { threads: [], npcs: [] };
  let autoLog = localStorage.getItem('ttrpg_autolog') !== '0';

  function init() {
    try { sessions = JSON.parse(localStorage.getItem(JKEY) || '[]'); } catch { sessions = []; }
    try { threads = JSON.parse(localStorage.getItem(TKEY) || '{"threads":[],"npcs":[]}'); } catch { threads = { threads: [], npcs: [] }; }
    renderSessions();
    renderThreads();
    Bus.on('dice:rolled', d => autoLogEntry('tirada', `${d.formula} = ${d.total}${d.nat20 ? ' (NAT 20!)' : ''}${d.nat1 ? ' (NAT 1!)' : ''}`));
    Bus.on('oracle:answered', d => autoLogEntry('oraculo', `${d.answer} (d100=${d.roll} vs ${d.threshold})${d.event ? ' | ' + d.event : ''}`));
    Bus.on('oracle:meaning', d => autoLogEntry('oraculo', `Significado: ${d.action} + ${d.subject}`));
    Bus.on('cof:rolled', d => autoLogEntry('tirada', d.text));
  }

  function autoLogEntry(type, text) {
    if (!autoLog || !activeSessionId) return;
    const s = sessions.find(x => x.id === activeSessionId);
    if (!s) return;
    s.entries.push({ id: 'e-' + Date.now(), type, text: '[Auto] ' + text, time: Date.now() });
    save();
    renderEntries();
    renderSessions();
  }

  function setAutoLog(on) { autoLog = on; localStorage.setItem('ttrpg_autolog', on ? '1' : '0'); }
  function isAutoLog() { return autoLog; }

  function save() { localStorage.setItem(JKEY, JSON.stringify(sessions)); }
  function saveThreads() { localStorage.setItem(TKEY, JSON.stringify(threads)); }

  // === SESSIONS ===
  function newSession() {
    const name = prompt('Nombre de la sesion:', `Sesion ${sessions.length + 1}`);
    if (!name) return;
    const s = { id: 's-' + Date.now(), name, created: Date.now(), entries: [] };
    sessions.unshift(s);
    save();
    openSession(s.id);
    renderSessions();
  }

  function renderSessions() {
    const el = document.getElementById('sessionList');
    if (!sessions.length) {
      el.innerHTML = '<div style="text-align:center;color:var(--text3);padding:20px;font-size:0.88em">No hay sesiones. Crea una para comenzar.</div>';
      return;
    }
    el.innerHTML = sessions.map(s => {
      const d = new Date(s.created).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
      const active = s.id === activeSessionId;
      return `<div class="journal-session${active ? ' active' : ''}" onclick="Journal.openSession('${s.id}')">
        <div class="js-info">
          <div class="js-name">${s.name}</div>
          <div class="js-meta">${d} — ${s.entries.length} entradas</div>
        </div>
        <div class="js-acts" onclick="event.stopPropagation()">
          <button class="btn btn-small btn-secondary" onclick="Journal.exportSession('${s.id}')" title="Exportar">📄</button>
          <button class="btn btn-small btn-danger" onclick="Journal.deleteSession('${s.id}')" title="Eliminar">✕</button>
        </div>
      </div>`;
    }).join('');
  }

  function openSession(id) {
    activeSessionId = id;
    renderSessions();
    renderEntries();
    document.getElementById('journalEntryPanel').style.display = 'block';
  }

  function deleteSession(id) {
    if (!confirm('Eliminar esta sesion y todas sus entradas?')) return;
    sessions = sessions.filter(s => s.id !== id);
    if (activeSessionId === id) { activeSessionId = null; document.getElementById('journalEntryPanel').style.display = 'none'; }
    save();
    renderSessions();
    renderEntries();
  }

  // === ENTRIES ===
  function addEntry() {
    const s = sessions.find(x => x.id === activeSessionId);
    if (!s) return;
    const type = document.getElementById('entryType').value;
    const text = document.getElementById('entryText').value.trim();
    if (!text) return;
    s.entries.push({ id: 'e-' + Date.now(), type, text, time: Date.now() });
    document.getElementById('entryText').value = '';
    save();
    renderEntries();
    renderSessions();
  }

  function deleteEntry(entryId) {
    const s = sessions.find(x => x.id === activeSessionId);
    if (!s) return;
    s.entries = s.entries.filter(e => e.id !== entryId);
    save();
    renderEntries();
  }

  function renderEntries() {
    const el = document.getElementById('entryTimeline');
    const s = sessions.find(x => x.id === activeSessionId);
    if (!s) { el.innerHTML = '<div style="text-align:center;color:var(--text3);padding:20px">Selecciona una sesion</div>'; return; }
    if (!s.entries.length) { el.innerHTML = '<div style="text-align:center;color:var(--text3);padding:20px">Sesion vacia. Agrega entradas.</div>'; return; }
    const icons = { narrativa: '📖', oraculo: '🔮', tirada: '🎲', nota: '📝', combate: '⚔️' };
    el.innerHTML = s.entries.map(e => {
      const t = new Date(e.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return `<div class="entry-item entry-${e.type}">
        <div class="entry-header">
          <span class="entry-icon">${icons[e.type] || '📝'}</span>
          <span class="entry-type">${e.type}</span>
          <span class="entry-time">${t}</span>
          <button class="entry-del" onclick="Journal.deleteEntry('${e.id}')" title="Eliminar">✕</button>
        </div>
        <div class="entry-text">${e.text.replace(/\n/g, '<br>')}</div>
      </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  }

  // === EXPORT ===
  function exportSession(id) {
    const s = sessions.find(x => x.id === id);
    if (!s) return;
    const icons = { narrativa: '📖', oraculo: '🔮', tirada: '🎲', nota: '📝', combate: '⚔️' };
    let md = `# ${s.name}\n`;
    md += `*${new Date(s.created).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}*\n\n`;
    md += `---\n\n`;
    s.entries.forEach(e => {
      const t = new Date(e.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      md += `### ${icons[e.type] || ''} [${t}] ${e.type.toUpperCase()}\n\n${e.text}\n\n`;
    });
    // Add threads
    if (threads.threads.length) {
      md += `---\n\n## Hilos\n\n`;
      threads.threads.forEach(t => { md += `- ${t.resolved ? '~~' : ''}${t.name}${t.resolved ? '~~' : ''} ${t.resolved ? '(resuelto)' : ''}\n`; });
      md += '\n';
    }
    if (threads.npcs.length) {
      md += `## NPCs\n\n`;
      threads.npcs.forEach(n => { md += `- ${n.removed ? '~~' : ''}${n.name}${n.removed ? '~~' : ''} ${n.removed ? '(eliminado)' : ''}\n`; });
    }
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${s.name.replace(/[^a-z0-9 ]/gi, '').replace(/ +/g, '-')}.md`; a.click();
  }

  // === THREADS ===
  function addThread() {
    const name = prompt('Nombre del hilo/thread:');
    if (!name) return;
    threads.threads.push({ id: 't-' + Date.now(), name, resolved: false });
    saveThreads(); renderThreads();
  }

  function resolveThread(id) {
    const t = threads.threads.find(x => x.id === id);
    if (t) { t.resolved = !t.resolved; saveThreads(); renderThreads(); }
  }

  function deleteThread(id) {
    threads.threads = threads.threads.filter(x => x.id !== id);
    saveThreads(); renderThreads();
  }

  function addNPC() {
    const name = prompt('Nombre del NPC:');
    if (!name) return;
    threads.npcs.push({ id: 'n-' + Date.now(), name, removed: false });
    saveThreads(); renderThreads();
  }

  function toggleNPC(id) {
    const n = threads.npcs.find(x => x.id === id);
    if (n) { n.removed = !n.removed; saveThreads(); renderThreads(); }
  }

  function deleteNPC(id) {
    threads.npcs = threads.npcs.filter(x => x.id !== id);
    saveThreads(); renderThreads();
  }

  function renderThreads() {
    const tEl = document.getElementById('threadList');
    const nEl = document.getElementById('npcList');
    if (!tEl || !nEl) return;

    if (!threads.threads.length) {
      tEl.innerHTML = '<div style="color:var(--text3);font-size:0.82em;padding:8px">Sin hilos activos</div>';
    } else {
      tEl.innerHTML = threads.threads.map(t =>
        `<div class="thread-item${t.resolved ? ' resolved' : ''}">
          <span class="thread-name" onclick="Journal.resolveThread('${t.id}')" title="Click para ${t.resolved ? 'reactivar' : 'resolver'}">${t.resolved ? '✅' : '🔴'} ${t.name}</span>
          <button onclick="Journal.deleteThread('${t.id}')" class="thread-del">✕</button>
        </div>`
      ).join('');
    }

    if (!threads.npcs.length) {
      nEl.innerHTML = '<div style="color:var(--text3);font-size:0.82em;padding:8px">Sin NPCs registrados</div>';
    } else {
      nEl.innerHTML = threads.npcs.map(n =>
        `<div class="thread-item${n.removed ? ' resolved' : ''}">
          <span class="thread-name" onclick="Journal.toggleNPC('${n.id}')" title="Click para ${n.removed ? 'reactivar' : 'marcar eliminado'}">👤 ${n.name}</span>
          <button onclick="Journal.deleteNPC('${n.id}')" class="thread-del">✕</button>
        </div>`
      ).join('');
    }
  }

  return {
    init, newSession, openSession, deleteSession,
    addEntry, deleteEntry, exportSession,
    addThread, resolveThread, deleteThread,
    addNPC, toggleNPC, deleteNPC,
    setAutoLog, isAutoLog
  };
})();
