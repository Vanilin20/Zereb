// ЖЕРЕБ — політика, партнер і діти як окремі люди

// ======================== ПОЛІТИКА ========================
var PRES_TOP = ['US', 'UA', 'PL', 'FR', 'BR', 'MX', 'AR', 'CO', 'CL', 'PE', 'KR', 'ID', 'PH', 'NG', 'KE', 'GH', 'TR', 'EG', 'IR', 'KZ', 'UZ', 'AZ', 'GE', 'AM', 'MD', 'RO', 'BG', 'HR', 'LT', 'RS', 'ZA', 'DZ', 'TZ', 'UG', 'CD', 'AO', 'MZ', 'CM', 'ML', 'NE', 'AF', 'SD', 'YE', 'LK', 'VN', 'CN', 'MG', 'HT', 'ET', 'FI', 'AT', 'IE', 'PT'];
var AUTOCRACY = ['CN', 'SA', 'AE', 'IR', 'EG', 'AZ', 'UZ', 'KZ', 'VN', 'MM', 'AF', 'SD', 'YE', 'ET', 'CD', 'CM', 'DZ'];
function polTop(s) { var c = C(s); if (['SA', 'AE'].indexOf(c.code) >= 0) return 'Голова уряду'; return PRES_TOP.indexOf(c.code) >= 0 ? 'Президент' : 'Премʼєр-міністр'; }
function offices(s) { return ['Активіст партії', 'Депутат міськради', 'Мер', 'Депутат парламенту', 'Міністр', polTop(s)]; }
function autocracy(s) { return AUTOCRACY.indexOf(s.country) >= 0; }
function partyName(p) { return { rul: 'правляча партія', opp: 'опозиція', ind: 'незалежний кандидат' }[p]; }
function polHours(s) { var o = s.pol && s.pol.office; return !o ? (s.pol ? 5 : 0) : o === 1 ? 12 : 55; }
function electionCycle(s) { return s.country === 'US' ? 4 : 5; }
// Куди можна балотуватися з поточної посади
function polTargets(s) {
  var o = s.pol.office, t = [];
  if (!isCitizen(s)) return [];   // балотуватися можуть лише громадяни
  if (o === 0) t.push(1);
  if (o === 1) t.push(2, 3);
  if (o === 2) t.push(3);
  if ((o === 2 || o === 3 || o === 4) && s.fame >= 45 && s.age >= 35 && s.birth === s.country && !autocracy(s) && !(s.pol.lostTop && s.age - s.pol.lostTop < 10)) t.push(5);   // після поразки на найвищих виборах партія не висуне ще 10 років   // глава держави — лише народжені в країні
  return t;
}
var OFFICE_BAR = [0, 52, 58, 60, 0, 80];   // скільки «очок» треба, щоб перемогти
var OFFICE_AD = [0, 0.2, 0.8, 1.5, 0, 5];   // ціна реклами (× медіанний дохід)

