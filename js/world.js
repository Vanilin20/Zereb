// ЖЕРЕБ — світові кризи, старіння батьків, армія, повтори подій, спрощена мафія, епітафія

function evOver(id, a, w, cond, run, once) { for (var i = EVENTS.length - 1; i >= 0; i--) if (EVENTS[i].id === id) EVENTS.splice(i, 1); if (run) { ev(id, a, w, cond, run, once); EVENTS[EVENTS.length - 1].q = /opts\s*:/.test(run.toString()); } }

// ======================================================================
// Світові кризи: тривалі періоди, а не разові події
// ======================================================================
var UNSTABLE = ['AR', 'TR', 'NG', 'EG', 'LK', 'IR', 'VE', 'ZW', 'PK', 'GH', 'LB', 'SD', 'ET', 'MM', 'HT'];
var CRISES = {
  recession: { n: 'Світова рецесія', yrs: [2, 3], start: 'У світі почалася рецесія: компанії скорочують людей, ринки падають, кредити дорожчають.', end: 'Рецесія закінчилася — економіка поволі оговтується.' },
  pandemic: { n: 'Пандемія', yrs: [2, 2], start: 'Новий вірус шириться світом. Лікарні переповнені, кордони закриваються.', end: 'Пандемія відступила. Життя повертається до звичного.' },
  housing: { n: 'Обвал ринку житла', yrs: [2, 4], start: 'Ринок нерухомості обвалився: ціни на житло стрімко падають, банки не дають іпотек.', end: 'Ринок житла стабілізувався.' },
  inflation: { n: 'Гіперінфляція', yrs: [2, 3], local: 1, start: 'Національна валюта обвалилася. Ціни ростуть щотижня, заощадження в місцевій валюті тануть.', end: 'Інфляцію вдалося приборкати. Але гроші, що згоріли, не повернуться.' },
  boom: { n: 'Економічний підйом', yrs: [2, 3], start: 'Економіка на підйомі: роботи багато, зарплати ростуть, бізнес процвітає.', end: 'Підйом вичерпався.' }
};
function crisisName(s) { return s.crisis ? CRISES[s.crisis.id].n : ''; }
function startCrisis(s, id, out) {
  var K = CRISES[id];
  s.crisis = { id: id, t: ri(K.yrs[0], K.yrs[1]), cc: s.country };
  s.econ = id === 'recession' || id === 'pandemic' ? -1 : id === 'boom' ? 0.5 : 0; s.econT = s.crisis.t;
  say(s, K.start, id === 'boom' ? 'good' : 'bad');
  if (id === 'housing') { if (s.home) s.home.val *= 0.7; s.rentals.forEach(function (r) { r.val *= 0.7; }); }
  if (id === 'pandemic' && s.age >= 6) out.push(pandemicPrompt(s));
  if (id === 'inflation' && s.age >= 18 && s.money > M(s) * 0.2) out.push(inflationPrompt(s));
  if (id === 'recession' && s.inv && s.inv.stk > 0) s.crash = 1;
}
function crisisTick(s, out) {
  if (s.crisis) {
    var k = s.crisis.id;
    if (k === 'inflation' && s.country === s.crisis.cc && !s.flags.hedged) { var l = s.money * 0.35; if (l > 1) { s.money -= l; cashNote(s, 'Знецінення через інфляцію', -l); } }
    if (k === 'housing') { if (s.home) s.home.val *= 0.95; }
    if (k === 'pandemic' && s.age > 65 && !s.flags.vax && chance(0.06)) add(s, { health: -12 });
    if (k === 'pandemic' && s.job && JOB[s.job.id] && ['waiter', 'cook', 'barista', 'shop', 'driver', 'hotel', 'guide'].indexOf(s.job.id) >= 0 && chance(0.3)) { say(s, 'Карантин: заклад закрили, тебе відправили у безстрокову відпустку.', 'bad'); endJob(s, 'карантин'); }
    if (--s.crisis.t <= 0) { say(s, CRISES[k].end, 'good'); s.crisis = null; s.flags.hedged = 0; s.econ = 0; s.econT = 0; s.lastCrisis = s.age; }
    return;
  }
  if (s.age < 1 || (s.lastCrisis != null && s.age - s.lastCrisis < 4)) return;
  var r = R();
  if (r < 0.045) startCrisis(s, 'recession', out);
  else if (r < 0.055 && s.year > 2026) startCrisis(s, 'pandemic', out);
  else if (r < 0.07) startCrisis(s, 'housing', out);
  else if (r < 0.07 + (UNSTABLE.indexOf(s.country) >= 0 ? 0.04 : 0.003)) startCrisis(s, 'inflation', out);
  else if (r < 0.11) startCrisis(s, 'boom', out);
}
function pandemicPrompt(s) {
  var rich = C(s).gdp > 20, risk = s.age > 70 ? 0.3 : s.age > 50 ? 0.12 : 0.05;
  return { title: 'Пандемія', text: 'Як ти житимеш ці два роки?' + (rich ? '' : ' Вакцини до твоєї країни доїдуть пізніше.'), opts: [
    { t: 'Суворо ізолюватися', sub: 'майже без ризику, але самотність і втрата доходу', f: function () { add(s, { happy: -10, social: -8 }); s.friends = Math.max(0, s.friends - 1); if (s.job && !s.job.teen && JOB[s.job.id] && ['dev', 'designer', 'writer', 'analyst', 'accountant'].indexOf(s.job.id) < 0 && chance(0.35)) { endJob(s, 'ізоляція'); return 'Ти пересиді' + g(s, 'в', 'ла') + ' пандемію вдома. Роботу, де треба було зʼявлятися особисто, втрачено.'; } return 'Два роки вдома. Здоровий' + g(s, '', 'а') + ', але дуже самотньо.'; } },
    { t: 'Вакцинуватися й жити обережно', sub: rich ? 'баланс ризику й нормального життя' : 'чекати вакцину ~рік, поки є ризик', f: function () { s.flags.vax = 1; add(s, { happy: -4 }); if (chance(rich ? risk * 0.2 : risk * 0.6)) { add(s, { health: -15 }); return 'Ти все ж захворі' + g(s, 'в', 'ла') + ', але без найгіршого.'; } return 'Маска, щеплення, менше зустрічей. Пронесло.'; } },
    { t: 'Жити як раніше', sub: 'нормальне життя й дохід, ризик для здоровʼя', f: function () { add(s, { social: 3 }); if (chance(risk * 2)) { add(s, { health: -25 }); if (s.age > 70 && chance(0.3)) { die(s, 'ускладнення вірусної інфекції'); return null; } return 'Тяжка хвороба: тижні в лікарні.'; } return 'Ти жи' + g(s, 'в', 'ла') + ' як раніше — і обійшлося.'; } }] };
}
function inflationPrompt(s) {
  var m = s.money;
  return { title: 'Гіперінфляція', text: 'У тебе ' + fmt(m) + ' готівкою в місцевій валюті. Щороку вони втрачатимуть третину вартості.', opts: [
    { t: 'Перевести в долари', sub: 'обмінники беруть ~8%', f: function () { s.money -= m * 0.08; s.flags.hedged = 1; return 'Заощадження тепер у доларах. Дорогий обмін, зате не згорять.'; } },
    { t: 'Купити речі й техніку заздалегідь', sub: 'частина грошей у речах, решта горить', f: function () { s.money -= m * 0.4; add(s, { happy: 3 }); return 'Ти скупи' + g(s, 'в', 'ла') + ' потрібне за старими цінами. Решта грошей усе одно тане.'; } },
    { t: 'Тримати як є', sub: 'вірити, що мине', f: function () { return 'Ти тримаєш гривні... тобто місцеву валюту. Побачимо.'; } }] };
}
evOver('pandemic'); evOver('inflation');

