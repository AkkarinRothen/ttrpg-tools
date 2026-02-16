// === MYTHIC-STYLE ORACLE ===
const Oracle = (() => {
  let data = null;
  let chaos = 5;
  let selectedLikelihood = '5050';
  const CHAOS_KEY = 'ttrpg_oracle_chaos';

  async function init() {
    try {
      const res = await fetch('data/oracle-tables.json');
      data = await res.json();
    } catch { console.error('Failed to load oracle tables'); return; }
    try { chaos = parseInt(localStorage.getItem(CHAOS_KEY) || '5'); } catch { chaos = 5; }
    renderChaosMeter();
    renderLikelihood();
  }

  function renderLikelihood() {
    const el = document.getElementById('oracleLikelihood');
    if (!data) return;
    const keys = Object.keys(data.likelihood);
    el.innerHTML = keys.map(k => {
      const l = data.likelihood[k];
      return `<button class="oracle-btn${k === selectedLikelihood ? ' active' : ''}" onclick="Oracle.setLikelihood('${k}')">${l.label}</button>`;
    }).join('');
  }

  function setLikelihood(k) {
    selectedLikelihood = k;
    renderLikelihood();
  }

  function ask() {
    if (!data) return;
    const threshold = data.likelihood[selectedLikelihood].threshold;
    // Chaos factor modifies threshold: higher chaos = more likely yes
    const adjusted = Math.min(99, Math.max(1, threshold + (chaos - 5) * 5));
    const roll = Math.floor(Math.random() * 100) + 1;

    let answer, isYes, isExceptional = false, hasEvent = false;

    if (roll <= adjusted) {
      isYes = true;
      // Exceptional: doubles under threshold (11, 22, 33...)
      if (roll % 11 === 0 && roll <= adjusted) isExceptional = true;
      answer = isExceptional ? 'Si Excepcional!' : 'Si';
    } else {
      isYes = false;
      if (roll % 11 === 0 && roll > adjusted) isExceptional = true;
      answer = isExceptional ? 'No Excepcional!' : 'No';
    }

    // Random event: if roll is doubles (11,22,33...) or within chaos range
    if (roll <= chaos * 2 || (roll % 11 === 0)) {
      hasEvent = true;
    }

    const resEl = document.getElementById('oracleResult');
    const ansEl = document.getElementById('oracleAnswer');
    const evEl = document.getElementById('oracleEvent');
    const detEl = document.getElementById('oracleDetail');

    ansEl.textContent = answer;
    ansEl.className = 'oracle-answer ' + (isYes ? 'yes' : 'no') + (isExceptional ? ' exceptional' : '');
    detEl.textContent = `Tirada: ${roll} vs umbral ${adjusted} (base ${threshold}, caos ${chaos})`;

    if (hasEvent) {
      const focus = pick(data.eventFocus);
      evEl.textContent = `⚡ Evento Aleatorio: ${focus}`;
      evEl.style.display = 'block';
    } else {
      evEl.style.display = 'none';
    }

    resEl.style.borderColor = isYes ? 'var(--green)' : 'var(--accent)';
    resEl.style.animation = 'none'; resEl.offsetHeight; resEl.style.animation = 'fadeIn 0.3s';
    SFX.click();
    Bus.emit('oracle:answered', { answer, roll, threshold: adjusted, chaos, event: hasEvent ? evEl.textContent : null });
  }

  function rollMeaning() {
    if (!data) return;
    const action = pick(data.actionWords);
    const subject = pick(data.subjectWords);
    document.getElementById('meaningWords').textContent = `${action} + ${subject}`;
    const el = document.getElementById('meaningResult');
    el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'fadeIn 0.3s';
    SFX.click();
    Bus.emit('oracle:meaning', { action, subject });
  }

  function sceneCheck() {
    if (!data) return;
    const roll = Math.floor(Math.random() * 10) + 1;
    const resEl = document.getElementById('oracleAnswer');
    const detEl = document.getElementById('oracleDetail');
    const evEl = document.getElementById('oracleEvent');

    if (roll <= chaos) {
      // Altered or interrupted
      if (roll % 2 === 0) {
        resEl.textContent = 'Escena Interrumpida';
        resEl.className = 'oracle-answer no exceptional';
        evEl.textContent = '⚡ ' + data.sceneAdjust[1];
      } else {
        resEl.textContent = 'Escena Alterada';
        resEl.className = 'oracle-answer no';
        evEl.textContent = '⚠ ' + data.sceneAdjust[0];
      }
      evEl.style.display = 'block';
    } else {
      resEl.textContent = 'Escena Normal';
      resEl.className = 'oracle-answer yes';
      evEl.style.display = 'none';
    }
    detEl.textContent = `Tirada: ${roll} vs caos ${chaos}`;
    document.getElementById('oracleResult').style.borderColor = roll <= chaos ? 'var(--accent)' : 'var(--green)';
  }

  function setChaos(v) {
    chaos = Math.min(9, Math.max(1, v));
    localStorage.setItem(CHAOS_KEY, chaos);
    renderChaosMeter();
  }

  function renderChaosMeter() {
    const pips = document.querySelectorAll('.chaos-pip');
    const val = document.getElementById('chaosVal');
    pips.forEach((p, i) => {
      p.className = 'chaos-pip' + (i < chaos ? ' filled' : '') + (i < chaos && chaos >= 7 ? ' high' : '');
    });
    if (val) val.textContent = chaos;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  return { init, ask, rollMeaning, sceneCheck, setLikelihood, setChaos };
})();