function campaign(s, target) {
  var P = s.pol, offs = offices(s), score = 0, notes = [], c = C(s), oppStr = gauss() * 6 + (P.office === target ? -(P.approval - 50) / 6 : 0) + [0, 0, 3, 10, 0, 22][target] + (target === 5 && autocracy(s) ? 20 : 0);
  var base = 35 + s.st.social / 5 + s.fame / 5 + P.approval / 10 + (s.edu >= 5 ? 3 : 0) + (s.immigrant ? -12 : 0);
  if (P.party === 'rul') base += (s.econ < 0 ? -8 : 6) + (autocracy(s) ? 25 : 0);
  if (P.party === 'opp') base += (s.econ < 0 ? 8 : -3) - (autocracy(s) ? 35 : 0);
  if (P.party === 'ind') base -= 6;
  if (target === 5 && P.office === 4) base += 5;
  score = base;
  function finish() {
    var total = score + gauss() * 7, bar = OFFICE_BAR[target] + oppStr;
    P.nextElec = s.age + electionCycle(s);
    if (total >= bar) {
      var prev = P.office; P.office = target; P.term = electionCycle(s); P.approval = clamp(50 + (total - bar)); P.terms = prev === target ? P.terms + 1 : 1;
      if (target >= 2 && s.job) endJob(s, 'політика');
      s.fame = clamp(s.fame + [0, 3, 8, 10, 0, 30][target]); add(s, { happy: 12 });
      mark(s, offs[target] + (prev === target ? ' (переобрано)' : ''));
      return 'Перемога! ' + Math.round(50 + (total - bar) / 2) + '% голосів. Тепер ти — ' + offs[target].toLowerCase() + '.' + (notes.length ? ' ' + notes.join(' ') : '');
    }
    add(s, { happy: -8 }); if (target === 5) { P.lostTop = s.age; s.fame = clamp(s.fame - 10); }
    if (P.office === target) { P.office = Math.max(0, target === 5 ? 3 : target - 1); } else if (P.term === 0 && P.office > 0) { P.office = 0; notes.push('Попередню посаду ти теж втрати' + g(s, 'в', 'ла') + '.'); }
    if (autocracy(s) && P.party === 'opp' && chance(0.25)) return court(s, '«екстремізм»', 2, 6);
    return 'Поразка: ' + Math.round(Math.max(3, 45 - (bar - total))) + '% голосів. Наступні вибори — через ' + electionCycle(s) + ' р.' + (notes.length ? ' ' + notes.join(' ') : '');
  }
  function twist() {
    var r = R();
    if (r < 0.35) return { title: 'За тиждень до виборів', text: 'Опоненти злили на тебе компромат: старі борги, сумнівні знайомства й фото з вечірки.', opts: [
      { t: 'Все заперечувати', f: function () { score += chance(0.5) ? 2 : -8; return finish(); } },
      { t: 'Чесно визнати й вибачитися', f: function () { score += chance(0.6) ? 3 : -4; return finish(); } },
      { t: 'Відповісти контркомпроматом', sub: 'брудно, але працює', f: function () { score += rnd(-6, 8); P.dirty = (P.dirty || 0) + 1; return finish(); } }] };
    if (r < 0.6) return { title: 'Пропозиція спонсора', text: 'Великий бізнесмен готовий профінансувати фінал кампанії. Натякає, що потім «попросить про дрібницю».', opts: [
      { t: 'Взяти гроші', sub: 'сильна реклама, але ти будеш винен', f: function () { score += 8; P.owed = 1; return finish(); } },
      { t: 'Відмовитися', f: function () { score += 1; return finish(); } }] };
    if (r < 0.8 && P.party !== 'rul') return { title: 'Пропозиція коаліції', text: 'Інша партія пропонує обʼєднатися: їхні голоси в обмін на посаду для їхнього лідера.', opts: [
      { t: 'Погодитися', f: function () { score += 7; P.approval -= 3; return finish(); } },
      { t: 'Йти самостійно', f: function () { return finish(); } }] };
    return finish();
  }
  function debate() {
    return { title: 'Дебати', text: 'Прямий ефір. Опонент щойно звинуватив тебе в некомпетентності.', opts: [
      { t: 'Факти й цифри', sub: 'розум', f: function () { score += (s.st.smarts - 50) / 4 + rnd(-3, 3); return twist(); } },
      { t: 'Емоції й історії людей', sub: 'харизма', f: function () { score += (s.st.social - 50) / 4 + rnd(-3, 3); return twist(); } },
      { t: 'Атакувати у відповідь', sub: 'ризиковано', f: function () { score += rnd(-8, 10); return twist(); } },
      { t: 'Не йти на дебати', f: function () { score -= 5; return twist(); } }] };
  }
  var ad = c.median * OFFICE_AD[target];
  var opts = [
    { t: 'Агітація від дверей до дверей', sub: 'дешево, працює харизма', f: function () { score += s.st.social / 12 + (target <= 2 ? 5 : 1); add(s, { health: -2 }); return debate(); } },
    { t: 'Реклама на ТБ і в мережах', sub: fmt(ad), dis: s.money < ad, f: function () { s.money -= ad; score += 9; return debate(); } },
    { t: 'Обіцяти всім усе', sub: 'зараз допоможе, потім розчарує', f: function () { score += 7; P.promises = (P.promises || 0) + 1; return debate(); } },
    { t: 'Компромат на суперника', sub: 'може вдарити по тобі', f: function () { if (chance(0.6)) score += 8; else { score -= 6; notes.push('Компромат виявився фейком — це обговорювали тиждень.'); } return debate(); } }
  ];
  if (c.law < 0.5) opts.push({ t: 'Підкупити виборців', sub: fmt(ad * 0.6) + ' · тут це «працює»', dis: s.money < ad * 0.6, f: function () { s.money -= ad * 0.6; score += 12; if (chance(c.law * 0.5)) { notes.push('Схему підкупу викрили журналісти.'); score -= 15; P.dirty = (P.dirty || 0) + 2; } return debate(); } });
  return { title: 'Вибори: ' + offs[target].toLowerCase(), text: (function () { var est = clamp(Math.round(50 + (base + 6 - OFFICE_BAR[target] - oppStr) * 1.3), 8, 85); return 'Суперник: ' + (oppStr > 4 ? 'сильний' : oppStr < -4 ? 'слабкий' : 'рівний тобі') + '. Опитування дають тобі ~' + est + '% (похибка ±7). '; })() + 'Ти йдеш як ' + partyName(P.party) + '. ' + (autocracy(s) ? (P.party === 'opp' ? 'Тут вибори контролює влада — опозиції майже нічого не світить.' : 'Тут вибори — формальність для правлячої партії.') : 'Як будуєш кампанію?'), opts: opts };
}

