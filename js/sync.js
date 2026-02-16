/* Sync Module — localStorage ↔ Firestore cloud sync */
const Sync = (() => {
  const SYNC_KEYS = [
    'ttrpg_theme', 'ttrpg_autolog', 'ttrpg_mute',
    'ttrpg_dice_history', 'ttrpg_initiative', 'ttrpg_oracle_chaos',
    'ttrpg_custom_tables', 'ttrpg_spells', 'ttrpg_journal', 'ttrpg_threads',
    'cof_character', 'cof_usage_dice', 'cof_grid', 'cof_travel',
    'cof_settlement', 'cof_incursion', 'cof_characters', 'cof_active_char'
  ];
  const META_KEY = 'ttrpg_sync_meta';
  let autoSyncEnabled = false;
  let debounceTimer = null;
  let pendingKeys = new Set();
  let syncing = false;

  function getMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch { return {}; }
  }

  function setMeta(key) {
    const meta = getMeta();
    meta[key] = Date.now();
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }

  function userRef() {
    if (!db || !Auth.isLoggedIn()) return null;
    return db.collection('users').doc(Auth.getUser().uid).collection('data');
  }

  // Push a single key to Firestore
  async function pushKey(key) {
    const ref = userRef();
    if (!ref) return;
    const value = localStorage.getItem(key);
    if (value === null) return;
    await ref.doc(key).set({
      value: value,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  // Push all keys to Firestore
  async function pushAll() {
    const ref = userRef();
    if (!ref) return;
    setSyncStatus('syncing');
    const batch = db.batch();
    SYNC_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        batch.set(ref.doc(key), {
          value: value,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    });
    await batch.commit();
    setSyncStatus('done');
  }

  // Pull all keys from Firestore
  async function pullAll() {
    const ref = userRef();
    if (!ref) return;
    setSyncStatus('syncing');
    const snapshot = await ref.get();
    snapshot.forEach(doc => {
      const key = doc.id;
      if (SYNC_KEYS.includes(key)) {
        localStorage.setItem(key, doc.data().value);
      }
    });
    setSyncStatus('done');
  }

  // Merge: compare timestamps, newest wins
  async function merge() {
    const ref = userRef();
    if (!ref) return;
    setSyncStatus('syncing');

    const meta = getMeta();
    const snapshot = await ref.get();
    const cloudData = {};
    snapshot.forEach(doc => {
      cloudData[doc.id] = doc.data();
    });

    let hadCloudChanges = false;
    const batch = db.batch();

    for (const key of SYNC_KEYS) {
      const localValue = localStorage.getItem(key);
      const localTime = meta[key] || 0;
      const cloud = cloudData[key];

      if (cloud && cloud.updatedAt) {
        const cloudTime = cloud.updatedAt.toMillis ? cloud.updatedAt.toMillis() : 0;

        if (!localValue && cloud.value) {
          // Cloud has data, local doesn't → pull
          localStorage.setItem(key, cloud.value);
          meta[key] = cloudTime;
          hadCloudChanges = true;
        } else if (localValue && !cloud.value) {
          // Local has data, cloud doesn't → push
          batch.set(ref.doc(key), {
            value: localValue,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } else if (cloudTime > localTime) {
          // Cloud is newer → pull
          localStorage.setItem(key, cloud.value);
          meta[key] = cloudTime;
          hadCloudChanges = true;
        } else if (localTime > cloudTime) {
          // Local is newer → push
          batch.set(ref.doc(key), {
            value: localValue,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      } else if (localValue) {
        // No cloud data → push local
        batch.set(ref.doc(key), {
          value: localValue,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    // Save updated meta timestamps before any reload
    localStorage.setItem(META_KEY, JSON.stringify(meta));
    await batch.commit();
    setSyncStatus('done');

    if (hadCloudChanges) {
      // Reload to apply cloud data
      location.reload();
    }
  }

  // Auto-sync: intercept localStorage.setItem
  function enableAutoSync() {
    if (autoSyncEnabled) return;
    autoSyncEnabled = true;

    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      originalSetItem.call(this, key, value);
      if (this === localStorage && SYNC_KEYS.includes(key) && Auth.isLoggedIn()) {
        setMeta(key);
        pendingKeys.add(key);
        debouncedPush();
      }
    };
  }

  function debouncedPush() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      if (!Auth.isLoggedIn() || pendingKeys.size === 0) return;
      const ref = userRef();
      if (!ref) return;
      setSyncStatus('syncing');
      const batch = db.batch();
      for (const key of pendingKeys) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          batch.set(ref.doc(key), {
            value: value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      pendingKeys.clear();
      try {
        await batch.commit();
        setSyncStatus('done');
      } catch (e) {
        console.error('Sync push error:', e);
        setSyncStatus('error');
      }
    }, 2000);
  }

  // Manual sync button
  async function syncNow() {
    if (!Auth.isLoggedIn()) { alert('Inicia sesion primero'); return; }
    try {
      await merge();
    } catch (e) {
      console.error('Manual sync error:', e);
      alert('Error de sync: ' + e.message);
    }
  }

  // UI status indicator
  function setSyncStatus(status) {
    syncing = status === 'syncing';
    ['syncIndicator', 'syncIndicatorMobile'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.className = 'sync-indicator ' + status;
      if (status === 'done') {
        setTimeout(() => {
          if (!syncing) el.className = 'sync-indicator idle';
        }, 2000);
      }
    });
  }

  return { pushAll, pullAll, merge, enableAutoSync, syncNow };
})();