// ======================================================================
// Старіння батьків і спадщина
// ======================================================================
function careCost(s, mode) { var c = C(s), rich = c.gdp > 30; return mode === 'home' ? M(s) * (rich ? 1.1 : 0.35) : mode === 'nurse' ? M(s) * (rich ? 0.7 : 0.25) : 0; }
function careTick(s, out) {
  // догляд за батьками, що вже не можуть жити самі
  s.parents.forEach(function (p) {
    if (!p.alive) { if (p.care) p.care = null; return; }
    if (p.care) {
      var cost = careCost(s, p.care);
      if (cost) { s.money -= cost; cashNote(s, p.care === 'home' ? 'Будинок для літніх (' + p.role.toLowerCase() + ')' : 'Доглядальниця (' + p.role.toLowerCase() + ')', -cost); }
      if (p.care === 'self') { add(s, { happy: -2 }); p.rel = clamp(p.rel + 3); if (s.partner) s.partner.rel -= 2; }
      if (p.care === 'home') p.rel = clamp(p.rel - 2 + (s.h.family || 0) * 2);
      if (p.care === 'sib') { var sb = s.sibs.filter(function (x) { return x.alive; })[0]; if (sb) sb.rel = clamp(sb.rel - 4); }
      return;
    }
    if (p.age >= 78 && s.age >= 25 && !s.prison && chance(0.12 + (p.age - 78) * 0.03 + (p.ill ? 0.15 : 0))) out.push(carePrompt(s, p));
  });
  // спадщина з братами й сестрами
  if (s.pendInh) {
    var I2 = s.pendInh; s.pendInh = null;
    if (!s.alive) return;
    out.push(inhPrompt(s, I2));
  }
}
function carePrompt(s, p) {
  var sib = s.sibs.filter(function (x) { return x.alive && x.age >= 20; })[0], who = p.sex === 'f' ? 'Мама' : 'Тато';
  var o = [
    { t: 'Забрати до себе', sub: '~10 год/тиждень на догляд, напруга в родині', f: function () { p.care = 'self'; p.rel = clamp(p.rel + 15); s.withParents = false; return who + ' тепер живе з тобою. Важко, але поруч.'; } },
    { t: 'Найняти доглядальницю', sub: '~' + fmt(careCost(s, 'nurse')) + '/рік', f: function () { p.care = 'nurse'; return 'Доглядальниця приходить щодня. ' + who + ' лишається вдома.'; } },
    { t: 'Будинок для літніх людей', sub: '~' + fmt(careCost(s, 'home')) + '/рік · ' + who.toLowerCase() + ' образиться', f: function () { p.care = 'home'; p.rel = clamp(p.rel - 15); return who + ' в будинку для літніх. Ти навідуєшся у вихідні.'; } }];
  if (sib) o.push({ t: 'Попросити ' + gp(sib, 'брата', 'сестру') + ' ' + sib.name, sub: 'безкоштовно для тебе, але стосунки зіпсуються', f: function () { if (chance(0.5 + (sib.rel - 50) / 150)) { p.care = 'sib'; sib.rel = clamp(sib.rel - 10); return sib.name + ' погоди' + gp(sib, 'вся', 'лася') + ', але натякну' + gp(sib, 'в', 'ла') + ', що запамʼятає.'; } sib.rel = clamp(sib.rel - 20); return { title: 'Відмова', text: sib.name + ' відмовляється: «Тепер твоя черга». Що робиш?', opts: o.slice(0, 3) }; } });
  return { title: 'Батьки старіють', text: who + ', ' + p.name + ' (' + p.age + '), вже не може жити сам' + (p.sex === 'f' ? 'а' : '') + '. Хтось має доглядати.', opts: o };
}
function inhPrompt(s, I2) {
  var share = I2.total / I2.heirs, carer = s.parents.some(function (p) { return p.care === 'self'; }) || I2.carer;
  return { title: 'Спадщина', text: 'Батьки залишили ' + fmt(I2.total) + '. Спадкоємців: ' + I2.heirs + '. Порівну — по ' + fmt(share) + '.', opts: [
    { t: 'Поділити порівну', f: function () { s.money += share; cashNote(s, 'Спадщина', share); return 'Поділили порівну. Без сварок.'; } },
    { t: 'Претендувати на більше', sub: carer ? 'ти догляда' + g(s, 'в', 'ла') + ' батьків — є аргумент' : 'суд, юристи, зіпсовані стосунки', f: function () { var fee = I2.total * 0.08; if (chance(carer ? 0.65 : 0.25)) { var x = share * 1.6 - fee; s.money += x; cashNote(s, 'Спадщина', x); s.sibs.forEach(function (b) { b.rel = clamp(b.rel - 35); }); return 'Суд став на твій бік: ' + fmt(x) + ' після юристів. З братами й сестрами ви більше не говорите.'; } var y = share - fee; s.money += y; cashNote(s, 'Спадщина', y); s.sibs.forEach(function (b) { b.rel = clamp(b.rel - 40); }); add(s, { happy: -6 }); return 'Суд поділив порівну, юристи забрали своє. Родина розсварилася.'; } },
    { t: 'Відмовитися на користь рідних', f: function () { s.sibs.forEach(function (b) { b.rel = clamp(b.rel + 25); }); add(s, { happy: 4 }); return 'Ти відмови' + g(s, 'вся', 'лася') + ' від своєї частки. Рідні цього не забудуть.'; } }] };
}
evOver('parentcare');

