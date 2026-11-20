// ЖЕРЕБ — ціни країн, мрії, соціальний ліфт, розлучення, віддалена робота, заповіт, код народження, «чому»

// ======================================================================
// Рівень цін (≈ відношення ПКС до ринкового курсу, США = 1; приблизно за даними Світового банку)
// Гроші в грі — у доларах ПКС. При переїзді заощадження перераховуються: долар зі США в Непалі купує втричі більше.
// ======================================================================
var PRICE = { IN: .24, CN: .55, NG: .3, PK: .22, ID: .3, CD: .45, ET: .35, US: 1, BD: .3, BR: .5, EG: .22, TZ: .35, PH: .38, MX: .52, UG: .33, KE: .4, AF: .25, SD: .25, VN: .35, AO: .4, NE: .4, MZ: .4, IQ: .4, ZA: .43, IR: .15, TR: .32, YE: .3, GH: .3, CM: .4, ML: .4, MG: .3, MM: .25, JP: .62, DE: .82, FR: .8, GB: .85, SA: .5, TH: .38, NP: .3, CO: .38, AR: .4, IT: .72, CA: .85, ES: .68, AU: .92, HT: .55, PL: .48, KR: .65, UA: .3, SE: .88, UZ: .25, DZ: .28, MA: .4, PE: .48, MY: .38, KZ: .32, LK: .25, CL: .55, IL: 1, NL: .85, RO: .42, BE: .85, AZ: .3, AE: .65, CZ: .58, HU: .48, PT: .62, CH: 1.25, AT: .85, GR: .62, RS: .48, NZ: .88, DK: 1, BG: .42, IE: .95, SK: .6, NO: 1.1, FI: .9, GE: .32, AM: .38, SG: .7, HR: .55, MD: .35, LT: .55, LV: .58, EE: .65 };
function priceLvl(code) { return PRICE[code] || clamp(Math.pow(COUNTRIES[code].gdp / 80, 0.5), 0.2, 1.3); }
function priceWord(code) { var p = priceLvl(code); return p < 0.35 ? 'дуже дешево' : p < 0.55 ? 'дешево' : p < 0.8 ? 'помірно' : p < 1.05 ? 'дорого' : 'дуже дорого'; }
(function () {
  var em = emigrate;
  emigrate = function (s, code, how) {
    var from = s.country, before = s.money;
    var r = em(s, code, how);
    var k = priceLvl(from) / priceLvl(code);
    if (Math.abs(k - 1) > 0.02) {
      s.money *= k; s.debt *= k; s.shadow = (s.shadow || 0) * k;
      if (s.inv) { s.inv.dep *= k; s.inv.stk *= k; s.inv.cry *= k; }
      if (s.money > M(s) * 0.5 || before > M(s) * 0.5) r += ' Ціни тут ' + (k > 1 ? 'нижчі' : 'вищі') + ', тож заощадження ' + (k > 1 ? 'купують у ' + k.toFixed(1).replace('.', ',') + ' раза більше.' : 'купують лише ' + Math.round(k * 100) + '% того, що вдома.');
    }
    return r;
  };
})();

// ======================================================================
// «Чому так сталося»: причини відмов і звільнень
// ======================================================================
function whyNot(s, j) {
  var c = C(s), f = [];
  if (s.immigrant && resStatus(s) === 'illegal') f.push([0.1, 'без документів офіційно не беруть']);
  if (hasRecord(s)) f.push([0.6, 'судимість відлякує роботодавців']);
  var im = immFactor(s); if (im < 0.85) f.push([im, 'мови замало для цієї роботи']);
  var un = clamp(1 - c.unemp * 2.2, 0.25, 1); if (un < 0.8) f.push([un, 'безробіття в країні високе (' + Math.round(c.unemp * 100) + '%)']);
  if (s.econ < 0) f.push([0.75, 'криза: компанії майже не наймають']);
  if (s.workYears === 0 && j.edu >= 4 && !j.vol) f.push([0.7, 'без досвіду роботи']);
  if (s.age > 55) f.push([0.7, 'вік: після 55 беруть неохоче']);
  if (j.comp < 0.35) f.push([j.comp + 0.3, 'на це місце велика конкуренція']);
  if (s.st.smarts < 40) f.push([0.8, 'співбесіду провалено']);
  if (!f.length) return 'обрали іншого кандидата';
  f.sort(function (a, b) { return a[0] - b[0]; });
  return f[0][1];
}
function whyFired(s, j) { return s.econ < 0 ? 'криза, скорочення' : s.job && s.job.perf < 35 ? 'низька продуктивність' : j.risk > 0.08 ? 'нестабільна галузь' : 'скорочення штату'; }

