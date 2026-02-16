/* Loot Generator — DMG-style treasure tables */
const Loot = (() => {
  let data = null;

  async function init() {
    try {
      const res = await fetch('data/loot-tables.json');
      data = await res.json();
    } catch { console.error('Failed to load loot tables'); }
  }

  function roll(sides) { return Math.floor(Math.random() * sides) + 1; }

  function rollDice(expr) {
    // Parse "2d6×100" or "1d6+2" style
    const m = expr.match(/(\d+)?d(\d+)(?:×(\d+))?(?:([+-]\d+))?/i);
    if (!m) return 0;
    const n = parseInt(m[1]) || 1, s = parseInt(m[2]), mult = parseInt(m[3]) || 1, bonus = parseInt(m[4]) || 0;
    let total = 0;
    for (let i = 0; i < n; i++) total += roll(s);
    return (total + bonus) * mult;
  }

  function parseCoins(text) {
    // Parse strings like "5d6 CP" or "4d6×100 CP, 1d6×10 EP"
    const parts = text.split(',').map(s => s.trim());
    const result = [];
    parts.forEach(p => {
      const m = p.match(/([\dd×+]+)\s+(CP|SP|EP|GP|PP)/i);
      if (m) {
        const amount = rollDice(m[1]);
        result.push({ amount, type: m[2].toUpperCase() });
      }
    });
    return result;
  }

  function pickGems(value, count) {
    const pool = data.gems[String(value)];
    if (!pool) return [];
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return result;
  }

  function pickArt(value, count) {
    const pool = data.art[String(value)];
    if (!pool) return [];
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return result;
  }

  function pickMagicItems(table, count) {
    const pool = data.magicTables[table];
    if (!pool) return [];
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return result;
  }

  function generateIndividual() {
    if (!data) return;
    const tier = document.getElementById('lootTier').value;
    const tierData = data.individual[tier];
    if (!tierData) return;

    const d100 = roll(100);
    let lootText = '';
    for (const entry of tierData.coins) {
      if (d100 >= entry.roll[0] && d100 <= entry.roll[1]) {
        lootText = entry.loot;
        break;
      }
    }

    const coins = parseCoins(lootText);
    const html = `
      <div class="loot-header">💰 Tesoro Individual (${tierData.label})</div>
      <div class="loot-roll">d100 = ${d100}</div>
      <div class="loot-coins">${coins.map(c => `<span class="coin coin-${c.type.toLowerCase()}">${c.amount} ${c.type}</span>`).join(' ')}</div>
    `;
    showResult(html);
    SFX.click();
    Bus.emit('dice:rolled', { formula: `Loot Individual ${tierData.label}`, total: d100, breakdown: lootText });
  }

  function generateHoard() {
    if (!data) return;
    const tier = document.getElementById('lootTier').value;
    const hoardData = data.hoard[tier];
    if (!hoardData) {
      showResult(`<div class="loot-header">⚠️ Hoard no disponible para ${tier}</div><p>Solo disponible para CR 0-4 y CR 5-10.</p>`);
      return;
    }

    const baseCoins = parseCoins(hoardData.base_coins);
    const d100 = roll(100);
    let extraText = '';
    for (const entry of hoardData.extras) {
      if (d100 >= entry.roll[0] && d100 <= entry.roll[1]) {
        extraText = entry.loot;
        break;
      }
    }

    // Parse extras for gems/art/magic
    let extraHtml = '';
    if (extraText !== 'Nada extra') {
      extraHtml = `<div class="loot-extra"><strong>Extras:</strong> ${extraText}</div>`;
    }

    const html = `
      <div class="loot-header">🏴‍☠️ Tesoro Hoard (${hoardData.label})</div>
      <div class="loot-roll">d100 = ${d100}</div>
      <div class="loot-coins">${baseCoins.map(c => `<span class="coin coin-${c.type.toLowerCase()}">${c.amount} ${c.type}</span>`).join(' ')}</div>
      ${extraHtml}
    `;
    showResult(html);
    SFX.click();
  }

  function generateMagicItem() {
    if (!data) return;
    const table = document.getElementById('lootMagicTable').value;
    const items = pickMagicItems(table, 1);
    if (!items.length) return;

    const rarityMap = { A: 'Common', B: 'Uncommon', C: 'Rare', D: 'Very Rare', F: 'Uncommon', G: 'Rare', H: 'Very Rare' };
    const rarity = rarityMap[table] || 'Unknown';
    const rarityClass = rarity.toLowerCase().replace(' ', '-');

    const html = `
      <div class="loot-header">✨ Item Mágico (Tabla ${table})</div>
      <div class="loot-magic-item rarity-${rarityClass}">
        <span class="item-name">${items[0]}</span>
        <span class="item-rarity">${rarity}</span>
      </div>
    `;
    showResult(html);
    SFX.click();
  }

  function quickLoot() {
    if (!data) return;
    const tier = document.getElementById('lootTier').value;
    const tierData = data.individual[tier];
    if (!tierData) return;

    // Generate both individual coins and a random magic item
    const d100 = roll(100);
    let lootText = '';
    for (const entry of tierData.coins) {
      if (d100 >= entry.roll[0] && d100 <= entry.roll[1]) {
        lootText = entry.loot;
        break;
      }
    }
    const coins = parseCoins(lootText);

    // Random magic table based on tier
    const tableTierMap = { '0-4': 'A', '5-10': 'B', '11-16': 'C', '17+': 'D' };
    const table = tableTierMap[tier] || 'A';
    const hasItem = roll(100) <= 30; // 30% chance of magic item
    const item = hasItem ? pickMagicItems(table, 1)[0] : null;

    // Random gems
    const hasGems = roll(100) <= 40;
    const gemValues = ['10', '50', '100', '500'];
    const gemVal = gemValues[Math.min(Math.floor(Math.random() * 4), Object.keys(data.individual).indexOf(tier))];
    const gemCount = hasGems ? rollDice('1d4') : 0;
    const gems = hasGems ? pickGems(gemVal, gemCount) : [];

    let html = `
      <div class="loot-header">⚡ Quick Loot (${tierData.label})</div>
      <div class="loot-coins">${coins.map(c => `<span class="coin coin-${c.type.toLowerCase()}">${c.amount} ${c.type}</span>`).join(' ')}</div>
    `;
    if (gems.length) {
      html += `<div class="loot-gems">💎 Gemas (${gemVal} GP c/u): ${gems.join(', ')}</div>`;
    }
    if (item) {
      html += `<div class="loot-magic-item">✨ ${item}</div>`;
    }
    if (!gems.length && !item) {
      html += `<div class="loot-nothing">Solo monedas esta vez.</div>`;
    }
    showResult(html);
    SFX.click();
  }

  function showResult(html) {
    const el = document.getElementById('lootResult');
    if (!el) return;
    el.innerHTML = html;
    el.style.display = 'block';
    el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'fadeIn 0.3s';
  }

  return { init, generateIndividual, generateHoard, generateMagicItem, quickLoot };
})();