// ======================================================================
// Армія: строкова служба, контракт, мобілізація під час війни
// ======================================================================
var CONSC_TERM = { KR: '18 місяців', IL: s0 => s0.sex === 'm' ? '32 місяці' : '24 місяці', TR: '6–12 місяців', GR: '9–12 місяців', FI: '6–12 місяців', NO: 'рік', CH: '~4 місяці і щорічні збори', AT: '6 місяців', DK: '4–11 місяців', SE: '9–15 місяців', EG: '1–3 роки', IR: '~2 роки', VN: '2 роки', TH: 'до 2 років (за жеребом)', SG: '2 роки', LT: '9 місяців', EE: '8–11 місяців' };
var CIVIL_SERVICE = ['FI', 'AT', 'CH', 'NO', 'DK', 'SE', 'KR', 'GR', 'EE', 'LT'];
conscription = function (s) {
  var c = C(s), war = cf(s) === 2, term = CONSC_TERM[c.code]; term = typeof term === 'function' ? term(s) : (term || 'рік');
  var o = [
    { t: 'Відслужити', sub: term + (war ? ' · країна воює — ризик фронту' : ''), f: function () { s.flags.served = 1; mark(s, 'Строкова служба'); if (war && chance(0.3)) { s.army = { left: 1, front: 1 }; return 'Твій підрозділ відправили ближче до фронту.'; } add(s, { health: 4, social: 5, happy: -8, smarts: -1 }); s.friends++; return 'Служба позаду: дисципліна, армійські друзі й утома.'; } },
    { t: 'Відстрочка через навчання', sub: 'треба вступити до вишу', f: function () { return { title: 'Спеціальність', text: 'Студентам дають відстрочку.', opts: uniOpts(s) }; } },
    { t: 'Підписати контракт', sub: 'стабільна зарплата, кар\'єра у війську', f: function () { s.flags.served = 1; takeJob(s, JOB.soldier); mark(s, 'Контракт зі збройними силами'); return 'Ти підписа' + g(s, 'в', 'ла') + ' контракт. Тепер це твоя професія.'; } },
    { t: 'Ухилитися', sub: c.law > 0.7 ? 'тут за це карають суворо' : 'можна відкупитися, але є ризик', f: function () { if (chance(c.law * 0.6)) { s.flags.dodger = 1; if (c.law > 0.8 && chance(0.5)) return court(s, 'ухилення від військової служби', 1, 2); s.money -= M(s) * 0.3; add(s, { happy: -6 }); return 'Тебе знайшли. Штраф ' + fmt(M(s) * 0.3) + ', і до армії все одно забрали.'; } s.flags.dodger = 1; add(s, { happy: -2 }); return 'Довідка від «знайомого лікаря» — і ти вільн' + g(s, 'ий', 'а') + '. Але в анкетах це питання ще спливатиме.'; } }];
  if (CIVIL_SERVICE.indexOf(c.code) >= 0) o.splice(1, 0, { t: 'Альтернативна (цивільна) служба', sub: 'довше, але без зброї', f: function () { s.flags.served = 1; add(s, { happy: -5, social: 3, smarts: 1 }); return 'Ти рік працюва' + g(s, 'в', 'ла') + ' в лікарні замість казарми.'; } });
  return { title: 'Повістка', text: 'Тобі 18 — час на строкову службу в ' + c.name + ' (' + term + (c.consc === 2 ? '; тут служать і жінки, і чоловіки' : '') + ').', opts: o };
};
function armyTick(s, out) {
  if (s.army) {
    var A2 = s.army, c = C(s);
    var pay = c.median * (A2.front ? 1.6 : 0.8); s.money += pay; cashNote(s, 'Грошове забезпечення військового', pay);
    if (A2.front) {
      add(s, { happy: -8, health: -3 });
      if (chance(0.03)) { die(s, 'загину' + g(s, 'в', 'ла') + ' на фронті'); return; }
      if (chance(0.1)) { add(s, { health: -25 }); s.flags.wounded = 1; say(s, 'Тяжке поранення. Шпиталь, реабілітація.', 'bad'); }
      if (chance(0.15)) s.flags.ptsd = 1;
    }
    if (--A2.left <= 0) {
      s.army = null; s.flags.veteran = 1; mark(s, A2.front ? 'Ветеран війни' : 'Демобілізація');
      if (A2.job && JOB[A2.job.id]) { s.job = A2.job; say(s, 'Ти поверну' + g(s, 'вся', 'лася') + ' з війська. Роботодавець зберіг за тобою місце.', 'good'); }
      else say(s, 'Ти поверну' + g(s, 'вся', 'лася') + ' з війська.', 'good');
      if (s.flags.ptsd) say(s, 'Війна не відпускає: погано спиш, різкі звуки лякають. Допомогла б терапія.', 'bad');
    }
    return;
  }
  // мобілізація у країні, що воює
  var c2 = C(s);
  if (cf(s) === 2 && s.sex === 'm' && s.age >= 25 && s.age <= 60 && !s.prison && !s.flags.wounded && !(s.flags.defer && s.age - s.flags.defer < 3) && !(s.job && s.job.id === 'soldier') && chance(s.flags.served ? 0.12 : 0.07)) out.push(mobilPrompt(s));
}
function mobilPrompt(s) {
  var c = C(s), crit = s.job && JOB[s.job.id] && (JOB[s.job.id].edu >= 5 || ['doctor', 'nurse', 'engineer', 'teacher', 'rescuer', 'police'].indexOf(s.job.id) >= 0);
  var kids3 = s.kids.filter(function (k) { return k.alive && k.age < 18; }).length >= 3;
  var o = [
    { t: 'Піти служити', sub: '1–3 роки, ризик загинути чи бути пораненим', f: function () { s.army = { left: ri(1, 3), front: chance(0.6) ? 1 : 0, job: s.job }; s.job = null; add(s, { social: 4 }); mark(s, 'Мобілізація'); return 'Ти пішов до війська. ' + (s.army.front ? 'Підрозділ — на передовій.' : 'Служиш у тилу.'); } }];
  if (kids3) o.push({ t: 'Оформити відстрочку', sub: 'троє й більше дітей — законна підстава', f: function () { s.flags.defer = s.age; return 'Відстрочку оформлено.'; } });
  else if (crit) o.push({ t: 'Бронювання через роботу', sub: 'критична професія, але роботодавець має погодитися', f: function () { if (chance(0.6)) { s.flags.defer = s.age; return 'Тебе забронювали.'; } return mobilPrompt2(s, 'Бронювання не погодили.'); } });
  o.push({ t: 'Ховатися від ТЦК', sub: 'кримінальна відповідальність, обмеження', f: function () { s.flags.dodger = 1; add(s, { happy: -8, social: -4 }); if (s.job && chance(0.3)) endJob(s, 'ухилення'); if (chance(0.3)) return court(s, 'ухилення від мобілізації', 1, 3); return 'Ти перестав виходити з дому без потреби. Кожна перевірка документів — стрес.'; } });
  return { title: 'Мобілізація', text: c.name + ' воює. Тобі вручили повістку.', opts: o };
}
function mobilPrompt2(s, why) { var p = mobilPrompt(s); p.text = why + ' ' + p.text; p.opts = p.opts.filter(function (o) { return !/Бронювання/.test(o.t); }); return p; }
evOver('soldier_deploy', [18, 50], 3, function (s) { return s.job && s.job.id === 'soldier'; }, function (s) {
  var war = cf(s) === 2;
  return { text: war ? 'Твій підрозділ перекидають на передову.' : 'Пропонують місію за кордоном: подвійна оплата, пів року далеко від дому.', opts: [
    O(war ? 'Виконувати наказ' : 'Поїхати', function () { if (!s.job) return 'Вже неактуально.'; s.job.perf += 12; s.money += M(s) * (war ? 0.8 : 0.5); add(s, { happy: -6 }); if (chance(war ? 0.05 : 0.01)) { die(s, war ? 'загину' + g(s, 'в', 'ла') + ' на фронті' : 'загину' + g(s, 'в', 'ла') + ' на місії'); return null; } if (chance(war ? 0.2 : 0.05)) { add(s, { health: -20 }); return 'Поверну' + g(s, 'вся', 'лася') + ' з пораненням.'; } return 'Ти поверну' + g(s, 'вся', 'лася') + ' цілим' + g(s, '', 'ою') + '. Командування помітило.'; }),
    O('Подати рапорт на інше місце', function () { if (s.job) s.job.perf -= 10; if (war && chance(0.5)) return 'Рапорт відхилили. Наказ є наказ.'; return 'Тебе лишили на місці. Карʼєрі це не допомогло.'; })] };
});

