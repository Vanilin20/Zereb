// ЖЕРЕБ — мафія за повагою, бізнес через випадкові можливості, квартири під оренду без спаму

// ======================================================================
// Мафія: повага за справи → посвячення → капо → консильєре; дон — через переворот або падіння боса
// ======================================================================
var REP_NEED = [0, 10, 30, 70];
function repLine(s) {
  var g2 = s.gang, r = g2.rank;
  if (r >= 3) return 'повага ' + Math.round(g2.rep || 0) + ' · далі — лише переворот або падіння боса';
  return 'повага ' + Math.round(g2.rep || 0) + '/' + REP_NEED[r + 1] + ' до «' + rankName(g2, r + 1).toLowerCase() + '»';
}
function gangJobRisk(s, base) {
  var g2 = s.gang, c = C(s);
  return clamp(base * (0.4 + c.law) * (cartel(s) ? 0.5 : 1) * (1 + (g2.heat || 0) * 0.12) * (s.used.bribe ? 0.5 : 1), 0.005, 0.6);
}
function gangJob(s) {
  var g2 = s.gang, narco = NARCO.indexOf(s.country) >= 0 ? 2 : 1;
  function ok(rep, pay, heat, txt) { g2.rep = (g2.rep || 0) + rep; g2.perf = clamp(g2.perf + rep * 2); g2.heat = (g2.heat || 0) + heat; var a = M(s) * pay; s.shadow = (s.shadow || 0) + a; return txt + ' (+' + fmt(a) + ', повага +' + rep + ')'; }
  function caught(base, what, y1, y2) { if (chance(gangJobRisk(s, base))) { g2.rep = (g2.rep || 0) + 3; return court(s, what, y1, y2); } return null; }
  var street = [
    { t: 'Перевезти партію', sub: 'добрі гроші, поліція полює саме на курʼєрів', f: function () { return caught(0.04, 'перевезення заборонених речовин', 2, 6) || ok(4, rnd(1, 2.5) * narco, 0.6, pick(['Партія дійшла.', 'Пронесло: на блокпосту не перевірили багажник.', 'Довелося їхати обʼїздом, але все доставлено.'])); } },
    { t: 'Вибити борг', sub: 'допомагає спорт; можна постраждати', f: function () { var r = R(); if (r < 0.18 - s.sk.sport / 600) { add(s, { health: -15 }); g2.rep = (g2.rep || 0) + 1; return 'Боржник виявився не сам. Ти ледве вибра' + g(s, 'вся', 'лася') + ', але не втік' + g(s, '', 'ла') + ' — це помітили.'; } return caught(0.025, 'вимагання', 1, 4) || ok(3, rnd(0.6, 1.4), 0.4, pick(['Борг повернули того ж вечора.', 'Вистачило однієї розмови.', 'Довелося приходити тричі, але гроші в тебе.'])); } },
    { t: 'Охороняти точку', sub: 'спокійно, мало грошей і поваги', f: function () { if (chance(0.06)) { add(s, { health: -10 }); return ok(3, 0.3, 0.3, 'На точку наїхали чужі. Ти вистоя' + g(s, 'в', 'ла') + '.'); } return ok(1, rnd(0.3, 0.6), 0.1, 'Тихий рік на точці.'); } }];
  var boss = [
    { t: 'Організувати схему', sub: 'працюють твої люди, ти лише керуєш', f: function () { return caught(0.03, 'організація злочинної схеми', 3, 8) || ok(5, rnd(3, 7) * narco * g2.rank, 0.5, pick(['Схема запрацювала.', 'Люди знають свою справу — гроші пішли.', 'Пару разів було близько, але все гладко.'])); } },
    { t: 'Домовитися з іншою сімʼєю', sub: 'дипломатія: харизма вирішує', f: function () { if (chance(0.35 + s.st.social / 200)) return ok(7, rnd(1, 3), 0.3, 'Ви поділили район без крові.'); if (chance(0.25)) { add(s, { health: -20 }); return 'Перемовини зірвалися стріляниною. Ти вижи' + g(s, 'в', 'ла') + '.'; } g2.rep = Math.max(0, (g2.rep || 0) - 4); return 'Розмова не вдалася. Бос незадоволений.'; } }];
  if (s.biz.length) boss.push({ t: 'Відмити гроші через свій бізнес', sub: 'менше ризику на вулиці, але податкова може зацікавитися', f: function () { if (chance(C(s).law * 0.15)) return court(s, 'відмивання грошей', 2, 6); return ok(4, rnd(2, 4) * g2.rank, 0.4, 'Гроші пройшли через касу «' + s.biz[0].name + '».'); } });
  var o = (g2.rank >= 2 ? boss.concat(street.slice(0, 1)) : street).concat([{ t: 'Відмовитися цього разу', sub: 'повага впаде', f: function () { g2.rep = Math.max(0, (g2.rep || 0) - 5); return 'Бос нічого не сказав. Але подивився довго.'; } }]);
  return { title: 'Справа', text: rankName(g2) + ' · ' + repLine(s) + '. Розшук: ' + ['низький', 'помітний', 'високий', 'дуже високий'][Math.min(3, Math.floor((g2.heat || 0) / 2))] + '.', opts: o };
}
(function () {
  var jg = ACTIONS.filter(function (a) { return a.id === 'job_gang'; })[0]; if (jg) jg.run = gangJob;
  var gy = ACTIONS.filter(function (a) { return a.id === 'gang_year'; })[0];
  if (gy) gy.d = function (s) { return repLine(s) + ' · розшук ' + ['низький', 'помітний', 'високий', 'дуже високий'][Math.min(3, Math.floor((s.gang.heat || 0) / 2))]; };
  var b2 = busted2;
  busted2 = function (s) { var g2 = s.gang; var r = b2(s); if (g2) g2.busted = s.age; return r; };
})();
function gangReturnTick(s, out) {
  var gp2 = s.gangPast;
  if (s.gang || s.prison || !gp2 || !gp2.busted || gp2.offered || s.age > 60) return;
  gp2.offered = 1;
  out.push({ title: 'Старі знайомі', text: 'Ти вийш' + g(s, 'ов', 'ла') + ' на волю. ' + (gp2.kind === 'картель' ? 'Картель' : 'Сімʼя') + ' знає, що ти нікого не зда' + g(s, 'в', 'ла') + '. Пропонують повернутися — з повагою.', opts: [
    { t: 'Повернутися', sub: 'повага за мовчання', f: function () { s.gang = gp2; s.gangPast = null; gp2.rep = (gp2.rep || 0) + 8; gp2.heat = 1; gp2.busted = 0; gp2.offered = 0; return 'Тебе зустріли як свого. ' + repLine(s) + '.'; } },
    { t: 'Зав\'язати', sub: 'почати з чистого аркуша', f: function () { add(s, { happy: 4 }); return 'Ти відмови' + g(s, 'вся', 'лася') + '. Цього разу — назавжди.'; } }] });
}