A({ id: 'politics', tab: 'work', n: 'Піти в політику', d: function (s) { return isCitizen(s) ? 'Партія, вибори, посади' + (s.birth !== s.country ? ' · главою держави може стати лише народжений тут' : '') : 'Потрібне громадянство цієї країни'; }, show: function (s) { return s.age >= 21 && !s.pol && !s.prison; },
  run: function (s) {
    if (!isCitizen(s)) return 'У ' + C(s).name + ' в політику можуть іти лише громадяни.';
    function join(p) { return function () { s.pol = { office: 0, party: p, approval: 50, terms: 0, nextElec: s.age + 1 }; mark(s, 'Політика: ' + partyName(p)); return 'Ти тепер ' + partyName(p) + '. Перші вибори — вже наступного року.'; }; }
    return { title: 'Політика', text: autocracy(s) ? 'У цій країні реальна влада — в однієї партії. Опозиціонерам тут небезпечно.' : 'З чого почати?', opts: [
      { t: 'Вступити в правлячу партію', sub: s.econ < 0 ? 'зараз криза — партію не люблять' : 'легше перемагати, поки економіка росте', f: join('rul') },
      { t: 'Вступити в опозицію', sub: autocracy(s) ? 'тут це ризик для свободи' : 'сильніша, коли влада помиляється', f: join('opp') },
      { t: 'Йти незалежним', sub: 'потрібні слава і харизма', f: join('ind') }] };
  } });
A({ id: 'campaign', tab: 'work', n: 'Балотуватися', d: function (s) { return 'Наступні вибори: ' + (s.pol.nextElec <= s.age ? 'цього року' : 'через ' + (s.pol.nextElec - s.age) + ' р.'); }, show: function (s) { return s.pol && !s.prison && s.pol.nextElec <= s.age && polTargets(s).length > 0; },
  run: function (s) { var offs = offices(s); return { title: 'Куди балотуватися?', text: 'Посада: ' + offs[s.pol.office].toLowerCase() + '. Рейтинг: ' + Math.round(s.pol.approval) + '%.', opts: polTargets(s).map(function (tg) { return { t: offs[tg], sub: tg >= 2 ? 'повна зайнятість — роботу доведеться залишити' : 'можна поєднувати з роботою', f: function () { return campaign(s, tg); } }; }) }; } });
A({ id: 'leavepol', tab: 'work', n: 'Піти з політики', ap: 0, d: function (s) { return s.pol ? offices(s)[s.pol.office] : ''; }, show: function (s) { return !!s.pol; },
  run: function (s) { var o = offices(s)[s.pol.office]; s.polPast = s.pol; s.pol = null; return 'Ти піш' + g(s, 'ов', 'ла') + ' з політики (' + o.toLowerCase() + ').'; } });

function polTick(s, out) {
  var P = s.pol; if (!P || s.prison) return;
  var offs = offices(s);
  if (P.office > 0) {
    P.approval = clamp(P.approval + (s.econ < 0 ? -6 : s.econ > 0 ? 3 : -1) - (P.promises ? 4 : 0) + rnd(-4, 4));
    s.fame = clamp(s.fame + P.office);
    if (P.term > 0) P.term--;
    if (P.term === 0) {
      var lim = P.office === 5 && P.terms >= 2 && !autocracy(s);
      if (lim) { mark(s, 'Заверши' + g(s, 'в', 'ла') + ' два терміни: ' + offs[5].toLowerCase()); say(s, 'Два терміни позаду — більше балотуватися не можна. Ти йдеш з посади як колишній ' + offs[5].toLowerCase() + '.', 'big'); s.polPast = P; s.pol = null; s.flags.exPres = 1; return; }
      out.push({ title: 'Кінець терміну', text: 'Термін на посаді «' + offs[P.office].toLowerCase() + '» закінчується. Рейтинг: ' + Math.round(P.approval) + '%. Можна переобратися або спробувати вище.', opts: polTargets(s).filter(function (tg) { return tg !== P.office; }).map(function (tg) {
          return { t: 'Балотуватися: ' + offs[tg].toLowerCase(), sub: 'якщо програєш — втратиш і теперішню посаду', f: function () { var keep = P.office; var r = campaign(s, tg); return r; } };
        }).concat([
        { t: 'Йти на переобрання', f: function () { return campaign(s, P.office === 4 ? 3 : P.office); } },
        { t: 'Піти з політики', f: function () { s.polPast = P; s.pol = null; return 'Ти не ста' + g(s, 'в', 'ла') + ' переобиратися.'; } }]) });
      return;
    }
  }
  // призначення міністром
  if (P.office === 3 && P.party === 'rul' && P.approval > 55 && chance(0.15)) {
    out.push({ title: 'Пропозиція посади', text: 'Тобі пропонують очолити міністерство.', opts: [
      { t: 'Погодитися', f: function () { P.office = 4; P.term = Math.max(P.term, 2); mark(s, 'Міністр'); s.fame = clamp(s.fame + 10); return 'Ти — міністр.'; } },
      { t: 'Лишитися в парламенті', f: function () { return 'Ти лишаєшся депутатом.'; } }] });
  }
  // в автократії главу держави не обирають — його висуває партійна верхівка
  if (autocracy(s) && P.office === 4 && P.party === 'rul' && P.approval > 65 && s.age >= 45 && chance(0.012)) { P.office = 5; P.term = 99; mark(s, offs[5]); s.fame = clamp(s.fame + 30); say(s, 'Партійна верхівка обрала тебе наступником. Ти — ' + offs[5].toLowerCase() + '.', 'big'); return; }
  if (P.office === 4 && P.approval < 30 && chance(0.4)) { P.office = 3; say(s, 'Тебе відправили у відставку з посади міністра.', 'bad'); }
  if (P.office === 5 && P.approval < 15 && !autocracy(s) && chance(0.3)) { say(s, 'Парламент оголосив тобі імпічмент.', 'big'); mark(s, 'Імпічмент'); s.polPast = P; s.pol = null; add(s, { happy: -20 }); return; }
}