// ======================================================================
// Менш очевидні вибори (переписані події)
// ======================================================================
evOver('checkup', [40, 80], 2, null, function (s) {
  if (chance(0.08 + (s.age - 40) / 300)) getIll(s, pick(['рак на ранній стадії', 'проблеми із серцем', 'цукровий діабет', 'гіпертонія', 'хвороба нирок']));
  var c = C(s), priv = treatCost(s, 0.05) + M(s) * 0.04;
  function found() { if (!s.flags.genKnown && Math.max(s.gen.heart, s.gen.cancer) > 1.25) s.flags.genKnown = s.gen.heart > s.gen.cancer ? 'heart' : 'cancer'; if (s.flags.ill && !s.flags.illKnown) { s.flags.illKnown = true; return illnessPrompt(s); } return null; }
  var o = [
    O('Приватна клініка', function () { s.money -= priv; var f = found(); if (f) return f; if (chance(0.15)) { add(s, { happy: -4 }); s.money -= priv * 0.5; return 'Знайшли «щось підозріле». Додаткові аналізи, тиждень нервів — і нічого серйозного.'; } return 'Усе в нормі.'; }, fmt(priv) + ' · швидко й точно'),
    O('Записатися в державну', function () { if (c.health === 'paid') s.money -= priv * 0.6; if (chance(c.hq)) { var f = found(); if (f) return f; return 'Після кількох місяців черг: усе в нормі.'; } return 'Черга розтяглася на рік, обстеження поверхове.'; }, c.health === 'paid' ? 'дешевше, але черги' : 'безкоштовно, але черги й якість ' + (c.hq > 0.7 ? 'нормальна' : 'так собі')),
    O('Відкласти', function () { return 'Ніколи. Може, наступного року.'; }, 'жодних витрат і нервів — поки що')];
  return { text: 'Тобі ' + s.age + '. Лікар радить повне обстеження.', opts: o };
});
evOver('mosquito', [0, 10], 3, function (s) { return ['NG', 'CD', 'ET', 'TZ', 'KE', 'UG', 'MZ', 'MG', 'ML', 'NE', 'BF', 'CM', 'GH', 'AO', 'SD', 'ZM', 'MW', 'SN', 'CI'].indexOf(s.country) >= 0 && s.d <= 5; }, function (s) {
  return { text: 'Сезон дощів — і хмари комарів. Сітки є не в усіх. (Факт: малярія щороку забирає ≈600 тис. життів, переважно дітей в Африці — WHO.)', opts: [
    O('Купити сітку замість шкільної форми', function () { s.flags.net = 1; add(s, { happy: -3, social: -3 }); return 'Спиш під сіткою. У школі сміються зі старого одягу.'; }),
    O('Їхати за безкоштовною в райцентр', function () { if (s.study) s.gpa = Math.max(0, s.gpa - 5); if (chance(0.6)) { s.flags.net = 1; return 'Тиждень школи пропущено, але сітку дали.'; } return 'Сітки закінчилися, поки ви доїхали.'; }),
    O('Обійдемося', function () { if (chance(0.35)) { add(s, { health: -15 }); if (s.age < 5 && chance(0.1)) { die(s, 'малярія'); return null; } return 'Малярія. Важкі тижні з лихоманкою.'; } return 'Цього разу пронесло.'; })] };
}, true);
evOver('daycare', [3, 5], 3, function (s) { return s.urban && C(s).gdp > 8; }, function (s) {
  return { text: 'Тебе віддали в садочок. Навколо купа незнайомих дітей.', opts: [
    O('Гратися з усіма', function () { add(s, { social: 5 }); if (chance(.6)) s.friends++; if (chance(0.3)) add(s, { health: -3 }); return 'Друзів багато — і застуд теж.'; }),
    O('Тихо бавитися самому з конструктором', function () { add(s, { smarts: 3, social: -2 }); return 'Ти будуєш вежі вищі за всіх. Але граєшся сам' + g(s, '', 'а') + '.'; })] };
}, true);
evOver('sportclub', [7, 14], 2, null, function (s) {
  var sp = pick(['футболу', 'боротьби', 'плавання', 'легкої атлетики', 'баскетболу']), fee = M(s) * 0.04, poorF = s.d <= 4;
  return { text: 'Тренер секції ' + sp + ' кличе тебе на перегляд.' + (poorF ? ' Але форма й поїздки на змагання коштують грошей, яких у родини небагато.' : ''), opts: [
    O('Піти', function () { s.flags.tal_sport = 1; add(s, { sport: 15, health: 4 }); if (s.study) s.gpa = Math.max(0, s.gpa - 3); if (poorF) s.parents.forEach(function (p) { p.rel -= 3; }); return 'Тренування щодня — оцінки трохи просіли, зате ти в секції ' + sp + '.'; }, 'хобі «Спорт» росте швидше · менше часу на навчання' + (poorF ? ' · навантаження на бюджет родини' : '')),
    O('Не піти', function () { add(s, { smarts: 1 }); return 'Більше часу на уроки й друзів у дворі.'; })] };
}, true);
evOver('tutor', [14, 17], 2, function (s) { return s.q >= 3 && s.study && s.study.t === 'school'; }, function (s) {
  var poorF = s.d <= 5;
  return { text: 'Батьки пропонують найняти репетитора перед вступом.' + (poorF ? ' Для цього їм доведеться відмовитися від відпустки й економити.' : ''), opts: [
    O('Погодитися', function () { add(s, { gpa: 10, smarts: 2, happy: -3, social: -2 }); if (poorF) s.parents.forEach(function (p) { p.rel += 3; }); return 'Вечори з репетитором підтягнули бал, на друзів часу не лишилося.'; }),
    O('Готуватися сам' + g(s, '', 'ою'), function () { if (chance(0.3 + s.st.smarts / 200)) { add(s, { gpa: 6, smarts: 3 }); return 'Сам' + g(s, '', 'а') + ' розібра' + g(s, 'вся', 'лася') + ' — і це дало навіть більше.'; } add(s, { gpa: 1 }); return 'Самостійно вийшло так собі.'; })] };
}, true);