// ======================================================================
// Бізнес: розвиток лише через випадкові можливості року
// ======================================================================
var GROW = /^(Працювати в бізнесі на повну|Розширити|Найняти працівників|Відкрити ще одну точку|Запустити франшизу|Залучити інвестора)/;
function bizOpps(s, b) {
  var T = BIZM[b.type], m = M(s), pool = [];
  pool.push({ w: 3, t: 'Поруч звільнилося приміщення', mk: function () { var p = b.cap * rnd(0.35, 0.7); return { t: 'Розширитися: сусіднє приміщення', sub: fmt(p) + ' · окупиться чи ні — невідомо', dis: s.money < p, f: function () { s.money -= p; if (chance(0.55)) { b.cap += p * 0.9; return 'Розширення вдалося: клієнтів побільшало.'; } b.cap += p * 0.35; return 'Ремонт затягнувся, а клієнтів прийшло менше, ніж розраховував' + g(s, '', 'ла') + '.'; } }; } });
  var maxStaff = Math.max(1, Math.floor(b.cap / (m * 0.3)));
  if ((b.staff || 0) < maxStaff) pool.push({ w: 3, t: 'Шукають роботу сильні люди', mk: function () { var n = Math.min(ri(1, 3), maxStaff - (b.staff || 0)), p = n * m * 0.3; return { t: 'Найняти ' + n + ' досвідчен' + (n === 1 ? 'ого працівника' : 'их працівників'), sub: fmt(p) + ' зараз, далі ~' + fmt(m * 0.9) + '/рік кожен', dis: s.money < p, f: function () { s.money -= p; b.staff = (b.staff || 0) + n; if (chance(0.2)) { b.staff--; return 'Один зі новеньких за місяць пішов до конкурентів — разом з клієнтами.'; } return 'Нові люди вже працюють.'; } }; } });
  pool.push({ w: 3, t: 'Великий замовник', mk: function () { var a = Math.max(0, b.last || 0) * rnd(0.15, 0.4) + m * 0.05; return { t: 'Взяти великий контракт', sub: 'добрі гроші, але замовник може не заплатити, а команда працюватиме на знос', f: function () { add(s, { happy: -2 }); if (chance(0.65)) { b.cash += a; return 'Контракт виконано й оплачено: +' + fmt(a) + ' у касу.'; } b.cash -= a * 0.5; return 'Замовник «забув» заплатити. Судитися — довше, ніж чекати.'; } }; } });
  pool.push({ w: 2, t: 'Конкурент продає справу', mk: function () { var p = b.cap * rnd(0.3, 0.6); return { t: 'Викупити конкурента', sub: fmt(p) + ' · менше конкуренції', dis: s.money < p, f: function () { s.money -= p; b.cap += p * rnd(0.5, 1.05); b.comp = Math.max(0, (b.comp || 0) - 0.02); return 'Тепер його клієнти — твої. Ну, більшість.'; } }; } });
  pool.push({ w: 2, t: 'Рекламна агенція', mk: function () { var p = m * rnd(0.3, 0.8); return { t: 'Рекламна кампанія', sub: fmt(p) + ' · може вистрілити, може піти в нікуди', dis: s.money < p, f: function () { s.money -= p; if (chance(0.45)) { b.loc = (b.loc || 0) + 0.03; return 'Реклама спрацювала — про «' + b.name + '» заговорили.'; } return 'Гроші пішли, клієнтів не додалося.'; } }; } });
  if (!b.inv && b.yrs >= 2) pool.push({ w: 1.5, t: 'Інвестор', mk: function () { return { t: 'Зустрітися з інвестором', sub: 'гроші в обмін на частку', f: function () { b.inv = s.age; var q = bizQ(s, b), p = clamp(0.15 + q / 150 + (b.last > 0 ? 0.15 : 0) + (T.startup ? 0.1 : 0), 0.05, 0.8); if (!chance(p)) return 'Інвестор подивився цифри й відмовив.'; var amt = b.cap * rnd(0.4, 1.2), stake = amt / (bizValue(s, b) / (b.share || 1) + amt); b.cap += amt; b.share = (b.share || 1) * (1 - stake); return 'Інвестор вклав ' + fmt(amt) + ' за ' + Math.round(stake * 100) + '%. Твоя частка: ' + Math.round(b.share * 100) + '%.'; } }; } });
  if (T.points) pool.push({ w: 2, t: 'Вигідна локація', mk: function () { var p = T.cost * m * rnd(0.8, 1.3); return { t: 'Відкрити ще одну точку', sub: fmt(p) + ' · точок: ' + (b.points || 1), dis: s.money < p, f: function () { s.money -= p; b.points = (b.points || 1) + 1; if (chance(0.7)) { b.cap += p * 0.8; b.cash += p * 0.2; return 'Нова точка відкрилася.'; } b.cap += p * 0.35; return 'Локація виявилася прохідною лише на папері.'; } }; } });
  if (T.points && b.fran == null && (b.points || 1) >= 3 && b.yrs >= 4) pool.push({ w: 1, t: 'Хочуть франшизу', mk: function () { return { t: 'Запустити франшизу', sub: 'роялті з чужих точок під твоїм брендом', f: function () { b.fran = 0; mark(s, 'Франшиза «' + b.name + '»'); return 'Перші франчайзі вже питають умови.'; } }; } });
  return pool;
}
(function () {
  var bm = bizMenu;
  bizMenu = function (s, b) {
    var r = bm(s, b);
    r.opts = r.opts.filter(function (o) { return !GROW.test(o.t); });
    var Y = yearly(s, 'biz_' + b.name + '_' + b.start, function () { return wsample(bizOpps(s, b), R() < 0.35 ? 1 : 2, function (x) { return x.w; }).map(function (x) { return x.t; }); });
    var pool = bizOpps(s, b), add2 = [];
    Y.v.forEach(function (name) { if (Y.used.indexOf(name) >= 0) return; var p = pool.filter(function (x) { return x.t === name; })[0]; if (!p) return; var o = p.mk(); var f0 = o.f; o.t = '★ ' + o.t; o.f = function () { Y.used.push(name); return f0(); }; add2.push(o); });
    if (!b.focus) add2.push({ t: 'Працювати в бізнесі на повну цього року', sub: 'підготовка ↑, але мінус 10 год/тиждень відпочинку', f: function () { b.focus = true; add(s, { happy: -3, health: -1 }); return 'Цього року ти тягнеш «' + b.name + '» на собі.'; } });
    r.text += add2.length > (b.focus ? 0 : 1) ? ' Можливості цього року — ★.' : ' Цього року особливих можливостей не трапилося.';
    r.opts = add2.concat(r.opts);
    return r;
  };
})();

