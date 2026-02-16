// === SESSION JOURNAL + THREAD TRACKER ===
const Journal = (() => {
  const JKEY = 'ttrpg_journal';
  const TKEY = 'ttrpg_threads';
  let sessions = [];
  let activeSessionId = null;
  let threads = { threads: [], npcs: [] };
  let autoLog = localStorage.getItem('ttrpg_autolog') !== '0';
  let entryFilter = '';
  let entryTypeFilter = 'all';

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

  function renameSession(id) {
    const s = sessions.find(x => x.id === id);
    if (!s) return;
    const name = prompt('Nuevo nombre:', s.name);
    if (!name || name === s.name) return;
    s.name = name;
    save();
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
          <div class="js-name">${escHtml(s.name)}</div>
          <div class="js-meta">${d} — ${s.entries.length} entradas</div>
        </div>
        <div class="js-acts" onclick="event.stopPropagation()">
          <button class="btn btn-small btn-secondary btn-rename" onclick="Journal.renameSession('${s.id}')" title="Renombrar">✏️</button>
          <button class="btn btn-small btn-secondary" onclick="Journal.exportSession('${s.id}')" title="Exportar">📄</button>
          <button class="btn btn-small btn-danger" onclick="Journal.deleteSession('${s.id}')" title="Eliminar">✕</button>
        </div>
      </div>`;
    }).join('');
  }

  function openSession(id) {
    activeSessionId = id;
    entryFilter = '';
    entryTypeFilter = 'all';
    const searchEl = document.getElementById('entrySearch');
    if (searchEl) searchEl.value = '';
    const typeEl = document.getElementById('entryTypeFilter');
    if (typeEl) typeEl.value = 'all';
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

  function editEntry(entryId) {
    const s = sessions.find(x => x.id === activeSessionId);
    if (!s) return;
    const e = s.entries.find(x => x.id === entryId);
    if (!e) return;
    const textEl = document.getElementById('etext-' + entryId);
    if (textEl) {
      // Already in edit mode — save
      return;
    }
    // Switch to edit mode
    const container = document.getElementById('ebody-' + entryId);
    if (!container) return;
    container.innerHTML = `<textarea class="entry-edit-area" id="etext-${entryId}">${escHtml(e.text)}</textarea>
      <div class="entry-edit-btns">
        <button class="btn btn-small btn-primary" onclick="Journal.saveEdit('${entryId}')">Guardar</button>
        <button class="btn btn-small btn-secondary" onclick="Journal.cancelEdit()">Cancelar</button>
      </div>`;
    document.getElementById('etext-' + entryId).focus();
  }

  function saveEdit(entryId) {
    const s = sessions.find(x => x.id === activeSessionId);
    if (!s) return;
    const e = s.entries.find(x => x.id === entryId);
    if (!e) return;
    const textEl = document.getElementById('etext-' + entryId);
    if (!textEl) return;
    const newText = textEl.value.trim();
    if (!newText) return;
    e.text = newText;
    save();
    renderEntries();
  }

  function cancelEdit() {
    renderEntries();
  }

  function filterEntries(term) {
    entryFilter = term.toLowerCase();
    renderEntries();
  }

  function filterEntriesByType(type) {
    entryTypeFilter = type;
    renderEntries();
  }

  function renderEntries() {
    const el = document.getElementById('entryTimeline');
    const s = sessions.find(x => x.id === activeSessionId);
    if (!s) { el.innerHTML = '<div style="text-align:center;color:var(--text3);padding:20px">Selecciona una sesion</div>'; return; }
    if (!s.entries.length) { el.innerHTML = '<div style="text-align:center;color:var(--text3);padding:20px">Sesion vacia. Agrega entradas.</div>'; return; }
    const icons = { narrativa: '📖', oraculo: '🔮', tirada: '🎲', nota: '📝', combate: '⚔️' };

    let entries = s.entries;
    if (entryTypeFilter !== 'all') {
      entries = entries.filter(e => e.type === entryTypeFilter);
    }
    if (entryFilter) {
      entries = entries.filter(e => e.text.toLowerCase().includes(entryFilter));
    }

    if (!entries.length) {
      el.innerHTML = '<div style="text-align:center;color:var(--text3);padding:20px">Sin resultados para el filtro actual.</div>';
      return;
    }

    el.innerHTML = entries.map(e => {
      const t = new Date(e.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return `<div class="entry-item entry-${e.type}">
        <div class="entry-header">
          <span class="entry-icon">${icons[e.type] || '📝'}</span>
          <span class="entry-type">${e.type}</span>
          <span class="entry-time">${t}</span>
          <button class="entry-edit" onclick="event.stopPropagation();Journal.editEntry('${e.id}')" title="Editar">✏️</button>
          <button class="entry-del" onclick="Journal.deleteEntry('${e.id}')" title="Eliminar">✕</button>
        </div>
        <div class="entry-text" id="ebody-${e.id}">${highlightSearch(escHtml(e.text).replace(/\n/g, '<br>'))}</div>
      </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  }

  function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function highlightSearch(html) {
    if (!entryFilter) return html;
    const safe = entryFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return html.replace(new RegExp(`(${safe})`, 'gi'), '<mark>$1</mark>');
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
      threads.npcs.forEach(n => {
        md += `- ${n.removed ? '~~' : ''}${n.name}${n.removed ? '~~' : ''} ${n.removed ? '(eliminado)' : ''}`;
        if (n.note) md += ` — ${n.note}`;
        md += '\n';
      });
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
    threads.npcs.push({ id: 'n-' + Date.now(), name, removed: false, note: '' });
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

  function editNPCNote(id) {
    const n = threads.npcs.find(x => x.id === id);
    if (!n) return;
    const note = prompt('Nota sobre ' + n.name + ':', n.note || '');
    if (note === null) return;
    n.note = note;
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
          <div style="flex:1;min-width:0">
            <span class="thread-name" onclick="Journal.toggleNPC('${n.id}')" title="Click para ${n.removed ? 'reactivar' : 'marcar eliminado'}">👤 ${escHtml(n.name)}</span>
            ${n.note ? `<div class="npc-note" onclick="Journal.editNPCNote('${n.id}')" title="Click para editar nota">${escHtml(n.note)}</div>` : `<div class="npc-note npc-note-empty" onclick="Journal.editNPCNote('${n.id}')" title="Agregar nota">+ nota</div>`}
          </div>
          <button onclick="Journal.deleteNPC('${n.id}')" class="thread-del">✕</button>
        </div>`
      ).join('');
    }
  }

  return {
    init, newSession, renameSession, openSession, deleteSession,
    addEntry, deleteEntry, editEntry, saveEdit, cancelEdit,
    filterEntries, filterEntriesByType, exportSession,
    addThread, resolveThread, deleteThread,
    addNPC, toggleNPC, deleteNPC, editNPCNote,
    setAutoLog, isAutoLog
  };
})();