// ======================================================================
// Повтори подій: кулдаун і спадна вага
// ======================================================================
var EV_CD = { unexp: 1, airraid: 1, heat: 2, flood: 3, commute: 3 };
pickEvents = function (s, out) {
  s.seenAt = s.seenAt || {}; s.pyr = s.pyr || [];
  var hadPrompt = out.length > 0, calm = s.pyr.length >= 2 && s.pyr[0] && s.pyr[1];   // два роки поспіль з виборами — дати перепочити
  var pool = EVENTS.filter(function (e) {
    if (s.age < e.a[0] || s.age > e.a[1] || (e.once && s.seen[e.id]) || (e.if && !e.if(s))) return false;
    var n = s.seen[e.id] || 0, cd = EV_CD[e.id] != null ? EV_CD[e.id] : 5;
    if (n && s.age - (s.seenAt[e.id] || -99) < cd) return false;
    if (n >= (EV_CD[e.id] ? 8 : 4)) return false;
    return true;
  });
  var n = 0, prompts = 0;
  shuffle(pool).forEach(function (e) {
    if (n >= (s.age < 6 ? 1 : 2) || !s.alive) return;
    var isQ = e.q == null ? (e.q = /opts\s*:/.test(e.run.toString())) : e.q;
    if (isQ && (prompts || hadPrompt || calm || out.length >= 2)) return;
    var w = typeof e.w === 'function' ? e.w(s) : (e.w == null ? 1 : e.w);
    w /= 1 + (s.seen[e.id] || 0) * 0.7;
    if (!chance((isQ ? 0.045 : 0.07) * w)) return;
    n++; s.seen[e.id] = (s.seen[e.id] || 0) + 1; s.seenAt[e.id] = s.age;
    var r = e.run(s);
    if (!r) return;
    if (typeof r === 'string') say(s, r, e.k || '');
    else { prompts++; r.title = r.title || e.title || 'Подія'; spice(s, r); out.push(r); }
  });
  s.pyr.unshift(out.length > 0); s.pyr.length = 2;
};
// трохи непередбачуваності: інколи наслідок вибору має несподіваний поворот
EVENTS.forEach(function (e) { if (e.q == null) e.q = /opts\s*:/.test(e.run.toString()); });
var TWISTS = [
  [function (s) { var a = M(s) * rnd(0.02, 0.08); s.money += a; return 'А ще випадково знайшлися гроші, про які ти забу' + g(s, 'в', 'ла') + ': +' + fmt(a) + '.'; }],
  [function (s) { var a = M(s) * rnd(0.02, 0.06); s.money -= a; return 'Але по дорозі ти загуби' + g(s, 'в', 'ла') + ' гаманець: −' + fmt(a) + '.'; }],
  [function (s) { add(s, { social: 4 }); s.friends++; return 'Через цю історію ти познайоми' + g(s, 'вся', 'лася') + ' з цікавою людиною.'; }],
  [function (s) { add(s, { happy: -5 }); return 'Але хтось переказав усе інакше — тепер про тебе пліткують.'; }],
  [function (s) { add(s, { health: -4 }); return 'Від нервів ти тиждень хворі' + g(s, 'в', 'ла') + '.'; }],
  [function (s) { add(s, { happy: 6 }); return 'Несподівано це підняло настрій на весь місяць.'; }],
  [function (s) { if (s.job) { s.job.perf += 6; return 'Про це дізнався начальник — і оцінив.'; } add(s, { smarts: 2 }); return 'Ти зроби' + g(s, 'в', 'ла') + ' з цього корисні висновки.'; }]
];
function spice(s, r) {
  (r.opts || []).forEach(function (o) {
    var f0 = o.f; if (!f0 || o.spiced) return; o.spiced = 1;
    o.f = function () { var res = f0.apply(this, arguments); if (typeof res === 'string' && s.alive && chance(0.13)) res += ' ' + pick(TWISTS)[0](s); return res; };
  });
}