// ======================================================================
// Квартири під оренду: оголошення раз на рік, витрати, продаж
// ======================================================================
(function () {
  var a = ACTIONS.filter(function (x) { return x.id === 'rental'; })[0];
  a.ap = 1;
  a.d = function (s) { return 'Кілька оголошень на рік · ~3–5% чистими після витрат'; };
  a.show = function (s) { return s.age >= 21 && s.money >= M(s) * C(s).house * 0.5 && !s.prison; };
  a.run = function (s) {
    var c = C(s), base = M(s) * c.house;
    var Y = yearly(s, 'rentals', function () { return [0, 1, 2].map(function () { var k = pick([['Студія на околиці', 0.55, 1.15], ['Двокімнатна в спальному районі', 0.9, 1], ['Квартира в центрі', 1.5, 0.8], ['Стара квартира під ремонт', 0.6, 1.1], ['Новобудова', 1.1, 0.9]]); return { n: k[0], p: base * k[1] * rnd(0.85, 1.15), y: 0.3 / c.house * k[2] * rnd(0.8, 1.2), fix: /ремонт/.test(k[0]) }; }); });
    var o = Y.v.map(function (L, i) {
      return { t: L.n + ' — ' + fmt(L.p), sub: 'оренда ~' + (L.y * 100).toFixed(1).replace('.', ',') + '% на рік до витрат' + (L.fix ? ' · ще ' + fmt(L.p * 0.15) + ' на ремонт' : ''), dis: Y.used.length > 0 || s.money < L.p * (L.fix ? 1.15 : 1), f: function () {
        var cost = L.p * (L.fix ? 1.15 : 1); s.money -= cost; Y.used.push(i);
        s.rentals.push({ val: L.p * (L.fix ? 1.1 : 1), y: L.y, n: L.n });
        return 'Ти купи' + g(s, 'в', 'ла') + ' квартиру під оренду: ' + L.n.toLowerCase() + '. Квартир: ' + s.rentals.length + '.' + (s.rentals.length > 2 ? ' Тепер потрібна керуюча компанія — вона бере 10% оренди.' : '');
      } };
    });
    o.push({ t: 'Нічого не купувати', f: function () { return 'Ти перегляну' + g(s, 'в', 'ла') + ' оголошення, але нічого не підійшло.'; } });
    return { title: 'Оголошення', text: 'Цього року на ринку ' + Y.v.length + ' варіанти. Купити можна один. Утримання: ремонт ~1% вартості на рік, простої, податок на нерухомість.', opts: o };
  };
})();
A({ id: 'sellrental', tab: 'money', n: 'Продати квартиру з оренди', ap: 0, d: function (s) { return 'Квартир: ' + s.rentals.length; }, show: function (s) { return s.rentals.length > 0; },
  run: function (s) {
    return { title: 'Продаж', text: 'Яку продати? Ріелтор і податки заберуть ~6%.', opts: s.rentals.map(function (r, i) { return { t: (r.n || 'Квартира') + ' — ~' + fmt(r.val), f: function () { var v = r.val * 0.94 * rnd(0.92, 1.06); s.rentals.splice(s.rentals.indexOf(r), 1); s.money += v; return 'Продано за ' + fmt(v) + '.'; } }; }).concat([{ t: 'Не продавати', f: function () { return 'Лишаєш як є.'; } }]) };
  } });

