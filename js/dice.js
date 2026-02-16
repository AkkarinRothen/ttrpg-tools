// === DICE ROLLER ===
const Dice = (() => {
  const HKEY = 'ttrpg_dice_history';
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem(HKEY) || '[]'); } catch { hist = []; }

  function parse(f) {
    const m = f.toLowerCase().trim().match(/^(\d*)d(\d+)([\+\-]\d+)?$/);
    if (!m) return null;
    const n = parseInt(m[1] || '1'), s = parseInt(m[2]), mod = parseInt(m[3] || '0');
    if (n > 100 || s > 10000) return null;
    const rolls = [];
    for (let i = 0; i < n; i++) rolls.push(Math.floor(Math.random() * s) + 1);
    const sum = rolls.reduce((a, b) => a + b, 0) + mod;
    return {
      formula: f, total: sum, rolls, modifier: mod,
      breakdown: rolls.join(' + ') + (mod ? ` ${mod > 0 ? '+' : ''}${mod}` : '') + ` = ${sum}`,
      nat20: n === 1 && s === 20 && rolls[0] === 20 && !mod,
      nat1: n === 1 && s === 20 && rolls[0] === 1 && !mod
    };
  }

  function roll(formula) {
    const r = parse(formula);
    if (!r) return;
    showResult(r);
    addHist(r);
  }

  function rollAdv(adv) {
    const a = Math.floor(Math.random() * 20) + 1, b = Math.floor(Math.random() * 20) + 1;
    const kept = adv ? Math.max(a, b) : Math.min(a, b);
    const r = {
      formula: adv ? '2d20 Ventaja' : '2d20 Desventaja', total: kept,
      breakdown: `Tiradas: ${a}, ${b} → ${kept}`,
      nat20: kept === 20, nat1: kept === 1
    };
    showResult(r);
    addHist(r);
  }

  function rollCustom() {
    const inp = document.getElementById('diceInput');
    const v = inp.value.trim();
    if (v) { roll(v); inp.value = ''; }
  }

  function showResult(r) {
    const v = document.getElementById('diceVal'), res = document.getElementById('diceRes');
    v.textContent = r.total;
    v.className = 'dice-val' + (r.nat20 ? ' nat20' : '') + (r.nat1 ? ' nat1' : '');
    res.className = 'dice-result' + (r.nat20 ? ' crit' : '') + (r.nat1 ? ' fail' : '');
    document.getElementById('diceForm').textContent = r.formula;
    const bd = document.getElementById('diceBD');
    if (r.breakdown) { bd.textContent = r.breakdown; bd.classList.add('visible'); }
    else { bd.classList.remove('visible'); }
    v.style.animation = 'none'; v.offsetHeight; v.style.animation = '';
  }

  function addHist(r) {
    hist.unshift({ f: r.formula, t: r.total, n20: r.nat20, n1: r.nat1 });
    if (hist.length > 20) hist.length = 20;
    localStorage.setItem(HKEY, JSON.stringify(hist));
    renderHist();
  }

  function renderHist() {
    const el = document.getElementById('diceHist');
    if (!hist.length) { el.innerHTML = '<div class="dice-hist-empty">No hay tiradas</div>'; return; }
    el.innerHTML = hist.map(h =>
      `<div class="dice-hist-item"><span class="dice-hist-f">${h.f}</span><span class="dice-hist-r${h.n20 ? ' nat20' : ''}${h.n1 ? ' nat1' : ''}">${h.t}</span></div>`
    ).join('');
  }

  function clearHist() { hist = []; localStorage.removeItem(HKEY); renderHist(); }

  function init() { renderHist(); }

  return { roll, rollAdv, rollCustom, clearHist, init };
})();