// Події на посаді
ev('pol_bribe', [21, 90], 4, function (s) { return s.pol && s.pol.office >= 1; }, function (s) {
  var P = s.pol, amt = M(s) * [0, 1, 4, 8, 15, 40][P.office], law = C(s).law;
  return { text: 'Компанія пропонує ' + fmt(amt) + ' за «правильне» рішення щодо тендеру.' + (P.owed ? ' Це той самий спонсор із виборів — нагадує про борг.' : ''), opts: [
    { t: 'Взяти', sub: 'ризик скандалу й суду', f: function () { if (!s.pol) return 'Вже неактуально.'; s.shadow = (s.shadow || 0) + amt; P.dirty = (P.dirty || 0) + 1; P.owed = 0; if (chance(law * 0.35)) { P.approval -= 25; return court(s, 'хабарництво', 3, 8); } return 'Гроші на рахунку дружини двоюрідного брата. Поки що тихо.'; } },
    { t: 'Відмовити', sub: P.owed ? 'спонсор образиться' : '', f: function () { if (!s.pol) return 'Вже неактуально.'; if (P.owed) { P.owed = 0; P.approval -= 8; return 'Спонсор переметнувся до опонентів і профінансував критику проти тебе.'; } P.approval += 2; return 'Ти відмови' + g(s, 'вся', 'лася') + '.'; } },
    { t: 'Здати їх антикорупційним органам', sub: law > 0.6 ? 'тут це працює' : 'тут це небезпечно', f: function () { if (!s.pol) return 'Вже неактуально.'; if (chance(law)) { P.approval += 12; s.fame = clamp(s.fame + 8); return 'Гучна справа — тебе називають чесним політиком.'; } P.approval -= 5; if (chance(0.15)) { add(s, { health: -20 }); return 'Справу замʼяли, а тебе побили біля підʼїзду.'; } return 'Справу замʼяли.'; } }] };
});
ev('pol_policy', [21, 90], 5, function (s) { return s.pol && s.pol.office >= 2; }, function (s) {
  var P = s.pol, pool = [
    ['Бюджет тріщить. Підняти податки, урізати соцвиплати чи взяти кредит у МВФ?', [['Підняти податки', -8, 0.2], ['Урізати виплати', -12, 0.3], ['Новий кредит', 3, -0.2]]],
    ['Пенсіонери вимагають підвищення пенсій перед виборами.', [['Підняти пенсії', 10, -0.2], ['Пояснити, що грошей немає', -6, 0.1], ['Пообіцяти «згодом»', 3, 0]]],
    ['Велика компанія хоче будувати завод, але екологи проти.', [['Дозволити будівництво', 2, 0.25], ['Заборонити', 4, -0.1], ['Вимагати очисні споруди', -1, 0.1]]],
    ['Лікарі та вчителі вийшли на страйк.', [['Підняти зарплати', 6, -0.15], ['Перемовини', 1, 0], ['Ігнорувати', -9, 0.05]]]
  ], it = pick(pool);
  return { title: 'Рішення', text: it[0], opts: it[1].map(function (o) { return { t: o[0], sub: 'рейтинг ' + (o[1] >= 0 ? '+' : '') + o[1] + (P.office === 5 && o[2] ? ' · економіка ' + (o[2] > 0 ? 'згодом краще' : 'згодом гірше') : ''), f: function () { if (!s.pol) return 'Вже неактуально.'; P.approval = clamp(P.approval + o[1]); if (P.office === 5 && o[2]) { if (o[2] > 0 && chance(o[2] * 2)) { s.econ = 0.5; s.econT = 2; } if (o[2] < 0 && chance(-o[2] * 2)) { s.econ = -1; s.econT = 1; } } return 'Рішення ухвалено. Рейтинг: ' + Math.round(P.approval) + '%.'; } }; }) };
});
ev('pol_crisis', [21, 90], 3, function (s) { return s.pol && s.pol.office >= 2; }, function (s) {
  var P = s.pol, what = pick(['повінь у кількох районах', 'вибух на хімзаводі', 'масштабне відключення світла', 'спалах інфекції']);
  return { title: 'Криза', text: 'Сталося: ' + what + '. Журналісти чекають на твою реакцію.', opts: [
    { t: 'Особисто поїхати на місце', f: function () { if (!s.pol) return ''; P.approval += chance(0.7) ? 8 : -3; add(s, { health: -2 }); return 'Тебе бачили на місці подій. Люди оцінили.'; } },
    { t: 'Доручити профільним службам', f: function () { if (!s.pol) return ''; P.approval += rnd(-4, 4); return 'Служби впоралися — як змогли.'; } },
    { t: 'Звинуватити попередників', f: function () { if (!s.pol) return ''; P.approval += chance(0.4) ? 3 : -8; return 'Половина країни повірила, половина — ні.'; } }] };
});
ev('pol_scandal', [21, 90], 2, function (s) { return s.pol && s.pol.office >= 1 && (s.pol.dirty || 0) > 0; }, function (s) {
  var P = s.pol;
  return { title: 'Розслідування журналістів', text: 'Журналісти опублікували докази твоїх «сірих» оборудок.', opts: [
    { t: 'Подати до суду на журналістів', f: function () { if (!s.pol) return ''; if (C(s).law < 0.5 && chance(0.6)) { P.approval -= 3; return 'Свій суд став на твій бік. Скандал затих.'; } P.approval -= 15; return 'Суд програно — і тепер про це пишуть ще більше.'; } },
    { t: 'Вибачитися й повернути гроші', f: function () { if (!s.pol) return ''; P.approval -= 8; P.dirty = 0; s.money -= Math.min(s.money, M(s) * 2); return 'Ти вибачи' + g(s, 'вся', 'лася') + '. Частина виборців пробачила.'; } },
    { t: 'Піти у відставку', f: function () { if (!s.pol) return ''; s.polPast = P; s.pol = null; return 'Ти піш' + g(s, 'ов', 'ла') + ' з політики до того, як стало гірше.'; } }] };
});
ACHIEVEMENTS.push({ id: 'pres', n: 'Глава держави', d: 'Стати президентом або премʼєром', t: function (s) { return (s.pol && s.pol.office === 5) || (s.polPast && s.polPast.office === 5) || s.flags.exPres; } });
ACHIEVEMENTS.push({ id: 'mayor', n: 'Мер', d: 'Виграти вибори мера', t: function (s) { return s.tl.some(function (x) { return /^Мер/.test(x.t); }); } });