// ======================================================================
// Мафія: одна кнопка «Рік в угрупованні» замість трьох
// ======================================================================
(function () {
  var job = ACTIONS.filter(function (a) { return a.id === 'job_gang'; })[0], br = ACTIONS.filter(function (a) { return a.id === 'bribe'; })[0];
  ['job_gang', 'bribe', 'lowkey'].forEach(function (id) { var a = ACTIONS.filter(function (x) { return x.id === id; })[0]; if (a) a.show = function () { return false; }; });
  A({ id: 'gang_year', tab: 'risk', n: 'Як проведеш цей рік', d: function (s) { return 'Справи, тиша чи конверти поліції · розшук: ' + ['низький', 'помітний', 'високий', 'дуже високий'][Math.min(3, Math.floor((s.gang.heat || 0) / 2))]; }, show: function (s) { return !!s.gang && !s.prison; },
    run: function (s) {
      var o = [
        { t: 'Брати справи', sub: 'більше грошей і довіри, більше уваги поліції', f: function () { s.used.job_gang = 1; return job.run(s); } },
        { t: 'Залягти на дно', sub: 'дохід ×0.5, ризики ↓, розшук спадає', f: function () { s.used.lowkey = 1; return 'Цього року ти не висовуєшся.'; } }];
      if (C(s).law < 0.8) o.push({ t: 'Платити поліції', sub: fmt(M(s) * (1 + s.gang.rank * 3)) + ' · ризик арешту ↓', f: function () { s.used.bribe = 1; return br.run(s); } });
      return { title: s.gang.kind === 'картель' ? 'Картель' : 'Сімʼя', text: 'Ти ' + rankName(s.gang).toLowerCase() + '. Як діятимеш цього року?', opts: o };
    } });
})();