// ======================================================================
// Мрія життя
// ======================================================================
var DREAMS = {
  home: { n: 'Власний дім', d: 'купити житло', t: function (s) { return !!s.home || s.rentals.length > 0; } },
  family: { n: 'Велика родина', d: 'двоє і більше дітей у шлюбі', t: function (s) { return s.marriages > 0 && s.kids.length >= 2; } },
  rich: { n: 'Багатство', d: 'статок у 50 річних доходів своєї країни', t: function (s) { return s.stat.peakNet >= M(s) * 50; } },
  abroad: { n: 'Життя за кордоном', d: 'переїхати й отримати громадянство іншої країни', t: function (s) { return (s.citizen || []).some(function (x) { return x !== s.birth; }); } },
  degree: { n: 'Наука', d: 'здобути ступінь магістра або вище', t: function (s) { return s.edu >= 6; } },
  fame: { n: 'Слава', d: 'стати відомою людиною', t: function (s) { return s.stat.maxFame >= 70; } },
  boss: { n: 'Вершина карʼєри', d: 'дійти до найвищого рівня у професії', t: function (s) { return s.jobHist.concat(s.job ? [s.job] : []).some(function (j) { var J = JOB[j.id]; return J && J.max && j.lvl >= J.max; }); } },
  biz: { n: 'Своя справа', d: 'бізнес, що прожив 10 років', t: function (s) { return s.biz.some(function (b) { return b.yrs >= 10; }) || s.bizHist.some(function (b) { return b.yrs >= 10; }); } },
  old: { n: 'Довге життя', d: 'дожити до 85', t: function (s) { return s.age >= 85; } },
  power: { n: 'Влада', d: 'отримати виборну посаду', t: function (s) { return (s.pol && s.pol.office >= 2) || (s.polPast && s.polPast.office >= 2) || (s.polMax || 0) >= 2; } },
  free: { n: 'Без боргів', d: 'у 60 не мати жодних боргів і мати заощадження', t: function (s) { return s.age >= 60 && s.debt <= 0 && netWorth(s) > M(s) * 3; } }
};
function dreamPrompt(s, again) {
  var keys = shuffle(Object.keys(DREAMS).filter(function (k) { return k !== s.dream && !(s.dreamsDone || []).includes(k); })).slice(0, 4);
  return { title: again ? 'Переосмислення' : 'Про що ти мрієш?', text: again ? 'Тобі ' + s.age + '. Мрія «' + DREAMS[s.dream].n + '» досі не здійснилася. Залишити її чи змінити?' : 'Тобі ' + s.age + '. Чого ти найбільше хочеш від життя? Наприкінці буде видно, чи вдалося.', opts: keys.map(function (k) {
    return { t: DREAMS[k].n, sub: DREAMS[k].d, f: function () { s.dream = k; s.dreamAge = s.age; mark(s, 'Мрія: ' + DREAMS[k].n.toLowerCase()); return 'Тепер у тебе є мета: ' + DREAMS[k].d + '.'; } };
  }).concat(again ? [{ t: 'Лишити як є', f: function () { return 'Ти не здаєшся.'; } }] : []) };
}
function dreamTick(s, out) {
  if (s.age === 16 && !s.dream) { out.push(dreamPrompt(s)); return; }
  if (!s.dream) return;
  if (DREAMS[s.dream].t(s)) {
    s.dreamsDone = s.dreamsDone || []; s.dreamsDone.push(s.dream);
    add(s, { happy: 15 }); say(s, 'Мрія здійснилася: ' + DREAMS[s.dream].n.toLowerCase() + '!', 'big'); mark(s, 'Мрію здійснено: ' + DREAMS[s.dream].n.toLowerCase());
    s.dream = null; if (s.age < 70) out.push(dreamPrompt(s)); return;
  }
  if ((s.age === 40 || s.age === 60) && s.dreamAge < s.age - 10) out.push(dreamPrompt(s, true));
}

