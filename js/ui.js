// ЖЕРЕБ — інтерфейс
(function () {
  var S = null, Q = [], tab = 'sched';
  var GROUPS = [{ id: 'sched', n: 'Розклад' }, { id: 'budget', n: 'Бюджет' }, { id: 'life', n: 'Життя', tabs: ['me', 'love', 'edu', 'move'] }, { id: 'work', n: 'Робота', tabs: ['work', 'hobby', 'biz', 'risk'] }, { id: 'money', n: 'Гроші', tabs: ['money'] }];
  var TAB_N = { me: 'Я і здоровʼя', love: 'Люди', edu: 'Освіта', move: 'Переїзд', work: 'Робота', hobby: 'Навички й курси', biz: 'Бізнес', risk: 'Тіньове', money: 'Гроші й покупки' };
  var $ = function (id) { return document.getElementById(id); };
  var KEY = 'zhereb_save_v2', SKEY = 'zhereb_saves_v3', GKEY = 'zhereb_graves_v1', MAXSAVES = 12;
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function esc(t) { return cur(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Кілька збережених життів: { id: стан }. Старі — витісняються, якщо місця бракує.
  function saves() { var all = store(SKEY) || {}; var old = store(KEY); if (old && old.id && !all[old.id]) { all[old.id] = old; store(SKEY, all); store(KEY, null); } return all; }
  function save() {
    if (!S || !S.alive) return;
    S.saved = Date.now();
    var all = saves(); all[S.id] = S;
    var ids = Object.keys(all).sort(function (a, b) { return (all[b].saved || 0) - (all[a].saved || 0); });
    ids.slice(MAXSAVES).forEach(function (id) { delete all[id]; });
    try { localStorage.setItem(SKEY, JSON.stringify(all)); }
    catch (e) { while (ids.length > 1) { delete all[ids.pop()]; try { localStorage.setItem(SKEY, JSON.stringify(all)); return; } catch (e2) { } } }
  }
  function unsave(id) { var all = saves(); delete all[id]; store(SKEY, all); }
  function load(id) { var s = saves()[id]; if (!s) return; S = s; if (!S.d) S.d = S.q * 2 - 1; S.cur = S.log[S.log.length - 1]; if (!S.citizen) S.citizen = [S.birth]; if (!S.status) S.status = S.immigrant ? 'pr' : 'citizen'; if (!S.sched) S.sched = {}; if (!S.own) S.own = { car: null, carVal: 0, gear: 0, homeLvl: 0, pet: null, petAge: 0 }; if (!S.h) S.h = {}; delete S.peers; Q = []; tab = 'sched'; setSpeed(0); show('game'); render(); }
  function toHub() { setSpeed(0); save(); closeModal(); $('profile').classList.remove('open'); startScreen(); }
  function show(id) { ['start', 'game', 'end'].forEach(function (x) { $(x).classList.toggle('hidden', x !== id); }); $('toast').classList.add('hidden'); }
  function yrs(n) { var a = n % 10, b = n % 100; return n + ' ' + (a === 1 && b !== 11 ? 'рік' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'роки' : 'років'); }
  function pct(p) { if (p > 0.99 && p < 1) return '99%+'; if (p >= 1) return '99,9%'; return (p * 100 < 1 && p > 0 ? (p * 100).toFixed(2).replace('.', ',') : Math.round(p * 100)) + '%'; }

  // ---------- Тост і модалка ----------
  var toastT;
  function toast(t) { if (!t) return; var el = $('toast'); el.textContent = cur(t); el.classList.remove('hidden'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.add('hidden'); }, 3200); }
  var modalClosable = false;
  function modal(title, bodyHTML, opts, closable) {
    modalClosable = closable !== false;
    $('mClose').classList.toggle('hidden', !modalClosable);
    $('mTitle').textContent = title; $('mBody').innerHTML = cur(bodyHTML || '');
    var box = $('mOpts'); box.innerHTML = '';
    opts.forEach(function (o) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.disabled = !!o.dis;
      b.innerHTML = '<b>' + esc(o.t) + '</b>' + (o.sub ? '<span>' + esc(o.sub) + '</span>' : '');
      b.onclick = function () { o.f(); };
      box.appendChild(b);
    });
    $('modal').classList.remove('hidden');
    var first = box.querySelector('.opt:not(:disabled)'); if (first) first.focus();
  }
  function closeModal() { $('modal').classList.add('hidden'); }

  // Показ підказки рушія (вибір). done() — коли ланцюжок завершився.
  function prompt(p, done, closable, useId) {
    var body = '<p>' + esc(p.text || '') + '</p>';
    modal(p.title || 'Подія', body, p.opts.map(function (o) {
      return { t: o.t, sub: o.sub, dis: o.dis, f: function () {
        if (!S._snap) S._snap = snapOf(S);
        if (useId) S.used[useId] = 1;   // раз на рік зараховується лише тоді, коли щось обрано
        var r = o.f(); normMoney(S);
        if (r && typeof r === 'object') { prompt(r, done, closable); return; }
        if (r) {
          // короткий результат без контексту — додати, про що була подія і що ти обрав
          var ctx = '';
          if (r.length < 70 && p.text) { var fs = String(p.text).replace(/⟦[^⟧]*⟧/g, function (m) { return m; }).split(/(?<=[.!?])\s/)[0]; if (fs.length > 80) fs = fs.slice(0, 77) + '…'; ctx = fs + ' → ' + o.t + '. '; }
          say(S, ctx + r, 'me'); toast(r);
        }
        S._snap = null;
        closeModal(); render(); save(); if (done) done();
      } };
    }), !!closable);
  }
  function runQueue() {
    if (!S.alive) { finish(); return; }
    if (!Q.length) { render(); save(); return; }
    var p = Q.shift();
    prompt(p, function () { if (!S.alive) { finish(); return; } runQueue(); }, false);
  }

  // ---------- Старт ----------
  function drawDots() {
    var cv = $('dots'), ctx = cv.getContext('2d'), w = cv.clientWidth, h = cv.clientHeight, dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr; cv.height = h * dpr; ctx.scale(dpr, dpr);
    var step = 9, cols = Math.floor(w / step), rows = Math.floor(h / step), hi = [Math.floor(R() * cols), Math.floor(R() * rows)];
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      var me = x === hi[0] && y === hi[1];
      ctx.fillStyle = me ? '#f0a830' : 'rgba(236,230,218,' + (0.06 + R() * 0.12) + ')';
      ctx.beginPath(); ctx.arc(x * step + 4, y * step + 4, me ? 3.6 : 1.4, 0, 7); ctx.fill();
    }
  }
  function curPicker(el) {
    el.innerHTML = '<span class="lbl">Валюта</span>' + Object.keys(CURRENCIES).map(function (k) { return '<button type="button" class="tab' + (k === CUR ? ' on' : '') + '" data-cur="' + k + '">' + CURRENCIES[k].n + '</button>'; }).join('');
    Array.prototype.forEach.call(el.querySelectorAll('[data-cur]'), function (b) { b.onclick = function () { CUR = b.dataset.cur; try { localStorage.setItem('zhereb_cur', CUR); } catch (e) { } curPicker(el); if (!$('game').classList.contains('hidden')) render(); if (!$('start').classList.contains('hidden')) startScreen(); }; });
  }
  function startScreen() {
    show('start'); curPicker($('curPick'));
    var all = saves(), ids = Object.keys(all).sort(function (a, b) { return (all[b].saved || 0) - (all[a].saved || 0); });
    var box = $('slots');
    if (!ids.length) { box.innerHTML = ''; box.classList.add('hidden'); }
    else {
      box.classList.remove('hidden');
      box.innerHTML = '<h2 class="mh">Незавершені життя</h2>' + ids.map(function (id) {
        var s = all[id], c = COUNTRIES[s.country] || COUNTRIES[s.birth];
        return '<div class="slot"><span class="f">' + (c ? c.flag : '') + '</span><div><b>' + esc(s.first + ' ' + s.last) + '</b><small>' + yrs(s.age) + ' · ' + esc(c ? c.name : '') + ' · ' + esc(jobTitle(s)) + '</small></div>' +
          '<button class="btn small primary" type="button" data-load="' + id + '">Грати</button><button class="btn small ghost" type="button" data-del="' + id + '" aria-label="Видалити">✕</button></div>';
      }).join('');
      Array.prototype.forEach.call(box.querySelectorAll('[data-load]'), function (b) { b.onclick = function () { load(b.dataset.load); }; });
      Array.prototype.forEach.call(box.querySelectorAll('[data-del]'), function (b) { b.onclick = function () {
        var s = all[b.dataset.del];
        modal('Видалити збереження?', '<p>' + esc(s.first + ' ' + s.last) + ', ' + yrs(s.age) + '. Це життя зникне без підсумку.</p>', [
          { t: 'Видалити', f: function () { unsave(b.dataset.del); closeModal(); startScreen(); } }, { t: 'Скасувати', f: closeModal }]); }; });
    }
    requestAnimationFrame(drawDots);
  }
  function born(o) { setSpeed(0); o = o || {}; S = (o.country || o.d) ? newLife(o) : newLifeSeeded(o, o.seed); Q = []; tab = 'sched'; save(); show('game'); render(); birthCard(); }
  function birthCard() {
    var c = COUNTRIES[S.birth], p = birthOdds(S.birth);
    var body = '<div class="big-flag">' + c.flag + '</div>' +
      '<p>' + esc(S.first + ' ' + S.last) + ' — ' + g(S, 'хлопчик', 'дівчинка') + ', ' + (S.urban ? 'місто' : 'село') + '.</p>' +
      decileBar(S.d) +
      (S.flags.elite ? '<p><b>Ти народи' + g(S, 'вся', 'лася') + ' в одній з найбагатших родин країни (0,1%). Статок родини: ' + fmt(S.fam) + '.</b></p>' : '') + '<p>Родина: ' + DEC_LBL[S.d - 1] + ' — ' + S.d + '-й дециль. Багатша за ' + (S.d - 1) * 10 + '% родин країни, дохід ~' + fmt(familyIncome(S)) + '/рік. У світі це більше, ніж у ' + pct(globalPct(familyIncome(S) / 2.2)) + ' людей.</p>' +
      '<p>Шанс народитися саме тут — ' + pct(p) + ', приблизно 1 з ' + Math.round(1 / p) + ' немовлят.</p>' +
      '<div class="grid2">' +
      st(c.le + ' р.', 'очікувана тривалість життя') + st((c.u5 / 10).toFixed(1) + '%', 'помирають до 5 років') +
      st(fmt(c.gdp * 1000), 'ВВП на душу (ПКС)') + st(Math.round(c.sec * 100) + '%', 'закінчують старшу школу') + '</div>' +
      rulesHTML(c) + (C(S).conflict === 2 ? '<p class="note">У країні зараз іде війна або збройний конфлікт.</p>' : '');
    modal(c.name, body, [{ t: 'Почати життя', f: function () { closeModal(); render(); setSpeed(1); } }]);
  }
  function decileBar(d) {
    var h = '<div class="dec" aria-label="Дециль статку ' + d + ' з 10">';
    for (var i = 1; i <= 10; i++) h += '<i class="' + (i === d ? 'me' : i < d ? 'lo' : '') + '" style="height:' + (8 + DEC_INC[i - 1] * 7) + 'px"></i>';
    return h + '</div><div class="dec-l"><span>найбідніші 10%</span><span>найбагатші 10%</span></div>';
  }
  function rulesHTML(c) {
    return '<div class="rules">' +
      '<span>Медицина: <b>' + healthName(c) + '</b></span>' +
      '<span>Університет: <b>' + feeNote(c) + '</b></span>' +
      '<span>Податки: <b>~' + Math.round(c.tax * 100) + '%</b></span>' +
      '<span>Пенсія: <b>з ' + c.retAge + '</b></span>' +
      '<span>Житло: <b>' + c.house + ' річних доходів</b></span>' +
      '<span>Армія: <b>' + (c.consc === 2 ? 'обовʼязкова для всіх' : c.consc ? 'обовʼязкова для чоловіків' : 'за контрактом') + '</b></span>' +
      '<span>Мова: <b>' + LANG_NAMES[c.lang] + '</b></span>' +
      '<span>Закон: <b>' + (c.law > 0.75 ? 'працює суворо' : c.law > 0.5 ? 'працює' : 'працює погано') + '</b></span></div>';
  }
  function st(v, k) { return '<div class="stat"><div class="v">' + v + '</div><div class="k">' + k + '</div></div>'; }
  function sandbox() {
    var cs = COUNTRY_LIST.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'uk'); });
    var body = '<label class="f" for="sbC">Країна</label><select id="sbC"><option value="">Випадково (за кількістю народжень)</option>' + cs.map(function (c) { return '<option value="' + c.code + '">' + c.flag + ' ' + c.name + '</option>'; }).join('') + '</select>' +
      '<label class="f" for="sbS">Стать</label><select id="sbS"><option value="">Випадково</option><option value="m">Чоловіча</option><option value="f">Жіноча</option></select>' +
      '<label class="f" for="sbQ">Статок родини (дециль)</label><select id="sbQ"><option value="">Випадково</option>' + DEC_LBL.map(function (l, i) { return '<option value="' + (i + 1) + '">' + (i + 1) + ' — ' + l + '</option>'; }).join('') + '</select>' +
      '<label class="f" for="sbU">Місце</label><select id="sbU"><option value="">Випадково</option><option value="1">Місто</option><option value="0">Село</option></select>' +
      '<label class="f" for="sbP">Подобаються</label><select id="sbP"><option value="opp">Протилежна стать</option><option value="same">Своя стать</option><option value="any">Будь-хто</option></select>' +
      '<label class="f" for="sbN">Імʼя (необовʼязково)</label><input type="text" id="sbN" maxlength="24" autocomplete="off">';
    modal('Пісочниця', body, [
      { t: 'Народитися', f: function () { var u = $('sbU').value; closeModal(); born({ sandbox: 1, country: $('sbC').value || null, sex: $('sbS').value || null, d: +$('sbQ').value || null, urban: u === '' ? null : u === '1', pref: $('sbP').value, name: $('sbN').value.trim() || null }); } },
      { t: 'Скасувати', f: closeModal }]);
  }

  // ---------- Рендер ----------
  function bar(k, v, key) { var cls = v < 30 ? 'low' : v < 55 ? 'mid' : ''; return '<div class="bar"><div class="top-l"><span>' + k + '</span><b>' + statWord(key, v) + '</b></div><div class="meter"><i class="' + cls + '" style="width:' + Math.round(v) + '%"></i></div></div>'; }
  function render() {
    if (!S) return;
    var c = C(S);
    $('hFlag').textContent = c.flag;
    $('hName').textContent = S.first + ' ' + S.last;
    $('hSub').textContent = yrs(S.age) + ' · ' + S.year + ' · ' + c.name + (S.urban ? ', місто' : ', село') + ' · ' + jobTitle(S);
    $('hMoney').textContent = money(S.debt > 0 ? S.debt : S.money);
    $('hMoneyL').textContent = S.debt > 0 ? 'Борг' : 'Готівка';
    var nw = netWorth(S), same = Math.abs(nw - (S.money - S.debt)) < Math.max(1, Math.abs(nw) * 0.01);
    $('hNet').textContent = money(nw); $('hNet').parentNode.style.display = same && (S.debt > 0 || nw === S.money) ? 'none' : '';
    $('bars').innerHTML = bar('Здоровʼя', S.st.health, 'health') + bar('Щастя', S.st.happy, 'happy') + bar('Розум', S.st.smarts, 'smarts') + bar('Харизма', S.st.social, 'social');
    renderLog(); renderTabs(); renderActs(); renderProfile();
  }
  function renderLog() {
    var el = $('log'), html = '';
    S.log.forEach(function (e) {
      html += '<div class="yr' + (e.lines.length ? '' : ' empty') + '"><div class="age">' + e.age + '<small>' + e.year + '</small></div><div>' +
        (e.lines.length ? e.lines.map(function (l) { return l.d ? '<p class="' + l.k + ' has-d" tabindex="0">' + esc(l.t) + '<span class="fx">' + l.d.map(function (x) { var v = x[2] ? (x[1] > 0 ? '+' : '−') + cur(fmt(Math.abs(x[1]))) : (x[1] > 0 ? '+' : '−') + Math.abs(x[1]); return '<i class="' + (x[1] > 0 ? 'up' : 'dn') + '">' + x[0] + ' ' + v + '</i>'; }).join('') + '</span></p>' : '<p class="' + l.k + '">' + esc(l.t) + '</p>'; }).join('') : '<p>Тихий рік.</p>') + '</div></div>';
    });
    el.innerHTML = html; el.scrollTop = el.scrollHeight;
    el.onclick = function (ev) { var p = ev.target.closest('.has-d'); if (p) p.classList.toggle('open'); };
    el.onkeydown = function (ev) { if (ev.key === 'Enter' && ev.target.classList.contains('has-d')) ev.target.classList.toggle('open'); };
  }
  function renderTabs() {
    $('tabs').innerHTML = GROUPS.map(function (t) {
      var any = t.id === 'sched' ? S.age >= 4 : t.id === 'budget' ? S.age >= 6 : t.tabs.some(function (x) { return availableActions(S, x).length; });
      if (!any) return '';
      return '<button type="button" class="tab' + (t.id === tab ? ' on' : '') + '" data-t="' + t.id + '">' + t.n + '</button>';
    }).join('');
    Array.prototype.forEach.call($('tabs').querySelectorAll('.tab'), function (b) { b.onclick = function () { tab = b.dataset.t; renderTabs(); renderActs(); }; });
  }
  function renderSched() {
    var box = $('acts'), items = schedItems(S), free = freeHours(S);
    if (S.age < 4 || !items.length) { box.innerHTML = '<div class="none">Поки що твій час розподіляють батьки.</div>'; return; }
    var head = '<div class="sched-head"><div class="row"><b id="schFree"></b><span id="schRest"></span></div><div class="meter"><i id="schBar"></i></div>' +
      '<div class="note">' + hoursBreakdown(S).map(function (x) { return x[0] + ' ' + x[1]; }).join(' · ') + ' (год/тиждень)</div></div>';
    box.innerHTML = head + SCHED_GROUPS.map(function (gp) {
      var its = items.filter(function (it) { return it.grp === gp[0]; }); if (!its.length) return '';
      return '<div class="sec">' + gp[1] + '</div>' + its.map(function (it) {
      var v = S.sched[it.id] || 0, d = typeof it.d === 'function' ? it.d(S) : it.d;
      return '<div class="srow"><div class="srow-t"><b>' + esc(it.n) + '</b><span>' + esc(d || '') + '</span></div><div class="srow-c"><input type="range" id="sr_' + it.id + '" data-id="' + it.id + '" min="0" max="' + it.max + '" step="1" value="' + v + '" aria-label="' + esc(it.n) + ', годин на тиждень"><output id="so_' + it.id + '">' + v + ' год</output></div></div>';
    }).join(''); }).join('');
    function upd() { var u = schedUsed(S); $('schFree').textContent = 'Вільно ' + free + ' год/тиждень'; $('schRest').textContent = 'зайнято ' + u + ' · відпочинок ' + Math.max(0, free - u) + (free - u < 4 ? ' — замало!' : ''); $('schBar').style.width = Math.min(100, u / Math.max(1, free) * 100) + '%'; $('schBar').className = free - u < 4 ? 'low' : ''; }
    upd();
    Array.prototype.forEach.call(box.querySelectorAll('input[type=range]'), function (r) {
      r.addEventListener('pointerdown', function () { dragging = true; });
      r.addEventListener('pointerup', function () { dragging = false; });
      r.oninput = function () {
        var id = r.dataset.id, old = S.sched[id] || 0, other = schedUsed(S) - old, nv = +r.value;
        if (other + nv > free) { nv = Math.max(0, free - other); r.value = nv; }
        S.sched[id] = nv; $('so_' + id).textContent = nv + ' год'; upd();
      };
      r.onchange = function () { dragging = false; save(); };
    });
  }
  // ---------- Бюджет і графіки ----------
  function chart(id, series, isMoney) {
    var cv = document.getElementById(id); if (!cv) return;
    var w = cv.clientWidth || 300, h = cv.clientHeight || 120, dpr = window.devicePixelRatio || 1;
    cv.width = w * dpr; cv.height = h * dpr; var x = cv.getContext('2d'); x.scale(dpr, dpr);
    var all = []; series.forEach(function (sr) { sr.d.forEach(function (p) { all.push(p); }); });
    if (all.length < 2) { x.fillStyle = '#8f97a3'; x.font = '12px Manrope, sans-serif'; x.fillText('Ще мало даних', 8, h / 2); return; }
    var x0 = all[0][0], x1 = all[0][0], y0 = 0, y1 = 0;
    all.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    if (y1 === y0) y1 = y0 + 1;
    var L = 44, B = 18, T = 8, Rr = 8;
    function px(v) { return L + (v - x0) / Math.max(1, x1 - x0) * (w - L - Rr); }
    function py(v) { return T + (1 - (v - y0) / (y1 - y0)) * (h - T - B); }
    x.strokeStyle = '#2a313b'; x.lineWidth = 1; x.fillStyle = '#8f97a3'; x.font = '10.5px Manrope, sans-serif';
    [y0, (y0 + y1) / 2, y1].forEach(function (v) { x.beginPath(); x.moveTo(L, py(v)); x.lineTo(w - Rr, py(v)); x.stroke(); var lab = isMoney ? money(v).replace(/\s(₴|€)$/, '$1') : Math.round(v); x.fillText(lab, 2, py(v) + 3); });
    if (y0 < 0) { x.strokeStyle = '#4a515c'; x.beginPath(); x.moveTo(L, py(0)); x.lineTo(w - Rr, py(0)); x.stroke(); }
    x.fillText(x0 + ' р.', L, h - 4); x.fillText(x1 + ' р.', w - Rr - 26, h - 4);
    series.forEach(function (sr) {
      x.strokeStyle = sr.c; x.lineWidth = 2; x.beginPath();
      sr.d.forEach(function (p, i) { if (i) x.lineTo(px(p[0]), py(p[1])); else x.moveTo(px(p[0]), py(p[1])); }); x.stroke();
      var lp = sr.d[sr.d.length - 1]; x.fillStyle = sr.c; x.beginPath(); x.arc(px(lp[0]), py(lp[1]), 3, 0, 7); x.fill();
    });
  }
  function chartsHTML(p) { return '<div class="chart"><div class="ch-t"><span><i style="background:#f0a830"></i>Статок</span><span><i style="background:#5ab4c8"></i>Дохід за рік</span></div><canvas id="' + p + 'c1"></canvas></div>' +
    '<div class="chart"><div class="ch-t"><span><i style="background:#5cc48c"></i>Здоровʼя</span><span><i style="background:#e8675b"></i>Щастя</span></div><canvas id="' + p + 'c2"></canvas></div>'; }
  function drawCharts(p) {
    var hs = S.hist || [];
    chart(p + 'c1', [{ c: '#f0a830', d: hs.map(function (r) { return [r[0], r[1]]; }) }, { c: '#5ab4c8', d: hs.map(function (r) { return [r[0], r[2]]; }) }], true);
    chart(p + 'c2', [{ c: '#5cc48c', d: hs.map(function (r) { return [r[0], r[3]]; }) }, { c: '#e8675b', d: hs.map(function (r) { return [r[0], r[4]]; }) }], false);
  }
  function renderBudget() {
    var L = S.ledger, box = $('acts'), h = '';
    if (!L) { box.innerHTML = '<div class="none">Бюджет зʼявиться після першого прожитого року.</div>'; return; }
    function rows(o, sign) { var ks = Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }); return ks.map(function (k) { return '<div class="kv"><span>' + esc(k) + '</span><span class="' + (sign > 0 ? 'pos' : 'neg') + '">' + (sign > 0 ? '+' : '−') + esc(fmt(o[k])).replace(/^−/, '') + '</span></div>'; }).join(''); }
    var ti = 0, te = 0; for (var a in L.inc) ti += L.inc[a]; for (var b in L.exp) te += L.exp[b];
    h += '<div class="sched-head"><div class="row"><b>Рік, коли тобі було ' + (L.age - 1) + '→' + L.age + '</b><span>' + L.year + '</span></div>' +
      '<div class="row"><span>Надійшло</span><b class="pos">' + esc(fmt(ti)) + '</b></div><div class="row"><span>Витрачено</span><b class="neg">' + esc(fmt(te)) + '</b></div>' +
      '<div class="row"><span>Результат</span><b class="' + (ti - te >= 0 ? 'pos' : 'neg') + '">' + esc(fmt(ti - te)) + '</b></div></div>';
    h += '<div class="sec">Доходи</div>' + (rows(L.inc, 1) || '<div class="none">Немає</div>');
    h += '<div class="sec">Витрати</div>' + (rows(L.exp, -1) || '<div class="none">Немає</div>');
    if (L.invGain && Math.abs(L.invGain) > 1) h += '<div class="kv"><span>Інвестиції за рік (не готівка)</span><span class="' + (L.invGain > 0 ? 'pos' : 'neg') + '">' + esc(fmt(L.invGain)) + '</span></div>';
    if (S.debt > 0 || L.short) {
      h += '<div class="sec">Борг</div><div class="kv"><span>Зараз винен</span><span class="neg">' + esc(fmt(S.debt)) + '</span></div><div class="kv"><span>Ставка</span><span>13% на рік' + (L.interest ? ' · за рік нараховано ' + esc(fmt(L.interest)) : '') + '</span></div>';
      if (L.short) h += '<div class="note">Минулого року на життя не вистачило ' + esc(fmt(L.short)) + ' — ця сума пішла в борг.</div>';
      var src = S.debtSrc || {}, ssum = 0; for (var q in src) ssum += src[q]; var kf = ssum > 0 ? S.debt / ssum : 0; src = Object.keys(src).reduce(function (o, q) { if (src[q] * kf >= 1) o[q] = src[q] * kf; return o; }, {}); Object.keys(src).sort(function (a, b) { return src[b] - src[a]; }).forEach(function (k) { h += '<div class="kv"><span>— ' + esc(k) + '</span><span>' + esc(fmt(src[k])) + '</span></div>'; });
      var DL = S.debtLog || [];
      if (DL.length) {
        var sSh = 0, sI = 0, sP = 0, sN = 0; DL.forEach(function (d) { sSh += d.sh; sI += d.i; sP += d.p; sN += d.e - d.s0 - d.sh - d.i + d.p; });
        var why = sI > sSh && sI > sN ? 'відсотки: борг сам себе роздуває, бо погашаєш менше, ніж нараховується' : sSh >= sN ? 'щороку витрачаєш більше, ніж заробляєш, — різниця йде в борг' : 'нові кредити й разові витрати (лікування, навчання, покупки, бізнес)';
        h += '<div class="note"><b>Головна причина за останні ' + DL.length + ' р.:</b> ' + why + '. Нестача на життя +' + esc(fmt(sSh)) + ', відсотки +' + esc(fmt(sI)) + ', нові кредити й інше ' + (sN >= 0 ? '+' : '−') + esc(fmt(Math.abs(sN))) + ', погашено −' + esc(fmt(sP)) + '.</div>';
        h += '<div class="dtab"><div class="dr dh"><span>Вік</span><span>Було</span><span>Нестача</span><span>Відсотки</span><span>Погашено</span><span>Стало</span></div>' + DL.slice().reverse().map(function (d) { return '<div class="dr"><span>' + d.a + '</span><span>' + esc(fmt(d.s0)) + '</span><span class="neg">' + (d.sh ? '+' + esc(fmt(d.sh)) : '—') + '</span><span class="neg">' + (d.i ? '+' + esc(fmt(d.i)) : '—') + '</span><span class="pos">' + (d.p ? '−' + esc(fmt(d.p)) : '—') + '</span><span>' + esc(fmt(d.e)) + '</span></div>'; }).join('') + '</div>';
      }
      if (L.cut) h += '<div class="note">Цього року грошей бракувало, тож витрати урізано на ' + esc(fmt(L.cut)) + ': живеш на мінімумі.</div>';
      if (L.denied) h += '<div class="note">Банки більше не позичають: борг перевищив півтора річного доходу.</div>';
      h += '<div class="note">Борг гаситься автоматично: спершу з заощаджень (лишається невелика подушка), далі половиною вільних грошей щороку. Як вибратися: дешевший стиль життя в розкладі, краща робота, повернутися до батьків або оголосити банкрутство. Кредитний рейтинг: ' + Math.round(S.credit) + '.</div>';
    }
    h += '<div class="sec">Як змінювалося життя</div>' + chartsHTML('b');
    box.innerHTML = cur(h);
    drawCharts('b');
  }
  function renderActs() {
    if (tab === 'sched') { renderSched(); return; }
    if (tab === 'budget') { renderBudget(); return; }
    var grp = GROUPS.filter(function (x) { return x.id === tab; })[0] || GROUPS[1], box = $('acts');
    box.innerHTML = '';
    var anyA = false;
    grp.tabs.forEach(function (tid) {
      var list = availableActions(S, tid); if (!list.length) return; anyA = true;
      var h = document.createElement('div'); h.className = 'sec'; h.textContent = TAB_N[tid]; box.appendChild(h);
    list.forEach(function (a) {
      var used = a.ap > 0 && S.used[a.id];
      var b = document.createElement('button'); b.type = 'button'; b.className = 'act' + (used ? ' done' : '');
      b.disabled = used;
      var d = typeof a.d === 'function' ? a.d(S) : a.d;
      b.innerHTML = '<b>' + esc(a.n) + '</b><span>' + esc(d || '') + '</span><em>' + (used ? '✓ цього року' : a.ap ? 'раз на рік' : '') + '</em>';
      b.onclick = function () { act(a); };
      box.appendChild(b);
    });
    });
    if (!anyA) box.innerHTML = '<div class="none">' + (S.age < 5 ? 'Ти ще зовсім маленьк' + g(S, 'ий', 'а') + '. Просто живи.' : 'Зараз тут нічого не доступно.') + '</div>';
  }
  var openCache = {};   // меню «раз на рік», відкрите й закрите без вибору, наступного разу показує ті самі варіанти
  function act(a) {
    S._snap = snapOf(S);
    var ck = S.id + ':' + a.id + ':' + S.age, r;
    if (a.ap > 0 && openCache[ck] && !S.used[a.id]) r = openCache[ck];
    else { r = doAction(S, a); if (a.ap > 0 && r && typeof r === 'object') openCache[ck] = r; }
    if (r == null) { S._snap = null; return; }
    if (typeof r === 'object') { var uid = a.ap > 0 ? a.id : null; if (uid) S.used[uid] = 0; prompt(r, function () { if (!S.alive) finish(); }, true, uid); render(); return; }
    say(S, r, 'me'); S._snap = null; toast(r); render(); save();
    if (!S.alive) finish();
  }
  function kv(k, v) { return '<div class="kv"><span>' + k + '</span><span>' + v + '</span></div>'; }
  function renderProfile() {
    var c = C(S), h = '';
    h += '<h3>Освіта</h3>' + kv('Рівень', EDU_NAMES[S.edu]);
    if (S.fields.length || S.vfields.length) h += kv('Фах', S.fields.concat(S.vfields).filter(function (x, i, a) { return a.indexOf(x) === i; }).map(fieldName).join(', '));
    if (S.study) h += kv('Зараз', studyName(S.study)) + kv('Середній бал', Math.round(S.gpa) + (S.study.left ? ' · ще ' + yrs(S.study.left) : ''));
    h += '<h3>Робота</h3>';
    if (S.job && !S.job.teen) { h += kv('Посада', jobTitle(S)) + kv('Зарплата до податків', fmt(jobPay(S)) + '/рік') + kv('Податок на зарплату', '~' + Math.round(taxRate(S, jobPay(S)) * 100) + '%' + (C(S).flat ? ' (плоска шкала)' : '')) + kv('Продуктивність', Math.round(S.job.perf)) + kv('Стаж тут', yrs(S.job.yrs)); }
    else h += kv('Статус', jobTitle(S));
    if (hasRecord(S)) h += kv('Судимість', 'так, знижує шанси на роботу');
    if (S.pol) h += kv('Політика', offices(S)[S.pol.office] + ' · ' + partyName(S.pol.party)) + kv('Рейтинг', Math.round(S.pol.approval) + '%' + (S.pol.office ? ' · термін ще ' + S.pol.term + ' р.' : '')) + kv('Наступні вибори', S.pol.nextElec <= S.age ? 'цього року' : 'через ' + (S.pol.nextElec - S.age) + ' р.');
    if (S.gang) { var gr = gangRisk(S); h += kv(S.gang.kind === 'картель' ? 'Картель' : 'Сімʼя', rankName(S.gang) + (S.gang.own ? ' · людей: ' + (S.gang.size || 1) : '') + (S.gang.warYrs ? ' · війна ще ' + S.gang.warYrs + ' р.' : '')) + kv('Ризик загинути / арешту', pct(gr.death) + ' / ' + pct(gr.arrest) + ' на рік'); }
    if (S.fame > 3) h += kv('Слава', Math.round(S.fame));
    h += '<h3>Гроші</h3>' + kv('Готівка', fmt(S.money)) + (S.debt ? kv('Борг', fmt(S.debt)) : '') +
      (S.inv.dep + S.inv.stk + S.inv.cry > 1 ? kv('Депозит / акції / крипта', fmt(S.inv.dep) + ' / ' + fmt(S.inv.stk) + ' / ' + fmt(S.inv.cry)) : '') +
      (S.home ? kv(S.home.kind, fmt(S.home.val)) : '') + (S.rentals.length ? kv('Квартири в оренду', S.rentals.length) : '') +
      (S.age >= 18 ? kv('Кредитний рейтинг', Math.round(S.credit) + (S.flags.bankrupt ? ' · банкрут' : '')) : '') +
      kv('Дохід за рік (чистий)', fmt(S.lastInc)) + (S.lastTax > 1 ? kv('Усі податки за рік', fmt(S.lastTax)) : '') + (S.age >= 18 ? kv('Дохід у світі', 'вище ніж у ' + pct(globalPct(S.lastInc)) + ' людей') : '') +
      kv('Родина', S.d + '-й дециль · ' + DEC_LBL[S.d - 1]) + kv('Медіанний дохід у країні', fmt(c.median)) + kv('Стиль життя', ['скромний', 'звичайний', 'розкішний'][S.ls]);
    S.biz.forEach(function (b) { h += kv(b.name, (b.last >= 0 ? '+' : '') + fmt(b.last) + ' · ' + yrs(b.yrs) + (b.staff ? ' · ' + b.staff + ' прац.' : '') + (b.share < 1 ? ' · ' + Math.round(b.share * 100) + '%' : '')); });
    h += '<h3>Здоровʼя</h3>' + kv('Харчування', ['фастфуд', 'звичайне', 'здорове'][S.diet]) + kv('Сон', S.sleep ? 'висипаюся' : 'недосипаю') + (S.flags.smoker ? kv('Куріння', 'так') : '') + (S.flags.drink ? kv('Алкоголь', 'проблема') : '') + (S.flags.depr ? kv('Настрій', 'пригнічений стан') : '') + (S.flags.genKnown ? kv('Спадковість', (S.flags.genKnown === 'heart' ? 'серце' : 'онкологія') + ' — ризик вищий') : '') + (S.flags.ill && S.flags.illKnown ? kv('Хвороба', S.flags.illName + (S.flags.illTreated ? ' · лікується' : ' · без лікування')) : '');
    var langs = Object.keys(S.lang).filter(function (l) { return S.lang[l] >= 1; }).map(function (l) { return LANG_NAMES[l] + ' ' + Math.round(S.lang[l]); });
    if (S.sk.eng >= 1) langs.push('Англійська ' + Math.round(S.sk.eng));
    h += '<h3>Мови</h3><div class="ppl">' + (langs.join(' · ') || '—') + '</div>' + (S.immigrant ? '<div class="note">Робоча мова тут: ' + Math.round(workLang(S, S.country) * 100) + '/100 — від неї залежить зарплата.</div>' : '');
    h += '<h3>Навички й хобі</h3>';
    Object.keys(SKILL_NAMES).forEach(function (k) {
      var v = S.sk[k]; if (k === 'eng' || (v < 1 && k !== 'code' && k !== 'music' && k !== 'art')) return;
      var nexts = [];
      if (k in HOBBY && v < 35) nexts.push('фриланс з <b>35</b>');
      if (k in HOBBY) HOBBY[k].jobs.forEach(function (id) { var j = JOB[id]; if (j.alt && j.alt[k]) { var need = skillNeed(S, k, j.alt[k]); if (v < need) nexts.push(j.n.toLowerCase() + ' з <b>' + need + '</b>'); } });
      var mk = k in HOBBY ? hobbyMarket(S, k) : 1;
      h += '<div class="sk"><div class="row"><span>' + SKILL_NAMES[k] + (k in HOBBY ? ' <small class="note">ринок ' + (mk > 1 ? 'сильний' : mk > .7 ? 'норм.' : 'слабкий') + '</small>' : '') + '</span><b>' + Math.round(v) + '</b></div><div class="meter"><i style="width:' + Math.round(v) + '%"></i></div>' +
        (nexts.length ? '<div class="hint">→ ' + nexts.slice(0, 3).join(', ') + '</div>' : '') + '</div>';
    });
    h += '<p class="note">Пороги залежать від країни: у багатих — конкуренція вища.</p>';
    h += '<h3>Люди</h3>';
    S.parents.forEach(function (p) { h += '<div class="ppl"><span class="' + (p.alive ? '' : 'dead') + '">' + p.role + ' ' + esc(p.name) + ', ' + p.age + '</span>' + (p.alive ? ' · стосунки ' + Math.round(p.rel) : '') + '</div>'; });
    if (S.sibs.length) h += '<div class="ppl">Брати й сестри: ' + S.sibs.map(function (b) { return '<span class="' + (b.alive ? '' : 'dead') + '">' + esc(b.name) + ' (' + b.age + ')</span>'; }).join(', ') + '</div>';
    if (S.partner) h += '<div class="ppl">' + (S.partner.married ? gp(S.partner, 'Чоловік', 'Дружина') : 'Пара') + ': ' + esc(S.partner.name) + ', ' + S.partner.age + ' · стосунки ' + Math.round(S.partner.rel) + (S.partner.trait ? '<br><small class="note">' + esc(ptrait(S.partner)) + ' · хоче дітей: ' + esc(S.partner.wantKids) + (S.partner.jobless ? ' · без роботи' : '') + (S.partner.far ? ' · на відстані' : '') + '</small>' : '') + '</div>';
    if (S.kids.length) h += '<div class="ppl">Діти:</div>' + S.kids.map(function (k) { return '<div class="ppl"><span class="' + (k.alive ? '' : 'dead') + '">' + esc(k.name) + ', ' + k.age + '</span> · стосунки ' + Math.round(k.rel) + '<br><small class="note">' + [k.job ? esc(k.job) : '', k.uni ? 'університет' : '', k.talent && k.talent.indexOf('_lost') < 0 ? 'талант' : '', k.rebel ? 'бунтар' : '', k.abroad ? 'живе: ' + COUNTRIES[k.abroad].name : '', k.married ? 'одружен' + gp(k, 'ий', 'а') : ''].filter(Boolean).join(' · ') + '</small></div>'; }).join('');
    if (S.grandkids) h += '<div class="ppl">Онуків: ' + S.grandkids + '</div>';
    h += '<div class="ppl">Друзів: ' + S.friends + '</div>';
    h += (S.dream ? '<h3>Мрія</h3>' + kv(DREAMS[S.dream].n, DREAMS[S.dream].d) : '') + '<h3>Країна</h3>' + kv('Де живеш', c.flag + ' ' + c.name) + kv('Ціни', priceWord(c.code) + ' (' + Math.round(priceLvl(c.code) * 100) + '% від США)') + (S.seed ? kv('Код народження', S.seed) : '') + (S.job && S.job.remote ? kv('Робота', 'віддалено на іноземну компанію') : '') + (S.support ? kv('Аліменти', Math.round(S.support.pct * 100) + '% доходу ще ' + (S.support.until - S.age) + ' р.') : '') + (S.crisis ? kv('Зараз', crisisName(S) + ' · ще ~' + S.crisis.t + ' р.') : '') + (S.army ? kv('Служба', (S.army.front ? 'фронт' : 'тил') + ' · ще ~' + S.army.left + ' р.') : '') + kv('Громадянство', (S.citizen || [S.birth]).map(function (x) { return COUNTRIES[x].flag + ' ' + COUNTRIES[x].name; }).join(', ')) + (isCitizen(S) ? '' : kv('Статус тут', STATUS_N[resStatus(S)]) + kv('До громадянства', (function () { var r = natRule(S.country); return r.cit >= 99 ? 'практично неможливо' : (resStatus(S) === 'pr' ? 'ще ' + Math.max(0, r.cit - S.immYrs) + ' р. + мова ' + r.lang : 'спершу постійне проживання (через ' + Math.max(0, r.pr - S.immYrs) + ' р.)'); })())) + rulesHTML(c) + kv('Тривалість життя', c.le + ' р.') + kv('Економіка', S.econ < 0 ? 'криза' : S.econ > 0 ? 'підйом' : 'стабільна') + (cf(S) ? kv('Безпека', cf(S) === 2 ? 'війна' : 'напружено') : '') + (S.immigrant ? kv('Адаптація', yrs(S.immYrs)) : '');
    $('profile').innerHTML = cur(h);
  }

  // ---------- Час ----------
  var speed = 0, acc = 0, lastT = Date.now(), dragging = false, YEAR_MS = { 1: 6000, 2: 3000, 4: 1500 };
  function setSpeed(v) { if (v && speed && v !== speed) acc = acc / YEAR_MS[speed] * YEAR_MS[v]; else if (!v) acc = acc; speed = v; Array.prototype.forEach.call(document.querySelectorAll('.spd'), function (b) { b.classList.toggle('on', +b.dataset.spd === speed); }); }
  // повзунок відпустили будь-де (або його перемалювали) — час іде далі
  ['pointerup', 'pointercancel', 'blur'].forEach(function (e) { window.addEventListener(e, function () { dragging = false; }); });
  setInterval(function () {
    var now = Date.now(), dt = Math.min(500, now - lastT); lastT = now;
    if (dragging && !document.querySelector('input[type=range]:active')) dragging = false;
    var run = speed && S && S.alive && !$('game').classList.contains('hidden') && $('modal').classList.contains('hidden') && !dragging;
    if (run) { acc += dt; if (acc >= YEAR_MS[speed]) { acc = 0; nextYear(1); } }
    $('yrbar').style.width = (speed ? Math.min(100, acc / YEAR_MS[speed] * 100) : 0) + '%';
  }, 100);

  // ---------- Рік ----------
  function nextYear(n) {
    if (!S || !S.alive) return;
    n = n || 1; var skipped = 0;
    for (var i = 0; i < n; i++) {
      Q = ageUp(S); skipped++;
      if (!S.alive || Q.length) break;   // автопауза на виборі чи смерті
    }
    render();
    if (!S.alive) { setSpeed(0); finish(); return; }
    runQueue();
  }

  // ---------- Кінець ----------
  function finish() {
    unsave(S.id);
    var sm = summary(S), c = COUNTRIES[S.birth];
    var graves = store(GKEY) || [];
    if (!S._buried) {
      S._buried = 1;
      graves.unshift({ left: !!S.left, n: S.first + ' ' + S.last, f: c.flag, c: c.name, a: S.age, cause: S.cause, job: S.jobHist.concat(S.job ? [S.job] : []).filter(function (j) { return JOB[j.id]; }).map(function (j) { return JOB[j.id].n; }).pop() || '', net: sm.net, peakNet: sm.peakNet, pk: sm.peakPct, d: S.d, d2: S.age >= 25 ? lifeDecile(S) : null, seed: S.seed, dream: (S.dreamsDone || []).length, emig: S.countries.length > 1, code: c.code, ach: sm.ach.map(function (a) { return a.id; }), t: Date.now() });
      store(GKEY, graves.slice(0, 200));
    }
    var careers = S.jobHist.concat(S.job ? [S.job] : []).filter(function (j) { return JOB[j.id]; });
    var h = '<div class="end-inner"><p class="eyebrow">' + c.flag + ' ' + c.name + ' · ' + S.birthYear + '–' + S.year + '</p>' +
      '<h1>' + esc(S.first + ' ' + S.last) + (S.left ? ': гру завершено у ' + yrs(S.age) : ' ' + g(S, 'прожив', 'прожила') + ' ' + yrs(S.age)) + '</h1><p class="cause">' + (S.left ? 'Ти ' + g(S, 'вирішив', 'вирішила') + ' більше не грати за цю людину. Ось підсумок того, що встигло статися.' : 'Причина смерті: ' + esc(S.cause) + '.') + '</p>' +
      '<div class="cmp">' +
      (S.left ? '' : st(pct(sm.pctCountry), 'людей, народжених ' + inC(c) + ', помирають раніше') +
      st(pct(sm.pctWorld), 'людей у світі помирають раніше')) +
      st(pct(sm.peakPct), 'людей у світі заробляють менше, ніж ти на піку (' + fmt(sm.peakInc) + '/рік)') +
      st(fmt(sm.peakNet), 'найбільший статок') +
      (S.left ? '' : st((S.age >= c.le ? '+' : '') + Math.round(S.age - c.le) + ' р.', 'проти середньої тривалості життя ' + inC(c) + ' (' + c.le + ' р.)')) +
      (sm.peakInc > 0 ? (function () { var ce = C(S); return st('×' + (sm.peakInc / ce.median).toFixed(1).replace('.', ','), 'від медіанного доходу ' + genC(ce) + ' — твій найкращий рік'); })() : '') + '</div>' +
      '<p class="epi">' + esc(epitaph(S)) + '</p>' +
      (S.age >= 25 ? '<p class="mob">' + esc(mobilityText(S, lifeDecile(S))) + '</p>' : '') +
      '<div class="kv"><span>Мрія</span><span>' + ((S.dreamsDone || []).length ? 'здійснено: ' + S.dreamsDone.map(function (k) { return DREAMS[k].n.toLowerCase(); }).join(', ') + (S.dream ? ' · не встиг' + g(S, '', 'ла') + ': ' + DREAMS[S.dream].n.toLowerCase() : '') : S.dream ? 'не здійснилася — ' + DREAMS[S.dream].n.toLowerCase() : 'не ма' + g(S, 'в', 'ла')) + '</span></div>' +
      (S.age >= 45 ? '<div class="kv"><span>Заповіт</span><span>' + (S.will ? esc(S.will.n) : 'не було — спадщину ділили за законом') + '</span></div>' : '') +
      (S.seed ? '<div class="kv"><span>Код народження</span><span><b>' + S.seed + '</b> — дай другу, щоб він почав з того самого старту</span></div>' : '') +
      (function () { var gs = (store(GKEY) || []).slice(1), rec = []; if (!gs.length) return ''; if (!S.left && S.age > Math.max.apply(null, gs.filter(function (x) { return !x.left; }).map(function (x) { return x.a; }).concat([0]))) rec.push('найдовше життя'); if (sm.peakNet > Math.max.apply(null, gs.map(function (x) { return x.peakNet || x.net || 0; }))) rec.push('найбільший статок'); var dd = S.age >= 25 ? lifeDecile(S) - S.d : null, ups = gs.filter(function (x) { return x.d2 != null; }).map(function (x) { return x.d2 - x.d; }); if (dd != null && dd > 0 && dd > Math.max.apply(null, ups.concat([0]))) rec.push('найбільший підйом'); return rec.length ? '<p class="rec">🏆 Новий рекорд серед твоїх життів: ' + rec.join(', ') + '</p>' : ''; })();
    h += '<h2>Життя</h2><div class="kv"><span>Освіта</span><span>' + EDU_NAMES[S.edu] + (S.fields.length ? ' · ' + S.fields.map(fieldName).join(', ') : '') + '</span></div>' +
      '<div class="kv"><span>Карʼєра</span><span>' + (careers.length ? careers.map(function (j) { var J = JOB[j.id]; return J.n + (J.max ? ' (' + lvName(J, j.lvl).toLowerCase() + ')' : ''); }).join(' → ') : 'не працюва' + g(S, 'в', 'ла') + ' офіційно') + '</span></div>' +
      '<div class="kv"><span>Бізнеси</span><span>' + (S.bizHist.length + S.biz.length ? S.bizHist.map(function (b) { return b.name + ' (' + yrs(b.yrs) + ', ' + b.how + ')'; }).concat(S.biz.map(function (b) { return b.name + ' (' + yrs(b.yrs) + ', до кінця)'; })).join('; ') : '—') + '</span></div>' +
      '<div class="kv"><span>Країни</span><span>' + S.countries.map(function (x) { return COUNTRIES[x].flag + ' ' + COUNTRIES[x].name; }).join(' → ') + '</span></div>' +
      '<div class="kv"><span>Громадянство</span><span>' + (S.citizen || [S.birth]).map(function (x) { return COUNTRIES[x].flag + ' ' + COUNTRIES[x].name; }).join(', ') + '</span></div>' +
      '<div class="kv"><span>Діти / онуки</span><span>' + S.kids.length + ' / ' + S.grandkids + '</span></div>' +
      '<div class="kv"><span>Шлюбів</span><span>' + S.marriages + '</span></div>';
    h += '<h2>Життя в графіках</h2>' + chartsHTML('e');
    h += '<h2>Досягнення</h2><div class="ach">' + ACHIEVEMENTS.map(function (a) { var on = sm.ach.indexOf(a) >= 0; return '<span class="' + (on ? '' : 'off') + '" title="' + esc(a.d) + '">' + esc(a.n) + '</span>'; }).join('') + '</div>';
    h += '<h2>Головне</h2><div class="tl">' + S.tl.map(function (t) { return '<div><b>' + t.age + '</b>' + esc(t.t) + '</div>'; }).join('') + '</div>';
    h += '<div class="end-btns"><button class="btn primary" id="eAgain" type="button">Ще одне життя</button><button class="btn ghost" id="eHub" type="button">До хабу</button><button class="btn ghost" id="eSand" type="button">Пісочниця</button><button class="btn ghost" id="eCopy" type="button">Скопіювати підсумок</button><button class="btn ghost" id="eLog" type="button">Перечитати життєпис</button><button class="btn link" id="eGraves" type="button">Минулі життя</button></div></div>';
    $('end').innerHTML = cur(h); show('end'); drawCharts('e'); $('end').scrollTop = 0;
    $('eAgain').onclick = function () { born({}); };
    $('eHub').onclick = startScreen;
    $('eSand').onclick = sandbox;
    $('eGraves').onclick = statsModal;
    $('eLog').onclick = function () { show('game'); render(); };
    $('eCopy').onclick = function () {
      var t = 'Жереб: ' + S.first + ' ' + S.last + ' ' + c.flag + ' ' + c.name + ' — ' + yrs(S.age) + '. ' + (careers.length ? JOB[careers[careers.length - 1].id].n + '. ' : '') + 'Дохід на піку вищий, ніж у ' + pct(sm.peakPct) + ' людей світу. ' + (sm.ach.length ? 'Досягнення: ' + sm.ach.map(function (a) { return a.n; }).join(', ') + '.' : '');
      t = cur(t); try { navigator.clipboard.writeText(t).then(function () { toast('Скопійовано'); }, function () { toast(t); }); } catch (e) { toast(t); }
    };
  }
  function gravesModal() {
    var g2 = store(GKEY) || [];
    var body = g2.length ? '<div class="graves">' + g2.slice(0, 50).map(function (x) { return '<div class="grave"><span class="f">' + x.f + '</span><div>' + esc(x.n) + '<small>' + esc(x.c) + ' · ' + esc(x.job || 'без професії') + ' · ' + esc(x.cause) + '</small></div><b>' + x.a + '</b></div>'; }).join('') + '</div>' +
      '<p class="note">Прожито життів: ' + g2.length + ' · країн: ' + Object.keys(g2.reduce(function (m, x) { m[x.c] = 1; return m; }, {})).length + ' · середній вік: ' + Math.round(g2.reduce(function (a, x) { return a + x.a; }, 0) / g2.length) + '</p>'
      : '<p>Тут зʼявляться прожиті життя.</p>';
    modal('Минулі життя', body, [{ t: 'Назад', f: closeModal }]);
  }
  function statsModal() {
    var gs = store(GKEY) || [];
    if (!gs.length) { modal('Статистика', '<p>Проживи хоча б одне життя.</p>', [{ t: 'Назад', f: closeModal }]); return; }
    var n = gs.length, lived = gs.filter(function (x) { return !x.left; }); if (!lived.length) lived = gs;
    var ages = lived.map(function (x) { return x.a; });
    var avg = Math.round(ages.reduce(function (a, b) { return a + b; }, 0) / ages.length);
    var byC = {}; gs.forEach(function (x) { byC[x.c] = byC[x.c] || { n: 0, f: x.f }; byC[x.c].n++; });
    var top = Object.keys(byC).sort(function (a, b) { return byC[b].n - byC[a].n; }).slice(0, 8);
    var longest = lived.reduce(function (a, b) { return b.a > a.a ? b : a; }), shortest = lived.reduce(function (a, b) { return b.a < a.a ? b : a; });
    var richest = gs.reduce(function (a, b) { return (b.peakNet || b.net || 0) > (a.peakNet || a.net || 0) ? b : a; });
    var achN = {}; gs.forEach(function (x) { (x.ach || []).forEach(function (id) { achN[id] = (achN[id] || 0) + 1; }); });
    var emig = gs.filter(function (x) { return x.emig; }).length;
    var body = '<div class="grid2">' + st(n, 'прожито життів') + st(Object.keys(byC).length + ' / ' + COUNTRY_LIST.length, 'країн народження') + st(avg + ' р.', 'середня тривалість (світ: ' + WORLD_LE + ')') + st(pct(emig / n), 'емігрували') + '</div>' +
      '<h3 class="mh">Де ти народжувався</h3><div class="ppl">' + top.map(function (k) { return byC[k].f + ' ' + esc(k) + ' ×' + byC[k].n; }).join(' · ') + '</div>' +
      '<h3 class="mh">Рекорди</h3>' +
      '<div class="kv"><span>Найдовше</span><span>' + longest.f + ' ' + esc(longest.n) + ', ' + longest.a + '</span></div>' +
      '<div class="kv"><span>Найкоротше</span><span>' + shortest.f + ' ' + esc(shortest.n) + ', ' + shortest.a + '</span></div>' +
      '<div class="kv"><span>Найбагатше</span><span>' + richest.f + ' ' + esc(richest.n) + ', ' + fmt(richest.peakNet || richest.net || 0) + '</span></div>' +
      (function () { var up = gs.filter(function (x) { return x.d2 != null; }); if (!up.length) return ''; var b = up.reduce(function (a, x) { return x.d2 - x.d > a.d2 - a.d ? x : a; }); var w = up.reduce(function (a, x) { return x.d2 - x.d < a.d2 - a.d ? x : a; }); var dr = gs.filter(function (x) { return x.dream; }).length; return '<div class="kv"><span>Найбільший підйом</span><span>' + b.f + ' ' + esc(b.n) + ': ' + b.d + '-й → ' + b.d2 + '-й дециль</span></div><div class="kv"><span>Найбільше падіння</span><span>' + w.f + ' ' + esc(w.n) + ': ' + w.d + '-й → ' + w.d2 + '-й дециль</span></div><div class="kv"><span>Здійснили мрію</span><span>' + dr + ' з ' + n + '</span></div>'; })() +
      '<h3 class="mh">Досягнення за всі життя</h3><div class="ach">' + ACHIEVEMENTS.map(function (a) { var k = achN[a.id] || 0; return '<span class="' + (k ? '' : 'off') + '" title="' + esc(a.d) + '">' + esc(a.n) + (k ? ' ×' + k : '') + '</span>'; }).join('') + '</div>';
    modal('Статистика всіх життів', body, [{ t: 'Список життів', f: gravesModal }, { t: 'Назад', f: closeModal }]);
  }
  function menu() {
    modal('Меню', '', [
      { t: 'Валюта: ' + CURRENCIES[CUR].n, sub: 'тільки відображення — на гру не впливає', f: function () { var ks = Object.keys(CURRENCIES); CUR = ks[(ks.indexOf(CUR) + 1) % ks.length]; try { localStorage.setItem('zhereb_cur', CUR); } catch (e) { } render(); menu(); } },
      { t: 'Як грати', sub: 'коротко про механіки', f: help },
      { t: 'Статистика всіх життів', f: statsModal },
      { t: 'Минулі життя', f: gravesModal },
      { t: 'До хабу', sub: 'це життя збережеться — можна повернутися', f: toHub },
      { t: 'Нове життя', sub: 'поточне збережеться в хабі', f: function () { save(); closeModal(); born({}); } },
      { t: 'Завершити гру за цю людину', sub: 'показати підсумок і більше не продовжувати', f: function () {
        modal('Завершити гру за ' + S.first + '?', '<p>Збереження зникне, а життя потрапить у статистику як завершене достроково.</p>', [
          { t: 'Так, завершити', f: function () { closeModal(); S.left = true; S.cause = 'гру завершено достроково'; S.alive = false; mark(S, 'Гру завершено у ' + S.age + ' р.'); finish(); } },
          { t: 'Ні, грати далі', f: closeModal }]); } },
      { t: 'Назад', f: closeModal }]);
  }
  function help() {
    modal('Як грати', '<p><b>Час</b> іде сам: ⏸ пауза, 1× — рік за 6 секунд, 2×, 4×; пробіл — пауза/старт. Події з вибором зупиняють час, поки не вирішиш.</p><p><b>Розклад.</b> Щотижня в тебе є вільні години (168 мінус сон, побут, навчання, робота, бізнес, діти, дорога). Розподіли їх між спортом, хобі, мовами, фрилансом, людьми — ефект за рік залежить від годин. Нерозподілене — відпочинок; менше 4 годин відпочинку — вигорання.</p><p><b>Разові дії</b> (пошук роботи, курси, переїзд, покупки) — у вкладках; деякі можна робити раз на рік.</p>' +
      '<p><b>Хобі → професія.</b> Навички ростуть від занять, курсів, менторів. З 35 можна брати фриланс; з певного порогу — йти в професію без диплома. Поріг і заробіток залежать від країни: ринку, міста, англійської.</p>' +
      '<p><b>Бізнес</b> перед відкриттям показує твою підготовку і шанс протриматися 3 роки. Досвід у галузі, профільне хобі і власна участь сильно підвищують шанси.</p>' +
      '<p><b>Дані</b> про країни приблизні (ООН, Світовий банк, ЮНІСЕФ, ~2023). Гроші рахуються в доларах за паритетом купівельної спроможності з урахуванням інфляції; гривні та євро — просто перерахунок за курсом (~45,3 ₴ і ~0,9 € за долар).</p>',
      [{ t: 'Зрозуміло', f: closeModal }]);
  }

  // ---------- Події кнопок ----------
  $('btnBorn').onclick = function () { born({}); };
  $('btnSandbox').onclick = sandbox;
  $('btnSeed').onclick = function () {
    modal('Народитися за кодом', '<p>Введи код, яким з тобою поділилися, — і почнеш з того самого старту: та сама країна, родина, гени. Далі все залежить від твоїх рішень.</p><input id="seedIn" class="seed-in" maxlength="10" placeholder="Напр. K7Q2XM" autocomplete="off">', [
      { t: 'Народитися', f: function () { var v = ($('seedIn').value || '').trim(); if (!v) return; closeModal(); born({ seed: v }); } },
      { t: 'Скасувати', f: closeModal }], true);
    setTimeout(function () { var i = $('seedIn'); if (i) i.focus(); }, 30);
  };
  $('btnGraves').onclick = statsModal;
  $('btnHub').onclick = toHub;
  $('btnYear').onclick = function () { acc = 0; nextYear(1); };
  Array.prototype.forEach.call(document.querySelectorAll('.spd'), function (b) { b.onclick = function () { setSpeed(+b.dataset.spd); }; });
  $('mClose').onclick = function () { if (modalClosable) closeModal(); };
  $('modal').onclick = function (e) { if (e.target === $('modal') && modalClosable) closeModal(); };
  $('btnMenu').onclick = menu;
  $('btnProfile').onclick = function () { $('profile').classList.toggle('open'); };
  $('profile').onclick = function (e) { if (window.innerWidth <= 1000 && e.target === $('profile')) $('profile').classList.remove('open'); };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { $('profile').classList.remove('open'); if (modalClosable && !$('modal').classList.contains('hidden')) closeModal(); }
    if (e.key === ' ' && e.target === document.body && !$('game').classList.contains('hidden') && $('modal').classList.contains('hidden')) { e.preventDefault(); setSpeed(speed ? 0 : 1); }
  });
  window.addEventListener('resize', function () { if (!$('start').classList.contains('hidden')) drawDots(); });
  try { var sc = localStorage.getItem('zhereb_cur'); if (sc && CURRENCIES[sc]) CUR = sc; } catch (e) { }
  startScreen();
})();