// ======================== ПАРТНЕР ========================
var P_TRAITS = ['турботлив', 'амбітн', 'ревнив', 'легковажн', 'спокійн', 'ощадлив', 'марнотратн', 'веселий'];
function ptrait(p) { var m = p.sex === 'm'; return p.trait.map(function (t) { return t === 'веселий' ? (m ? 'веселий' : 'весела') : t + (m ? 'ий' : 'а'); }).join(', '); }
function enrichPartner(p) { if (p.trait) return p; p.trait = wsample(P_TRAITS, 2, function () { return 1; }); p.wantKids = pick(['так', 'так', 'можливо', 'ні']); return p; }
ev('p_money', [18, 90], 3, function (s) { return s.partner && (s.debt > M(s) * 0.3 || (s.partner.trait && s.partner.trait.indexOf('марнотратн') >= 0)); }, function (s) {
  var p = enrichPartner(s.partner);
  return { text: 'Ви з ' + p.name + ' сваритеся через гроші: ' + (s.debt > M(s) * 0.3 ? 'борги тиснуть на обох.' : p.name + ' знову купи' + gp(p, 'в', 'ла') + ' щось дороге.'), opts: [
    { t: 'Завести спільний бюджет', f: function () { if (!s.partner) return ''; if (chance(0.6)) { p.rel += 8; return 'Таблиця витрат, чесні розмови — стало спокійніше.'; } p.rel -= 5; return 'Бюджет не прижився, сварки тривають.'; } },
    { t: 'Окремі рахунки', f: function () { if (!s.partner) return ''; p.rel -= 2; return 'Кожен сам за себе. Тихо, але трохи холодніше.'; } },
    { t: 'Посваритися як слід', f: function () { if (!s.partner) return ''; p.rel -= 12; add(s, { happy: -5 }); return 'Посварилися. Кілька днів не розмовляли.'; } }] };
});
ev('p_kids', [22, 42], 3, function (s) { var p = s.partner; return p && enrichPartner(p) && !s.kids.length && p.yrs >= 2 && p.wantKids !== 'можливо'; }, function (s) {
  var p = s.partner;
  return { text: p.wantKids === 'так' ? p.name + ' дуже хоче дітей і питає, коли ви будете готові.' : p.name + ' зізна' + gp(p, 'вся', 'лася') + ', що не хоче дітей. Взагалі.', opts: [
    { t: p.wantKids === 'так' ? 'Погодитися спробувати' : 'Прийняти це', f: function () { if (!s.partner) return ''; p.rel += 8; if (p.wantKids === 'так') s.flags.tryKids = 1; return 'Ви домовилися. Стало легше.'; } },
    { t: 'Запропонувати почекати', f: function () { if (!s.partner) return ''; p.rel -= 4; return 'Питання відклали. Але воно нікуди не зникло.'; } },
    { t: 'Сказати, що для тебе це принципово', f: function () { if (!s.partner) return ''; if (chance(0.4)) { p.wantKids = p.wantKids === 'так' ? 'ні' : 'так'; p.rel -= 3; return p.name + ' подума' + gp(p, 'в', 'ла') + ' і зміни' + gp(p, 'в', 'ла') + ' думку.'; } p.rel -= 20; return 'Розмова закінчилася сльозами. Під питанням майбутнє.'; } }] };
});
ev('p_abroad', [22, 55], 2, function (s) { return s.partner && s.partner.yrs >= 1 && s.age < 55; }, function (s) {
  var p = s.partner, d = pick(EMIGRATE_TO.filter(function (c) { return c !== s.country; }));
  return { text: p.name + ' отрима' + gp(p, 'в', 'ла') + ' пропозицію роботи в ' + COUNTRIES[d].name + ' ' + COUNTRIES[d].flag + '. Зарплата значно більша.', opts: [
    { t: 'Переїхати разом', f: function () { if (!s.partner) return ''; p.inc *= 1.8; p.rel += 10; return emigrate(s, d, 'переїзд за партнером'); } },
    { t: 'Стосунки на відстані', f: function () { if (!s.partner) return ''; p.inc *= 1.8; p.rel -= 15; p.far = 1; return 'Тепер ви бачитеся раз на кілька місяців.'; } },
    { t: 'Попросити відмовитися', f: function () { if (!s.partner) return ''; if (chance(0.6)) { p.rel -= 10; return p.name + ' лиши' + gp(p, 'вся', 'лася') + ', але це запамʼятає.'; } s.partner = null; s.exes++; add(s, { happy: -12 }); return p.name + ' поїха' + gp(p, 'в', 'ла') + ' сам' + gp(p, '', 'а') + '. Ви розійшлися.'; } }] };
});
ev('p_jobloss', [20, 65], 2, function (s) { return s.partner && !s.partner.jobless && s.partner.age < 64; }, function (s) {
  var p = s.partner; p.jobless = 1;
  return { text: p.name + ' втрати' + gp(p, 'в', 'ла') + ' роботу.', opts: [
    { t: 'Підтримати: «знайдеш, коли будеш готов' + gp(p, 'ий', 'а') + '»', f: function () { if (!s.partner) return ''; p.rel += 8; return 'Це було важливо для ' + p.name + '. Пошук затягнувся, але ви разом.'; } },
    { t: 'Допомогти з пошуком і резюме', f: function () { if (!s.partner) return ''; if (chance(0.6)) { p.jobless = 0; p.inc *= rnd(0.9, 1.2); return 'Через два місяці ' + p.name + ' знайш' + gp(p, 'ов', 'ла') + ' нову роботу.'; } return 'Поки нічого не знайшлося.'; } },
    { t: 'Дати зрозуміти, що треба швидше', f: function () { if (!s.partner) return ''; p.rel -= 10; if (chance(0.5)) p.jobless = 0; return 'Тиск подіяв — але осад лишився.'; } }] };
});
ev('p_newjob', [20, 65], 3, function (s) { return s.partner && s.partner.jobless; }, function (s) { var p = s.partner; p.jobless = 0; p.inc *= rnd(0.8, 1.3); return p.name + ' нарешті знайш' + gp(p, 'ов', 'ла') + ' роботу.'; });
ev('p_jealous', [18, 70], 3, function (s) { var p = s.partner; return p && enrichPartner(p) && p.trait.indexOf('ревнив') >= 0 && s.friends > 0; }, function (s) {
  var p = s.partner;
  return { text: p.name + ' ревнує до твоїх друзів і вимагає менше з ними бачитися.', opts: [
    { t: 'Поступитися', f: function () { if (!s.partner) return ''; s.friends = Math.max(0, s.friends - 1); p.rel += 5; s.sched.friends = Math.max(0, (s.sched.friends || 0) - 2); return 'Ти рідше бачишся з друзями. Вдома спокійніше.'; } },
    { t: 'Познайомити з друзями ближче', f: function () { if (!s.partner) return ''; if (chance(0.55)) { p.rel += 6; return 'Після спільного вечора ревнощі вщухли.'; } p.rel -= 6; return 'Вечір закінчився сваркою.'; } },
    { t: 'Поставити межу', f: function () { if (!s.partner) return ''; if (chance(0.5)) return 'Розмова була важкою, але межу почули.'; p.rel -= 14; return 'Межу не прийняли. Стосунки під загрозою.'; } }] };
});
ev('p_trip', [20, 85], 2, function (s) { return s.partner && s.money > M(s) * 0.2; }, function (s) {
  var p = s.partner, c2 = M(s) * 0.15;
  return { text: p.name + ' пропонує поїхати кудись удвох.', opts: [
    { t: 'Поїхати за кордон', sub: fmt(c2), f: function () { if (!s.partner) return ''; s.money -= c2; p.rel += 12; add(s, { happy: 8 }); s.stat.travels++; return 'Найкращий тиждень за довгий час.'; } },
    { t: 'Вихідні неподалік', sub: fmt(c2 * 0.2), f: function () { if (!s.partner) return ''; s.money -= c2 * 0.2; p.rel += 5; return 'Скромно, але тепло.'; } },
    { t: 'Зараз не час', f: function () { if (!s.partner) return ''; p.rel -= 4; return p.name + ' сумно кивну' + gp(p, 'в', 'ла') + '.'; } }] };
});