// ======================================================================
// Соціальний ліфт: дециль народження проти децилю наприкінці
// ======================================================================
function giniSigma(G) { var lo = 0.01, hi = 4; for (var i = 0; i < 40; i++) { var m = (lo + hi) / 2; if (2 * ncdf(m / Math.SQRT2) - 1 < G) lo = m; else hi = m; } return lo; }
function lifeDecile(s) {
  // дециль за статком (як і при народженні): пік статку проти розподілу багатства в країні
  var w = Math.max(s.stat.peakNet || 0, netWorth(s));
  if (w <= 0) return 1;
  var c = C(s), p = ncdf(Math.log(w / (c.median * 8)) / giniSigma(Math.min(0.85, c.gini + 0.33)));
  return clamp(Math.ceil(p * 10), 1, 10);
}
function mobilityText(s, d2) {
  var d = s.d, diff = d2 - d, c = C(s);
  var head = g(s, 'Народився', 'Народилася') + ' в ' + d + '-му децилі, наприкінці — ' + d2 + '-й. ';
  var body = diff >= 4 ? 'Великий підйом: так вдається небагатьом.' : diff >= 1 ? 'Ти підня' + g(s, 'вся', 'лася') + ' вище, ніж почина' + g(s, 'в', 'ла') + '.' : diff === 0 ? 'Там, де почалося, — там і завершилося. Так буває найчастіше.' : diff >= -3 ? 'Ти скоти' + g(s, 'вся', 'лася') + ' нижче, ніж народи' + g(s, 'вся', 'лася') + '.' : 'Падіння з висоти, з якої народи' + g(s, 'вся', 'лася') + '.';
  var tail = c.gini > 0.42 ? ' У країнах з такою нерівністю, як ' + c.name + ', рухатися вгору особливо важко.' : c.gini < 0.3 ? ' ' + cap(inC(c)) + ' нерівність невелика — звідси легше піднятися.' : '';
  return head + body + tail;
}

