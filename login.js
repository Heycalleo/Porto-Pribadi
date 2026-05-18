// Optional: set your Discord webhook URL here to receive signup/login notifications
const LOGIN_WEBHOOK_URL = 'https://discord.com/api/webhooks/1505905171950076107/pjjv01RoecbtbPr-gqTi0vxAcY7WTrhiU0j3laqgcFUXOV5S4OTLG6iF_koLDypE4I0Y';

function sha256Hex(message) {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  return crypto.subtle.digest('SHA-256', data).then((hash) => {
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  });
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem('pg_users') || '{}');
  } catch (_) { return {}; }
}

function setUsers(obj) {
  try { localStorage.setItem('pg_users', JSON.stringify(obj)); } catch (_) { }
}

async function postToWebhook(message) {
  if (!LOGIN_WEBHOOK_URL) return;
  try {
    await fetch(LOGIN_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });
  } catch (e) {
    // ignore network errors
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const guestBtn = document.getElementById('guestBtn');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    if (!user || !pass) return alert('Isi username dan password');

    const users = getUsers();
    if (!users[user]) {
      alert('Pengguna tidak ditemukan. Silakan daftar terlebih dahulu.');
      await postToWebhook(`Gagal login: pengguna \"${user}\" tidak terdaftar (waktu: ${new Date().toISOString()})`);
      return;
    }

    const hash = await sha256Hex(pass);
    if (hash !== users[user].hash) {
      alert('Password salah.');
      await postToWebhook(`Gagal login: password salah untuk \"${user}\" (waktu: ${new Date().toISOString()})`);
      return;
    }

    // sukses (session)
    sessionStorage.setItem('username', user);
    sessionStorage.setItem('userRole', 'user');
    sessionStorage.setItem('email', users[user].email || '');
    await postToWebhook(`Login sukses: ${user} (waktu: ${new Date().toISOString()})`);
    window.location.href = 'index.html';
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('signupUser').value.trim();
    const pass = document.getElementById('signupPass').value;
    const email = document.getElementById('signupEmail').value.trim();
    if (!user || !pass) return alert('Isi username dan password untuk mendaftar');

    const users = getUsers();
    if (users[user]) return alert('Username sudah terpakai. Pilih username lain.');

    const hash = await sha256Hex(pass);
    users[user] = { hash, email: email || '' };
    setUsers(users);

    await postToWebhook(`Signup baru: ${user} ${email ? '(' + email + ')' : ''} (waktu: ${new Date().toISOString()})`);

    // auto-login after signup (session)
    sessionStorage.setItem('username', user);
    sessionStorage.setItem('userRole', 'user');
    sessionStorage.setItem('email', email || '');
    window.location.href = 'index.html';
  });

  guestBtn.addEventListener('click', async () => {
    sessionStorage.setItem('username', 'Tamu');
    sessionStorage.setItem('userRole', 'guest');
    sessionStorage.setItem('email', '');
    await postToWebhook(`Pengguna masuk sebagai tamu (waktu: ${new Date().toISOString()})`);
    window.location.href = 'index.html';
  });

  // Admin login flow
  const adminBtn = document.getElementById('adminBtn');
  const adminArea = document.getElementById('adminArea');
  const adminPass = document.getElementById('adminPass');
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const adminCancelBtn = document.getElementById('adminCancelBtn');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      adminArea.classList.remove('hidden');
      adminPass.focus();
    });
  }
  if (adminCancelBtn) adminCancelBtn.addEventListener('click', () => adminArea.classList.add('hidden'));
  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', async () => {
      const pw = adminPass.value || '';
      if (pw === 'HanifLarp()') {
        sessionStorage.setItem('username', 'admin');
        sessionStorage.setItem('userRole', 'admin');
        sessionStorage.setItem('email', '');
        await postToWebhook(`Admin login sukses (waktu: ${new Date().toISOString()})`);
        window.location.href = 'index.html';
      } else {
        alert('Password admin salah.');
        await postToWebhook(`Gagal admin login (password salah) (waktu: ${new Date().toISOString()})`);
      }
    });
  }

  // Open correct tab if passed via query param ?tab=signup or ?tab=login
  try {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'signup') tabSignup.click();
    else if (tab === 'login') tabLogin.click();
  } catch (e) { /* ignore */ }
});
