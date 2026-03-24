window.UI = (() => {
  function getToastArea() {
    return document.getElementById('toastArea');
  }

  function toast(message, type = 'ok') {
    const area = getToastArea();
    if (!area) return alert(message);
    const el = document.createElement('div');
    el.className = 'toast-msg ' + (type === 'err' ? 'err' : 'ok');
    el.textContent = message;
    area.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function requireAuth(roles) {
    const token = window.Api.getToken();
    const user = window.Api.getUser();
    if (!token || !user || !user.role || window.Api.isExpired()) {
      window.Api.clearSession();
      if (window.location.protocol === 'file:') {
        alert('Abra o sistema por http://localhost ou por um site publicado. Não use os arquivos HTML diretamente em file://.');
        throw new Error('Abra o sistema por servidor local ou hospedagem.');
      }
      window.location.href = 'login.html';
      throw new Error('Sem sessão.');
    }
    if (Array.isArray(roles) && roles.length && roles.indexOf(String(user.role || '').toUpperCase()) === -1) {
      toast('Acesso negado.', 'err');
      setTimeout(() => window.location.href = 'index.html', 250);
      throw new Error('Acesso negado.');
    }
    return user;
  }

  function mountNav(active) {
    const host = document.getElementById('appNav');
    if (!host) return;
    const user = window.Api.getUser() || {};
    const isEditor = String(user.role || '').toUpperCase() === 'EDITOR';

    const links = [
      ['index.html', 'Início', 'home'],
      ['students.html', 'Alunos', 'students'],
      ['reports.html', 'Relatórios', 'reports'],
      ['absences.html', 'Faltas', 'absences'],
      ['ranking.html', 'Ranking', 'ranking']
    ];
    if (isEditor) links.splice(2, 0, ['student.html?new=1', 'Novo aluno', 'new']);

    host.innerHTML = `
      <div class="topbar">
        <div class="topbar-inner">
          <div class="brand-box">
            <div class="brand-title">${escapeHtml((window.APP_CONFIG && window.APP_CONFIG.APP_NAME) || 'Sistema')}</div>
            <div class="brand-sub">${escapeHtml(user.role || '')}</div>
          </div>
          <div class="nav-links">
            ${links.map(([href, label, key]) => `<a class="nav-link ${active === key ? 'active' : ''}" href="${href}">${label}</a>`).join('')}
            <button class="nav-link btn-logout" id="btnLogout" type="button">Sair</button>
          </div>
        </div>
      </div>
    `;

    const btn = document.getElementById('btnLogout');
    if (btn) btn.addEventListener('click', async () => {
      try { await window.Api.apiPost('logout', {}); } catch (_) {}
      window.Api.clearSession();
      window.location.href = 'login.html';
    });
  }

  function onlyDigits(s) {
    return String(s || '').replace(/\D+/g, '');
  }

  function formatBRDateFromDigits(digits) {
    const d = digits.substring(0, 2);
    const m = digits.substring(2, 4);
    const y = digits.substring(4, 8);
    let out = d;
    if (digits.length >= 3) out += '/' + m;
    if (digits.length >= 5) out += '/' + y;
    return out;
  }

  function brToIso(br) {
    const m = String(br || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return '';
    return `${m[3]}-${m[2]}-${m[1]}`;
  }

  function isoToBr(iso) {
    return window.Api.fmtDate(iso);
  }

  function bindDateMask(uiId, hiddenId) {
    const ui = document.getElementById(uiId);
    const hidden = document.getElementById(hiddenId);
    if (!ui || !hidden) return;

    if (hidden.value) ui.value = isoToBr(hidden.value);

    ui.addEventListener('input', () => {
      const digits = onlyDigits(ui.value).substring(0, 8);
      ui.value = formatBRDateFromDigits(digits);
      hidden.value = brToIso(ui.value) || '';
    });

    ui.addEventListener('blur', () => {
      hidden.value = brToIso(ui.value) || '';
      if (hidden.value) ui.value = isoToBr(hidden.value);
    });
  }

  function calcAgeFromIso(iso) {
    const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return '';
    const birth = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const mdiff = today.getMonth() - birth.getMonth();
    if (mdiff < 0 || (mdiff === 0 && today.getDate() < birth.getDate())) age--;
    return age < 0 ? '' : age;
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pctBar(pct) {
    const val = Math.max(0, Math.min(100, Number(pct || 0)));
    return `
      <div class="metric-box small-box">
        <div class="metric-fill" style="width:${val}%"></div>
        <div class="metric-value">${val.toFixed(1).replace('.0','')}%</div>
      </div>
    `;
  }

  return {
    toast,
    getParam,
    requireAuth,
    mountNav,
    bindDateMask,
    brToIso,
    isoToBr,
    calcAgeFromIso,
    escapeHtml,
    pctBar
  };
})();