// ======================================================================
// Розлучення як процес
// ======================================================================
var DIV_STIGMA = ['IN', 'PK', 'BD', 'AF', 'YE', 'SA', 'IR', 'EG', 'NP', 'LK', 'NG', 'IQ', 'SD'];
function divorcePrompt(s, p, initiator) {
  var c = C(s), assets = Math.max(0, s.money) + (s.home ? s.home.val : 0) + s.inv.dep + s.inv.stk, kids = s.kids.filter(function (k) { return k.alive && k.age < 18; });
  var lawyer = M(s) * 0.4;
  function finish(share, txt) {
    var lose = assets * share;
    var fromHome = 0; if (s.home && lose > Math.max(0, s.money)) { fromHome = s.home.val; s.money += s.home.val; s.home = null; s.own.homeLvl = 0; }
    s.money -= lose; cashNote(s, 'Поділ майна при розлученні', -lose);
    s.partner = null; s.exes++; add(s, { happy: -12 }); mark(s, 'Розлучення з ' + p.name);
    if (DIV_STIGMA.indexOf(c.code) >= 0) { add(s, { social: -6 }); s.parents.forEach(function (x) { x.rel -= 10; }); }
    var t = txt + ' Поділ майна: −' + fmt(lose) + (fromHome ? ' (довелося продати житло)' : '') + '.';
    if (kids.length) {
      var mom = s.sex === 'f';
      var withMe = chance(mom ? 0.75 : 0.2);
      if (!withMe) { var pct = kids.length === 1 ? 0.2 : kids.length === 2 ? 0.27 : 0.33; s.support = { pct: pct, until: s.age + 18 - Math.min.apply(null, kids.map(function (k) { return k.age; })) }; kids.forEach(function (k) { k.rel -= 15; }); t += ' Діти лишилися з ' + gp(p, 'батьком', 'матірʼю') + '. Аліменти: ' + Math.round(pct * 100) + '% доходу до повноліття.'; }
      else { t += ' Діти лишилися з тобою — і всі турботи теж.'; add(s, { happy: -4 }); s.supportIn = { inc: (p.inc || M(s)) * 0.2, until: s.age + 18 - Math.min.apply(null, kids.map(function (k) { return k.age; })) }; }
    }
    if (DIV_STIGMA.indexOf(c.code) >= 0) t += ' Родина й сусіди засуджують.';
    return t;
  }
  return { title: 'Розлучення', text: (initiator === 'them' ? p.name + ' хоче розлучення.' : 'Ти виріши' + g(s, 'в', 'ла') + ' розлучитися з ' + p.name + '.') + ' Спільне майно: ' + fmt(assets) + (kids.length ? ', неповнолітніх дітей: ' + kids.length : '') + '.', opts: [
    { t: 'Домовитися мирно', sub: 'половину майна — ' + gp(p, 'йому', 'їй') + ', без суду', f: function () { return finish(0.5, 'Розійшлися без скандалів.'); } },
    { t: 'Судитися з юристом', sub: fmt(lawyer) + ' · можна зберегти більше або втратити більше', f: function () { s.money -= lawyer; var r = R() + (s.st.social - 50) / 200 + (s.money > M(s) * 3 ? 0.15 : 0); add(s, { happy: -6 }); return r > 0.6 ? finish(0.3, 'Суд став на твій бік.') : r > 0.25 ? finish(0.5, 'Суд поділив навпіл, юристи забрали своє.') : finish(0.65, 'Суд програно: адвокат ' + gp(p, 'колишнього', 'колишньої') + ' виявився сильнішим.'); } },
    { t: 'Спробувати зберегти шлюб', sub: 'сімейна терапія, ' + fmt(M(s) * 0.1), f: function () { s.money -= M(s) * 0.1; if (chance(0.35 + (p.compat || 50) / 300)) { if (s.partner) s.partner.rel = 55; return 'Терапія допомогла. Ви ще разом.'; } return finish(0.5, 'Не допомогло.'); } }] };
}
(function () {
  var br = ACTIONS.filter(function (a) { return a.id === 'breakup'; })[0];
  var run0 = br.run;
  br.run = function (s) { var p = s.partner; if (p && p.married) return divorcePrompt(s, p, 'me'); return run0(s); };
})();
function supportTick(s) {
  if (s.support) { if (s.age >= s.support.until) { s.support = null; say(s, 'Діти виросли — аліменти більше не платиш.'); } else { var a = s.lastInc * s.support.pct; if (a > 0) { s.money -= a; cashNote(s, 'Аліменти', -a); } } }
  if (s.supportIn) { if (s.age >= s.supportIn.until) s.supportIn = null; else if (chance(0.75)) { s.money += s.supportIn.inc; cashNote(s, 'Аліменти від колишнього партнера', s.supportIn.inc); } }
}