// ======================== ДІТИ ========================
var K_TALENT = [['music', 'музики'], ['sport', 'спорту'], ['art', 'малювання'], ['code', 'програмування'], ['smarts', 'точних наук']];
ev('k_talent', [24, 70], 4, function (s) { return s.kids.some(function (k) { return k.alive && k.age >= 5 && k.age <= 12 && !k.talent; }); }, function (s) {
  var k = s.kids.filter(function (x) { return x.alive && x.age >= 5 && x.age <= 12 && !x.talent; })[0], t = pick(K_TALENT), cost = M(s) * 0.08;
  k.talent = t[0];
  return { text: 'У ' + k.name + ' явний хист до ' + t[1] + '. Вчитель радить займатися серйозно.', opts: [
    { t: 'Оплачувати заняття', sub: '~' + fmt(cost) + ' на рік', f: function () { k.classes = 1; k.rel += 6; return k.name + ' тепер ходить на заняття. Очі горять.'; } },
    { t: 'Займатися самому з дитиною', sub: 'безкоштовно, але треба час', f: function () { k.rel += 10; s.sched.kids = Math.max(s.sched.kids || 0, 4); return 'Ви займаєтеся разом по вечорах.'; } },
    { t: 'Не зараз', f: function () { k.talent = k.talent + '_lost'; return 'Може, згодом.'; } }] };
});
ev('k_teen', [28, 75], 4, function (s) { return s.kids.some(function (k) { return k.alive && k.age >= 13 && k.age <= 17; }); }, function (s) {
  var k = pick(s.kids.filter(function (x) { return x.alive && x.age >= 13 && x.age <= 17; }));
  var it = pick([['повертається додому о третій ночі', 'Заборонити гуляти', 'Домовитися про години'], ['зависає з компанією, яка тобі не подобається', 'Заборонити ці зустрічі', 'Познайомитися з цими друзями'], ['хоче кинути школу і стати блогером', 'Категорично ні', 'Домовитися: спершу атестат'], ['закоха' + gp(k, 'вся', 'лася') + ' і забу' + gp(k, 'в', 'ла') + ' про навчання', 'Посадити за уроки', 'Поговорити по-дорослому']]);
  return { text: gp(k, 'Син', 'Донька') + ' ' + k.name + ' ' + it[0] + '.', opts: [
    { t: it[1], f: function () { k.rel -= 10; if (chance(0.4)) { k.rebel = 1; return k.name + ' грюкну' + gp(k, 'в', 'ла') + ' дверима. Тепер усе робить навпаки.'; } return 'Подіяло. Але стосунки похолоднішали.'; } },
    { t: it[2], f: function () { if (chance(0.5 + k.rel / 300)) { k.rel += 8; return 'Домовилися. ' + k.name + ' навіть подякува' + gp(k, 'в', 'ла') + '.'; } k.rel -= 3; return 'Домовленість протрималася тиждень.'; } },
    { t: 'Відпустити ситуацію', f: function () { if (chance(0.3)) { k.rebel = 1; return 'Без контролю стало гірше.'; } return 'Минуло саме собою.'; } }] };
});
ev('k_abroad', [40, 85], 2, function (s) { return s.kids.some(function (k) { return k.alive && k.age >= 18 && k.age <= 30 && !k.abroad; }); }, function (s) {
  var k = pick(s.kids.filter(function (x) { return x.alive && x.age >= 18 && x.age <= 30 && !x.abroad; })), d = pick(EMIGRATE_TO.filter(function (c) { return c !== s.country; }));
  return { text: k.name + ' хоче переїхати жити в ' + COUNTRIES[d].name + ' ' + COUNTRIES[d].flag + '.', opts: [
    { t: 'Підтримати й допомогти грошима', sub: fmt(M(s) * 0.3), f: function () { s.money -= M(s) * 0.3; k.abroad = d; k.rel += 10; return k.name + ' поїха' + gp(k, 'в', 'ла') + ' з твоїм благословенням. Дзвоните щонеділі.'; } },
    { t: 'Просто побажати успіху', f: function () { k.abroad = d; return k.name + ' поїха' + gp(k, 'в', 'ла') + '.'; } },
    { t: 'Відмовляти', f: function () { if (chance(0.4)) { k.rel -= 5; return k.name + ' лиши' + gp(k, 'вся', 'лася') + ' — але питання ще повернеться.'; } k.abroad = d; k.rel -= 15; return k.name + ' все одно поїха' + gp(k, 'в', 'ла') + '. Тепер ви рідко розмовляєте.'; } }] };
});
ev('k_wedding', [40, 90], 3, function (s) { return s.kids.some(function (k) { return k.alive && k.age >= 22 && !k.married; }); }, function (s) {
  var k = pick(s.kids.filter(function (x) { return x.alive && x.age >= 22 && !x.married; })), c2 = M(s) * 0.5;
  k.married = 1;
  return { text: k.name + ' одружується!', opts: [
    { t: 'Оплатити весілля', sub: fmt(c2), f: function () { s.money -= c2; k.rel += 12; add(s, { happy: 8 }); return 'Гучне весілля, на якому ти плака' + g(s, 'в', 'ла') + ' від щастя.'; } },
    { t: 'Подарувати скромну суму', sub: fmt(c2 * 0.2), f: function () { s.money -= c2 * 0.2; k.rel += 3; add(s, { happy: 5 }); return 'Скромне, але щире весілля.'; } },
    { t: 'Не подобається обранець', f: function () { k.rel -= 20; return 'Ти не прийш' + g(s, 'ов', 'ла') + ' на весілля. ' + k.name + ' цього не забуде.'; } }] };
});
ev('k_loan', [45, 90], 2, function (s) { return s.money > M(s) && s.kids.some(function (k) { return k.alive && k.age >= 22; }); }, function (s) {
  var k = pick(s.kids.filter(function (x) { return x.alive && x.age >= 22; })), a = M(s) * rnd(0.5, 2);
  return { text: k.name + ' просить ' + fmt(a) + ' — на перший внесок за житло.', opts: [
    { t: 'Дати', f: function () { s.money -= a; k.rel += 12; return 'Тепер у ' + k.name + ' своє житло.'; } },
    { t: 'Позичити, а не подарувати', f: function () { s.money -= a; k.rel += 3; if (chance(0.6)) { s.money += a; return k.name + ' поверну' + gp(k, 'в', 'ла') + ' борг за кілька років.'; } return 'Гроші так і не повернулися — але ви не сваритеся.'; } },
    { t: 'Відмовити', f: function () { k.rel -= 10; return 'Нехай вчиться сам' + gp(k, '', 'а') + '.'; } }] };
});
// Доросла дитина: карʼєра і допомога батькам
function kidsAdultTick(s) {
  s.kids.forEach(function (k) {
    if (!k.alive) return;
    if (k.classes) { s.money -= M(s) * 0.08; if (k.age >= 18) k.classes = 0; }
    if (k.age === 22 && !k.job) {
      var good = (k.uni ? 1.6 : 0.9) * (k.talent && k.talent.indexOf('_lost') < 0 ? (k.classes !== undefined ? 1.25 : 1.1) : 1) * (k.rebel ? 0.8 : 1) * rnd(0.6, 1.5);
      k.inc = M(s) * good; k.job = good > 1.7 ? pick(['інженер', 'лікар', 'програміст', 'юрист', 'менеджер']) : good > 1 ? pick(['вчитель', 'бухгалтер', 'медсестра', 'дизайнер', 'майстер']) : pick(['продавець', 'водій', 'офіціант', 'робітник', 'курʼєр']);
      if (k.talent === 'music' && k.uni && chance(0.1)) k.job = 'музикант';
      say(s, k.name + ' працює: ' + k.job + '.', '');
    }
    if (s.age >= 65 && k.age >= 25 && k.rel > 55 && s.lastInc < M(s) * 0.6 && chance(0.4)) { var help = (k.inc || M(s)) * 0.08; s.money += help; cashNote(s, 'Допомога від дітей', help); }
  });
}
