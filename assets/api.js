window.Api = (() => {
  const TOKEN_KEY = 'iape_token';
  const USER_KEY = 'iape_user';
  const EXP_KEY = 'iape_exp';

  function ensureConfig() {
    const url = (window.APP_CONFIG && window.APP_CONFIG.API_URL) || '';
    if (!url || url === 'COLE_AQUI_A_URL_DO_WEB_APP') {
      throw new Error('Configure a URL do Apps Script em assets/config.js');
    }
    return url;
  }

  async function apiPost(action, payload = {}) {
    const url = ensureConfig();
    const body = Object.assign({}, payload, { action });
    const token = getToken();
    if (token && !body.token) body.token = token;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'follow'
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      throw new Error('Resposta não é JSON: ' + text.slice(0, 180));
    }

    if (!res.ok || data.status === 'error') {
      throw new Error(data.message || ('HTTP ' + res.status));
    }
    return data;
  }

  function setSession(token, user, expiresAt) {
    localStorage.setItem(TOKEN_KEY, token || '');
    localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
    localStorage.setItem(EXP_KEY, expiresAt || '');
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXP_KEY);
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function isExpired() {
    const exp = localStorage.getItem(EXP_KEY) || '';
    if (!exp) return false;
    const normalized = exp.replace(' ', 'T');
    const d = new Date(normalized);
    return !d.getTime || isNaN(d.getTime()) ? false : d.getTime() < Date.now();
  }

  function fmtDate(iso) {
    const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return iso || '—';
    return `${m[3]}/${m[2]}/${m[1]}`;
  }

  return {
    apiPost,
    setSession,
    clearSession,
    getToken,
    getUser,
    isExpired,
    fmtDate
  };
})();