// ======================================================================
// Віддалена робота на іноземну компанію
// ======================================================================
var REMOTE_JOBS = ['dev', 'designer', 'translator', 'writer'];
function remoteRate(s) { return 0.12 + Math.min(100, s.sk.eng) / 800; }
function remotePay(s, j, lvl) {
  var us = COUNTRIES.US, base = us.median; if (j.g) base = Math.max(us.median, us.median * (1 - j.g) + 22000 * j.g);
  return base * j.pay * LV_PAY[lvl || 0] * remoteRate(s) / priceLvl(s.country);
}
(function () {
  var jp = jobPay;
  jobPay = function (s) {
    if (s.job && s.job.remote && JOB[s.job.id]) return remotePay(s, JOB[s.job.id], s.job.lvl) * (1 + 0.015 * Math.min(20, s.job.yrs)) * (s.payLuck || 1) * (s.job.part ? 0.45 : 1);
    return jp(s);
  };
})();
A({ id: 'remote', tab: 'work', n: 'Шукати віддалену роботу', d: function (s) { return 'Іноземна компанія, оплата за світовими ставками · англійська ' + Math.round(s.sk.eng); },
  show: function (s) { return s.job && !s.job.teen && !s.job.remote && REMOTE_JOBS.indexOf(s.job.id) >= 0 && s.sk.eng >= 40 && s.age >= 20; },
  run: function (s) {
    var j = JOB[s.job.id], pay = remotePay(s, j, s.job.lvl), local = jobPay(s);
    if (pay < local * 1.1) return 'Іноземні компанії платять за таку роботу не більше, ніж місцеві. Сенсу немає.';
    var p = clamp(0.15 + (s.sk.eng - 40) / 150 + s.job.lvl * 0.08 + (s.sk.code || 0) / 400 - (s.econ < 0 ? 0.1 : 0), 0.05, 0.75);
    return { title: 'Віддалена робота', text: 'Співбесіда англійською з компанією з-за кордону. Дохід ~' + fmt(pay) + '/рік замість ~' + fmt(local) + '. Але немає місцевих гарантій: контракт можуть розірвати будь-якого дня.', opts: [
      { t: 'Пройти співбесіду', sub: 'шанс ~' + Math.round(p * 100) + '%', f: function () { if (!s.job) return 'Вже неактуально.'; if (chance(p)) { s.job.remote = 1; mark(s, 'Віддалена робота на іноземну компанію'); add(s, { happy: 6 }); return 'Тебе взяли! Тепер працюєш з дому на іноземну компанію.'; } return 'Відмова: ' + (s.sk.eng < 60 ? 'англійської поки замало.' : 'обрали кандидата з більшим досвідом.'); } },
      { t: 'Не ризикувати', f: function () { return 'Лишаєшся на місцевій роботі.'; } }] };
  } });
function remoteTick(s) {
  if (!s.job || !s.job.remote) return;
  if (chance(s.econ < 0 ? 0.3 : 0.12)) { s.job.remote = 0; say(s, 'Іноземний контракт закінчився (' + (s.econ < 0 ? 'криза — компанія скоротила підрядників' : 'проєкт закрили') + '). Ти повертаєшся на місцевий ринок.', 'bad'); add(s, { happy: -6 }); return; }
  if (cf(s) === 2 && chance(0.3)) { s.job.perf -= 10; say(s, 'Відключення світла й тривоги: дедлайни горять, клієнт незадоволений.', 'bad'); }
}

// ======================================================================
// Заповіт
// ======================================================================
evOver('will');
A({ id: 'will', tab: 'love', n: 'Скласти заповіт', ap: 0, d: function (s) { return s.will ? 'Зараз: ' + s.will.n : 'Кому дістанеться все, що ти маєш'; },
  show: function (s) { return s.age >= 45 && (s.kids.some(function (k) { return k.alive; }) || s.partner || netWorth(s) > M(s) * 3); },
  run: function (s) {
    var kids = s.kids.filter(function (k) { return k.alive; }), fav = kids.slice().sort(function (a, b) { return b.rel - a.rel; })[0];
    var o = [];
    if (kids.length) o.push({ t: 'Порівну всім дітям', sub: 'ніхто не образиться', f: function () { s.will = { k: 'equal', n: 'порівну дітям' }; kids.forEach(function (k) { k.rel += 3; }); return 'Заповіт складено: усім порівну.'; } });
    if (kids.length > 1) o.push({ t: 'Більше — ' + fav.name, sub: 'найближч' + gp(fav, 'ому', 'ій') + ' до тебе; інші образяться', f: function () { s.will = { k: 'fav', n: 'більша частка — ' + fav.name, who: fav.name }; kids.forEach(function (k) { k.rel += k === fav ? 15 : -20; }); return 'Діти дізналися. ' + fav.name + ' вдячн' + gp(fav, 'ий', 'а') + ', решта — ображені.'; } });
    if (s.partner && s.partner.married) o.push({ t: 'Все — ' + gp(s.partner, 'чоловікові', 'дружині'), sub: 'діти отримають після ' + gp(s.partner, 'нього', 'неї'), f: function () { s.will = { k: 'spouse', n: gp(s.partner, 'чоловікові', 'дружині') }; if (s.partner) s.partner.rel += 10; return 'Заповіт на користь ' + gp(s.partner, 'чоловіка', 'дружини') + '.'; } });
    o.push({ t: 'Половину — на благодійність', sub: 'добра памʼять, але рідні отримають менше', f: function () { s.will = { k: 'charity', n: 'половина — на благодійність' }; s.fame = clamp(s.fame + 5); add(s, { happy: 6 }); kids.forEach(function (k) { k.rel -= 8; }); return 'Половина статку піде на благодійність.'; } });
    o.push({ t: 'Не складати', sub: 'поділять за законом', f: function () { s.will = null; return 'Хай вирішує закон.'; } });
    return { title: 'Заповіт', text: 'Твій статок зараз ' + fmt(netWorth(s)) + '. Як його розподілити?', opts: o };
  } });