// ======================================================================
// Години: догляд за батьками й служба
// ======================================================================
(function () {
  var fh = freeHours, hb = hoursBreakdown;
  function extra(s) { var h = 0; s.parents.forEach(function (p) { if (p.alive && p.care === 'self') h += 10; if (p.alive && p.care === 'nurse') h += 2; }); return h; }
  freeHours = function (s) { var h = fh(s); if (s.army) return Math.min(h, 10); return Math.max(0, h - extra(s)); };
  hoursBreakdown = function (s) { var r = hb(s); if (s.army) r.push(['служба', 100]); var e = extra(s); if (e) r.push(['догляд за батьками', e]); return r; };
})();

// ======================================================================
// Описи замість цифр
// ======================================================================
function statWord(k, v, s) {
  var i = v < 20 ? 0 : v < 40 ? 1 : v < 60 ? 2 : v < 80 ? 3 : 4;
  var W = {
    health: ['критичне', 'слабке', 'нормальне', 'добре', 'відмінне'],
    happy: ['депресія', 'сумно', 'так собі', 'добре', 'щастя'],
    smarts: ['низький', 'нижче середнього', 'середній', 'високий', 'блискучий'],
    social: ['відлюдькуватість', 'сором\'язливість', 'звичайна', 'чарівність', 'магнетизм']
  };
  return W[k][i];
}