(function () { var lt = life2Tick; life2Tick = function (s, out) { lt(s, out); gangReturnTick(s, out); }; })();

// прибуткова ніша приваблює конкурентів — надприбутки з часом тануть
function bizCompTick(s) {
  s.biz.forEach(function (b) {
    var hot = (b.last || 0) > b.cap * 0.12;
    b.comp = clamp((b.comp || 0) + (hot ? 0.015 : -0.005), 0, 0.12);
    if (hot && b.comp >= 0.06 && !b.compWarn) { b.compWarn = 1; say(s, 'Поруч із «' + b.name + '» відкрилися конкуренти — побачили, що справа прибуткова.', 'bad'); }
  });
}
(function () { var lt = life2Tick; life2Tick = function (s, out) { lt(s, out); bizCompTick(s); }; })();

// ======================================================================
// Вибори: результат вирішують рішення під конкретну ситуацію, а не монетка
// Тема виборів × тип суперника × твої сильні сторони; після кожного кроку видно, як змінилося опитування
// ======================================================================
var OPP_T = {
  pop: { n: 'популіст', d: 'гучні обіцянки, натовп його любить', facts: 5, emo: -3, attack: -3, ad: 0 },
  tech: { n: 'технократ', d: 'розумний, але сухий', facts: -3, emo: 5, attack: 2, ad: 0 },
  olig: { n: 'ставленик олігарха', d: 'реклама на кожному білборді', facts: 2, emo: 2, attack: 6, ad: -3 },
  vet: { n: 'політик зі стажем', d: 'його всі знають — і всі від нього втомилися', facts: 1, emo: 3, attack: 4, ad: 0 }
};
var ISSUES = { econ: 'економіка й робота', corr: 'корупція', war: 'безпека й війна', price: 'ціни й тарифи', health: 'лікарні', edu: 'школи й освіта' };
function issueCred(s, k) {
  // наскільки тобі вірять у цій темі
  var P = s.pol;
  if (k === 'econ') return (s.biz.length || s.bizHist.length ? 4 : 0) + (s.edu >= 5 ? 2 : 0) - (s.econ < 0 && P.party === 'rul' ? 4 : 0);
  if (k === 'corr') return (P.dirty ? -6 * P.dirty : 4) + (hasRecord(s) ? -5 : 0);
  if (k === 'war') return (s.flags.veteran ? 7 : s.flags.served ? 3 : s.flags.dodger ? -6 : 0);
  if (k === 'health') return s.job && /doctor|nurse/.test(s.job.id) ? 6 : 1;
  if (k === 'edu') return s.job && s.job.id === 'teacher' ? 6 : (s.edu >= 6 ? 3 : 1);
  return 2;
}
campaign = function (s, target) {
  var P = s.pol, offs = offices(s), c = C(s), notes = [];
  var oppStr = gauss() * 5 + (P.office === target ? -(P.approval - 50) / 6 : 0) + [0, 2, 3, 10, 0, 27][target] + (target === 5 && autocracy(s) ? 20 : 0);
  var base = 35 + s.st.social / 5 + s.fame / 5 + P.approval / 10 + (s.edu >= 5 ? 3 : 0) + (s.immigrant ? -12 : 0);
  if (P.party === 'rul') base += (s.econ < 0 ? -8 : 6) + (autocracy(s) ? 25 : 0);
  if (P.party === 'opp') base += (s.econ < 0 ? 8 : -3) - (autocracy(s) ? 35 : 0);
  if (P.party === 'ind') base -= 6;
  if (target === 5 && P.office === 4) base += 5;
  var poll = clamp(50 + (base + 8 - OFFICE_BAR[target] - oppStr) * 1.2, 6, 88);
  var issue = cf(s) === 2 ? 'war' : s.econ < 0 ? 'econ' : c.law < 0.5 && chance(0.5) ? 'corr' : pick(['econ', 'corr', 'price', 'health', 'edu', 'war']);
  var otype = pick(Object.keys(OPP_T)), O2 = OPP_T[otype], other = pick(Object.keys(ISSUES).filter(function (k) { return k !== issue; }));
  var ad = c.median * OFFICE_AD[target], local = target <= 2;
  function sh(d) { var old = Math.round(poll); poll = clamp(poll + d, 3, 95); var nw = Math.round(poll); return nw === old ? 'опитування не змінилося (' + nw + '%)' : 'опитування: ' + old + '% → ' + nw + '%'; }
  function head(t) { return t + ' Зараз у тебе ~' + Math.round(poll) + '%.'; }
  function finish(last) {
    var vote = clamp(poll + gauss() * 2.5, 2, 97), win = vote >= 50;
    P.nextElec = s.age + electionCycle(s);
    if (win) {
      var prev = P.office; P.office = target; P.term = electionCycle(s); P.approval = clamp(40 + (vote - 50) * 2); P.terms = prev === target ? P.terms + 1 : 1;
      if (target >= 2 && s.job) endJob(s, 'політика');
      s.fame = clamp(s.fame + [0, 3, 8, 10, 0, 30][target]); add(s, { happy: 12 });
      mark(s, offs[target] + (prev === target ? ' (переобрано)' : ''));
      return (last ? last + ' ' : '') + 'Перемога: ' + Math.round(vote) + '% голосів. Тепер ти — ' + offs[target].toLowerCase() + '.' + (P.prom && P.prom.length ? ' Виборці памʼятають твої обіцянки.' : '') + (notes.length ? ' ' + notes.join(' ') : '');
    }
    add(s, { happy: -8 }); if (target === 5) { P.lostTop = s.age; s.fame = clamp(s.fame - 10); }
    if (P.office === target) P.office = Math.max(0, target === 5 ? 3 : target - 1); else if (P.term === 0 && P.office > 0) { P.office = 0; notes.push('Попередню посаду ти теж втрати' + g(s, 'в', 'ла') + '.'); }
    P.prom = [];
    if (autocracy(s) && P.party === 'opp' && chance(0.25)) return court(s, '«екстремізм»', 2, 6);
    return (last ? last + ' ' : '') + 'Поразка: ' + Math.round(vote) + '% голосів. Наступні вибори — через ' + electionCycle(s) + ' р.' + (notes.length ? ' ' + notes.join(' ') : '');
  }
  // 3. Дебати — залежать від типу суперника і твоїх сильних сторін
  function debate(prev) {
    var lead = poll - 50;
    return { title: 'Дебати', text: (prev ? prev + '. ' : '') + head('Прямий ефір проти суперника (' + O2.n + ').'), opts: [
      { t: 'Факти й цифри', sub: 'розум ' + statWord('smarts', s.st.smarts), f: function () { return twist(sh((s.st.smarts - 50) / 6 + O2.facts + gauss())); } },
      { t: 'Історії живих людей', sub: 'харизма ' + statWord('social', s.st.social), f: function () { return twist(sh((s.st.social - 50) / 6 + O2.emo + gauss())); } },
      { t: 'Атакувати його минуле', sub: 'працює не проти всіх', f: function () { return twist(sh(O2.attack + gauss() * 2)); } },
      { t: 'Не йти на дебати', sub: lead > 8 ? 'ти лідер — можна не ризикувати' : 'виглядатиме як страх', f: function () { return twist(sh(lead > 8 ? -0.5 : -4)); } }] };
  }
  // 4. Подія останнього тижня — наслідок залежить від того, ким ти був, а не від монетки
  function twist(prev) {
    var r = R();
    if (r < 0.3) { var real = (P.dirty || 0) + (hasRecord(s) ? 1 : 0) > 0; return { title: 'За тиждень до виборів', text: prev + '. Опоненти злили на тебе компромат.' + (real ? ' І частина — правда.' : ' Схоже, це фейк.'), opts: [
      { t: 'Все заперечувати', sub: real ? 'якщо знайдуть докази — катастрофа' : 'фейк легко спростувати', f: function () { return finish(sh(real ? (chance(0.5) ? -1 : -9) : 2)); } },
      { t: 'Визнати й вибачитися', sub: real ? 'чесність інколи цінують' : 'визнавати те, чого не було?', f: function () { return finish(sh(real ? -2 : -5)); } },
      { t: 'Відповісти контркомпроматом', sub: 'брудно; ти теж станеш «брудним»', f: function () { P.dirty = (P.dirty || 0) + 1; return finish(sh(otype === 'olig' ? 4 : 1)); } }] }; }
    if (r < 0.55) return { title: 'Пропозиція спонсора', text: prev + '. Бізнесмен готовий оплатити фінал кампанії. Каже, що потім «попросить про дрібницю».', opts: [
      { t: 'Взяти гроші', sub: 'сильний фініш, але ти будеш винен', f: function () { P.owed = 1; return finish(sh(otype === 'olig' ? 5 : 3)); } },
      { t: 'Відмовитися', sub: issue === 'corr' ? 'у кампанії про корупцію це оцінять' : '', f: function () { return finish(sh(issue === 'corr' ? 2 : 0)); } }] };
    return finish(prev);
  }
  // 2. Ресурси
  function resources(prev) {
    var o = [
      { t: 'Ходити від дверей до дверей', sub: local ? 'на місцевих виборах працює найкраще' : 'на загальних виборах це крапля в морі', f: function () { add(s, { health: -2 }); return debate(sh((local ? 4 : 1) + (s.st.social - 50) / 15)); } },
      { t: 'Реклама на ТБ і в мережах', sub: fmt(ad) + (otype === 'olig' ? ' · його бюджет більший' : ''), dis: s.money < ad, f: function () { s.money -= ad; return debate(sh((local ? 3 : 6) + O2.ad)); } },
      { t: 'Блогери й соцмережі', sub: s.age < 40 ? 'молодим вірять' : 'у твоєму віці це виглядає натужно', f: function () { return debate(sh(s.age < 40 ? 4 : 1)); } },
      { t: 'Партійні волонтери', sub: P.party === 'ind' ? 'у незалежного їх майже нема' : 'безкоштовно', f: function () { return debate(sh(P.party === 'ind' ? 0.5 : 3)); } }];
    if (c.law < 0.55) o.push({ t: 'Домовитися з місцевими «авторитетами»', sub: 'вони приведуть людей, але ти будеш винен', f: function () { P.owed = 1; P.dirty = (P.dirty || 0) + 1; return debate(sh(6)); } });
    return { title: 'Ресурси', text: prev + '. ' + head('На що витратити останні тижні?'), opts: o };
  }
  // 1. Головне повідомлення
  var cred = issueCred(s, issue), cred2 = issueCred(s, other);
  var first = [
    { t: 'Говорити про головне: ' + ISSUES[issue], sub: cred >= 4 ? 'тобі тут вірять' : cred <= -3 ? 'тобі тут не вірять' : 'тема гаряча', f: function () { return resources(sh(2 + cred)); } },
    { t: 'Своя тема: ' + ISSUES[other], sub: cred2 >= 4 ? 'тут ти сильн' + g(s, 'ий', 'а') : 'людей зараз хвилює інше', f: function () { return resources(sh(cred2 - 1)); } },
    { t: 'Бити по суперникові', sub: O2.n + ' — ' + O2.d, f: function () { return resources(sh(O2.attack - 1)); } },
    { t: 'Обіцяти те, що хочуть почути', sub: 'зараз допоможе, але обіцянки доведеться виконувати', f: function () { P.prom = (P.prom || []).concat([{ t: ISSUES[issue], y: 2 }]); return resources(sh(5)); } }];
  return { title: 'Вибори: ' + offs[target].toLowerCase(), text: 'Головна тема виборів — ' + ISSUES[issue] + '. Суперник — ' + O2.n + ' (' + O2.d + '). Опитування на старті: ~' + Math.round(poll) + '%. З чим ідеш до людей?', opts: first };
};
// невиконані обіцянки бʼють по рейтингу
function promiseTick(s, out) {
  var P = s.pol; if (!P || !P.office || !P.prom || !P.prom.length) return;
  var p = P.prom[0];
  if (--p.y > 0) return;
  P.prom.shift();
  var cost = C(s).median * [0, 0.5, 2, 3, 4, 10][P.office];
  out.push({ title: 'Обіцянка', text: 'На виборах ти обіця' + g(s, 'в', 'ла') + ' зміни в темі «' + p.t + '». Люди чекають результату.', opts: [
    { t: 'Продавити рішення', sub: 'політичні борги, конфлікти в команді', f: function () { if (chance(0.55 + s.st.smarts / 400)) { P.approval = clamp(P.approval + 10); return 'Вдалося! Рейтинг росте.'; } P.approval = clamp(P.approval - 4); return 'Рішення заблокували. Ти хоча б спробува' + g(s, 'в', 'ла') + '.'; } },
    { t: 'Тихо забути', sub: 'рейтинг упаде', f: function () { P.approval = clamp(P.approval - 12); return 'Виборці помітили. Журналісти нагадують про обіцянку щотижня.'; } }] });
}
(function () { var lt = life2Tick; life2Tick = function (s, out) { lt(s, out); promiseTick(s, out); }; })();