// ======================================================================
// Код народження (той самий старт для друга)
// ======================================================================
function seedRng(str) { var h = 1779033703 ^ str.length; for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return function () { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); h ^= h >>> 16; var t = (h += 0x6D2B79F5); t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function newSeed() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', x = ''; for (var i = 0; i < 6; i++) x += a[Math.floor(Math.random() * a.length)]; return x; }
function newLifeSeeded(o, code) {
  code = (code || newSeed()).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || newSeed();
  var keep = R; R = seedRng(code);
  try { var s = newLife(o); } finally { R = keep; }
  s.seed = code; return s;
}

// ======================================================================
// Ефекти подій: знімок до і після
// ======================================================================
function snapOf(s) { return { h: s.st.health, hp: s.st.happy, sm: s.st.smarts, so: s.st.social, m: s.money - s.debt + (s.shadow || 0) }; }
function snapDiff(s) {
  var a = s._snap, b = snapOf(s), d = [];
  if (!a) return null;
  [['h', 'Здоровʼя'], ['hp', 'Щастя'], ['sm', 'Розум'], ['so', 'Харизма']].forEach(function (k) { var v = Math.round(b[k[0]] - a[k[0]]); if (v) d.push([k[1], v]); });
  var dm = b.m - a.m; if (Math.abs(dm) >= Math.max(1, M(s) * 0.005)) d.push(['Гроші', dm, 1]);
  return d.length ? d : null;
}
(function () {
  var sy = say;
  say = function (s, t, k) { if (s.nolog || !s.cur) return; var d = snapDiff(s); sy(s, t, k); if (d) s.cur.lines[s.cur.lines.length - 1].d = d; if (s._snap) s._snap = snapOf(s); };
})();

// ======================================================================
// Щорічні оновлення цього модуля
// ======================================================================
// Усі щорічні оновлення модулів — в одному списку, по порядку
var YEARLY = [];
function life2Tick(s, out) { YEARLY.forEach(function (f) { f(s, out); }); }
YEARLY.push(function (s, out) { supportTick(s); remoteTick(s); dreamTick(s, out); if (s.pendDivorce) { var p = s.pendDivorce; s.pendDivorce = null; if (s.partner === p) out.push(divorcePrompt(s, p, 'them')); } });
ACHIEVEMENTS.push({ id: 'dream', n: 'Мрія збулася', d: 'Здійснити мрію життя', t: function (s) { return (s.dreamsDone || []).length > 0; } });
ACHIEVEMENTS.push({ id: 'ladder', n: 'З низів', d: 'Народитися в 1–3 децилі й завершити в 8–10', t: function (s) { return s.d <= 3 && s.age >= 30 && lifeDecile(s) >= 8; } });
ACHIEVEMENTS.push({ id: 'remote', n: 'Світова зарплата', d: 'Працювати віддалено на іноземну компанію', t: function (s) { return s.tl.some(function (x) { return /Віддалена робота/.test(x.t); }); } });

// ======================================================================
// Родина при народженні має значення: приватна школа, зв'язки, допомога батьків, утримання бідних батьків
// ======================================================================
function parentsAlive(s) { return s.parents.some(function (p) { return p.alive; }); }
function familyLuckTick(s, out) {
  var c = C(s), d = s.d;
  // приватна школа: вирішують батьки
  if (s.age === 7 && s.study && s.study.t === 'school' && !s.priv && d >= 6 && c.gdp > 4) {
    if (d >= 8 || s.flags.elite) { s.priv = 1; s.q = Math.min(5, s.q + 1); say(s, 'Батьки перевели тебе до приватної школи: малі класи, сильні вчителі, «правильні» знайомства.', 'good'); }
    else out.push({ title: 'Приватна школа', text: 'Батьки думають про приватну школу. Для родини це дорого — доведеться відмовлятися від відпусток і ремонту.', opts: [
      { t: 'Приватна школа', sub: 'кращі оцінки й шанси на вступ, але батьки в напрузі', f: function () { s.priv = 1; s.q = Math.min(5, s.q + 1); s.parents.forEach(function (p) { p.rel -= 4; }); return 'Нова школа, нові вимоги. Батьки затягнули паски.'; } },
      { t: 'Звичайна школа', sub: 'без жертв', f: function () { return 'Ти лишаєшся у звичайній школі з друзями.'; } }] });
  }
  // приватна школа підтягує оцінки
  if (s.priv && s.study && s.study.t === 'school') s.gpa = clamp(s.gpa + 2.5);
  // бідність заважає вчитися: немає репетиторів, книжок, тиші вдома, треба допомагати по господарству
  if (s.study && s.study.t === 'school' && d <= 3) s.gpa = clamp(s.gpa - (4 - d) * 0.8);
  if (s.study && s.study.t === 'school' && d >= 8 && !s.priv) s.gpa = clamp(s.gpa + 1);
  // допомога батьків — лише до 25
  if (s.age >= 18 && s.age <= 25 && !s.parentGift && d >= 4 && parentsAlive(s) && !s.prison && chance(0.25)) {
    s.parentGift = 1;
    var gift = c.median * [0, 0, 0, 0.3, 0.5, 0.8, 1.5, 3, 6, 15][d - 1] * (s.flags.elite ? 10 : 1) * rnd(0.7, 1.3);
    var o = [
      { t: 'На житло', sub: 'перший внесок або вся квартира', f: function () { s.money += gift; cashNote(s, 'Допомога батьків', gift); s.flags.homeGift = 1; return 'Батьки дали ' + fmt(gift) + ' на житло. ' + (gift > M(s) * 4 ? 'Цього вистачить на квартиру.' : 'Вистачить на перший внесок.'); } },
      { t: 'Стартовий капітал на справу', sub: 'гроші плюс батьківські поради й знайомства', f: function () { s.money += gift; cashNote(s, 'Допомога батьків', gift); s.flags.bizGift = 1; return 'Батьки вклали ' + fmt(gift) + ' у твою майбутню справу. Тато обіцяє звести з потрібними людьми.'; } },
      { t: 'Відмовитися — сам' + g(s, '', 'а') + ' впораюся', sub: 'гордість і незалежність', f: function () { add(s, { happy: 3 }); s.parents.forEach(function (p) { p.rel += 5; }); return 'Батьки поважають твоє рішення. Пропозиція лишається в силі — якщо що.'; } }];
    out.push({ title: 'Батьки хочуть допомогти', text: 'Батьки пропонують ' + fmt(gift) + '. На що?', opts: o });
  }
  // бідні родини: дорослі діти утримують старих батьків
  if (d <= 3 && s.age >= 25) {
    var old = s.parents.filter(function (p) { return p.alive && p.age >= 60; }).length;
    if (old && s.lastInc > 0) { var sup = s.lastInc * 0.06 * old * (c.gdp < 10 ? 1.5 : 1); s.money -= sup; cashNote(s, 'Допомога батькам', -sup); }
  }
}
(function () {
  // зв'язки родини при пошуку роботи
  var oc = offerChance;
  offerChance = function (s, j) { var p = oc(s, j); var d = s.flags.elite ? 12 : s.d; return clamp(p * (1 + (d - 5) * 0.04) * (s.priv && j.edu >= 5 ? 1.1 : 1), 0.03, 0.97); };
  // приватна школа допомагає вступити
  var ac = admitChance;
  admitChance = function (s, f, kind) { return clamp(ac(s, f, kind) + (s.priv && !kind ? 0.1 : 0) + (s.d - 5) * 0.01, 0.03, 0.95); };
  // бізнес з батьківськими знайомствами живе довше
  YEARLY.push(familyLuckTick);
})();
