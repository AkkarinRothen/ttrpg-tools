/* Auth Module — Google Sign-In via Firebase */
const Auth = (() => {
  let user = null;
  let onChangeCallbacks = [];

  function init() {
    if (!fbAuth) return;
    fbAuth.onAuthStateChanged(async u => {
      user = u;
      updateUI();
      onChangeCallbacks.forEach(fn => { try { fn(u); } catch(e) { console.error('Auth callback error:', e); } });
      if (u) {
        // User just logged in — trigger sync
        try { await Sync.merge(); } catch(e) { console.error('Sync merge error:', e); }
        Sync.enableAutoSync();
      }
    });
  }

  function login() {
    if (!fbAuth) { alert('Firebase no configurado. Ver instrucciones en README.'); return; }
    const provider = new firebase.auth.GoogleAuthProvider();
    fbAuth.signInWithPopup(provider).catch(err => {
      if (err.code !== 'auth/popup-closed-by-user') {
        alert('Error de login: ' + err.message);
      }
    });
  }

  function logout() {
    if (!fbAuth) return;
    fbAuth.signOut();
  }

  function getUser() { return user; }
  function isLoggedIn() { return !!user; }
  function onChange(fn) { onChangeCallbacks.push(fn); }

  function updateUI() {
    const loginBtn = document.getElementById('authLoginBtn');
    const userPanel = document.getElementById('authUserPanel');
    const avatar = document.getElementById('authAvatar');
    const name = document.getElementById('authName');

    if (!loginBtn || !userPanel) return;

    if (user) {
      loginBtn.style.display = 'none';
      userPanel.style.display = 'flex';
      if (avatar) avatar.src = user.photoURL || '';
      if (name) name.textContent = user.displayName || user.email || 'Usuario';
    } else {
      loginBtn.style.display = '';
      userPanel.style.display = 'none';
    }
  }

  return { init, login, logout, getUser, isLoggedIn, onChange };
})();
