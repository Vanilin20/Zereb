// ЖЕРЕБ — рушій симуляції
var R = Math.random;
function rnd(a, b) { return a + R() * (b - a); }
function ri(a, b) { return Math.floor(rnd(a, b + 1)); }
function pick(a) { return a[Math.floor(R() * a.length)]; }
function chance(p) { return R() < p; }
function clamp(v, a, b) { if (a === undefined) a = 0; if (b === undefined) b = 100; return Math.max(a, Math.min(b, v)); }
function gauss() { var u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function wpick(arr, w) { var t = 0, i; for (i = 0; i < arr.length; i++) t += w(arr[i]); var r = R() * t; for (i = 0; i < arr.length; i++) { r -= w(arr[i]); if (r <= 0) return arr[i]; } return arr[arr.length - 1]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function poisson(l) { var L = Math.exp(-l), k = 0, p = 1; do { k++; p *= R(); } while (p > L); return k - 1; }
function erf(x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x); var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
function ncdf(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }

// Гроші всередині гри — у доларах ПКС. fmt() ставить мітку ⟦сума⟧, а інтерфейс показує її в обраній валюті.
var CURRENCIES = {
  USD: { n: 'Долари', rate: 1, pre: '$', post: '' },
  EUR: { n: 'Євро', rate: 0.9, pre: '', post: ' €' },
  UAH: { n: 'Гривні', rate: 45.3, pre: '', post: ' ₴' }
};
var CUR = 'USD';
function fmt(x) { return '⟦' + Math.round(x) + '⟧'; }
function money(x) {
  var C2 = CURRENCIES[CUR] || CURRENCIES.USD, n = Math.round(x * C2.rate), neg = n < 0; n = Math.abs(n);
  var str;
  if (n >= 1e9) str = (n / 1e9).toFixed(1).replace('.', ',') + ' млрд';
  else if (n >= 1e6) str = (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.', ',') + ' млн';
  else str = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '−' : '') + C2.pre + str + C2.post;
}
function normMoney(s) { if (s.money < 0) { addDebt(s, -s.money, 'разові витрати в мінус'); s.money = 0; } }
function addDebt(s, a, why) { if (!(a > 0)) return; s.debt += a; s.debtSrc = s.debtSrc || {}; s.debtSrc[why] = (s.debtSrc[why] || 0) + a; }
function payDebt(s, a) { if (!(a > 0) || !s.debt) return; var k = s.debt > 0 ? Math.max(0, 1 - a / s.debt) : 0; s.debt -= a; if (s.debtSrc) for (var x in s.debtSrc) { s.debtSrc[x] *= k; if (s.debtSrc[x] < 1) delete s.debtSrc[x]; } }
function cur(text) { return String(text).replace(/⟦(-?\d+)⟧/g, function (m, v) { return money(+v); }); }

// ---------- Смертність: Гомпертц, відкалібрований під тривалість життя країни ----------
var GB = 0.085, BASEQ = 0.0003;
function calib(c) {
  var qc = 1 - Math.pow(1 - c.u5 / 1000, 1 / 5);
  function e0(a) { var S = 1, e = 0; for (var x = 0; x < 125; x++) { var q = x < 5 ? qc : Math.min(1, BASEQ + a * Math.exp(GB * x)); var S2 = S * (1 - q); e += (S + S2) / 2; S = S2; } return e; }
  var lo = 1e-9, hi = 0.1;
  for (var i = 0; i < 60; i++) { var m = Math.sqrt(lo * hi); if (e0(m) > c.le) lo = m; else hi = m; }
  c.ga = Math.sqrt(lo * hi); c.qc = qc;
  // крива виживання для підсумку
  var S = 1; c.surv = [1];
  for (var x = 0; x < 125; x++) { S *= 1 - hazard(c, x); c.surv.push(S); }
}
function hazard(c, age) { return age < 5 ? c.qc : Math.min(1, BASEQ + c.ga * Math.exp(GB * age)); }
COUNTRY_LIST.forEach(calib);
function expH(age) { return age < 30 ? 75 : Math.max(25, 75 - (age - 30) * 0.5); }

function C(s) { return COUNTRIES[s.country]; }
function g(s, m, f) { return s.sex === 'm' ? m : f; }
function gp(p, m, f) { return p.sex === 'm' ? m : f; }
function cf(s) { return s.cf[s.country] != null ? s.cf[s.country] : C(s).conflict; }
function nameFrom(code, sex) { var ns = NAMES[COUNTRIES[code].names]; return pick(sex === 'm' ? ns.m : ns.f); }
function fullName(s) { return s.first + ' ' + s.last; }

function say(s, t, k) { if (s.nolog || !s.cur) return; s.cur.lines.push({ t: t, k: k || '' }); }
function mark(s, t) { if (s.nolog) return; s.tl.push({ age: s.age, year: s.year, t: t }); }
function add(s, o) { for (var k in o) { if (k in s.st) s.st[k] = clamp(s.st[k] + o[k]); else if (k in s.sk) s.sk[k] = clamp(s.sk[k] + o[k]); else if (k === 'fame') s.fame = clamp(s.fame + o[k]); else if (k === 'money') s.money += o[k]; else if (k === 'gpa') s.gpa = clamp(s.gpa + o[k]); } }
function M(s) { return C(s).median; }

// ---------- Нове життя ----------
function newLife(o) {
  o = o || {};
  var c = o.country ? COUNTRIES[o.country] : wpick(COUNTRY_LIST, function (x) { return x.births; });
  var sex = o.sex || (chance(0.512) ? 'm' : 'f');
  var d = o.d || ri(1, 10), q = Math.ceil(d / 2);
  var elite = o.elite || (d === 10 && !o.d && chance(0.01));   // 1% найбагатших у верхньому децилі = 0,1% родин
  var urban = o.urban != null ? o.urban : chance(c.urban);
  var ns = NAMES[c.names];
  var s = {
    citizen: [c.code], status: 'citizen',
    v: 2, id: Date.now() + '-' + ri(0, 99999), sandbox: !!o.sandbox,
    first: o.name || pick(sex === 'm' ? ns.m : ns.f), last: pick(ns.s), sex: sex, pref: o.pref || 'opp',
    birth: c.code, country: c.code, countries: [c.code], urban: urban, q: q, d: d,
    fam: elite ? c.median * Math.exp(6.8 + gauss() * 1.15) : 0,
    year: 2026, birthYear: 2026, age: 0, alive: true, cause: '',
    st: { health: clamp(ri(62, 92) - (c.u5 > 50 ? 8 : 0)), smarts: ri(25, 75), happy: 75, social: ri(30, 70) },
    sk: { music: 0, art: 0, code: 0, write: 0, cook: 0, sport: 0, eng: NATIVE_EN.indexOf(c.code) >= 0 ? 100 : 0, biz: 0, craft: 0 },
    sched: {}, h: {}, payLuck: Math.exp(gauss() * c.gini * 0.9 - 0.5 * Math.pow(c.gini * 0.9, 2)), own: { car: null, carVal: 0, gear: 0, homeLvl: 0, pet: null, petAge: 0 },
    lang: {}, credit: 60, record: 0, recordAge: 0, prison: 0, diet: 1, sleep: 1, lowYrs: 0,
    gen: { heart: Math.exp(gauss() * 0.35), cancer: Math.exp(gauss() * 0.35) }, staffAll: 0,
    port: {}, fame: 0, money: 0, debt: 0, inv: { dep: 0, stk: 0, cry: 0 }, home: null, rentals: [], ls: 1, withParents: true,
    edu: 0, fields: [], vfields: [], study: null, gpa: 60, noSchool: false,
    job: null, wy: {}, workYears: 0, retired: false, jobHist: [],
    biz: [], bizHist: [], bizYears: 0,
    parents: [], sibs: [], younger: 0, partner: null, exes: 0, marriages: 0, kids: [], grandkids: 0, friends: 0,
    immigrant: false, immYrs: 0, cf: {}, seen: {}, flags: {}, log: [], tl: [], ap: 0, used: {},
    econ: 0, econT: 0, lastInc: 0, hhInc: 0,
    stat: { peakInc: 0, incSum: 0, incYears: 0, travels: 0, peakNet: 0, maxFame: 0 }
  };
  // батьки
  var momAge = c.tfr > 3 ? ri(16, 32) : ri(20, 38);
  s.parents.push({ name: nameFrom(c.code, 'f'), sex: 'f', role: 'Мама', age: momAge, alive: true, rel: 75 });
  if (!chance(0.07)) s.parents.push({ name: nameFrom(c.code, 'm'), sex: 'm', role: 'Тато', age: momAge + ri(-2, 8), alive: true, rel: 70 });
  else s.flags.oneParent = true;
  // брати й сестри
  var n = Math.max(1, poisson(c.tfr * (q <= 2 ? 1.15 : 0.9)));
  var older = ri(0, n - 1); s.younger = n - 1 - older;
  var a = 0;
  for (var i = 0; i < older; i++) { a += ri(1, 4); var sx = chance(.5) ? 'm' : 'f'; s.sibs.push({ name: nameFrom(c.code, sx), sex: sx, age: a, alive: true, rel: 60 }); }
  if (c.lang !== 'en') s.lang[c.lang] = 100;
  if (elite) { s.flags.elite = 1; s.urban = true; }
  s.cur = { age: 0, year: s.year, lines: [] }; s.log.push(s.cur);
  var place = urban ? 'у місті' : 'у селі';
  say(s, g(s, 'Ти народився', 'Ти народилася') + ' ' + place + ', ' + c.name + ' ' + c.flag + ', у родині з ' + d + '-го децилю за статком (' + DEC_LBL[d - 1] + ').', 'big');
  var fam = s.parents.map(function (p) { return p.role.toLowerCase() + ' ' + p.name + ' (' + p.age + ')'; }).join(', ');
  say(s, 'Батьки: ' + fam + (s.flags.oneParent ? '. Тата поруч немає.' : '.') + (older ? ' Старших братів і сестер: ' + older + '.' : ''));
  mark(s, 'Народження: ' + c.name);
  s.ap = 0;
  return s;
}
// Децилі статку родини всередині країни: дохід родини відносно медіанного, смертність
var DEC_LBL = ['найбідніша', 'дуже бідна', 'бідна', 'нижче середнього', 'середня', 'середня', 'вище середнього', 'заможна', 'багата', 'дуже багата'];
var DEC_INC = [0.25, 0.4, 0.55, 0.7, 0.85, 1, 1.2, 1.5, 2.1, 4.5];
var DEC_CHILD = [1.75, 1.45, 1.25, 1.1, 1, 0.92, 0.82, 0.72, 0.6, 0.45];
var DEC_MORT = [1.45, 1.3, 1.18, 1.08, 1, 0.95, 0.88, 0.82, 0.75, 0.68];
function decMult(c, d) { return Math.pow(DEC_INC[d - 1], c.gini / 0.33); }
function familyIncome(s) { var c = COUNTRIES[s.birth]; return s.flags && s.flags.elite ? s.fam * 0.05 : c.median * 1.6 * decMult(c, s.d); }
function birthOdds(code) { return COUNTRIES[code].births / TOTAL_BIRTHS; }

// ---------- Доходи ----------
function langLevel(s, L) { return L === 'en' ? s.sk.eng : ((s.lang && s.lang[L]) || 0); }
// Наскільки добре ти можеш працювати в країні мовою (0-1)
function workLang(s, code) { var c = COUNTRIES[code]; var l = langLevel(s, c.lang); if (c.engOk) l = Math.max(l, s.sk.eng * 0.85); return clamp(l, 0, 100) / 100; }
function immFactor(s) { if (!s.immigrant) return 1; return Math.min(1, 0.5 + 0.04 * s.immYrs + workLang(s, s.country) * 0.5); }
function taxRate(s, gross) { var c = C(s); if (!c.tax) return 0; if (c.flat) return c.tax; if (gross <= 0) return 0; return Math.min(c.top * 0.92, c.tax * Math.max(0.55, 0.6 + 0.4 * Math.log2(1 + gross / c.median))); }
function corpTax(s, b) { var c = C(s); if (c.code === 'UA' && b.cap < c.median * 10) return 0.05; return c.corp; }   // в Україні малий бізнес — ФОП, єдиний податок ~5%
function jobBase(s, j) { var c = C(s); var base = c.median; if (j.g) base = Math.max(c.median, c.median * (1 - j.g) + 22000 * j.g); return base * j.pay; }
function fameMult(f) { return 0.4 + 0.02 * f + (f > 70 ? Math.pow(f - 70, 2) * 0.02 : 0); }
function jobPay(s) {
  if (!s.job) return 0;
  if (s.job.teen) return M(s) * s.job.pay;
  var j = JOB[s.job.id];
  var p = jobBase(s, j) * LV_PAY[s.job.lvl] * (1 + 0.015 * Math.min(20, s.job.yrs));
  if (j.vol) {
    p *= fameMult(s.fame);
    var vk = j.vol === 'social' ? null : j.vol;
    if (vk) p *= clamp(hobbyMarket(s, vk), 0.4, 1.3) * (0.7 + 0.6 * mastery(s, vk, skillNeed(s, vk, j.alt[vk])));
  } else if (s.job.hobby) {
    // без диплома: платять за реальну майстерність, а не за папірець
    p *= 0.75 + 0.5 * mastery(s, s.job.hobby, skillNeed(s, s.job.hobby, j.alt[s.job.hobby]));
  }
  p *= immFactor(s) * (s.job.bonus || 1) * (s.payLuck || 1) * (s.immigrant && resStatus(s) === 'illegal' ? 0.6 : 1);
  if (s.job.part) p *= 0.45;
  if (s.econ > 0 && j.g) p *= 1.05;
  return p;
}
function pension(s) { var c = C(s); return c.median * c.pens * (0.6 + Math.min(40, s.workYears) / 50) * (isCitizen(s) ? 1 : resStatus(s) === 'pr' ? 0.8 : 0.4); }
function netWorth(s) {
  var w = s.money + s.inv.dep + s.inv.stk + s.inv.cry - s.debt;
  if (s.home) w += s.home.val;
  s.rentals.forEach(function (r) { w += r.val; });
  s.biz.forEach(function (b) { w += bizValue(s, b); });
  return w;
}
function globalPct(inc) { if (inc <= 0) return 0; return ncdf((Math.log(inc) - Math.log(3500)) / 1.2); }
function lifePct(code, age) { var c = COUNTRIES[code]; return 1 - c.surv[Math.min(124, age + 1)]; }
function worldLifePct(age) { var t = 0; COUNTRY_LIST.forEach(function (c) { t += c.births * (1 - c.surv[Math.min(124, age + 1)]); }); return t / TOTAL_BIRTHS; }

// ---------- Роботи ----------
function skillVal(s, k) { return k in s.st ? s.st[k] : (s.sk[k] || 0); }
function yearsIn(s, id) { return s.wy[id] || 0; }
function jobCheck(s, j) {
  var why = [];
  if (s.age < 16) return { ok: false, why: ['з 16 років'] };
  if (j.age && (s.age < j.age[0] || s.age > j.age[1])) why.push('вік ' + j.age[0] + '–' + j.age[1]);
  if (j.urban && !s.urban) why.push('тільки в місті');
  if (j.need) for (var k in j.need) if (skillVal(s, k) < j.need[k]) why.push(statName(k) + ' ≥ ' + j.need[k]);
  if (j.prev) {
    var okp = false, parts = [];
    for (var p in j.prev) { if (yearsIn(s, p) >= j.prev[p]) okp = true; parts.push(JOB[p].n + ' ' + j.prev[p] + ' р.'); }
    if (!okp) why.push('досвід: ' + parts.join(' або '));
  }
  if (j.exp && s.workYears < j.exp) why.push('стаж ' + j.exp + ' р.');
  if (RECORD_BAN.indexOf(j.id) >= 0 && hasRecord(s)) why.push('без судимості');
  var eduOk = !j.skillOnly && s.edu >= j.edu && (!j.f || j.f.some(function (f) { return s.fields.indexOf(f) >= 0 || s.vfields.indexOf(f) >= 0; }));
  var altOk = false;
  if (j.alt) {
    var keys = Object.keys(j.alt);
    var test = function (k) { return skillVal(s, k) >= skillNeed(s, k, j.alt[k]); };
    altOk = (j.allAlt ? keys.every(test) : keys.some(test)) && s.edu >= Math.min(j.edu, 2);
  }
  if (!eduOk && !altOk) {
    var w = [];
    if (!j.skillOnly) w.push(EDU_NAMES[Math.max(j.edu, 1)] + (j.f ? ' (' + j.f.map(fieldName).join(' / ') + ')' : ''));
    if (j.alt) w.push(Object.keys(j.alt).map(function (k) { return statName(k) + ' ≥ ' + skillNeed(s, k, j.alt[k]); }).join(j.allAlt ? ' і ' : ' або '));
    why.push(w.join(' — або — '));
  }
  return { ok: why.length === 0, why: why, viaHobby: !eduOk && altOk };
}
function fieldName(f) { return UNI_FIELDS[f] ? UNI_FIELDS[f].n : (VOC_FIELDS[f] ? VOC_FIELDS[f].n : f); }
function statName(k) { return { health: 'Здоровʼя', smarts: 'Розум', happy: 'Щастя', social: 'Харизма' }[k] || SKILL_NAMES[k] || k; }
function hobbyFor(jobId) { var r = []; for (var k in HOBBY) if (HOBBY[k].jobs.indexOf(jobId) >= 0) r.push(k); return r; }
// Ринок для навички в країні: місцевий попит (місто, достаток) + глобальний (через англійську та інтернет)
function hobbyMarket(s, k) {
  var c = C(s), H = HOBBY[k];
  var local = clamp(0.35 + c.urban * 0.35 + Math.min(c.gdp, 60) / 90 + (s.urban ? 0.1 : -0.15), 0.25, 1.4);
  if (k === 'sport') local = clamp(0.3 + Math.min(c.gdp, 60) / 60, 0.3, 1.3);   // інфраструктура, клуби, спонсори
  if (k === 'craft' || k === 'cook') local = clamp(0.6 + c.urban * 0.3 + (s.urban ? 0.1 : 0), 0.5, 1.2); // потрібні всюди
  var glob = H.g * (c.gdp > 30 ? 0.8 : 1);
  var g = clamp(s.sk.eng / 100, 0, 1) * 1.3 * (k === 'code' && C(s).gdp < 25 ? 1.15 : 1);
  return (1 - glob) * local + glob * g;
}
// Поріг майстерності: у багатих країнах конкуренція вища
function skillNeed(s, k, base) { var gdp = C(s).gdp; return clamp(base + (gdp > 40 ? 8 : gdp < 8 ? -8 : 0), 10, 95); }
function mastery(s, k, need) { var v = skillVal(s, k); return clamp((v - need) / Math.max(10, 100 - need), 0, 1); }
// Чи взяли на роботу через хобі (без профільного диплома) — і наскільки сильна позиція
function altInfo(s, j) {
  if (!j.alt) return null;
  var best = null;
  Object.keys(j.alt).forEach(function (k) {
    var need = skillNeed(s, k, j.alt[k]);
    var m = mastery(s, k, need), mk = k in HOBBY ? hobbyMarket(s, k) : 1;
    if (skillVal(s, k) >= need && (!best || m * mk > best.m * best.mk)) best = { k: k, need: need, m: m, mk: mk };
  });
  return best;
}
function freelancePay(s, k) {
  var c = C(s), H = HOBBY[k], v = s.sk[k];
  var local = c.median * (0.04 + Math.pow(v / 100, 2) * 0.45) * hobbyMarket(s, k);
  return local * (1 + Math.min(10, s.port[k] || 0) * 0.05) * (H.g ? 1 + H.g * clamp((22000 - c.median) / 22000, 0, 1) * s.sk.eng / 100 : 1);
}
function offerChance(s, j) {
  var p = j.comp;
  p *= 1 + (s.st.smarts - 50) / 200 + (s.st.social - 50) / 250;
  if (s.edu > j.edu + 1 && !j.vol) p *= 1.08;
  if (s.gpa > 80 && s.age < 27) p *= 1.1;
  hobbyFor(j.id).forEach(function (k) { p *= 1 + s.sk[k] / 250 + Math.min(5, s.port[k] || 0) * 0.04; });
  var chk = jobCheck(s, j);
  if (chk.viaHobby) { var ai = altInfo(s, j); if (ai) p *= (0.45 + ai.m * 0.8) * clamp(ai.mk, 0.4, 1.3); }
  if (yearsIn(s, j.id) > 0) p *= 1.25;
  if (s.econ < 0) p *= 0.75;
  p *= clamp(1 - C(s).unemp * 2.2, 0.25, 1);
  if (s.workYears === 0 && j.edu >= 4 && !j.vol) p *= 0.7;   // без досвіду важче
  if (s.age >= 16 && s.age < 25 && C(s).unemp > 0.1) p *= 0.85;   // молодіжне безробіття
  p *= immFactor(s);
  if (s.age > 55) p *= 0.7;
  p *= 1 + Math.min(0.2, s.friends * 0.03);   // знайомі підказують вакансії
  if (hasRecord(s)) p *= 0.6;
  if (s.immigrant && resStatus(s) === 'illegal') p *= j.edu <= 2 ? 0.5 : 0.05;   // без документів — лише неформальна робота
  if (cf(s) === 2) p *= 0.85;
  return clamp(p, 0.03, 0.97);
}
function takeJob(s, j, part) {
  if (s.job) endJob(s, 'змінив роботу');
  var lvl = 0;
  if (yearsIn(s, j.id) >= 3) lvl = Math.min(j.max, Math.floor(yearsIn(s, j.id) / 4));
  s.job = { id: j.id, lvl: lvl, yrs: 0, lvlYrs: 0, perf: 55, part: !!part, start: s.age };
  var chk = jobCheck(s, j);
  if (chk.viaHobby) { var ai = altInfo(s, j); if (ai && ai.k in s.sk) s.job.hobby = ai.k; s.flags.hobbyJob = 1; }
  s.biz.forEach(function (b) { if (!b.mgr) b.effort = 0.5; });
  mark(s, 'Робота: ' + j.n);
}
function endJob(s, why) {
  if (!s.job) return;
  if (!s.job.teen) s.jobHist.push({ id: s.job.id, from: s.job.start, to: s.age, lvl: s.job.lvl, why: why });
  s.job = null;
  s.biz.forEach(function (b) { if (!b.mgr) b.effort = 1; });
}
function lvName(j, l) { var a = j.lv || LV; return a[Math.min(l, a.length - 1)] || LV[Math.min(l, 4)]; }
function jobTitle(s) {
  if (s.prison) return 'У вʼязниці (ще ' + s.prison + ' р.)';
  if (s.gang && !s.job) return rankName(s.gang) + ' (' + s.gang.kind + ')';
  if (s.pol && s.pol.office >= 2) return offices(s)[s.pol.office];
  if (!s.job) return s.retired ? 'Пенсіонер' : (s.study ? studyName(s.study) : (s.age < 6 ? 'Дитина' : 'Без роботи'));
  if (s.job.teen) return s.job.n + ' (підробіток)';
  var j = JOB[s.job.id];
  return j.n + (j.max ? ' · ' + lvName(j, s.job.lvl) : '') + (s.job.part ? ' (частково)' : '');
}
function studyName(st) {
  if (st.t === 'school') return st.st === 'primary' ? 'Учень початкової школи' : (st.st === 'lower' ? 'Школяр' : 'Старшокласник');
  if (st.t === 'voc') return 'Студент коледжу (' + fieldName(st.f) + ')';
  if (st.t === 'uni') return 'Студент (' + fieldName(st.f) + ')';
  if (st.t === 'master') return 'Магістрант (' + fieldName(st.f) + ')';
  return 'Аспірант (' + fieldName(st.f) + ')';
}

// ---------- Бізнес ----------
function bizQ(s, b) {
  var T = BIZM[b.type], rel = 0;
  T.rel.jobs.forEach(function (id) { rel = Math.max(rel, Math.min(10, yearsIn(s, id)) * 7); });
  var sk = s.sk[T.rel.skill] || 0;
  var q = 0.25 * s.st.smarts + 0.25 * s.sk.biz + 0.2 * Math.max(rel, sk) + 0.15 * Math.min(100, s.bizYears * 8) + 0.15 * s.st.social
    + (s.fields.indexOf('econ') >= 0 ? 6 : 0) + (b.effort >= 1 ? 5 : (b.mgr ? 0 : -8)) + (b.mgr ? 4 : 0) + (b.focus ? 8 : 0) - Math.max(0, s.biz.filter(function (x) { return !x.mgr; }).length - 1) * 6;
  return clamp(q);
}
function bizReadyLabel(q) { return q < 30 ? 'слабка' : q < 45 ? 'середня' : q < 60 ? 'добра' : 'відмінна'; }
// Оцінка шансу протриматися 3 роки без докладання грошей (Монте-Карло)
function bizSurvival(s, type) {
  var T = BIZM[type], ok = 0, N = 300;
  var b = { type: type, effort: s.job ? 0.5 : 1, mgr: false };
  var q = bizQ(s, b);
  for (var i = 0; i < N; i++) {
    var cap = 0.8, cash = 0.2, alive = true;
    for (var y = 0; y < 3; y++) {
      var econ = chance(0.1) ? -1 : 0;
      var roi = T.roi + (q - 35) / 200 - (y === 0 ? T.ramp : 0) + econ * T.cyc + gauss() * T.vol;
      cash += cap * roi; if (roi > 0) cap *= 1 + roi * 0.25;
      if (cash < -0.3 * cap) { alive = false; break; }
      var res = 0.2 * cap; if (cash > res) cash -= (cash - res) * 0.5;
    }
    if (alive) ok++;
  }
  return { q: q, p: ok / N };
}
function bizCan(s, T) {
  if (T.need && T.need.field && s.fields.indexOf(T.need.field) < 0) return 'потрібна освіта: ' + fieldName(T.need.field);
  if (T.need && T.need.job && yearsIn(s, T.need.job) < T.need.yrs) return 'потрібно ' + T.need.yrs + ' р. досвіду: ' + JOB[T.need.job].n.toLowerCase();
  return '';
}
function canBorrow(s) { return s.age >= 18 && s.credit >= 35 && !s.flags.bankrupt; }
function bizCost(s, type) { return BIZM[type].cost * M(s); }
function openBiz(s, type, pm, loc) {
  var T = BIZM[type], cost = bizCost(s, type) * (pm || 1), loan = 0;
  if (s.money < cost) { loan = cost - s.money; addDebt(s, loan, 'кредит на бізнес'); s.money = 0; s.loans = (s.loans || 0) + 1; } else s.money -= cost;
  var b = { loc: loc || 0, share: 1, staff: 0, points: 1, type: type, cap: cost * 0.8, cash: cost * 0.2, yrs: 0, effort: s.job ? 0.5 : 1, mgr: false, div: 0.5, paid: 0, comp: 0, last: 0, hist: [], start: s.age, name: T.n };
  s.biz.push(b);
  mark(s, 'Відкри' + g(s, 'в', 'ла') + ' бізнес: ' + T.n);
  return 'Ти відкри' + g(s, 'в', 'ла') + ' «' + T.n + '». Вкладено ' + fmt(cost) + (loan ? ', з них ' + fmt(loan) + ' у кредит' : '') + '.';
}
function bizValue(s, b) {
  var avg = b.hist.length ? b.hist.slice(-3).reduce(function (a, x) { return a + x; }, 0) / Math.min(3, b.hist.length) : 0;
  return Math.max(0, b.cap * 0.5 + b.cash + Math.max(0, avg) * 2 + (b.fran || 0) * M(s) * 0.6) * (b.share || 1);
}
function closeBiz(s, b, how, value) {
  var i = s.biz.indexOf(b); if (i >= 0) s.biz.splice(i, 1);
  if (value != null) { if (value >= 0) s.money += value; else { addDebt(s, -value, 'борги закритого бізнесу'); s.credit = clamp(s.credit - 15); } }
  s.bizHist.push({ type: b.type, name: b.name, yrs: b.yrs, how: how, paid: b.paid, value: value || 0 });
}
function bizTick(s, out) {
  var c = C(s), ownerPay = 0;
  s.sectorShock = {};
  if (s.biz.length) Object.keys(SECTOR).forEach(function (k) { var sec = SECTOR[k]; if (s.sectorShock[sec] != null) return; var r = R(); s.sectorShock[sec] = r < 0.12 ? -0.18 : r < 0.22 ? 0.07 : 0; });
  Object.keys(s.sectorShock).forEach(function (sec) { if (s.sectorShock[sec] < 0 && s.biz.some(function (b) { return SECTOR[b.type] === sec; })) say(s, 'Поганий рік для сфери «' + sec + '»: клієнтів поменшало.', 'bad'); });
  s.biz.slice().forEach(function (b) {
    var T = BIZM[b.type], q = bizQ(s, b);
    var active = s.biz.filter(function (x) { return !x.mgr; }).length, eff = b.mgr ? b.effort : b.effort / Math.max(1, active);   // одна людина не може повністю тягнути кілька бізнесів
    var roi = T.roi + (b.loc || 0) + (b.mom || 0) + (q - 35) / 200 - (b.yrs === 0 ? T.ramp : 0) + s.econ * T.cyc + gauss() * T.vol - b.comp;
    if (s.econ > 0) roi = T.roi + (b.loc || 0) + (b.mom || 0) + (q - 35) / 200 - (b.yrs === 0 ? T.ramp : 0) + 0.04 + gauss() * T.vol - b.comp;
    b.comp *= 0.6;
    var sat = BIZM[b.type].cost * c.median * (BIZ_SCALE[b.type] || 20);
    if (b.cap > sat) roi -= 0.15 * Math.log2(b.cap / sat);   // ринок не безмежний
    var sec = SECTOR[b.type] || 'інше', sh = s.sectorShock && s.sectorShock[sec] || 0; roi += sh;
    var sameSec = s.biz.filter(function (x) { return x !== b && SECTOR[x.type] === sec; }).length;
    var otherSec = {}; s.biz.forEach(function (x) { if (x !== b && SECTOR[x.type] !== sec) otherSec[SECTOR[x.type]] = 1; });
    roi += Math.min(0.05, Object.keys(otherSec).length * 0.02) - sameSec * 0.04;   // різні сфери підтримують одна одну, однакові — конкурують
    var prof = b.cap * roi;
    if (b.mgr) prof -= c.median * 0.8;
    if (b.staff) { var prod = 0.85 + q / 250 + gauss() * 0.15 - Math.max(0, b.staff - 5) * 0.008 + (s.econ < 0 ? -0.25 : s.econ > 0 ? 0.08 : 0) - (b.cap > sat ? 0.1 * Math.log2(b.cap / sat) : 0) - Math.max(0, b.staff - 20) * 0.003; prof += b.staff * c.median * 0.9 * (prod - 1); }
    if (b.fran != null) { if (chance(clamp((q - 40) / 100 + 0.1, 0.02, 0.6))) { var nf = ri(1, 2); b.fran += nf; say(s, '«' + b.name + '»: +' + nf + ' франчайзі. Усього: ' + b.fran + '.', 'good'); } if (b.fran > 0 && q < 35 && chance(0.15)) { b.fran--; say(s, 'Франчайзі пішов від «' + b.name + '» — бренд слабшає.', 'bad'); } b.fran = Math.min(b.fran, (BIZ_SCALE[b.type] || 20) * 2); prof += b.fran * c.median * 0.25; }
    var ctax = prof > 0 ? prof * corpTax(s, b) : 0; prof -= ctax; s.yrTax = (s.yrTax || 0) + ctax;
    b.cash += prof; b.last = prof; b.hist.push(prof); b.yrs++; s.bizYears++;
    if (roi > 0 && b.cap < sat) b.cap *= 1 + roi * 0.25;
    b.focus = false;
    if (eff > 0) ownerPay += c.median * (0.7 + q / 60) * (T.pay || 1) * Math.sqrt(Math.min(4, b.cap / (BIZM[b.type].cost * c.median))) * eff * (b.mgr ? 0.3 : 1);
    var res = 0.2 * b.cap;
    if (b.cash > res) { var d = (b.cash - res) * b.div; b.cash -= d; s.money += d * (b.share || 1); b.paid += d * (b.share || 1); cashNote(s, 'Дивіденди з бізнесу', d * (b.share || 1)); }
    add(s, { biz: 2 + (b.effort >= 1 ? 2 : 0) });
    b.focus = false;
    // вихід стартапу
    if (T.startup && b.yrs >= 2 && q > 50 && chance(0.004 + (q - 50) / 4000)) {
      var v = b.cap * (q > 75 && chance(0.01) ? rnd(50, 400) : rnd(3, 15)) * (b.share || 1);
      say(s, 'Твій «' + b.name + '» купила велика компанія за ' + fmt(v) + '!', 'big');
      mark(s, 'Прода' + g(s, 'в', 'ла') + ' стартап за ' + fmt(v));
      closeBiz(s, b, 'куплено інвестором', v);
      return;
    }
    // у журнал — лише помітне: перший прибуток, зміна знаку, різкий стрибок, зміна етапу
    var prevP = b.hist.length > 1 ? b.hist[b.hist.length - 2] : null, stg = typeof bizStage === 'function' ? bizStage(b) : '';
    if (prevP === null) say(s, '«' + b.name + '»: перший рік — ' + (prof >= 0 ? 'прибуток ' : 'збиток ') + fmt(Math.abs(prof)) + (prof < 0 ? '. Для старту це нормально.' : '.'), prof >= 0 ? 'good' : '');
    else if ((prevP < 0) !== (prof < 0)) say(s, '«' + b.name + '»: ' + (prof >= 0 ? 'вийшов у плюс — ' + fmt(prof) + ' за рік.' : 'пішов у мінус — ' + fmt(-prof) + ' збитку.'), prof >= 0 ? 'good' : 'bad');
    else if (Math.abs(prof - prevP) > Math.max(Math.abs(prevP) * 0.6, c.median * 0.4)) say(s, '«' + b.name + '»: ' + (prof > prevP ? 'різкий ріст' : 'різкий спад') + ' — ' + (prof >= 0 ? 'прибуток ' : 'збиток ') + fmt(Math.abs(prof)) + '.', prof > prevP ? 'good' : 'bad');
    if (stg && b.stg && b.stg !== 'старт' && stg !== b.stg && stg !== 'старт') say(s, '«' + b.name + '»: ' + { 'ріст': 'справа на підйомі.', 'стабільність': 'стабільний період.', 'спад': 'справи погіршуються.' }[stg], stg === 'спад' ? 'bad' : stg === 'ріст' ? 'good' : '');
    b.stg = stg;
    if (b.cash < -0.3 * b.cap) out.push(bizCrisis(s, b));
  });
  return ownerPay;
}
function bizCrisis(s, b) {
  var need = -b.cash + 0.15 * b.cap;
  return {
    title: 'Бізнес у мінусі', text: '«' + b.name + '» не покриває витрат: потрібно ' + fmt(need) + ', щоб розрахуватися з постачальниками й працівниками. Підготовка: ' + bizReadyLabel(bizQ(s, b)) + '.',
    opts: [
      { t: 'Докласти ' + fmt(need), sub: s.money >= need ? 'з власних заощаджень' : canBorrow(s) ? 'бракує ' + fmt(need - s.money) + ' — візьмеш кредит' : 'бракує грошей, а банк не дає кредит (рейтинг ' + Math.round(s.credit) + ')', dis: s.money < need && !canBorrow(s), f: function () { if (s.money >= need) s.money -= need; else { addDebt(s, need - s.money, 'порятунок бізнесу'); s.money = 0; } b.cash += need; return 'Ти врятува' + g(s, 'в', 'ла') + ' «' + b.name + '», доклавши ' + fmt(need) + '.'; } },
      { t: 'Скоротити витрати і працювати самому', sub: 'частина клієнтів піде', f: function () { b.cash += b.cap * 0.15; b.cap *= 0.75; b.effort = 1; b.mgr = false; add(s, { happy: -6, health: -3 }); return 'Ти уріза' + g(s, 'в', 'ла') + ' витрати. Бізнес менший, але живий.'; } },
      { t: 'Закрити бізнес', sub: 'продаж майна покриє частину боргів', f: function () { var v = b.cap * 0.25 + b.cash; closeBiz(s, b, 'закрито', v); add(s, { happy: -10 }); return 'Ти закри' + g(s, 'в', 'ла') + ' «' + b.name + '» після ' + b.yrs + ' р. ' + (v >= 0 ? 'Після розпродажу лишилося ' + fmt(v) + '.' : 'Залишився борг ' + fmt(-v) + '.'); } }
    ]
  };
}

// ---------- Освіта ----------
function tuition(s, t) {
  var c = C(s), f = c.fee;
  if (c.feeType === 'merit' && s.gpa >= 75) f = 0.02;   // бюджетне місце
  if (s.immigrant && c.feeType === 'free' && s.immYrs < 2) f = 0.15;
  return f * c.median * (t === 'voc' ? 0.5 : 1);
}
function feeNote(c) { return { free: 'безкоштовно', merit: 'бюджет при балі 75+', paid: 'платно', high: 'дорого' }[c.feeType]; }
function admitChance(s, f, kind) {
  var c = C(s), F = UNI_FIELDS[f];
  var p;
  if (kind === 'master') p = 0.35 + (s.gpa - 60) / 60;
  else if (kind === 'phd') p = 0.15 + (s.gpa - 65) / 60;
  else {
    p = (0.15 + c.sec * 0.5) * F.diff + (s.gpa - 60) / 70 + (s.st.smarts - 50) / 150 + (s.flags.olymp ? 0.15 : 0) + (s.vfields.length ? 0.08 : 0);
    if (f === 'it') p += s.sk.code / 350;
    if (f === 'arts') p += s.sk.art / 350;
    if (f === 'hum') p += (s.sk.write + s.sk.eng) / 600;
    if (f === 'med' || f === 'sci') p += (s.st.smarts - 60) / 200;
    if (s.age > 25) p -= 0.05;
  }
  return clamp(p * 100, 3, 95) / 100;
}
function payTuition(s) {
  var st = s.study; if (!st || st.t === 'school') return;
  if (st.scholar) return;
  var fee = tuition(s, st.t);
  var share = (s.age < 26 && s.parents.some(function (p) { return p.alive; })) ? (s.flags.elite ? 1 : [0, 0, 0, 0.3, 0.5, 0.6, 0.8, 1, 1, 1][s.d - 1]) : 0;
  s.money -= fee * (1 - share); cashNote(s, 'Навчання', -fee * (1 - share));
}
function startStudy(s, t, f, years) {
  if (s.study && s.study.t !== 'school') s.study = null;
  s.study = { t: t, f: f, left: years, scholar: s.gpa > 86 && t !== 'voc' };
  if (s.job && !s.job.part && !s.job.teen) s.flags.studyWork = true;
}
function uniOpts(s, kind, shorter) {
  return Object.keys(UNI_FIELDS).map(function (f) {
    var F = UNI_FIELDS[f], p = admitChance(s, f, 'bach'), fee = tuition(s, 'uni');
    var yrs = Math.max(2, F.years - (shorter ? 1 : 0));
    return {
      t: F.n, sub: 'шанс вступу ' + Math.round(p * 100) + '% · ' + yrs + ' р. · ' + (fee > 0 ? fmt(fee) + '/рік' : 'безкоштовно'),
      f: function () {
        if (chance(p)) { startStudy(s, 'uni', f, yrs); mark(s, 'Вступ: ' + F.n); return g(s, 'Ти вступив', 'Ти вступила') + ' на «' + F.n + '»!' + (s.study.scholar ? ' Ще й на стипендію.' : ''); }
        add(s, { happy: -6 }); return 'Не вистачило балів на «' + F.n + '». Можна спробувати наступного року (вкладка «Освіта»).';
      }
    };
  });
}
function vocOpts(s, years) {
  return Object.keys(VOC_FIELDS).map(function (f) {
    return { t: VOC_FIELDS[f].n, sub: years + ' р. навчання', f: function () { startStudy(s, 'voc', f, years); mark(s, 'Коледж: ' + VOC_FIELDS[f].n); return 'Ти вступи' + g(s, 'в', 'ла') + ' до коледжу: ' + VOC_FIELDS[f].n + '.'; } };
  });
}
function after9(s) {
  return {
    title: '9 класів позаду', text: 'Ти ' + g(s, 'закінчив', 'закінчила') + ' базову школу. Середній бал: ' + Math.round(s.gpa) + '. Що далі?',
    opts: [
      { t: 'Старша школа', sub: '2 роки, потім університет', f: function () { s.study = { t: 'school', st: 'upper', left: 2 }; return 'Ти ' + g(s, 'пішов', 'пішла') + ' у 10 клас.'; } },
      { t: 'Коледж', sub: 'робоча професія за 3 роки', f: function () { return { title: 'Який коледж?', text: 'Обери напрям.', opts: vocOpts(s, 3) }; } },
      { t: 'Піти працювати', sub: 'гроші вже зараз', f: function () { add(s, { happy: 2 }); return 'Ти виріши' + g(s, 'в', 'ла') + ', що навчання досить.'; } }
    ]
  };
}
function after11(s) {
  return {
    title: 'Випускний', text: 'Школу закінчено з балом ' + Math.round(s.gpa) + '. Куди далі?',
    opts: [
      { t: 'Вступати до університету', sub: 'обрати спеціальність', f: function () { return { title: 'Спеціальність', text: 'Шанс залежить від балу, розуму і профільних навичок.', opts: uniOpts(s) }; } },
      { t: 'Коледж', sub: 'професія за 2 роки', f: function () { return { title: 'Який коледж?', text: 'Обери напрям.', opts: vocOpts(s, 2) }; } },
      { t: 'Працювати', f: function () { return 'Ти ' + g(s, 'пішов', 'пішла') + ' у доросле життя одразу після школи.'; } },
      { t: 'Рік перерви', sub: 'відпочити і подумати', f: function () { add(s, { happy: 10 }); return 'Рік перерви — щоб зрозуміти, чого хочеш.'; } }
    ]
  };
}
function eduTick(s, out) {
  var c = C(s);
  if (s.age === 6 && !s.study && !s.noSchool) {
    var p = clamp(0.55 + c.sec * 0.45 + (s.q - 3) * 0.05 + (s.urban ? 0.05 : -0.05), 0.3, 0.99);
    if (cf(s) === 2) p -= 0.1;
    if (chance(p)) { s.study = { t: 'school', st: 'primary', left: 5 }; say(s, g(s, 'Ти пішов', 'Ти пішла') + ' до школи.'); }
    else { s.noSchool = true; say(s, 'Родина не змогла віддати тебе до школи. Факт: ≈250 млн дітей у світі не ходять до школи (UNESCO, 2023).', 'bad'); mark(s, 'Не піш' + g(s, 'ов', 'ла') + ' до школи'); }
    return;
  }
  var st = s.study; if (!st) return;
  var working = s.job && !s.job.teen;
  s.gpa = clamp(s.gpa * 0.55 + 0.45 * (45 + (s.st.smarts - 50) * 0.6 + Math.min(25, (s.h.study || 0) * 2.2) - (working ? (s.job.part ? 6 : 14) : 0) + (s.q - 3) * 2 + rnd(-10, 10)));
  var sq = 0.55 + 0.6 * c.sec + (s.urban ? 0.05 : -0.1);   // якість школи країни важить більше за старання
  add(s, { smarts: (st.t === 'school' ? 1.5 + s.gpa / 100 : 1 + s.gpa / 150) * sq * (s.st.smarts > 70 ? 0.45 : 1) });
  payTuition(s);
  st.left--;
  // вибування з бідних шкіл
  if (st.t === 'school' && s.age >= 10 && s.q <= 2 && c.gdp < 10 && chance(0.05 * (1 - c.sec))) {
    s.study = null; say(s, 'Довелося кинути школу, щоб допомагати родині.', 'bad'); mark(s, 'Кину' + g(s, 'в', 'ла') + ' школу'); return;
  }
  if (st.left > 0) return;
  s.study = null;
  if (st.t === 'school') {
    if (st.st === 'primary') {
      s.edu = Math.max(s.edu, 1);
      var p2 = clamp(c.sec * 1.4 + 0.15 + (s.q - 3) * 0.08 + (s.gpa - 60) / 200, 0.1, 0.99);
      if (chance(p2)) s.study = { t: 'school', st: 'lower', left: 4 };
      else { say(s, 'Початкову школу закінчено, але далі вчитися родина не може.', 'bad'); }
    } else if (st.st === 'lower') { s.edu = Math.max(s.edu, 2); out.push(after9(s)); }
    else { s.edu = Math.max(s.edu, 3); mark(s, 'Закінчи' + g(s, 'в', 'ла') + ' школу'); out.push(after11(s)); }
  } else if (st.t === 'voc') {
    s.edu = Math.max(s.edu, 4); if (s.vfields.indexOf(st.f) < 0) s.vfields.push(st.f); mark(s, 'Диплом коледжу'); add(s, { craft: st.f === 'tech' ? 25 : 5, cook: st.f === 'cook' ? 25 : 0, code: st.f === 'itv' ? 20 : 0, art: st.f === 'beauty' ? 15 : 0 });
    say(s, 'Ти ' + g(s, 'отримав', 'отримала') + ' диплом коледжу: ' + fieldName(st.f) + '.', 'good');
    out.push({ title: 'Диплом коледжу', text: 'Що далі?', opts: [
      { t: 'Вступити до університету', sub: 'скорочена програма', f: function () { return { title: 'Спеціальність', text: 'Після коледжу навчання на рік коротше.', opts: uniOpts(s, 'bach', true) }; } },
      { t: 'Працювати за фахом', f: function () { return 'Час заробляти.'; } }] });
  } else if (st.t === 'uni') {
    s.edu = Math.max(s.edu, st.f === 'med' ? 6 : 5); if (s.fields.indexOf(st.f) < 0) s.fields.push(st.f);
    add(s, { code: st.f === 'it' ? 25 : 0, art: st.f === 'arts' ? 20 : 0, write: st.f === 'hum' ? 15 : 0, eng: 10 });
    mark(s, (st.f === 'med' ? 'Диплом лікаря' : 'Диплом бакалавра') + ': ' + fieldName(st.f));
    say(s, 'Ти ' + g(s, 'отримав', 'отримала') + ' диплом: ' + fieldName(st.f) + ' (бал ' + Math.round(s.gpa) + ').', 'good');
    if (st.f !== 'med') {
      var pm = admitChance(s, st.f, 'master');
      out.push({ title: 'Бакалаврат завершено', text: 'Підеш у магістратуру?', opts: [
        { t: 'Магістратура', sub: 'шанс ' + Math.round(pm * 100) + '% · 2 роки', f: function () { if (chance(pm)) { startStudy(s, 'master', st.f, 2); return 'Ти ' + g(s, 'вступив', 'вступила') + ' в магістратуру.'; } return 'У магістратуру не взяли.'; } },
        { t: 'Працювати', f: function () { return 'Досить теорії.'; } }] });
    }
  } else if (st.t === 'master') {
    s.edu = Math.max(s.edu, 6); mark(s, 'Диплом магістра'); say(s, 'Ти ' + g(s, 'став', 'стала') + ' магістром.', 'good');
    var pp = admitChance(s, st.f, 'phd');
    if (s.gpa > 65) out.push({ title: 'Аспірантура?', text: 'Науковий керівник пропонує тобі аспірантуру.', opts: [
      { t: 'Йти в науку', sub: 'шанс ' + Math.round(pp * 100) + '% · 4 роки', f: function () { if (chance(pp)) { startStudy(s, 'phd', st.f, 4); return 'Ти ' + g(s, 'став', 'стала') + ' аспірантом.'; } return 'Місць в аспірантурі не вистачило.'; } },
      { t: 'Ні, в індустрію', f: function () { return 'Наука почекає.'; } }] });
  } else if (st.t === 'phd') {
    s.edu = 7; mark(s, 'Захисти' + g(s, 'в', 'ла') + ' дисертацію'); say(s, 'Ти ' + g(s, 'захистив', 'захистила') + ' дисертацію. Тепер ти доктор наук.', 'big'); add(s, { happy: 10, smarts: 5 });
  }
}

// ---------- Родина ----------
function newPartner(s) {
  var sex = s.pref === 'same' ? s.sex : s.pref === 'any' ? (chance(.5) ? 'm' : 'f') : (s.sex === 'm' ? 'f' : 'm');
  var c = C(s);
  var age = clamp(s.age + ri(-4, 5), Math.max(16, s.age - 8), s.age + 10);
  if (s.age >= 18) age = Math.max(18, age);
  var occ = pick(['вчител' + (sex === 'm' ? 'ь' : 'ька'), 'продав' + (sex === 'm' ? 'ець' : 'чиня'), 'інженер', 'медсестра/медбрат', 'водій', 'бухгалтер', 'програміст', 'перукар', 'студент' + (sex === 'm' ? '' : 'ка'), 'фермер', 'менеджер', 'дизайнер', 'офіціант', 'лікар', 'будівельник']);
  return enrichPartner({ name: nameFrom(c.code, sex), sex: sex, age: age, occ: occ, inc: c.median * rnd(0.4, 1.8), rel: ri(40, 65), yrs: 0, married: false, alive: true, compat: ri(0, 40) });
}
function fertility(s) {
  var fa = s.sex === 'f' ? s.age : (s.partner && s.partner.sex === 'f' ? s.partner.age : null);
  if (fa == null) return 0;
  return fa < 30 ? 0.6 : fa < 35 ? 0.5 : fa < 40 ? 0.3 : fa < 45 ? 0.1 : 0;
}
function familyTick(s) {
  var c = C(s), bc = COUNTRIES[s.birth];
  var alivePar = s.parents.filter(function (p) { return p.alive; });
  if (s.fam) s.fam *= 1.015 + 0.1 * gauss() + s.econ * 0.08;
  s.parents.forEach(function (p) {
    if (!p.alive) return;
    p.age++; p.rel = clamp(p.rel - 1.5 + (s.h.family || 0) * 2);
    var mod = DEC_MORT[s.d - 1] * (p.ill ? 3 : 1);
    if (chance(hazard(bc, p.age) * mod)) {
      p.alive = false; add(s, { happy: -15 });
      var left = s.parents.filter(function (x) { return x.alive; }).length;
      var txt = 'Помер' + (p.sex === 'f' ? 'ла' : '') + ' ' + p.role.toLowerCase() + ', ' + p.name + ', у ' + p.age + ' р.';
      if (left === 0 && s.d >= 4 && s.age >= 16) {
        var heirs = 1 + s.sibs.filter(function (x) { return x.alive; }).length;
        var inh = (s.flags.elite ? s.fam : bc.median * [0, 0, 0, 0.4, 1, 1.8, 3, 5, 10, 40][s.d - 1] * rnd(0.5, 1.5)) / heirs;
        if (s.flags.elite) s.fam = 0;
        if (heirs > 1 && !s.flags.elite) { s.pendInh = { total: inh * heirs, heirs: heirs }; txt += ' Лишилася спадщина — її треба поділити з рідними.'; }
        else { s.money += inh; cashNote(s, 'Спадщина', inh); txt += ' Тобі дісталася спадщина: ' + fmt(inh) + '.'; }
      }
      var gk = s.gen.heart > s.gen.cancer ? 'heart' : 'cancer';
      if (p.age < 75 && s.gen[gk] > 1.15 && !s.flags.genKnown) { s.flags.genKnown = gk; txt += ' Причина — ' + (gk === 'heart' ? 'серце' : 'рак') + '. Лікарі кажуть, у тебе підвищений спадковий ризик.'; }
      say(s, txt, 'bad'); mark(s, 'Втрата: ' + p.role.toLowerCase());
    }
  });
  if (s.younger > 0 && s.age <= 14 && alivePar.some(function (p) { return p.sex === 'f' && p.age < 45; }) && chance(0.33)) {
    s.younger--; var sx = chance(.5) ? 'm' : 'f';
    s.sibs.push({ name: nameFrom(s.birth, sx), sex: sx, age: 0, alive: true, rel: 65 });
    say(s, 'У тебе ' + (sx === 'm' ? 'народився братик' : 'народилася сестричка') + ' — ' + s.sibs[s.sibs.length - 1].name + '.', 'good');
  }
  s.sibs.forEach(function (b) { if (!b.alive) return; b.age++; if (chance(hazard(bc, b.age))) { b.alive = false; add(s, { happy: -12 }); say(s, 'Помер' + gp(b, '', 'ла') + ' ' + gp(b, 'брат', 'сестра') + ' ' + b.name + '.', 'bad'); } });
  if (s.withParents && s.age >= 18 && ((s.partner && s.partner.married) || (s.age >= 23 && s.lastInc > c.median * 0.7 && chance(0.2)))) {
    s.withParents = false; say(s, 'Ти ' + g(s, 'переїхав', 'переїхала') + ' від батьків у власне житло (оренда).');
  }
  var p = s.partner;
  if (p) {
    p.age++; p.yrs++;
    p.rel = clamp(p.rel - 4 + (s.h.partner || 0) * 2.2 + (s.st.happy - 50) / 20 + p.compat / 15 + (s.debt > M(s) ? -3 : 0));
    if (p.age >= 65) p.inc *= 0.97; else if (!p.jobless) p.inc *= 1.01 + (p.trait && p.trait.indexOf('амбітн') >= 0 ? 0.02 : 0);
    if (p.trait && p.trait.indexOf('турботлив') >= 0) add(s, { happy: 1 });
    if (chance(hazard(c, p.age))) {
      p.alive = false; s.partner = null; add(s, { happy: -25 });
      say(s, (p.married ? gp(p, 'Помер твій чоловік', 'Померла твоя дружина') : gp(p, 'Помер твій партнер', 'Померла твоя партнерка')) + ' ' + p.name + '.', 'bad');
      mark(s, 'Втрата: ' + p.name);
    } else if (p.rel < 22 && chance(0.4)) {
      if (p.married) s.pendDivorce = p;
      else { s.partner = null; s.exes++; add(s, { happy: -14 }); say(s, p.name + ' піш' + gp(p, 'ов', 'ла') + ' від тебе.', 'bad'); }
    }
  }
  s.kids.forEach(function (k) {
    if (!k.alive) return;
    k.age++; k.rel = clamp(k.rel - 2 + (s.h.kids || 0) * 2);
    var hz = k.age < 5 ? c.qc * [1.5, 1.2, 1, 0.7, 0.45][Math.min(4, Math.max(0, wealthQ(s) - 1))] : hazard(c, k.age);
    if (chance(hz)) { k.alive = false; add(s, { happy: -30 }); say(s, 'Помер' + gp(k, '', 'ла') + ' ' + gp(k, 'твій син', 'твоя донька') + ' ' + k.name + '. Це найважчий день у твоєму житті.', 'bad'); mark(s, 'Втрата дитини'); return; }
    if (k.age === 18) {
      // майбутнє дитини залежить від твого доходу, освіти й часу, який ти їй давав
      var kp = clamp(0.15 + C(s).sec * 0.35 + (wealthQ(s) - 3) * 0.08 + (s.edu >= 5 ? 0.12 : 0) + (k.rel - 50) / 200 + (k.edu ? 0.15 : 0), 0.03, 0.95);
      k.uni = chance(kp);
      say(s, gp(k, 'Син', 'Донька') + ' ' + k.name + ' виріс' + gp(k, '', 'ла') + (k.uni ? ' і вступи' + gp(k, 'в', 'ла') + ' до університету.' : ' і піш' + gp(k, 'ов', 'ла') + ' працювати після школи.') + (k.rel < 35 ? ' Спілкуєтесь ви рідко.' : ''), k.uni ? 'good' : '');
    }
    if (k.age >= 22 && chance(0.07)) { s.grandkids++; say(s, 'У ' + k.name + ' народилася дитина — у тебе ' + (s.grandkids === 1 ? 'перший онук!' : s.grandkids + '-й онук.'), 'good'); add(s, { happy: 6 }); if (s.grandkids === 1) mark(s, 'Перший онук'); }
  });
}
function wealthQ(s) { var r = s.hhInc / M(s); return r < 0.4 ? 1 : r < 0.8 ? 2 : r < 1.4 ? 3 : r < 3 ? 4 : 5; }

// ---------- Фінанси ----------
function finTick(s, ownerPay, side) {
  var c = C(s), inc = 0, L = { inc: {}, exp: {} };
  function I(k, v) { if (v > 0.5) L.inc[k] = (L.inc[k] || 0) + v; }
  function E(k, v) { if (v > 0.5) L.exp[k] = (L.exp[k] || 0) + v; }
  // що змінилося в грошах між роками через разові речі (покупки, курси, події) — щоб у бюджеті не було «загадкових» мінусів
  var bal = s.money - s.debt, tracked = 0;
  for (var k0 in (s.yrCash || {})) tracked += s.yrCash[k0];
  if (s.lastBal != null) { var other = bal - s.lastBal - tracked; if (other > 0.5) I('Разові надходження (події, продажі)', other); else if (other < -0.5) E('Разові витрати (покупки, курси, події)', -other); }
  for (var k1 in (s.yrCash || {})) { if (s.yrCash[k1] > 0) I(k1, s.yrCash[k1]); else E(k1, -s.yrCash[k1]); }
  s.yrCash = {};
  var jpG = jobPay(s), jp = jpG * (1 - taxRate(s, jpG)), opG = ownerPay; ownerPay = opG * (1 - taxRate(s, opG) * 0.8);
  var sideG = side || 0; side = sideG * (1 - taxRate(s, sideG) * 0.5);
  I('Зарплата (до податків)', jpG); I('Бізнес: оплата твоєї праці', opG); I('Фриланс і підробітки', sideG); I('Тіньові доходи', s.shadow || 0);
  E('Податок на доходи', jpG - jp + opG - ownerPay + sideG - side);
  s.lastTax = jpG - jp + opG - ownerPay + sideG - side + (s.yrTax || 0); s.yrTax = 0;
  inc += jp + ownerPay + side + (s.shadow || 0); s.shadow = 0;
  if (s.retired) { inc += pension(s); I('Пенсія', pension(s)); }
  if (s.pol && s.pol.office > 0) { var ps = polSalary(s); inc += ps; I('Зарплата на посаді', ps); }
  var adult = s.age >= 18;
  if (adult && !s.job && !s.study && !s.retired && !s.biz.length && c.gdp > 30 && (isCitizen(s) || resStatus(s) === 'pr')) { inc += c.median * 0.3; I('Допомога з безробіття', c.median * 0.3); }
  var rent = 0, rcost = 0; s.rentals.forEach(function (r) { r.val *= 1 + 0.01 + 0.05 * gauss() + s.econ * 0.05; var y = r.y || 0.3 / c.house, g0 = r.val * y; if (chance(0.12)) g0 *= 1 - rnd(0.15, 0.45); rcost += r.val * 0.012 + (s.rentals.length > 2 ? g0 * 0.1 : 0); if (chance(0.04)) { rcost += r.val * rnd(0.04, 0.12); say(s, 'Орендарі зіпсували квартиру й зникли, не заплативши. Ремонт за твій рахунок.', 'bad'); } rent += g0; }); inc += rent - rcost; I('Оренда твоїх квартир', rent); E('Утримання квартир (ремонт, управління, простої)', rcost);
  if (s.home) s.home.val *= 1 + 0.01 + 0.05 * gauss() + s.econ * 0.05;
  var pshare = 0;
  if (s.partner && (s.partner.married || s.partner.yrs >= 2) && s.age >= 18) { pshare = s.partner.inc * 0.5 * (s.partner.jobless ? 0.2 : 1); I('Внесок партнера', pshare); }
  // інвестиції
  var g0 = s.inv.dep + s.inv.stk + s.inv.cry;
  s.inv.dep *= 1.012 + R() * 0.01;
  var sr = 0.055 + 0.16 * gauss() + s.econ * 0.12 + (s.crash ? -0.35 : 0); s.inv.stk *= Math.max(0.45, 1 + sr); s.crash = 0;
  var cr = Math.exp(-0.15 + 0.6 * gauss()); s.inv.cry *= cr;
  var gain = s.inv.dep + s.inv.stk + s.inv.cry - g0;
  if (gain > 0) { var gt = gain * c.capTax, invT = s.inv.dep + s.inv.stk + s.inv.cry; if (invT > 0) { gt = Math.min(gt, invT); ['dep', 'stk', 'cry'].forEach(function (k) { s.inv[k] = Math.max(0, s.inv[k] - gt * s.inv[k] / invT); }); s.lastTax += gt; } }
  s.lastInvGain = gain;
  var prop = ((s.home ? s.home.val : 0) + s.rentals.reduce(function (a, r) { return a + r.val; }, 0)) * c.propTax;
  var wt = c.wealthTax && netWorth(s) > c.median * 25 ? (netWorth(s) - c.median * 25) * c.wealthTax : 0;
  inc -= prop + wt; s.lastTax += prop + wt; E('Податок на нерухомість', prop); E('Податок на статки', wt);
  if (s.inv.cry > 10 && cr > 2.5) say(s, 'Крипта злетіла: твій портфель ×' + cr.toFixed(1) + '!', 'good');
  if (s.inv.cry > 10 && cr < 0.35) say(s, 'Крипторинок обвалився: портфель −' + Math.round((1 - cr) * 100) + '%.', 'bad');
  // витрати
  var exp = 0;
  if (!adult && s.withParents) {
    var pocket = s.flags.elite ? c.median * 1.5 : c.median * [0.001, 0.003, 0.005, 0.008, 0.012, 0.02, 0.035, 0.06, 0.12, 0.3][s.d - 1];
    s.money += pocket + inc; I('Кишенькові від батьків', pocket);
    inc = 0; pshare = 0; exp = ownUpkeep(s) * 0.5; E('Утримання речей', exp);
  } else {
    var LS = [0.75, 1, 1.7][s.ls];
    var extra = Math.max(0, inc + pshare - c.median * 1.2) * [0.6, 0.78, 0.95][s.ls];   // з доходом ростуть і витрати
    var food = (c.median * 0.76 * LS + extra) * (s.withParents ? 0.55 : 1) * [0.97, 1, 1.06][s.diet];
    var housing = (!s.home && !s.withParents && !s.prison) ? c.median * 0.2 * (c.house / 9) * [0.8, 1, 1.6][s.ls] : 0;
    var kidsHome = s.kids.filter(function (k) { return k.alive && k.age < 18; }).length, kidsC = kidsHome * c.median * 0.13 * (pshare ? 0.6 : 1);
    var un = chance(0.35) ? c.median * rnd(0.03, 0.12) : 0; s.unexp = un;
    var mult = (s.prison ? 0.2 : 1) * (s.econ < 0 ? 1.06 : 1) * (pshare ? 0.85 : 1);
    E('Їжа, побут, транспорт, розваги', food * mult); E('Оренда житла', housing * mult); E('Діти', kidsC); E('Утримання авто, речей і дому', ownUpkeep(s)); E('Ліки', chronicCost(s)); E('Непередбачені витрати', un);
    exp = (food + housing) * mult + kidsC + ownUpkeep(s) + chronicCost(s) + un;
  }
  // коли грошей бракує, людина живе скромніше: урізає все, крім мінімуму. У борг іде лише те, чого не вистачило на мінімум
  var debt0 = s.debt, cut = 0;
  if (adult && !s.prison) {
    var avail = inc + pshare + Math.max(0, s.money) - (s.debt > 0 ? s.debt * 0.13 : 0);
    var floor = c.median * 0.42 * (s.withParents ? 0.5 : 1) + kidsC * 0.7 + chronicCost(s) + un;
    if (exp > avail && exp > floor) {
      cut = Math.min(exp - floor, exp - Math.max(avail, floor)); exp -= cut;
      L.cut = cut; var fk = 'Їжа, побут, транспорт, розваги'; if (L.exp[fk]) { L.exp[fk] -= cut; if (L.exp[fk] < 1) delete L.exp[fk]; }
      add(s, { happy: -clamp(cut / c.median * 12, 1, 8) });
      if (!s.lastCutSay || s.age - s.lastCutSay >= 4) { s.lastCutSay = s.age; say(s, 'Грошей бракує — довелося жити скромніше: дешевша їжа, жодних розваг, усе найнеобхідніше.', 'bad'); }
    }
  }
  if (s.debt > 0) {
    // спершу гасимо дорогий борг із заощаджень, лишаючи подушку
    var cushion = c.median * 0.25;
    if (s.money > cushion) { var fromCash = Math.min(s.debt, s.money - cushion); payDebt(s, fromCash); s.money -= fromCash; L.fromCash = fromCash; }
  }
  if (s.debt > 0) {
    // прострочений борг понад ліміт — у колекторів: відсотки вже не 13%, а невеликі судові
    var dLim = Math.max(s.lastInc || 0, c.median * 0.6) * 1.5, deflt = s.debt > dLim * 1.5, rate = deflt ? 0 : 0.13;
    s.defYrs = deflt ? (s.defYrs || 0) + 1 : 0;
    if (s.defYrs >= 7) { var wo = s.debt * 0.6; payDebt(s, wo); s.defYrs = 0; L.writeoff = wo; say(s, 'Минуло багато років без виплат: частину старих боргів (' + fmt(wo) + ') списано за давністю.', 'good'); }
    var interest = s.debt * rate; s.debt += interest; if (s.debtSrc) for (var x in s.debtSrc) s.debtSrc[x] *= 1 + rate;
    var pay = Math.min(s.debt, Math.max(0, s.money + inc + pshare - exp) * 0.5); payDebt(s, pay); s.money -= pay;
    E('Погашення боргу', pay); L.interest = interest;
    s.credit = clamp(s.credit + (pay >= interest ? 2 : -8));
    if (s.debt < 1) { s.debt = 0; s.debtSrc = {}; s.credit = clamp(s.credit + 5); }
  } else if (s.age >= 18) s.credit = clamp(s.credit + 1);
  s.money += inc + pshare - exp;
  if (s.money < 0) {
    var lim = Math.max(s.lastInc || 0, c.median * 0.6) * 1.5;   // більше банки не позичають
    if (s.debt > lim) {
      // позичати ніхто не дає: нестача не стає боргом — це неоплачені рахунки, відключення, життя впритул
      L.denied = 1; L.unpaid = -s.money; s.money = 0; add(s, { happy: -6, health: -3 });
      if (!s.lastDenySay || s.age - s.lastDenySay >= 3) { s.lastDenySay = s.age; say(s, 'Банки більше не позичають. Рахунки лишаються неоплаченими, світло відключають, дзвонять колектори.', 'bad'); }
    } else { addDebt(s, -s.money, 'не вистачало на життя'); L.short = -s.money; s.money = 0; }
  }
  // історія боргу: звідки він узявся рік за роком
  if (debt0 > 0 || s.debt > 0) { s.debtLog = s.debtLog || []; s.debtLog.push({ a: s.age, y: s.year, s0: debt0, sh: L.short || 0, i: L.interest || 0, p: (L.fromCash || 0) + (L.exp['Погашення боргу'] || 0), e: s.debt, cut: cut }); if (s.debtLog.length > 12) s.debtLog.shift(); }
  s.lastInc = jp + ownerPay + side + (s.retired ? pension(s) : 0) + rent; s.hhInc = inc + pshare;
  s.lastExp = exp;
  L.age = s.age; L.year = s.year; L.invGain = gain;
  s.ledger = L; s.lastBal = s.money - s.debt;
  if (adult) { s.stat.incSum += s.lastInc; s.stat.incYears++; }
  s.stat.peakInc = Math.max(s.stat.peakInc, s.lastInc);
  s.stat.peakNet = Math.max(s.stat.peakNet, netWorth(s));
  s.stat.maxFame = Math.max(s.stat.maxFame, s.fame);
}
function polSalary(s) { return s.pol && s.pol.office ? C(s).median * [0, 0.5, 2.2, 3, 4, 6][s.pol.office] : 0; }
function cashNote(s, k, v) { s.yrCash = s.yrCash || {}; s.yrCash[k] = (s.yrCash[k] || 0) + v; }

// ---------- Робота за рік ----------
function jobTick(s) {
  if (!s.job) { if (s.age >= 18 && !s.study && !s.retired && !s.biz.length) add(s, { happy: -3 }); return; }
  if (s.job.teen) { if (s.age >= 18) { s.job = null; } return; }
  var j = JOB[s.job.id];
  s.job.yrs++; s.job.lvlYrs++; s.wy[j.id] = (s.wy[j.id] || 0) + 1; s.workYears++;
  var rel = 0; hobbyFor(j.id).forEach(function (k) { s.sk[k] = clamp(s.sk[k] + (s.sk[k] < 70 ? 2 : 0.8)); rel = Math.max(rel, s.sk[k]); });
  s.job.perf = clamp(s.job.perf * 0.5 + 25 + (s.st.smarts - 50) * 0.3 + rel / 6 + rnd(-12, 12) + (s.h.overtime || 0) * 1.6 - (s.study && !s.job.part ? 8 : 0) + (s.st.health < 35 ? -10 : 0) + (s.sleep ? 0 : 6) - (s.flags.depr ? 10 : 0) + (s.st.happy - 50) / 8 + (s.st.health - 50) / 12 - (s.stress > 60 ? 5 : 0));
  if (j.max && s.job.lvl < j.max && s.job.lvlYrs >= 3 && s.job.perf > 65 && chance(0.12 + (s.job.perf - 65) / 80)) {
    s.job.lvl++; s.job.lvlYrs = 0; add(s, { happy: 6 });
    say(s, 'Підвищення! Тепер ти ' + lvName(j, s.job.lvl).toLowerCase() + ' (' + j.n.toLowerCase() + ').', 'good');
    if (s.job.lvl === j.max) mark(s, lvName(j, s.job.lvl) + ' (' + j.n + ')');
  }
  if (j.vol) {
    var sk = j.vol === 'social' ? s.st.social : s.sk[j.vol];
    var jump = chance(0.02 + sk / 2500) ? 20 : 0;
    s.fame = clamp(s.fame + (sk - 55) / 8 + rnd(-4, 6) + jump + (s.h.overtime || 0) * 0.3);
    if (jump) say(s, 'Прорив! Про тебе заговорили — слава зросла.', 'good');
    if (s.fame >= 80 && !s.flags.star) { s.flags.star = 1; mark(s, 'Знаменитість'); say(s, 'Тебе впізнають на вулиці. Ти — зірка.', 'big'); }
  }
  add(s, { health: -(j.st - 50) / 40, happy: (j.sat - 50) / 25 });
  if (j.danger && chance(0.03)) { add(s, { health: -20 }); say(s, 'Травма на роботі.', 'bad'); }
  var lay = j.risk * (s.econ < 0 ? 2.5 : 1) * (s.job.perf < 35 ? 2.5 : 1) * 0.6;
  if (chance(lay)) { say(s, 'Тебе звільнили з посади «' + j.n + '». Причина: ' + whyFired(s, j) + '.', 'bad'); add(s, { happy: -10 }); endJob(s, 'звільнили'); }
  else if (j.age && s.age > j.age[1] + 3) { say(s, 'Час йти з професії «' + j.n + '» за віком.'); endJob(s, 'вік'); }
}

// ---------- Показники ----------
function statsTick(s) {
  var c = C(s);
  var target = expH(s.age) - (s.chronic ? s.chronic.length * 2.5 : 0) + [-5, 0, 4][s.diet] - (s.sleep ? 0 : 4) - (s.flags.depr ? 4 : 0) + Math.min(12, (s.h.sport || 0) * 1.5) + OWN_HEALTH(s) + (s.ls === 2 ? 2 : s.ls === 0 ? -2 : 0) - (s.flags.smoker ? 7 : 0) - (s.flags.drink ? 5 : 0) + (s.age >= 18 && s.hhInc < c.median * 0.5 ? -4 : 0) + (c.gdp > 30 ? 2 : 0);
  s.st.health = clamp(s.st.health + (target - s.st.health) * (0.14 + 0.1 * c.hq) + rnd(-2, 2));
  if (s.age > 65) add(s, { smarts: -0.5 });
  if (s.age < 18 && !s.study) add(s, { smarts: 0.6 });
  s.st.social = clamp(s.st.social + ((35 + Math.min(6, s.friends) * 6) - s.st.social) * 0.08 + ownSocial(s) * 0.1);
  if (s.friends > 0 && (s.h.friends || 0) < 2 && chance(0.12)) { s.friends--; }
  if (!(s.job && JOB[s.job.id] && JOB[s.job.id].vol) && !(s.h.blog > 0)) s.fame *= 0.93;
  if (s.flags.smoker && s.age > 25 && s.used.quitsmoke) { }
  // стрес: багато роботи, борги, хвороби
  var workH = (s.job && !s.job.teen ? (s.job.part ? 20 : 40) : 0) + (s.h.overtime || 0) + s.biz.reduce(function (a, b) { return a + (b.mgr ? 4 : b.effort >= 1 ? 45 : 22); }, 0);
  s.stress = clamp((workH - 40) * 1.5 + (s.debt > c.median ? 20 : 0) + (s.chronic ? s.chronic.length * 5 : 0) + (s.h.rest < 6 ? 15 : 0) + (s.job ? (JOB[s.job.id] ? JOB[s.job.id].st - 50 : 0) : 0));
  if (s.stress > 60) { add(s, { health: -2 }); if (s.partner) s.partner.rel -= 4; }
  if (s.edu >= 5) s.st.health = clamp(s.st.health + 0.3);
  // щастя
  var t = 52 - Math.max(0, s.stress - 40) / 4;
  if (s.age >= 18) {
    var hh = Math.max(1, s.hhInc);
    t += clamp(Math.log(hh / c.median) * 6, -12, 10) + clamp(Math.log(hh / 8000) * 2.5, -6, 6);
    t += s.partner ? (s.partner.rel - 50) / 4 + 4 : (s.age > 26 ? -4 : 0);
    if (s.job && !s.job.teen) t += (JOB[s.job.id].sat - 50) / 6; else if (!s.study && !s.retired && !s.biz.length) t -= 8;
    if (s.debt > c.median * 0.5) t -= 8;
    t += [-3, 0, 4][s.ls];
  } else {
    t += (s.d - 5.5) * 0.9 + (s.flags.oneParent ? -3 : 0);
  }
  t += (s.st.health - 60) / 5 + (s.friends > 0 ? Math.min(5, s.friends) * 1.5 : -5) - cf(s) * 5 + (s.immigrant && s.immYrs < 3 ? -5 : 0);
  s.kids.forEach(function (k) { if (k.alive) t += 2; });
  t += ownHappy(s);
  if (s.prison) t -= 15;
  if (s.flags.depr) t -= 10;
  if (!s.sleep) t -= 3;
  t += [2, 0, -1][s.diet];
  s.st.happy = clamp(s.st.happy + (t - s.st.happy) * 0.35 + rnd(-3, 3));
}

// ---------- Світ ----------
function worldTick(s) {
  if (s.econT > 0) { s.econT--; if (s.econT === 0) s.econ = 0; }
  COUNTRY_LIST.forEach(function (c) {
    var l = s.cf[c.code] != null ? s.cf[c.code] : c.conflict;
    if (l > 0 && chance(0.05)) { l--; if (c.code === s.country) say(s, l === 0 ? 'У країні настав мир.' : 'Бойові дії в країні вщухають.', 'good'); }
    else if (l < 2 && chance(0.003)) { l++; if (c.code === s.country) say(s, 'Ситуація в країні загострилася.', 'bad'); }
    s.cf[c.code] = l;
  });
  if (s.immigrant) s.immYrs++;
}

// ---------- Смерть ----------
function deathCheck(s) {
  var c = C(s), q;
  if (s.age < 5) q = c.qc * DEC_CHILD[s.d - 1] * (s.st.health < 40 ? 2 : 1);
  else {
    var mod = Math.exp(-(s.st.health - expH(s.age)) / 22) * (s.flags.smoker ? 1.6 : 1) * (s.flags.drink ? 1.3 : 1);
    if (s.age >= 18) { var r = Math.max(0.1, s.hhInc / c.median); mod *= clamp(Math.pow(r, -0.15), 0.7, 1.4); }
    if (s.flags.ill) mod *= s.flags.illTreated ? 1.4 : 2.5;
    mod = clamp(mod, 0.35, 6);
    mod *= 1 + cf(s) * 0.1;
    q = hazard(c, s.age) * mod * 0.47;
  }
  if (chance(q)) { die(s, deathCause(s)); return true; }
  return false;
}
function deathCause(s) {
  var a = s.age, c = C(s);
  if (s.flags.ill && chance(0.7)) return s.flags.illName || 'хвороба';
  if (a < 1) return pick(['ускладнення після пологів', 'інфекція новонародженого', 'пневмонія']);
  if (a < 5) return pick(c.u5 > 30 ? ['пневмонія', 'діарея', 'малярія', 'недоїдання'] : ['пневмонія', 'нещасний випадок', 'вроджена хвороба']);
  if (a < 30) return pick(['ДТП', 'нещасний випадок', 'інфекційна хвороба', 'утоплення']);
  if (a >= 30 && s.gen.heart > 1.3 && chance(0.4)) return pick(['серцевий напад', 'інсульт']);
  if (a >= 30 && s.gen.cancer > 1.3 && chance(0.4)) return 'рак';
  if (a < 60) return pick(['серцевий напад', 'рак', 'інсульт', 'ДТП', 'хвороба печінки']);
  if (a < 85) return pick(['серцева недостатність', 'інсульт', 'рак', 'пневмонія', 'діабет']);
  return pick(['старість, уві сні', 'серцева недостатність', 'пневмонія', 'старість, в оточенні рідних']);
}
function die(s, cause) {
  if (!s.alive) return;
  s.alive = false; s.cause = cause; s.ap = 0;
  say(s, 'Ти ' + g(s, 'помер', 'померла') + ' у ' + s.age + ' р. Причина: ' + cause + '.', 'death');
  mark(s, 'Смерть: ' + cause);
}

// ---------- Події ----------
var EVENTS = [];

// ---------- Рік ----------
function apFor(age, s) { if (s && s.prison > 0) return 1; return age < 6 ? 0 : age < 13 ? 2 : age < 18 ? 3 : age < 80 ? 4 : 2; }
function ageUp(s) {
  if (!s.alive) return [];
  var out = [];
  // смерть перевіряється для віку, який зараз закінчується
  s.cur = { age: s.age + 1, year: s.year + 1, lines: [] };
  if (deathCheck(s)) { if (!s.nolog) s.log.push(s.cur); return out; }
  s.age++; s.year++;
  if (!s.nolog) s.log.push(s.cur);
  var side = schedTick(s);
  worldTick(s);
  crisisTick(s, out);
  familyTick(s);
  careTick(s, out);
  armyTick(s, out);
  life2Tick(s, out);
  if (!s.alive) return out;
  eduTick(s, out);
  jobTick(s);
  gangTick(s, out);
  polTick(s, out);
  citTick(s, out);
  kidsAdultTick(s);
  var op = bizTick(s, out);
  finTick(s, op, side);
  statsTick(s);
  langTick(s);
  prisonTick(s, out);
  creditTick(s, out);
  if (s.flags.ill && !s.flags.illTreated) add(s, { health: -3 });
  if (s.flags.ill && s.flags.illTreated && chance(0.15 + 0.4 * C(s).hq)) { s.flags.ill = false; s.flags.illTreated = false; say(s, 'Лікування допомогло — хворобу подолано.', 'good'); }
  if (s.flags.ill && !s.flags.illKnown && chance(0.3)) { s.flags.illKnown = true; out.push(illnessPrompt(s)); }
  if (s.age === 18 && C(s).consc && (s.sex === 'm' || C(s).consc === 2) && !s.study && !s.immigrant && !s.prison) out.push(conscription(s));
  pickEvents(s, out);
  if (s.st.health <= 0) die(s, 'виснаження організму');
  mentalTick(s);
  if (!s.nolog) { s.hist = s.hist || []; s.hist.push([s.age, Math.round(netWorth(s)), Math.round(s.lastInc), Math.round(s.st.health), Math.round(s.st.happy)]); }
  ownTick(s);
  chronicTick(s);
  schedDefaults(s); schedFit(s);
  s.used = {}; s.ap = apFor(s.age, s);
  return out;
}
function treatCost(s, k) { var c = C(s); var m = { free: 0.05, mixed: 0.5, paid: c.code === 'US' ? (s.job ? 0.35 : 1.6) : 1.1 }[c.health]; return c.median * m * (k || 1); }
function healthName(c) { return { free: 'безкоштовна (страхова)', mixed: 'частково платна', paid: 'платна' }[c.health]; }
function illnessPrompt(s) {
  var c = C(s), cost = treatCost(s) * rnd(0.7, 1.4);
  var name = s.flags.illName;
  return { title: 'Діагноз', text: 'Лікарі виявили: ' + name + '. Лікування коштуватиме ' + fmt(cost) + (c.health === 'free' ? ' (майже все покриває держава).' : c.health === 'paid' ? ' — медицина тут платна.' : '.') + ' Якість медицини: ' + Math.round(c.hq * 100) + '/100.', opts: [
    { t: 'Лікуватися', sub: s.money >= cost ? 'оплатити зі збережень' : 'в борг', f: function () { if (s.money >= cost) s.money -= cost; else { addDebt(s, cost - s.money, 'лікування'); s.money = 0; } s.flags.illTreated = true; add(s, { happy: -5 }); return 'Ти поча' + g(s, 'в', 'ла') + ' лікування (' + name + ').'; } },
    { t: 'Не лікуватися', sub: 'надто дорого', f: function () { add(s, { happy: -10 }); return 'Ти виріши' + g(s, 'в', 'ла') + ' не лікуватися.'; } }
  ] };
}
function getIll(s, name) { if (s.flags.ill) return; s.flags.ill = true; s.flags.illName = name; s.flags.illKnown = false; s.flags.illTreated = false; }

// ---------- Хронічні хвороби з віком ----------
var CHRONIC = ['гіпертонія', 'біль у спині', 'діабет 2 типу', 'артрит', 'проблеми із зором', 'хронічний бронхіт', 'безсоння'];
function chronicTick(s) {
  if (!s.chronic) s.chronic = [];
  if (s.age < 35 || s.chronic.length >= 4) return;
  var p = 0.012 + (s.age - 35) * 0.0012;
  p *= (s.h.sport >= 3 ? 0.6 : 1.2) * [1.4, 1, 0.75][s.diet] * (s.flags.smoker ? 1.5 : 1) * (s.sleep ? 1 : 1.3);
  if (chance(p)) {
    var left = CHRONIC.filter(function (x) { return s.chronic.indexOf(x) < 0; }); if (!left.length) return;
    var n = pick(left); s.chronic.push(n); add(s, { happy: -2 });
    say(s, 'Лікар поставив діагноз: ' + n + '. Це надовго — доведеться жити з цим і купувати ліки.', 'bad');
  }
}
function chronicCost(s) { return (s.chronic || []).length * C(s).median * { free: 0.005, mixed: 0.02, paid: 0.035 }[C(s).health]; }

// ---------- Майно: транспорт, речі, облаштування дому, тварини ----------
function vehicle(s) { return s.own && s.own.car ? VEHICLE[s.own.car] : null; }
function OWN_HEALTH(s) { var o = s.own || {}, v = vehicle(s); return (v ? v.health || 0 : 0) + HOME_LV[o.homeLvl || 0].health + (o.pet === 'dog' ? 2 : o.pet ? 1 : 0); }
function ownHappy(s) { var o = s.own || {}, v = vehicle(s); return (v ? v.hap : 0) + GEAR_LV[o.gear || 0].hap + HOME_LV[o.homeLvl || 0].hap + (o.pet ? 4 : 0); }
function ownSocial(s) { var o = s.own || {}, v = vehicle(s); return (v ? v.soc : 0) + GEAR_LV[o.gear || 0].soc; }
function ownUpkeep(s) { var o = s.own || {}, c = C(s), v = vehicle(s), u = 0; if (v) u += v.up * c.median; u += GEAR_LV[o.gear || 0].p * c.median * 0.12; u += HOME_LV[o.homeLvl || 0].p * c.median * 0.03; if (o.pet) u += c.median * 0.04; return u; }
function ownTick(s) {
  var o = s.own; if (!o) return;
  if (o.car) { o.carVal *= 0.87; if (chance(0.01)) { add(s, { health: -8 }); say(s, 'Невелика аварія на ' + VEHICLE[o.car].n.toLowerCase() + 'і. Обійшлося синцями.', 'bad'); } }
  if (o.pet) { o.petAge++; if (o.petAge > ri(11, 16)) { say(s, 'Помер' + (o.pet === 'dog' ? ' твій пес' : 'ла твоя кішка') + '. Він' + (o.pet === 'dog' ? '' : 'а') + ' був' + (o.pet === 'dog' ? '' : 'а') + ' частиною родини.', 'bad'); add(s, { happy: -10 }); o.pet = null; o.petAge = 0; } }
  if (s.debt > M(s) * 3 && (o.gear > 0) && chance(0.3)) { o.gear--; say(s, 'Через борги довелося продати частину дорогих речей.', 'bad'); }
}

// ---------- Організована злочинність ----------
var NARCO = ['MX', 'CO', 'PE', 'BR', 'AF', 'MM', 'HT', 'NG'];
var CARTEL = ['MX', 'CO'];   // найбільші картельні країни: нелегальне тут живе вільніше
function cartel(s) { return CARTEL.indexOf(s.country) >= 0; }
var MAFIA_RANKS = ['Прибічник', 'Солдат', 'Капо', 'Заступник дона', 'Дон'];
var CARTEL_RANKS = ['Халькон (дозорний)', 'Сікаріо', 'Хефе де пласа', 'Лейтенант картелю', 'Глава картелю'];
function rankName(g2, r) { if (r == null) r = g2.rank; if (g2.own && r === 4) return g2.kind === 'картель' ? 'Глава власного картелю' : 'Дон власної сімʼї'; return (g2.kind === 'картель' ? CARTEL_RANKS : MAFIA_RANKS)[r]; }
var GANG_PAY = [0.8, 2, 5, 15, 60];
function gangKind(s) { return NARCO.indexOf(s.country) >= 0 ? 'картель' : 'мафіозна сімʼя'; }
function gangOK(s) { return s.age >= 15 && s.age <= 45 && s.urban && !s.gang && !s.prison && C(s).law < 0.75; }
function gangRisk(s) {
  var g2 = s.gang, c = C(s), narco = NARCO.indexOf(s.country) >= 0;
  return {
    death: [0.012, 0.02, 0.03, 0.04, 0.05][g2.rank] * (narco ? (cartel(s) ? 1.5 : 1.8) : 1) * (s.gangWar ? 2.5 : 1) * (g2.warYrs > 0 ? 2 : 1) * (s.used.lowkey ? 0.6 : 1),
    // нижчі звання роблять «брудну» роботу на вулиці, верхівка прикрита людьми й купленими поліцейськими;
    // але в країнах із сильним законом за верхівкою полюють роками (як у справах RICO)
    arrest: clamp(([0.035, 0.03, 0.025, 0.02, 0.018][g2.rank] + (g2.heat || 0) * 0.015) * (0.15 + c.law * 1.2) * (s.used.bribe ? Math.max(0.15, 0.4 - g2.rank * 0.06) : 1) * (s.used.lowkey ? 0.6 : 1) * (cartel(s) ? 0.4 : 1) * (c.law > 0.7 && g2.rank >= 3 ? 1.4 : 1), 0.003, 0.8)
  };
}
function gangTick(s, out) {
  var g2 = s.gang; if (!g2 || s.prison) return;
  var c = C(s), narco = NARCO.indexOf(s.country) >= 0, r = gangRisk(s);
  g2.yrs++;
  var inc = c.median * (g2.own ? GANG_PAY[4] * 0.12 * (g2.size || 1) : GANG_PAY[g2.rank]) * (narco ? 3 : 1) * (cartel(s) ? 1.3 : 1) * rnd(0.5, 1.5) * (s.used.job_gang ? 1.5 : 1) * (s.used.lowkey ? 0.5 : 1);
  if (g2.rank === 4 && narco && chance(0.06)) { inc *= 10; say(s, 'Канал поставок розширився на інші країни — гроші течуть рікою.', 'big'); }
  s.shadow = (s.shadow || 0) + inc;
  g2.perf = clamp(g2.perf * 0.5 + 25 + (s.st.smarts - 50) * 0.2 + s.sk.sport / 8 + (s.st.social - 50) * 0.2 + (s.used.job_gang ? 15 : 0) + rnd(-10, 10));
  g2.heat = (g2.heat || 0) + (s.used.job_gang ? 1 : 0.3) - (s.used.lowkey ? 1 : 0); if (g2.heat < 0) g2.heat = 0;
  s.gangWar = false;
  if (chance(r.death)) { die(s, pick(['загину' + g(s, 'в', 'ла') + ' у розборках', 'вбивство конкурентами', 'перестрілка з поліцією'])); return; }
  if (chance(r.arrest)) {
    var cp = court(s, g2.rank >= 3 ? 'керівництво злочинною організацією' : 'участь в організованому угрупованні', 2 + g2.rank * 2, 4 + g2.rank * 4);
    if (typeof cp === 'object') { cp.title = 'Арешт'; out.push(cp); } else say(s, cp, 'bad');
    return;
  }
  if (g2.warYrs > 0) { g2.warYrs--; if (!g2.warYrs) say(s, 'Війна з колишніми «своїми» вщухла.', 'good'); }
  if (g2.own) { if (g2.perf > 60 && (g2.size || 1) < 6 && chance(0.25)) { g2.size = (g2.size || 1) + 1; say(s, 'Твоя ' + (g2.kind === 'картель' ? 'організація' : 'сімʼя') + ' росте: до тебе перейшли нові люди.', 'good'); } return; }
  g2.heat = Math.max(0, (g2.heat || 0) - (s.used.lowkey ? 2 : 1));   // розшук поволі спадає
  if (g2.rank === 0 && (g2.rep || 0) >= REP_NEED[1] && !g2.askedInit) { g2.askedInit = 1; out.push(initiation(s)); return; }
  if (g2.rank >= 1 && g2.rank < 3 && (g2.rep || 0) >= REP_NEED[g2.rank + 1] && chance(g2.rank === 2 ? 0.35 : 0.6)) { g2.rank++; say(s, 'Тебе підвищили: тепер ти ' + rankName(g2).toLowerCase() + ' (' + g2.kind + ').', 'big'); mark(s, rankName(g2)); }
}
function initiation(s) {
  var g2 = s.gang, cart = g2.kind === 'картель';
  return { title: cart ? 'Перевірка' : 'Посвячення', text: cart ? 'Щоб стати сікаріо, треба довести, що на тебе можна покластися. Тобі дають завдання.' : 'Сімʼя готова зробити тебе «своїм» — солдатом. Але спершу — доручення, після якого назад дороги не буде.', opts: [
    { t: 'Виконати, що скажуть', sub: 'найпевніший шлях, але ризик і для тебе', f: function () { g2.heat += 2; if (chance(0.1)) { add(s, { health: -20 }); return 'Щось пішло не так — тебе поранило. Посвячення відклали.'; } if (chance(riskP(s, 0.08))) return court(s, 'тяжкий злочин', 4, 10); g2.rank = 1; g2.perf += 10; mark(s, rankName(g2)); return 'Ти пройш' + g(s, 'ов', 'ла') + ' перевірку. Тепер ти ' + rankName(g2).toLowerCase() + '.'; } },
    { t: 'Попросити інше доручення', sub: 'харизма вирішить, чи погодяться', f: function () { if (chance(0.25 + s.st.social / 250)) { g2.rank = 1; mark(s, rankName(g2)); return 'Тобі доручили «бухгалтерію». Посвячення пройдено без крові.'; } g2.perf -= 10; g2.askedInit = 0; return 'На тебе подивилися з підозрою. Посвячення відклали.'; } },
    { t: 'Відмовитися', sub: 'лишишся на побігеньках', f: function () { g2.perf -= 20; return 'Ти лишаєшся «прибічником». Довіри до тебе поменшало.'; } }] };
}
function busted2(s) {
  var g2 = s.gang, yrs = ri(2, 4) + g2.rank * ri(1, 3);
  var l = s.money * 0.8 + s.inv.cry * 0.8 + s.inv.stk * 0.5; s.money *= 0.2; s.inv.cry *= 0.2; s.inv.stk *= 0.5;
  s.gang = null; s.gangPast = g2;
  return sentence(s, yrs, 'участь в організованому злочинному угрупованні') + (l > 1 ? ' Конфісковано ' + fmt(l) + '.' : '');
}

// ---------- Мови, вʼязниця, кредит, психіка ----------
function langTick(s) {
  var c = C(s);
  if (s.study && s.study.t === 'school') s.sk.eng = clamp(s.sk.eng + (c.lang === 'en' ? 7 : c.gdp > 20 ? 3 : 1.5));
  if (s.immigrant && c.lang !== 'en') { s.lang[c.lang] = clamp((s.lang[c.lang] || 0) + (s.age < 30 ? 12 : s.age < 55 ? 8 : 4) * (s.prison ? 0.5 : 1)); }
  if (s.immigrant && c.lang === 'en') s.sk.eng = clamp(s.sk.eng + 8);
}
function prisonTick(s, out) {
  if (s.heat > 0 && !s.used.scheme && !s.used.steal && !s.used.smuggle && chance(0.35)) s.heat--;
  if (!s.prison) return;
  s.prison--; add(s, { health: -2 });
  if (s.partner) s.partner.rel -= 8;
  if (s.prison === 0) { s.recordAge = s.age; say(s, 'Ти ' + g(s, 'вийшов', 'вийшла') + ' на волю. Судимість залишиться в документах ще надовго.', 'big'); mark(s, 'Вихід з вʼязниці'); }
  else say(s, 'Ще ' + s.prison + ' р. за ґратами.', 'bad');
}
function hasRecord(s) { return s.record > 0 && (s.prison > 0 || s.age - s.recordAge < 10); }
function sentence(s, yrs, what) {
  if (s.gang) { s.gangPast = s.gang; s.gang = null; }
  s.record++; s.prison = yrs; if (s.job) endJob(s, 'вʼязниця');
  s.biz.slice().forEach(function (b) { if (!b.mgr) { b.mgr = true; b.effort = 0; } });
  if (s.partner && !s.partner.married && chance(0.5)) { say(s, s.partner.name + ' не стал' + gp(s.partner, '', 'а') + ' чекати.', 'bad'); s.partner = null; }
  add(s, { happy: -20 }); mark(s, 'Вʼязниця: ' + yrs + ' р. (' + what + ')');
  return 'Тебе спіймали. Суд: ' + yrs + ' р. позбавлення волі за ' + what + '.';
}
function creditTick(s, out) {
  if (s.flags.bankrupt) { s.flags.bankrupt--; if (!s.flags.bankrupt) say(s, 'Мітка банкрутства зникла з кредитної історії.', 'good'); }
  var heavy = s.debt > Math.max(3 * Math.max(s.lastInc, 1), 2 * M(s));
  s.debtYrs = heavy ? (s.debtYrs || 0) + 1 : 0;
  if (s.debtYrs >= 2 && s.age >= 18 && !s.flags.bankrupt && !(s.debtAsk && s.age - s.debtAsk < 6) && (s.debtAsk = s.age)) out.push({ title: 'Борги душать', text: 'Борг ' + fmt(s.debt) + ' — це кілька твоїх річних доходів, і він росте через відсотки. Кредитний рейтинг: ' + Math.round(s.credit) + '.', opts: [
    { t: 'Оголосити банкрутство', sub: 'частину боргу спишуть, майно продадуть, 7 років без кредитів', f: function () { var sold = 0; if (s.home) { sold += s.home.val; s.debt -= s.home.val; s.home = null; } s.rentals.forEach(function (r) { sold += r.val; s.debt -= r.val; }); s.rentals = []; if (sold) cashNote(s, 'Продаж майна при банкрутстві', sold); var before = Math.max(0, s.debt); s.debt = Math.max(0, s.debt * 0.2); cashNote(s, 'Списано боргу при банкрутстві', before - s.debt); if (s.debt <= 0 && s.money < 0) s.money = 0; s.credit = 5; s.flags.bankrupt = 7; s.debtYrs = 0; mark(s, 'Банкрутство'); add(s, { happy: -8 }); return 'Банкрутство оголошено. Борг зменшено до ' + fmt(s.debt) + '.'; } },
    { t: 'Платити далі', sub: 'стрес, але без мітки в історії', f: function () { add(s, { happy: -8, health: -3 }); s.debtYrs = 0; return 'Ти виріши' + g(s, 'в', 'ла') + ' розплачуватися сам' + g(s, '', 'а') + '.'; } }] });
}
function mentalTick(s) {
  if (s.age < 13) return;
  if (s.st.happy < 25) s.lowYrs++; else s.lowYrs = Math.max(0, s.lowYrs - 1);
  if (!s.flags.depr && s.lowYrs >= 2 && chance(0.5)) { s.flags.depr = 1; say(s, 'Пригнічений стан: важко радіти, важко працювати. Тут допоможе психотерапія, близькі люди й час.', 'bad'); }
  if (s.flags.depr && s.st.happy > 55 && chance(0.4)) { s.flags.depr = 0; say(s, 'Пригнічений стан відступив.', 'good'); }
}

// ---------- Підсумок ----------
var ACHIEVEMENTS = [
  { id: 'old', n: 'Довгожитель', d: 'Дожити до 90', t: function (s) { return s.age >= 90; } },
  { id: 'cent', n: 'Сторіччя', d: 'Дожити до 100', t: function (s) { return s.age >= 100; } },
  { id: 'mil', n: 'Мільйонер', d: 'Статок $1 млн', t: function (s) { return s.stat.peakNet >= 1e6; } },
  { id: 'top1', n: 'Верхній 1%', d: 'Дохід у верхньому 1% світу', t: function (s) { return globalPct(s.stat.peakInc) >= 0.99; } },
  { id: 'phd', n: 'Доктор', d: 'Захистити дисертацію', t: function (s) { return s.edu >= 7; } },
  { id: 'emig', n: 'Емігрант', d: 'Переїхати в іншу країну', t: function (s) { return s.countries.length > 1; } },
  { id: 'nomad', n: 'Громадянин світу', d: 'Жити в 3+ країнах', t: function (s) { return s.countries.length >= 3; } },
  { id: 'biz', n: 'Підприємець', d: 'Бізнес, що прожив 10 років', t: function (s) { return s.biz.some(function (b) { return b.yrs >= 10; }) || s.bizHist.some(function (b) { return b.yrs >= 10; }); } },
  { id: 'serial', n: 'Серійний підприємець', d: 'Відкрити 3 бізнеси', t: function (s) { return s.biz.length + s.bizHist.length >= 3; } },
  { id: 'exit', n: 'Екзит', d: 'Продати стартап інвестору', t: function (s) { return s.bizHist.some(function (b) { return b.how === 'куплено інвестором'; }); } },
  { id: 'star', n: 'Зірка', d: 'Слава 80+', t: function (s) { return s.stat.maxFame >= 80; } },
  { id: 'big', n: 'Велика родина', d: '4+ дітей', t: function (s) { return s.kids.length >= 4; } },
  { id: 'gk', n: 'Бабуся/дідусь', d: 'Дочекатися онуків', t: function (s) { return s.grandkids > 0; } },
  { id: 'travel', n: 'Мандрівник', d: '10 подорожей', t: function (s) { return s.stat.travels >= 10; } },
  { id: 'hobby', n: 'Хобі стало справою', d: 'Професія, відкрита через хобі', t: function (s) { return !!s.flags.hobbyJob; } },
  { id: 'top', n: 'На вершині', d: 'Найвища посада в професії', t: function (s) { return s.jobHist.concat(s.job ? [s.job] : []).some(function (j) { var J = JOB[j.id]; return J && J.max && j.lvl === J.max; }); } },
  { id: 'poor2rich', n: 'З низів', d: 'З дуже бідної родини до верхніх 10% світу', t: function (s) { return s.d <= 2 && globalPct(s.stat.peakInc) >= 0.9; } },
  { id: 'boss', n: 'Дон', d: 'Очолити мафіозну сімʼю або картель', t: function (s) { return (s.gang && s.gang.rank === 4) || (s.gangPast && s.gangPast.rank === 4); } },
  { id: 'billion', n: 'Мільярдер', d: 'Статок $1 млрд', t: function (s) { return s.stat.peakNet >= 1e9; } },
  { id: 'teacher', n: 'Учитель', d: 'Пропрацювати вчителем 20 років', t: function (s) { return yearsIn(s, 'teacher') >= 20; } }
];
function summary(s) {
  var c = COUNTRIES[s.birth];
  var avg = s.stat.incYears ? s.stat.incSum / s.stat.incYears : 0;
  return {
    age: s.age, le: c.le, worldLe: WORLD_LE, cause: s.cause,
    pctCountry: lifePct(s.birth, s.age), pctWorld: worldLifePct(s.age),
    peakInc: s.stat.peakInc, peakPct: globalPct(s.stat.peakInc), avgInc: avg, avgPct: globalPct(avg),
    net: netWorth(s), peakNet: s.stat.peakNet,
    ach: ACHIEVEMENTS.filter(function (a) { return a.t(s); })
  };
}
