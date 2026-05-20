// Optional: set your Discord webhook URL here to receive signup/login notifications
const LOGIN_WEBHOOK_URL = 'https://discord.com/api/webhooks/1505905171950076107/pjjv01RoecbtbPr-gqTi0vxAcY7WTrhiU0j3laqgcFUXOV5S4OTLG6iF_koLDypE4I0Y';

function createDefaultProfile(username = '', email = '') {
  return {
    displayName: username || 'User',
    bio: 'Suka ngulik ide baru dan bikin halaman yang keren.',
    avatarUrl: '',
    accent: '#7db8ff',
    joinAt: Date.now(),
    email,
  };
}

function normalizeUserRecord(username, record = {}) {
  const safeRecord = record && typeof record === 'object' ? record : {};
  const profile = safeRecord.profile && typeof safeRecord.profile === 'object'
    ? safeRecord.profile
    : createDefaultProfile(username, safeRecord.email || '');

  return {
    hash: safeRecord.hash || '',
    email: safeRecord.email || profile.email || '',
    profile: {
      ...createDefaultProfile(username, safeRecord.email || ''),
      ...profile,
      displayName: profile.displayName || username || 'User',
      email: safeRecord.email || profile.email || '',
    },
  };
}

function sha256Hex(message) {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  return crypto.subtle.digest('SHA-256', data).then((hash) => {
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  });
}

function getUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem('pg_users') || '{}');
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed).map(([username, record]) => [username, normalizeUserRecord(username, record)])
    );
  } catch (_) { return {}; }
}

function setUsers(obj) {
  try { localStorage.setItem('pg_users', JSON.stringify(obj)); } catch (_) { }
}

function getResetConfig() {
  try {
    return JSON.parse(localStorage.getItem('admin_reset_config') || 'null');
  } catch (_) {
    return null;
  }
}

const ADMIN_ACTIVITY_LOG_KEY = 'admin_activity_log';

function getAdminActivityLog() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ADMIN_ACTIVITY_LOG_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function pushAdminActivityLog(action, details, actor = 'system') {
  try {
    const entries = getAdminActivityLog();
    entries.unshift({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      action,
      details,
      actor,
      createdAt: Date.now(),
    });
    localStorage.setItem(ADMIN_ACTIVITY_LOG_KEY, JSON.stringify(entries.slice(0, 40)));
  } catch (_) {
    // ignore
  }
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
  const resetForm = document.getElementById('resetForm');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const cancelResetBtn = document.getElementById('cancelResetBtn');
  const resetStatus = document.getElementById('resetStatus');

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    resetForm.classList.add('hidden');
  });

  tabSignup.addEventListener('click', () => {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    resetForm.classList.add('hidden');
  });

  function showResetStatus(message, type = '') {
    if (!resetStatus) return;
    resetStatus.textContent = message;
    resetStatus.classList.remove('error', 'success');
    if (type) resetStatus.classList.add(type);
  }

  function openResetForm() {
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');
    resetForm.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabSignup.classList.remove('active');
    showResetStatus('Kode reset aktif selama 1 jam setelah admin mengaturnya.');
  }

  function closeResetForm() {
    resetForm.classList.add('hidden');
    tabLogin.click();
    showResetStatus('');
  }

  forgotPasswordBtn?.addEventListener('click', openResetForm);
  cancelResetBtn?.addEventListener('click', closeResetForm);

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    if (!user || !pass) return alert('Isi username dan password');

    const users = getUsers();
    if (!users[user]) {
      alert('Pengguna tidak ditemukan. Silakan daftar terlebih dahulu.');
      pushAdminActivityLog('Login gagal', `Username "${user}" tidak ditemukan.`, user || 'guest');
      await postToWebhook(`Gagal login: pengguna \"${user}\" tidak terdaftar (waktu: ${new Date().toISOString()})`);
      return;
    }

    const hash = await sha256Hex(pass);
    if (hash !== users[user].hash) {
      alert('Password salah.');
      pushAdminActivityLog('Login gagal', `Password salah untuk "${user}".`, user);
      await postToWebhook(`Gagal login: password salah untuk \"${user}\" (waktu: ${new Date().toISOString()})`);
      return;
    }

    // sukses (session)
    sessionStorage.setItem('username', user);
    sessionStorage.setItem('userRole', 'user');
    sessionStorage.setItem('email', users[user].email || '');
    pushAdminActivityLog('Login sukses', `User "${user}" berhasil login.`, user);
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
    users[user] = normalizeUserRecord(user, {
      hash,
      email: email || '',
      profile: createDefaultProfile(user, email || ''),
    });
    setUsers(users);
    pushAdminActivityLog('Signup baru', `Akun "${user}" dibuat${email ? ' dengan email ' + email : ''}.`, user);

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
    pushAdminActivityLog('Guest login', 'Pengunjung masuk sebagai tamu.', 'guest');
    await postToWebhook(`Pengguna masuk sebagai tamu (waktu: ${new Date().toISOString()})`);
    window.location.href = 'index.html';
  });

  resetForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('resetUser').value.trim();
    const code = document.getElementById('resetCode').value.trim();
    const newPass = document.getElementById('resetNewPass').value;
    if (!user || !code || !newPass) {
      showResetStatus('Lengkapi username, kode reset, dan password baru.', 'error');
      return;
    }

    const users = getUsers();
    if (!users[user]) {
      showResetStatus('Username tidak ditemukan.', 'error');
      pushAdminActivityLog('Reset gagal', `Percobaan reset gagal karena username "${user}" tidak ditemukan.`, user || 'guest');
      return;
    }

    const resetConfig = getResetConfig();
    if (!resetConfig || !resetConfig.code) {
      showResetStatus('Kode reset belum diatur admin.', 'error');
      pushAdminActivityLog('Reset gagal', `Percobaan reset "${user}" gagal karena kode belum diatur admin.`, user);
      return;
    }

    if (Number(resetConfig.expiresAt || 0) < Date.now()) {
      showResetStatus('Kode reset sudah kedaluwarsa. Minta kode baru ke admin.', 'error');
      pushAdminActivityLog('Reset gagal', `Percobaan reset "${user}" gagal karena kode reset kedaluwarsa.`, user);
      return;
    }

    if (code !== String(resetConfig.code)) {
      showResetStatus('Kode reset salah.', 'error');
      pushAdminActivityLog('Reset gagal', `Percobaan reset "${user}" memakai kode yang salah.`, user);
      return;
    }

    users[user].hash = await sha256Hex(newPass);
    setUsers(users);
    localStorage.removeItem('admin_reset_config');
    showResetStatus('Password berhasil direset. Sekarang kamu bisa login pakai password baru.', 'success');
    pushAdminActivityLog('Password direset', `Password untuk "${user}" berhasil direset.`, user);
    await postToWebhook(`Reset password berhasil untuk ${user} (waktu: ${new Date().toISOString()})`);
    resetForm.reset();
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
        pushAdminActivityLog('Admin login sukses', 'Admin berhasil masuk ke dashboard.', 'admin');
        await postToWebhook(`Admin login sukses (waktu: ${new Date().toISOString()})`);
        window.location.href = 'index.html';
      } else {
        alert('Password admin salah.');
        pushAdminActivityLog('Admin login gagal', 'Ada percobaan login admin dengan password salah.', 'unknown');
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