// ======================================================================
// Епітафія
// ======================================================================
function epitaph(s) {
  var c = COUNTRIES[s.birth], bits = [], J = s.jobHist.concat(s.job ? [s.job] : []).filter(function (j) { return JOB[j.id] && !j.teen; });
  var main = J.slice().sort(function (a, b) { return (b.yrs || 0) - (a.yrs || 0); })[0];
  var who = main ? JOB[main.id].n.toLowerCase() : s.gangPast || s.gang ? 'людина з тіньового світу' : s.biz.length || s.bizHist.length ? 'підприємець' : g(s, 'людина без офіційної роботи', 'людина без офіційної роботи');
  if (s.pol && s.pol.office >= 4) who = 'політик' + (s.pol.office === 5 ? ', глава держави' : '');
  if (s.gang && s.gang.rank === 4) who = s.gang.kind === 'картель' ? 'глава картелю' : 'дон';
  bits.push(c.flag + ' ' + c.name + ', ' + s.birthYear + '–' + s.year + '. ' + cap(who) + '.');
  var t = [];
  if (s.countries.length > 1) t.push(s.countries.length === 2 ? g(s, 'емігрував', 'емігрувала') + ' до ' + COUNTRIES[s.countries[1]].name : 'жи' + g(s, 'в', 'ла') + ' у ' + s.countries.length + ' країнах');
  if (s.marriages > 1) t.push('ма' + g(s, 'в', 'ла') + ' ' + s.marriages + ' шлюби'); else if (s.marriages === 1) t.push(s.partner && s.partner.married && s.partner.yrs >= 25 ? 'прожи' + g(s, 'в', 'ла') + ' у шлюбі ' + s.partner.yrs + ' р.' : g(s, 'одружився', 'вийшла заміж'));
  if (s.kids.length) t.push('вихова' + g(s, 'в', 'ла') + ' ' + s.kids.length + ' ' + (s.kids.length === 1 ? 'дитину' : s.kids.length < 5 ? 'дітей' : 'дітей'));
  if (s.flags.veteran) t.push('пройш' + g(s, 'ов', 'ла') + ' війну');
  if (s.record) t.push('сиді' + g(s, 'в', 'ла') + ' у вʼязниці');
  if (t.length) bits.push(cap(t.slice(0, 3).join(', ')) + '.');
  var pk = globalPct(s.stat.peakInc);
  bits.push(pk >= 99 ? 'На піку заробля' + g(s, 'в', 'ла') + ' більше, ніж 99% людей на Землі.' : pk >= 80 ? 'Жи' + g(s, 'в', 'ла') + ' заможніше за більшість людей світу.' : pk >= 40 ? 'Жи' + g(s, 'в', 'ла') + ' як звичайна людина свого часу.' : 'Усе життя рахува' + g(s, 'в', 'ла') + ' кожну копійку.');
  return bits.join(' ');
}
function cap(x) { return x ? x.charAt(0).toUpperCase() + x.slice(1) : x; }
