// ЖЕРЕБ — дії гравця (пісочниця). ap — скільки «часу» забирає дія (на рік 2–4 очки).
var TABS = [
  { id: 'me', n: 'Я' }, { id: 'hobby', n: 'Хобі' }, { id: 'edu', n: 'Освіта' }, { id: 'work', n: 'Робота' },
  { id: 'love', n: 'Люди' }, { id: 'money', n: 'Гроші' }, { id: 'biz', n: 'Бізнес' }, { id: 'move', n: 'Переїзд' }, { id: 'risk', n: 'Ризик' }
];
// Випадкові пропозиції року: генеруються один раз на рік, повторне відкриття їх не перекидає
function yearly(s, key, gen) { s.offers = s.offers || {}; var o = s.offers[key]; if (!o || o.age !== s.age) { o = { age: s.age, v: gen(), used: [] }; s.offers[key] = o; } return o; }
function wsample(arr, n, w) { var a = arr.slice(), out = []; while (a.length && out.length < n) { var x = wpick(a, w); out.push(x); a.splice(a.indexOf(x), 1); } return out; }
function A(o) { if (o.ap == null) o.ap = 1; ACTIONS.push(o); }
var ACTIONS = [];

// ---- Я ----
A({ id: 'sport', prisonOk: 1, tab: 'me', n: 'Спорт', d: 'Здоровʼя, навичка «Спорт»', show: function (s) { return s.age >= 5; },
  run: function (s) { var g2 = ri(4, 8); add(s, { sport: g2, happy: 2 }); s.st.health = clamp(s.st.health + ri(2, 5)); return 'Ти регулярно займа' + g(s, 'вся', 'лася') + ' спортом. Спорт +' + g2 + '.'; } });
A({ id: 'read', prisonOk: 1, tab: 'me', n: 'Читати', d: 'Розум, трохи письма', show: function (s) { return s.age >= 6 && !s.noSchoolRead; },
  run: function (s) { if (s.edu < 1 && !s.study && s.age > 10 && chance(0.6)) return 'Важко читати без школи — але ти потроху вчишся.'; add(s, { smarts: ri(2, 4), write: 1 }); return 'Кілька прочитаних книжок зробили тебе розумнішим.'; } });
A({ id: 'rest', prisonOk: 1, tab: 'me', n: 'Відпочити', d: 'Щастя', show: function (s) { return s.age >= 6; },
  run: function (s) { add(s, { happy: ri(5, 9), health: 1 }); return 'Ти да' + g(s, 'в', 'ла') + ' собі відпочити.'; } });
A({ id: 'doctor', tab: 'me', n: 'Медогляд', d: function (s) { return 'Виявити хвороби рано · ' + fmt(treatCost(s, 0.04)); }, show: function (s) { return s.age >= 18; },
  run: function (s) { s.money -= treatCost(s, 0.04); if (!s.flags.genKnown && Math.max(s.gen.heart, s.gen.cancer) > 1.25 && chance(.5)) s.flags.genKnown = s.gen.heart > s.gen.cancer ? 'heart' : 'cancer'; s.st.health = clamp(s.st.health + 2); if (s.flags.ill && !s.flags.illKnown) { s.flags.illKnown = true; return illnessPrompt(s); } return 'Обстеження пройшло добре.'; } });
A({ id: 'travel', tab: 'me', n: 'Подорож', d: function (s) { return 'Щастя, враження · ' + fmt(M(s) * 0.15 * [0.6, 1, 2.5][s.ls]); }, show: function (s) { return s.age >= 16 && s.money >= M(s) * 0.15 * [0.6, 1, 2.5][s.ls]; },
  run: function (s) {
    var cost = M(s) * 0.15 * [0.6, 1, 2.5][s.ls]; s.money -= cost; s.stat.travels++;
    var dest = pick(COUNTRY_LIST.filter(function (c) { return c.code !== s.country && c.conflict < 2; }));
    add(s, { happy: ri(8, 14), eng: 2, social: 2 });
    return 'Подорож до ' + genC(dest) + ' ' + dest.flag + ' — ' + pick(['незабутньо.', 'втомливо, але варто того.', 'ти поверну' + g(s, 'вся', 'лася') + ' іншою людиною.', 'дорого, але щасливо.']);
  } });
A({ id: 'volunteer', tab: 'me', n: 'Волонтерство', d: 'Щастя, харизма, друзі', show: function (s) { return s.age >= 12; },
  run: function (s) { add(s, { happy: 4, social: 3 }); if (chance(0.3)) s.friends++; return 'Ти допомага' + g(s, 'в', 'ла') + ' іншим. Це наповнює.'; } });
A({ id: 'habits', tab: 'me', n: 'Звички', ap: 0, d: function (s) { return ['фастфуд', 'звичайне харчування', 'здорове харчування'][s.diet] + ' · ' + (s.sleep ? 'висипаюся' : 'недосипаю'); }, show: function (s) { return s.age >= 14; },
  run: function (s) { return { title: 'Звички', text: 'Здорова їжа трохи дорожча, але береже серце. Недосип додає продуктивності на роботі, але бʼє по здоровʼю.', opts: [
    { t: 'Харчування: фастфуд', sub: 'дешевше, смачно, шкідливо', f: function () { s.diet = 0; return 'Ти їси що попало.'; } },
    { t: 'Харчування: звичайне', f: function () { s.diet = 1; return 'Звичайне харчування.'; } },
    { t: 'Харчування: здорове', sub: '+6% до витрат', f: function () { s.diet = 2; return 'Ти перейш' + g(s, 'ов', 'ла') + ' на здорове харчування.'; } },
    { t: s.sleep ? 'Спати менше, працювати більше' : 'Нормально висипатися', f: function () { s.sleep = s.sleep ? 0 : 1; return s.sleep ? 'Сон — святе.' : 'Тепер ти спиш по 5 годин.'; } }] }; } });
A({ id: 'therapy', tab: 'me', n: 'Психотерапія', d: function (s) { return 'Допомагає з пригніченим станом · ' + fmt(treatCost(s, 0.08)); }, show: function (s) { return s.age >= 14 && C(s).gdp > 3; },
  run: function (s) { s.money -= treatCost(s, 0.08); add(s, { happy: 6 }); if (s.flags.depr && chance(0.45)) { s.flags.depr = 0; s.lowYrs = 0; return 'Терапія допомогла: пригнічений стан відступив.'; } return s.flags.depr ? 'Терапія потроху допомагає. Варто продовжити.' : 'Розмови з психотерапевтом допомогли краще себе зрозуміти.'; } });
A({ id: 'smoke_quit', tab: 'me', n: 'Кинути курити', d: 'Складно, але продовжує життя', show: function (s) { return s.flags.smoker; },
  run: function (s) { if (chance(0.35)) { s.flags.smoker = false; add(s, { happy: 4 }); return 'Ти кину' + g(s, 'в', 'ла') + ' курити!'; } add(s, { happy: -3 }); return 'Цього разу зірва' + g(s, 'вся', 'лася') + '.'; } });
A({ id: 'drink_quit', tab: 'me', n: 'Зав’язати з алкоголем', d: 'Здоровʼя', show: function (s) { return s.flags.drink; },
  run: function (s) { if (chance(0.35)) { s.flags.drink = false; add(s, { happy: 3, health: 5 }); return 'Ти більше не пʼєш.'; } return 'Поки не вдалося.'; } });

// ---- Хобі (навички → професії) ----
var HOBBY_ACT = [
  ['music', 'Музика', 5, 'Гітара, вокал, бити'], ['art', 'Малювання', 5, 'Скетчі, ілюстрації, дизайн'], ['code', 'Програмування', 9, 'Скрипти, сайти, ігри'],
  ['write', 'Писати', 9, 'Розповіді, статті, блог'], ['cook', 'Готувати', 9, 'Від борщу до фʼюжну'], ['craft', 'Майструвати', 8, 'Ремонт, дерево, техніка'],
  ['eng', 'Англійська', 6, 'Відкриває світовий ринок'], ['biz', 'Торгівля й гроші', 12, 'Перепродаж, книжки про бізнес']
];
HOBBY_ACT.forEach(function (h) {
  A({ id: 'h_' + h[0], prisonOk: h[0] !== 'code' && h[0] !== 'cook', tab: 'hobby', n: h[1], skill: h[0], d: function (s) { return h[3]; },
    show: function (s) { return s.age >= h[2] && !(h[0] === 'eng' && s.sk.eng >= 100); },
    run: function (s) {
      if (h[0] === 'code' && s.q <= 2 && C(s).gdp < 10 && !s.flags.pc && s.age < 18 && !s.study) return 'Компʼютера немає — практикуватися нема на чому.';
      var talent = s.flags['tal_' + h[0]] ? 1.5 : 1;
      var v = s.sk[h[0]];
      var gain = (v < 30 ? ri(6, 10) : v < 60 ? ri(4, 7) : v < 85 ? ri(2, 4) : ri(1, 2)) * talent * (0.8 + s.st.smarts / 250);
      s.sk[h[0]] = clamp(v + gain); add(s, { happy: 2 });
      var nv = Math.round(s.sk[h[0]]);
      var unlock = '';
      if (v < 35 && nv >= 35 && s.age >= 14) unlock = ' Відкрито фриланс: «' + HOBBY[h[0]].free + '».';
      HOBBY[h[0]].jobs.forEach(function (id) { var j = JOB[id]; if (j.alt && j.alt[h[0]] && v < skillNeed(s, h[0], j.alt[h[0]]) && nv >= skillNeed(s, h[0], j.alt[h[0]])) unlock += ' Тепер можна без диплома пробувати: ' + j.n + '.'; });
      return h[1] + ': ' + nv + '/100.' + unlock;
    } });
});
A({ id: 'lang', prisonOk: 1, tab: 'hobby', n: 'Іноземна мова', d: function (s) { var k = Object.keys(s.lang).filter(function (l) { return s.lang[l] < 100 && s.lang[l] > 0; }); return k.length ? k.map(function (l) { return LANG_NAMES[l] + ' ' + Math.round(s.lang[l]); }).join(', ') : 'Польська, німецька, іспанська…'; }, show: function (s) { return s.age >= 8; },
  run: function (s) { return { title: 'Яку мову вчити?', text: 'Мова країни сильно впливає на шанс отримати візу і на зарплату після переїзду. Англійська — окремо, у хобі.', opts: LEARNABLE.filter(function (l) { return (s.lang[l] || 0) < 100; }).map(function (l) {
    return { t: LANG_NAMES[l], sub: 'зараз ' + Math.round(s.lang[l] || 0), f: function () { var v = s.lang[l] || 0; s.lang[l] = clamp(v + (v < 40 ? ri(7, 11) : v < 75 ? ri(5, 8) : ri(2, 4)) * (0.8 + s.st.smarts / 250)); return LANG_NAMES[l] + ': ' + Math.round(s.lang[l]) + '/100.'; } };
  }) }; } });
A({ id: 'freelance', tab: 'hobby', n: 'Фриланс за навичкою', d: 'Гроші й портфоліо, з навички 35+', show: function (s) { return s.age >= 14 && Object.keys(HOBBY).some(function (k) { return s.sk[k] >= 35; }); },
  run: function (s) {
    var opts = Object.keys(HOBBY).filter(function (k) { return s.sk[k] >= 35; }).map(function (k) {
      var pay = freelancePay(s, k), mk = hobbyMarket(s, k);
      return { t: HOBBY[k].free, sub: SKILL_NAMES[k] + ' ' + Math.round(s.sk[k]) + ' · ~' + fmt(pay) + '/рік · ринок ' + (mk > 1 ? 'сильний' : mk > 0.7 ? 'нормальний' : 'слабкий') + (HOBBY[k].g ? ' · англ. розширює ринок' : ''),
        f: function () { var earn = pay * rnd(0.6, 1.4); s.money += earn; s.port[k] = (s.port[k] || 0) + 1; s.sk[k] = clamp(s.sk[k] + 2); add(s, { happy: 1, fame: k === 'music' || k === 'art' || k === 'write' ? 2 : 0 });
          return 'Фриланс («' + HOBBY[k].free.toLowerCase() + '») приніс ' + fmt(earn) + '. Портфоліо: ' + s.port[k] + ' проєкт(ів).'; } };
    });
    return { title: 'Фриланс', text: 'Скільки платять, залежить від майстерності, ринку твоєї країни та портфоліо. Для онлайн-навичок англійська відкриває закордонних клієнтів.', opts: opts };
  } });
A({ id: 'blog', tab: 'hobby', n: 'Вести блог', d: 'Слава, харизма', show: function (s) { return s.age >= 12 && C(s).gdp > 2; },
  run: function (s) {
    var best = Math.max(s.sk.music, s.sk.art, s.sk.cook, s.sk.code, s.sk.write, s.sk.sport, s.st.social);
    var g2 = (best - 40) / 10 + rnd(-2, 5); if (chance(0.03 + best / 2000)) { g2 += 18; }
    s.fame = clamp(s.fame + g2); add(s, { social: 2 });
    return g2 > 15 ? 'Твоє відео стало вірусним! Слава ' + Math.round(s.fame) + '.' : 'Блог потроху росте. Слава ' + Math.round(s.fame) + '.';
  } });

// ---- Освіта ----
A({ id: 'study', tab: 'edu', n: 'Вчитися старанніше', d: 'Бал ↑, щастя трохи ↓', show: function (s) { return !!s.study; },
  run: function (s) { add(s, { happy: -2, smarts: 1 }); return 'Ти сиді' + g(s, 'в', 'ла') + ' над підручниками.'; } });
A({ id: 'skip', tab: 'edu', n: 'Прогулювати', d: 'Щастя ↑, бал ↓', show: function (s) { return !!s.study; },
  run: function (s) { add(s, { happy: 5, social: 2 }); return 'Пари можуть почекати.'; } });
A({ id: 'olymp', tab: 'edu', n: 'Готуватися до олімпіади', d: 'Розум; перемога допоможе при вступі', show: function (s) { return s.study && s.study.t === 'school' && s.age >= 10 && !s.flags.olymp; },
  run: function (s) { add(s, { smarts: 3, happy: -2 }); if (chance((s.st.smarts - 40) / 120)) { s.flags.olymp = 1; mark(s, 'Переможець олімпіади'); return 'Ти ' + g(s, 'переміг', 'перемогла') + ' на олімпіаді!'; } return 'Цього року без призу, але знань додалося.'; } });
A({ id: 'enroll_uni', tab: 'edu', n: 'Вступити до університету', d: 'Обрати спеціальність', show: function (s) { return !s.study && s.edu >= 3 && s.age >= 17 && s.age < 55; },
  run: function (s) { return { title: 'Спеціальність', text: 'Шанс вступу залежить від балу, розуму і профільних навичок.' + (s.job ? ' Працювати і вчитися — важко.' : ''), opts: uniOpts(s) }; } });
A({ id: 'enroll_master', tab: 'edu', n: 'Магістратура', d: 'Якщо маєш бакалавра', show: function (s) { return !s.study && s.edu === 5 && s.age < 50; },
  run: function (s) { var f = s.fields[s.fields.length - 1], p = admitChance(s, f, 'master'); if (chance(p)) { startStudy(s, 'master', f, 2); return 'Ти ' + g(s, 'вступив', 'вступила') + ' в магістратуру.'; } return 'У магістратуру не взяли.'; } });
A({ id: 'enroll_voc', tab: 'edu', n: 'Вступити до коледжу', d: 'Робоча професія', show: function (s) { return !s.study && s.edu >= 2 && s.age >= 16 && s.age < 50; },
  run: function (s) { return { title: 'Коледж', text: 'Обери напрям.', opts: vocOpts(s, s.edu >= 3 ? 2 : 3) }; } });
A({ id: 'course', tab: 'hobby', n: 'Платні курси', d: function (s) { return 'Навичка швидше, ніж самостійно · ' + fmt(M(s) * 0.1) + ' за рік навчання'; }, show: function (s) { return s.age >= 14 && C(s).gdp > 3; },
  run: function (s) { var cost = M(s) * 0.1; return { title: 'Який курс?', text: 'Цього року в твоєму місті набирають такі курси. Курс триває рік і дає приблизно стільки, скільки 4–5 годин самостійних занять щотижня. Коштує ' + fmt(cost) + '.', opts: yearly(s, 'course', function () { return wsample(Object.keys(HOBBY), 3, function () { return 1; }); }).v.map(function (k) { var v = s.sk[k]; return { t: SKILL_NAMES[k], sub: 'зараз ' + Math.round(v) + ' → ~' + Math.round(clamp(v + hobbyGain(s, v, 4.5))), dis: s.money < cost, f: function () { s.money -= cost; s.sk[k] = clamp(v + hobbyGain(s, v, 4.5) * rnd(0.8, 1.2)); return 'Курс завершено: ' + SKILL_NAMES[k] + ' ' + Math.round(s.sk[k]) + '.'; } }; }) }; } });
A({ id: 'langcourse', tab: 'hobby', n: 'Мовні курси', d: function (s) { return 'Будь-яка мова · ' + fmt(M(s) * 0.08) + ' за рік'; }, show: function (s) { return s.age >= 10; },
  run: function (s) { var cost = M(s) * 0.08; return { title: 'Мовні курси', text: 'Цього року доступні такі групи. Рік курсів ≈ 4 години самостійних занять щотижня. Коштує ' + fmt(cost) + '.', opts: yearly(s, 'lcourse', function () { return ['en'].concat(wsample(LEARNABLE.filter(function (l) { return langLevel(s, l) < 100; }), 2, function (l) { return ['pl', 'de', 'es', 'fr'].indexOf(l) >= 0 ? 2 : 1; })); }).v.filter(function (l) { return langLevel(s, l) < 100; }).map(function (l) { var v = langLevel(s, l); return { t: LANG_NAMES[l], sub: 'зараз ' + Math.round(v), dis: s.money < cost, f: function () { s.money -= cost; var nv = clamp(v + hobbyGain(s, v, 4) * rnd(0.8, 1.2)); if (l === 'en') s.sk.eng = nv; else s.lang[l] = nv; return LANG_NAMES[l] + ': ' + Math.round(nv) + '/100.'; } }; }) }; } });
A({ id: 'picklang', tab: 'hobby', n: 'Яку мову вчити самостійно', ap: 0, d: function (s) { return s.langTarget ? LANG_NAMES[s.langTarget] + ' — години став у «Розкладі»' : 'Обери мову, потім додай години в «Розкладі»'; }, show: function (s) { return s.age >= 8; },
  run: function (s) { return { title: 'Мова для самостійного вивчення', text: 'Англійська вчиться окремим рядком у розкладі.', opts: LEARNABLE.filter(function (l) { return (s.lang[l] || 0) < 100; }).map(function (l) { return { t: LANG_NAMES[l], sub: 'зараз ' + Math.round(s.lang[l] || 0), f: function () { s.langTarget = l; if (!s.sched.lang) s.sched.lang = 3; return 'Тепер ти вчиш: ' + LANG_NAMES[l].toLowerCase() + '.'; } }; }) }; } });
A({ id: 'pickfree', tab: 'hobby', n: 'Навичка для фрилансу', ap: 0, d: function (s) { return s.freeSkill ? HOBBY[s.freeSkill].free + ' — години став у «Розкладі»' : 'Відкривається з навички 35'; }, show: function (s) { return s.age >= 14 && Object.keys(HOBBY).some(function (k) { return s.sk[k] >= 35; }); },
  run: function (s) { return { title: 'Фриланс', text: 'Скільки платять, залежить від майстерності, ринку країни, англійської й портфоліо. Години на фриланс ставиш у «Розкладі».', opts: Object.keys(HOBBY).filter(function (k) { return s.sk[k] >= 35; }).map(function (k) { var mk = hobbyMarket(s, k); return { t: HOBBY[k].free, sub: SKILL_NAMES[k] + ' ' + Math.round(s.sk[k]) + ' · ~' + fmt(freelancePay(s, k) / 10) + ' за год/тиждень на рік · ринок ' + (mk > 1 ? 'сильний' : mk > 0.7 ? 'нормальний' : 'слабкий'), f: function () { s.freeSkill = k; if (!s.sched.free) s.sched.free = 5; return 'Фриланс: ' + HOBBY[k].free.toLowerCase() + '.'; } }; }) }; } });
A({ id: 'dropout', tab: 'edu', n: 'Кинути навчання', ap: 0, d: 'Без диплома', show: function (s) { return s.study && (s.study.t !== 'school' || s.age >= 15); },
  run: function (s) { var t = studyName(s.study); s.study = null; add(s, { happy: 3 }); mark(s, 'Кину' + g(s, 'в', 'ла') + ' навчання'); return 'Ти покину' + g(s, 'в', 'ла') + ' навчання (' + t.toLowerCase() + ').'; } });

// ---- Робота ----
function jobOptions(s, apps) {
  var all = JOBS.map(function (j) { return { j: j, c: jobCheck(s, j) }; }).filter(function (x) { return x.c.ok && !(s.job && s.job.id === x.j.id); });
  var off = yearly(s, 'job', function () {
    var n = s.urban ? 4 : 3;
    return wsample(all, n, function (x) { var j = x.j, w = j.comp * (j.edu <= 2 ? 2 : 1) * (j.vol ? 0.5 : 1);
      if (j.f && j.f.some(function (f) { return s.fields.indexOf(f) >= 0 || s.vfields.indexOf(f) >= 0; })) w *= 3;
      if (hobbyFor(j.id).some(function (k) { return s.sk[k] >= 40; })) w *= 2;
      if (yearsIn(s, j.id)) w *= 2; return w; }).map(function (x) { return x.j.id; });
  });
  var list = all.filter(function (x) { return off.v.indexOf(x.j.id) >= 0 && off.used.indexOf(x.j.id) < 0; });
  list.sort(function (a, b) { return jobBase(s, b.j) - jobBase(s, a.j); });
  var opts = list.map(function (x) {
    var j = x.j, p = offerChance(s, j);
    var pay = jobBase(s, j) * immFactor(s);
    if (j.vol) pay *= fameMult(s.fame);
    var ai = x.c.viaHobby ? altInfo(s, j) : null;
    return { t: j.n, sub: 'шанс ' + Math.round(p * 100) + '% · ~' + fmt(pay) + '/рік' + (ai ? ' · через хобі (' + (SKILL_NAMES[ai.k] || 'популярність') + ')' : '') + (j.vol ? ' · дохід залежить від слави' : ''),
      f: function () {
        if (chance(p)) { takeJob(s, j, !!s.study); add(s, { happy: 5 }); return 'Тебе взяли: ' + j.n + (s.job.part ? ' (неповний день, поки вчишся)' : '') + '!' + (ai ? ' Хобі стало професією.' : ''); }
        off.used.push(j.id); apps--; if (apps <= 0) return 'Відмова на посаду «' + j.n + '»: ' + whyNot(s, j) + '. На цей рік спроби вичерпано.';
        var nx = jobOptions(s, apps); nx.text = 'Відмова на «' + j.n + '»: ' + whyNot(s, j) + '. Залишилось спроб: ' + apps + '.'; return nx;
      } };
  });
  return { title: 'Вакансії цього року', text: 'Це те, що трапилося тобі цього року (у місті вакансій більше). До 3 заявок. Нові вакансії — наступного року. Безробіття в країні: ' + Math.round(C(s).unemp * 100) + '%.', opts: opts.length ? opts : [{ t: 'Цього року нічого підходящого', sub: 'підвищуй освіту чи навички або переїдь у місто', f: function () { return 'Підходящих вакансій не трапилося.'; } }] };
}
A({ id: 'findjob', tab: 'work', n: 'Шукати роботу', d: function (s) { return 'До 3 заявок' + (hasRecord(s) ? ' · судимість знижує шанси' : ''); }, show: function (s) { return s.age >= 16 && !s.retired && !(s.pol && s.pol.office >= 2); }, run: function (s) { var o = yearly(s, 'jobapps', function () { return 3; }); return jobOptions(s, o.v); } });
A({ id: 'teenjob', tab: 'work', n: 'Підробіток', d: 'Кишенькові гроші', show: function (s) { return s.age >= 13 && s.age < 18; },
  run: function (s) { var ok = TEEN_JOBS.filter(function (t) { return !t.need || Object.keys(t.need).every(function (k) { return skillVal(s, k) >= t.need[k]; }); }); var t = pick(ok); var e = M(s) * t.pay; s.money += e; add(s, { happy: -1, social: 1 }); return t.n + ' — зароби' + g(s, 'в', 'ла') + ' ' + fmt(e) + '.'; } });
A({ id: 'work', tab: 'work', n: 'Працювати на повну', d: 'Продуктивність ↑ (шанс підвищення), щастя ↓', show: function (s) { return s.job && !s.job.teen; },
  run: function (s) { add(s, { happy: -3, health: -1 }); return 'Ти виклада' + g(s, 'вся', 'лася') + ' на роботі по максимуму.'; } });
A({ id: 'raise', tab: 'work', n: 'Попросити підвищення', d: 'Залежить від продуктивності', show: function (s) { var j = s.job && JOB[s.job.id]; return j && j.max && s.job.lvl < j.max && s.job.lvlYrs >= 2; },
  run: function (s) { var j = JOB[s.job.id]; var p = clamp((s.job.perf - 60) / 60 + (s.st.social - 50) / 250, 0.03, 0.6); if (chance(p)) { s.job.lvl++; s.job.lvlYrs = 0; add(s, { happy: 6 }); return 'Підвищили! Тепер ти ' + lvName(j, s.job.lvl).toLowerCase() + '.'; } s.job.perf -= 5; add(s, { happy: -3 }); return 'Начальство сказало «поки ні».'; } });
A({ id: 'switchco', tab: 'work', n: 'Перейти в іншу компанію', d: 'Шанс на вищу зарплату або посаду', show: function (s) { var j = s.job && JOB[s.job.id]; return j && !j.vol && !s.job.teen && s.job.yrs >= 3; },
  run: function (s) { var j = JOB[s.job.id], p = clamp(0.3 + s.job.perf / 250 + s.st.social / 400 - (s.econ < 0 ? 0.15 : 0), 0.1, 0.8);
    if (!chance(p)) return 'Співбесіди в інших компаніях нічого не дали.';
    var up = j.max && s.job.lvl < j.max && chance(0.2); if (up) s.job.lvl++;
    s.job.bonus = Math.min(1.6, (s.job.bonus || 1) * rnd(1.03, 1.12)); s.job.yrs = 0; s.job.lvlYrs = 0; s.job.perf = 55; add(s, { happy: 4 });
    return 'Нова компанія' + (up ? ', нова посада: ' + lvName(j, s.job.lvl).toLowerCase() : '') + ' і зарплата на ' + Math.round((s.job.bonus - 1) * 100) + '% вища за ринкову.'; } });
A({ id: 'quit', tab: 'work', n: 'Звільнитися', ap: 0, d: function (s) { return s.job ? JOB[s.job.id] ? JOB[s.job.id].n : '' : ''; }, show: function (s) { return s.job && !s.job.teen; },
  run: function (s) { var n = JOB[s.job.id].n; endJob(s, 'звільнився'); add(s, { happy: 2 }); return 'Ти звільни' + g(s, 'вся', 'лася') + ' (' + n + ').'; } });
A({ id: 'retire', tab: 'work', n: 'Вийти на пенсію', ap: 0, d: function (s) { return '~' + fmt(pension(s)) + '/рік'; }, show: function (s) { return !s.retired && s.age >= C(s).retAge - 3; },
  run: function (s) { if (s.job) endJob(s, 'пенсія'); s.retired = true; mark(s, 'Пенсія'); add(s, { happy: 8 }); return 'Ти ' + g(s, 'вийшов', 'вийшла') + ' на пенсію.'; } });
A({ id: 'unretire', tab: 'work', n: 'Повернутися до роботи', ap: 0, d: 'Знову шукати роботу', show: function (s) { return s.retired && s.age < 80; }, run: function (s) { s.retired = false; return 'Пенсія — не для тебе. Знову в строю.'; } });

// ---- Люди ----
A({ id: 'parents', prisonOk: 1, tab: 'love', n: 'Час з батьками', d: 'Стосунки, щастя', show: function (s) { return s.parents.some(function (p) { return p.alive; }) && s.age >= 3; },
  run: function (s) { add(s, { happy: 3 }); var p = pick(s.parents.filter(function (x) { return x.alive; })); return 'Ти прові' + g(s, 'в', 'ла') + ' час із ' + (p.sex === 'f' ? 'мамою' : 'татом') + '.'; } });
A({ id: 'friends', prisonOk: 1, tab: 'love', n: 'Друзі', d: function (s) { return 'Друзів: ' + s.friends; }, show: function (s) { return s.age >= 4; },
  run: function (s) { add(s, { happy: 4, social: 2 }); if (s.friends < 8 && chance(0.25 + s.st.social / 200)) { s.friends++; return 'Зʼявився новий друг — ' + nameFrom(s.country, chance(.5) ? 'm' : 'f') + '. Друзів: ' + s.friends + '.'; } return s.friends ? 'Посиденьки з друзями.' : 'Поки не вдалося з кимось зблизитися.'; } });
A({ id: 'date', tab: 'love', n: 'Знайомства', d: 'Шукати пару', show: function (s) { return s.age >= 15 && !s.partner; }, run: function (s) { return datePrompt(s, 2); } });
function datePrompt(s, tries) {
  var p = newPartner(s);
  return { title: 'Знайомство', text: p.name + ', ' + p.age + ' р., ' + p.occ + '. Здається, між вами щось є.', opts: [
    { t: 'Запросити на побачення', sub: 'шанс залежить від харизми', f: function () { if (chance(0.3 + s.st.social / 150 + p.compat / 200 + s.fame / 300 + (s.age >= 18 ? (wealthQ(s) - 3) * 0.03 : 0) - (s.stress > 60 ? 0.1 : 0))) { s.partner = p; add(s, { happy: 10 }); if (!s.flags.firstRel) { s.flags.firstRel = 1; mark(s, 'Перші стосунки: ' + p.name); } return 'Ви з ' + p.name + ' почали зустрічатися.'; } add(s, { happy: -4 }); return p.name + ' відмови' + gp(p, 'в', 'ла') + '.'; } },
    tries > 0 ? { t: 'Шукати далі', f: function () { return datePrompt(s, tries - 1); } } : { t: 'Не зараз', f: function () { return 'Може, наступного року.'; } }
  ] };
}
A({ id: 'partner', tab: 'love', n: 'Час з партнером', d: function (s) { return s.partner ? s.partner.name + ' · стосунки ' + Math.round(s.partner.rel) : ''; }, show: function (s) { return !!s.partner; },
  run: function (s) { add(s, { happy: 4 }); return 'Ви з ' + s.partner.name + ' провели гарний час разом.'; } });
A({ id: 'propose', tab: 'love', n: 'Запропонувати шлюб', d: 'Після року стосунків', show: function (s) { return s.partner && !s.partner.married && s.partner.yrs >= 1 && s.age >= 18; },
  run: function (s) { var p = s.partner; if (chance(clamp((p.rel - 30) / 50, 0.05, 0.95))) { p.married = true; s.marriages++; var cost = M(s) * 0.3 * [0.5, 1, 3][s.ls]; s.money -= cost; add(s, { happy: 15 }); mark(s, 'Весілля з ' + p.name); return p.name + ' сказа' + gp(p, 'в', 'ла') + ' «так»! Весілля коштувало ' + fmt(cost) + '.'; } p.rel -= 10; add(s, { happy: -8 }); return p.name + ' поки не готов' + gp(p, 'ий', 'а') + '.'; } });
A({ id: 'baby', tab: 'love', n: 'Завести дитину', d: function (s) { return fertility(s) ? 'Шанс ~' + Math.round(fertility(s) * 100) + '% за рік' : 'Усиновлення'; }, show: function (s) { return s.partner && s.age >= 18 && s.age < 55 && s.partner.rel > 40; },
  run: function (s) {
    var adopt = !fertility(s), pk = s.partner && s.partner.wantKids === 'ні' && !s.flags.tryKids ? 0.3 : 1;
    if (adopt ? chance(0.4 * pk) : chance(fertility(s) * pk)) {
      var sx = chance(0.51) ? 'm' : 'f'; var k = { name: nameFrom(s.country, sx), sex: sx, age: 0, alive: true, rel: 80 };
      s.kids.push(k); add(s, { happy: 12 }); mark(s, (s.kids.length === 1 ? 'Перша дитина: ' : 'Дитина: ') + k.name);
      return (adopt ? 'Ви усиновили ' : 'У вас ' + (sx === 'm' ? 'народився син' : 'народилася донька') + ' — ') + k.name + '!';
    }
    return adopt ? 'Процедура усиновлення затягнулася.' : 'Цього року не вийшло.';
  } });
A({ id: 'kids', tab: 'love', n: 'Час з дітьми', d: 'Стосунки з дітьми', show: function (s) { return s.kids.some(function (k) { return k.alive; }); },
  run: function (s) { add(s, { happy: 5 }); return 'Ти прові' + g(s, 'в', 'ла') + ' час із дітьми.'; } });
A({ id: 'breakup', tab: 'love', n: 'Розійтися', ap: 0, d: function (s) { return s.partner ? s.partner.name : ''; }, show: function (s) { return !!s.partner; },
  run: function (s) { var p = s.partner; s.partner = null; s.exes++; if (p.married) { var l = Math.max(0, s.money) * 0.35; s.money -= l; mark(s, 'Розлучення'); add(s, { happy: -8 }); return 'Ви з ' + p.name + ' розлучилися. Поділ майна: −' + fmt(l) + '.'; } add(s, { happy: -5 }); return 'Ви з ' + p.name + ' розійшлися.'; } });
A({ id: 'moveout', tab: 'love', n: 'Зʼїхати від батьків', ap: 0, d: 'Свобода, але оренда й побут за твій рахунок', show: function (s) { return s.withParents && s.age >= 16; },
  run: function (s) { s.withParents = false; add(s, { happy: 6 }); mark(s, 'Самостійне життя'); return 'Ти тепер живеш окремо.'; } });
A({ id: 'moveback', tab: 'love', n: 'Повернутися до батьків', ap: 0, d: 'Економія', show: function (s) { return !s.withParents && !s.home && s.parents.some(function (p) { return p.alive; }) && s.age < 45 && !s.partner; },
  run: function (s) { s.withParents = true; add(s, { happy: -5 }); return 'Ти знову живеш з батьками.'; } });

// ---- Гроші ----
function investPrompt(s) {
  var o = [];
  [['dep', 'Депозит', 'надійно, ~1–2% понад інфляцію'], ['stk', 'Індексний фонд акцій', 'в середньому ~5%, але бувають мінуси'], ['cry', 'Криптовалюта', 'може ×5, може −90%']].forEach(function (x) {
    var k = x[0];
    if (s.money > 50) o.push({ t: x[1] + ': вкласти 50% готівки', sub: x[2] + ' · зараз ' + fmt(s.inv[k]), f: function () { var a = s.money * 0.5; s.money -= a; s.inv[k] += a; return 'Вкладено ' + fmt(a) + ' (' + x[1].toLowerCase() + ').'; } });
    if (s.inv[k] > 1) o.push({ t: x[1] + ': забрати все', sub: fmt(s.inv[k]), f: function () { var a = s.inv[k]; s.inv[k] = 0; s.money += a; return 'Виведено ' + fmt(a) + '.'; } });
  });
  if (s.debt > 0 && s.money > 0) o.push({ t: 'Погасити борг', sub: 'борг ' + fmt(s.debt), f: function () { var a = Math.min(s.debt, s.money); s.debt -= a; s.money -= a; return 'Погашено ' + fmt(a) + ' боргу.'; } });
  if (!o.length) o.push({ t: 'Немає вільних грошей', f: function () { return 'Спершу треба заробити.'; } });
  return { title: 'Інвестиції', text: 'Готівка: ' + fmt(s.money) + '. Інфляцію вже враховано: усі суми в «сьогоднішніх» доларах.', opts: o };
}
A({ id: 'invest', tab: 'money', n: 'Інвестиції', ap: 0, d: 'Депозит, акції, крипта', show: function (s) { return s.age >= 16; }, run: investPrompt });
A({ id: 'home', tab: 'money', n: 'Купити житло', ap: 0, d: function (s) { return 'Квартира ~' + fmt(M(s) * C(s).house) + ' (' + C(s).house + ' річних медіанних доходів)'; }, show: function (s) { return s.age >= 18 && !s.home; },
  run: function (s) {
    var o = [['Квартира', 1], ['Будинок', 1.8]].map(function (h) {
      var cost = M(s) * C(s).house * h[1], down = cost * 0.2;
      return { t: h[0] + ' — ' + fmt(cost), sub: s.money >= cost ? 'одразу' : s.money >= down && s.lastInc > 0 && canBorrow(s) ? 'іпотека: перший внесок ' + fmt(down) : !canBorrow(s) ? 'банк не дає іпотеку (рейтинг ' + Math.round(s.credit) + ')' : 'не вистачає грошей', dis: !(s.money >= cost || (s.money >= down && s.lastInc > 0 && canBorrow(s))),
        f: function () { if (s.money >= cost) s.money -= cost; else { s.money -= down; addDebt(s, cost - down, 'іпотека'); } s.home = { kind: h[0], val: cost }; s.withParents = false; mark(s, 'Власне житло'); add(s, { happy: 10 }); return 'У тебе тепер власн' + (h[0] === 'Квартира' ? 'а квартира' : 'ий будинок') + '!'; } };
    });
    return { title: 'Житло', text: 'Власне житло — без оренди. Ціни в країні: ' + C(s).name + '.', opts: o };
  } });
A({ id: 'sellhome', tab: 'money', n: 'Продати житло', ap: 0, d: function (s) { return s.home ? fmt(s.home.val) : ''; }, show: function (s) { return !!s.home; },
  run: function (s) { var v = s.home.val; s.money += v; s.home = null; s.own.homeLvl = 0; return 'Житло продано за ' + fmt(v) + '.'; } });
A({ id: 'lifestyle', tab: 'money', n: 'Стиль життя', ap: 0, d: function (s) { return ['Скромний', 'Звичайний', 'Розкішний'][s.ls]; }, show: function (s) { return s.age >= 16; },
  run: function (s) { return { title: 'Стиль життя', text: 'Більше витрат — більше щастя, але менше заощаджень.', opts: [['Скромний', 0], ['Звичайний', 1], ['Розкішний', 2]].map(function (x) { return { t: x[0], sub: 'витрати ×' + [0.7, 1, 1.9][x[1]], f: function () { s.ls = x[1]; return 'Стиль життя: ' + x[0].toLowerCase() + '.'; } }; }) }; } });

// ---- Бізнес ----
A({ id: 'openbiz', tab: 'biz', n: 'Відкрити бізнес', d: 'Видно ризик і твою підготовку', show: function (s) { return s.age >= 18; },
  run: function (s) {
    var off = yearly(s, 'biz', function () {
      var ok = BIZ.filter(function (T) { return !bizCan(s, T); });
      return wsample(ok, 3, function (T) { return (T.rel.jobs.some(function (id) { return yearsIn(s, id); }) ? 3 : 1) * (s.sk[T.rel.skill] >= 40 ? 2 : 1) * (T.startup ? 0.5 : 1); })
        .map(function (T) { return { id: T.id, pm: rnd(0.75, 1.3), loc: pick([-0.04, -0.02, 0, 0, 0.02, 0.04]) }; });
    });
    var LOC = { '-0.04': 'погане місце', '-0.02': 'так собі місце', '0': 'звичайне місце', '0.02': 'добре місце', '0.04': 'чудове місце' };
    var opts = off.v.filter(function (x) { return off.used.indexOf(x.id) < 0; }).map(function (x) {
      var T = BIZM[x.id], cost = bizCost(s, T.id) * x.pm, sv = bizSurvival(s, T.id), can = s.money >= cost || (s.money >= cost * 0.3 && canBorrow(s));
      return { t: T.n + ' — ' + fmt(cost), sub: LOC[String(x.loc)] + (x.pm < 0.9 ? ', вигідна ціна' : x.pm > 1.15 ? ', дорого' : '') + ' · підготовка: ' + bizReadyLabel(sv.q) + ' · протриматися 3 роки ~' + Math.round(clamp(sv.p + x.loc * 3, 0.02, 0.99) * 100) + '%' + (s.money < cost ? (can ? ' · решта в кредит' : canBorrow(s) ? ' · треба мати 30%' : ' · банк не дає кредит') : ''), dis: !can,
        f: function () { off.used.push(x.id); return openBiz(s, T.id, x.pm, x.loc); } };
    });
    if (!opts.length) opts = [{ t: 'Цього року нічого не трапилося', sub: 'нові можливості — наступного року', f: function () { return 'Можливостей для бізнесу цього року не знайшлося.'; } }];
    return { title: 'Можливості для бізнесу цього року', text: 'Це те, що тобі трапилося цього року. Успіх залежить від розуму, досвіду в галузі, профільного хобі, навички підприємництва й того, чи ти працюєш у бізнесі сам. Готівка: ' + fmt(s.money) + '. Кредитний рейтинг: ' + Math.round(s.credit) + '. Власна практика відкривається після досвіду в професії.', opts: opts };
  } });
A({ id: 'bizmanage', tab: 'biz', n: 'Керувати бізнесом', ap: 0, d: function (s) { return s.biz.map(function (b) { return b.name; }).join(', '); }, show: function (s) { return s.biz.length > 0; },
  run: function (s) { return { title: 'Мої бізнеси', text: 'Обери бізнес.', opts: s.biz.map(function (b) { return { t: b.name, sub: 'рік ' + b.yrs + ' · ' + (b.last >= 0 ? '+' : '') + fmt(b.last) + ' · каса ' + fmt(b.cash) + ' · вартість ~' + fmt(bizValue(s, b)), f: function () { return bizMenu(s, b); } }; }) }; } });

// ---- Переїзд ----
A({ id: 'tocity', tab: 'move', n: 'Переїхати в місто', d: 'Більше роботи, дорожче життя', show: function (s) { return !s.urban && s.age >= 16; },
  run: function (s) { s.urban = true; s.withParents = false; if (s.job && JOB[s.job.id] && JOB[s.job.id].id === 'farmer') endJob(s, 'переїзд'); add(s, { happy: -3 }); s.friends = Math.floor(s.friends / 2); mark(s, 'Переїзд у місто'); return 'Ти ' + g(s, 'переїхав', 'переїхала') + ' до міста.'; } });
A({ id: 'tovillage', tab: 'move', n: 'Переїхати в село', d: 'Спокій і дешевше', show: function (s) { return s.urban && s.age >= 30; },
  run: function (s) { s.urban = false; if (s.job && JOB[s.job.id].urban) endJob(s, 'переїзд'); add(s, { happy: 3 }); return 'Ти перебра' + g(s, 'вся', 'лася') + ' за місто.'; } });
function emigrate(s, code, how) {
  var from = C(s);
  s.status = statusAfterMove(s, code, how); s.prAsked = 0; s.natAsked = 0;
  if (s.pol) { s.polPast = s.pol; s.pol = null; }
  s.country = code; s.immigrant = code !== s.birth; s.immYrs = 0;
  if (s.countries.indexOf(code) < 0) s.countries.push(code);
  if (s.job) endJob(s, 'еміграція');
  s.biz.slice().forEach(function (b) { closeBiz(s, b, 'продано через переїзд', bizValue(s, b) * 0.6); });
  s.friends = Math.floor(s.friends * 0.3); s.withParents = false; s.urban = true;
  if (s.home) { s.money += s.home.val; s.home = null; } if (s.mort) { s.money -= s.mort.left; s.mort = null; } s.house = null;
  s.own.homeLvl = 0; if (s.own.car && s.own.car !== 'bike') { s.money += s.own.carVal * 0.8; s.own.car = null; s.own.carVal = 0; }
  if (s.partner && !s.partner.married) { s.partner = null; s.exes++; }
  add(s, { happy: -6 });
  mark(s, 'Переїзд: ' + from.name + ' → ' + COUNTRIES[code].name);
  return 'Ти ' + g(s, 'переїхав', 'переїхала') + ' до ' + genC(COUNTRIES[code]) + ' ' + COUNTRIES[code].flag + ' (' + how + '). Статус: ' + STATUS_N[resStatus(s)] + '.' + (resStatus(s) === 'illegal' ? ' Офіційно працювати не можна.' : ' Нова мова, нові правила, нове життя.');
}
A({ id: 'emigrate', tab: 'move', n: 'Емігрувати', d: 'Робоча віза, навчання, біженство, лотерея', show: function (s) { return s.age >= 17; },
  run: function (s) {
    var o = [];
    EMIGRATE_TO.filter(function (c) { return c !== s.country && (s.banned || []).indexOf(c) < 0; }).forEach(function (code) {
      var d = COUNTRIES[code], open = OPENNESS[code] || 0.3, cost = d.median * 0.08;
      var lang = workLang(s, code);
      var work = s.edu >= 4 && s.age <= 50 ? (hasRecord(s) ? 0.3 : 1) * clamp(open * 0.55 * (0.15 + lang) * (s.edu >= 5 ? 1.2 : 0.7) * (1 + Math.min(10, yearsWorked(s)) / 12) * (s.job && JOB[s.job.id] && JOB[s.job.id].g ? 1.4 : 1), 0.02, 0.8) : 0;
      var studyP = s.age <= 30 && s.edu >= 3 && code !== 'SA' ? clamp(open * 0.8 * (s.gpa / 100) * (0.3 + lang), 0.02, 0.8) : 0;
      var ref = cf(s) === 2 && ['PL', 'DE', 'CA', 'SE', 'FR', 'ES', 'IT', 'GB'].indexOf(code) >= 0 ? (['PL', 'DE'].indexOf(code) >= 0 ? 0.85 : 0.5) : 0;
      if (work) o.push({ t: d.flag + ' ' + d.name + ' — робоча віза', sub: 'шанс ' + Math.round(work * 100) + '% · мова: ' + LANG_NAMES[d.lang] + ' ' + Math.round(langLevel(s, d.lang)) + (d.engOk && d.lang !== 'en' ? ' (вистачить і англійської)' : '') + ' · медіана ' + fmt(d.median), dis: s.money < cost,
        f: function () { s.money -= cost; if (chance(work)) return emigrate(s, code, 'робоча віза'); return 'Візу до ' + genC(d) + ' не дали.'; } });
      if (studyP) { var fee = d.fee * d.median * 1.5 + d.median * 0.3; o.push({ t: d.flag + ' ' + d.name + ' — навчання', sub: 'шанс ' + Math.round(studyP * 100) + '% · перший рік ~' + fmt(fee), dis: s.money < fee,
        f: function () { if (!chance(studyP)) return 'Університет ' + inC(d) + ' відмовив.'; s.money -= fee; var r = emigrate(s, code, 'студентська віза'); return { title: 'Спеціальність', text: r + ' Обери, що вивчати.', opts: uniOpts(s) }; } }); }
      if (ref) o.push({ t: d.flag + ' ' + d.name + ' — як біженець', sub: 'шанс ' + Math.round(ref * 100) + '% · через війну вдома', f: function () { if (chance(ref)) return emigrate(s, code, 'тимчасовий захист'); return 'Виїхати не вдалося.'; } });
      if (code === 'US' && !s.used.dv) o.push({ t: '🇺🇸 Лотерея грін-карт', sub: 'шанс ~1%, безкоштовно', f: function () { s.used.dv = 1; if (chance(0.012) && s.edu >= 3) return emigrate(s, 'US', 'виграш у лотерею грін-карт'); return 'У лотерею цього року не пощастило.'; } });
    });
    var curGdp = C(s).gdp;
    COUNTRY_LIST.filter(function (d) { return d.code !== s.country && (s.banned || []).indexOf(d.code) < 0 && EMIGRATE_TO.indexOf(d.code) < 0 && (d.gdp <= curGdp * 1.3 || d.law < 0.5); }).sort(function (a, b) { return a.name.localeCompare(b.name, 'uk'); }).forEach(function (d) {
      var cost = Math.max(M(s), d.median) * 0.05;
      o.push({ t: d.flag + ' ' + d.name + ' — просто переїхати', sub: 'шанс ~85% · ' + fmt(cost) + ' · закон: ' + (d.law > 0.75 ? 'суворий' : d.law > 0.5 ? 'працює' : 'слабкий') + (NARCO.indexOf(d.code) >= 0 ? ' · тут діють картелі' : '') + (d.conflict === 2 ? ' · війна' : ''), dis: s.money < cost,
        f: function () { s.money -= cost; if (chance(0.85)) return emigrate(s, d.code, 'переїзд'); return 'На кордоні щось пішло не так — довелося повернутися.'; } });
    });
    var off = yearly(s, 'emig', function () { return wsample(o, 4, function (x) { return /біженець/.test(x.t) ? 5 : /просто переїхати/.test(x.t) ? 0.5 : /Лотерея/.test(x.t) ? 0.7 : 1; }).map(function (x) { return x.t; }); });
    o = o.filter(function (x) { return off.v.indexOf(x.t) >= 0; });
    (s.citizen || []).filter(function (x) { return x !== s.country && x !== s.birth; }).forEach(function (x) { o.unshift({ t: COUNTRIES[x].flag + ' Переїхати до ' + genC(COUNTRIES[x]), sub: 'ти громадянин — без віз', f: function () { return emigrate(s, x, 'повернення'); } }); });
    if (s.immigrant && isCitizen(s, s.birth)) o.unshift({ t: COUNTRIES[s.birth].flag + ' Повернутися додому', sub: COUNTRIES[s.birth].name, f: function () { return emigrate(s, s.birth, 'повернення'); } });
    return { title: 'Шанси на переїзд цього року', text: 'Тобі трапилися такі варіанти; інші можуть зʼявитися наступного року. Шанс залежить від освіти, мови країни, досвіду й відкритості. Після переїзду платять менше, поки не вивчиш мову і не адаптуєшся; мова підтягується сама, якщо живеш там.', opts: o.length ? o : [{ t: 'Немає варіантів', sub: 'потрібна освіта від коледжу або вік до 30 для навчання', f: function () { return 'Поки варіантів немає.'; } }] };
  } });
function yearsWorked(s) { return s.workYears; }

function availableActions(s, tab) {
  return ACTIONS.filter(function (a) { return a.tab === tab && !a.hidden && s.alive && (!s.prison || a.prisonOk) && a.show(s); });
}
function doAction(s, a) {
  if (a.ap > 0 && s.used[a.id]) return null;   // ap > 0: можна раз на рік
  if (a.ap > 0) s.used[a.id] = 1;
  var r = a.run(s); normMoney(s); return r;
}

// ---- Ризик (тіньові заробітки) ----
// «Розшук» (heat): кожна вдала справа підвищує шанс, що спіймають наступного разу. Спадає з роками.
function crimeCaught(s, base) { var p = (base + (s.heat || 0) * 0.07) * (0.4 + C(s).law) * (cartel(s) ? 0.4 : 1); s.heat = (s.heat || 0) + 1; return chance(clamp(p, 0, 0.95)); }
function confiscate(s) { var l = s.money * 0.8 + s.inv.cry * 0.8 + s.inv.stk * 0.5; s.money *= 0.2; s.inv.cry *= 0.2; s.inv.stk *= 0.5; return l; }
function busted(s, yrs, what) { var l = confiscate(s); var r = sentence(s, yrs, what); s.heat = 0; return r + (l > 1 ? ' Конфісковано ' + fmt(l) + '.' : ''); }
A({ id: 'shadow', hidden: 1, tab: 'risk', n: 'Робота «в конверті»', d: 'Без податків; невеликий ризик штрафу', show: function (s) { return s.age >= 16; },
  run: function (s) { var e = M(s) * rnd(0.1, 0.2); if (chance(0.06 * (0.4 + C(s).law))) { var f = e * 2; s.money -= f; return 'Податкова помітила неоформлений заробіток — штраф ' + fmt(f) + '.'; } s.shadow = (s.shadow || 0) + e; s.lastShadow = s.age; return 'Цього року ти отримаєш ' + fmt(e) + ' без податків.'; } });
// Невеликі сцени замість «вкрав — або спіймали, або ні»
function riskP(s, base) { var p = (base + (s.heat || 0) * 0.06) * (0.4 + C(s).law) * (cartel(s) ? 0.4 : 1); s.heat = (s.heat || 0) + 1; return clamp(p, 0.01, 0.95); }
// Суд: кілька шляхів, і жоден не гарантований
function court(s, what, y1, y2) {
  var yrs = ri(y1, y2), c = C(s), law = c.law, lawyer = M(s) * (0.3 + y2 * 0.15), bribe = M(s) * (0.5 + y2 * 0.3) * (cartel(s) ? 0.5 : 1);
  if (s.age < 18) { s.flags.juvenile = 1; s.heat = 0; add(s, { happy: -8 }); s.parents.forEach(function (p) { p.rel -= 15; }); return 'Тебе затримали. Ювенальний облік, розмова з інспектором і дуже важка розмова з батьками.'; }
  return { title: 'Суд', text: 'Справа: ' + what + '. Прокурор вимагає ' + yrs + ' р.', opts: [
    { t: 'Визнати провину', sub: 'менший строк', f: function () { var y = Math.round(yrs * 0.5); if (y < 1) { s.record++; s.recordAge = s.age; s.money -= M(s) * 0.15; s.heat = 0; return 'Умовний строк і штраф ' + fmt(M(s) * 0.15) + '. Судимість залишиться.'; } return busted(s, y, what); } },
    { t: 'Найняти адвоката', sub: fmt(lawyer) + ' · шанс виправдання ~' + Math.round(clamp(0.25 + (1 - law) * 0.25, 0.1, 0.6) * 100) + '%', dis: s.money < lawyer, f: function () { s.money -= lawyer; if (chance(clamp(0.25 + (1 - law) * 0.25, 0.1, 0.6))) { s.heat = 0; return 'Адвокат розвалив справу. Виправдано.'; } return busted(s, yrs, what); } },
    { t: 'Дати хабар судді', sub: fmt(bribe) + (law > 0.7 ? ' · тут за це додадуть строк' : ' · тут це працює частіше'), dis: s.money < bribe, f: function () { s.money -= bribe; if (chance(clamp(1.05 - law * 1.2 + (cartel(s) ? 0.2 : 0), 0.03, 0.9))) { s.heat = 0; return 'Справу закрили «через брак доказів».'; } return busted(s, yrs + 2, what + ' і спробу підкупу'); } },
    { t: 'Мовчати й чекати', sub: 'якщо доказів мало — можуть відпустити', f: function () { if (chance(0.15 + (1 - law) * 0.25)) { s.heat = Math.max(0, s.heat - 2); return 'Доказів забракло — тебе відпустили. Але поліція тебе запамʼятала.'; } return busted(s, yrs, what); } }] };
}
A({ id: 'steal', hidden: 1, tab: 'risk', n: 'Можливість щось поцупити', d: 'Мало грошей, високий ризик', show: function (s) { return s.age >= 12; },
  run: function (s) {
    var tg = pick([['гаманець у переповненому автобусі', 0.03], ['велосипед біля магазину', 0.04], ['телефон зі столика в кафе', 0.05], ['товар із супермаркету', 0.01], ['інструменти з відчиненого гаража', 0.04]]);
    function loot() { var v = M(s) * tg[1] * rnd(0.5, 1.6); if (chance(0.15)) { v *= 0.3; s.money += v; return 'Річ виявилася дешевшою, ніж здавалося: лише ' + fmt(v) + '.'; } s.money += v; add(s, { happy: -2 }); return 'Вийшло: ' + tg[0] + ' — це ' + fmt(v) + '. Серце ще довго калатало.'; }
    function noticed() {
      return { title: 'Тебе помітили', text: 'Власник обернувся й дивиться просто на тебе.', opts: [
        { t: 'Тікати', sub: 'спорт допоможе', f: function () { if (chance(0.3 + s.sk.sport / 150 + s.st.health / 400)) return 'Ти ' + g(s, 'втік', 'втекла') + ' дворами. З порожніми руками, але на волі.'; return court(s, 'крадіжку', 0, 2); } },
        { t: 'Віддати й вибачитися', f: function () { if (chance(0.55)) { add(s, { happy: -5, social: -2 }); return 'Людина сплюнула й пішла. Поліцію не кликали.'; } return court(s, 'спробу крадіжки', 0, 1); } },
        { t: 'Відкупитися', sub: fmt(M(s) * 0.05), dis: s.money < M(s) * 0.05, f: function () { s.money -= M(s) * 0.05; return 'Гроші зробили своє — розійшлися мовчки.'; } }] };
    }
    return { title: 'Можливість', text: 'Ти помічаєш: ' + tg[0] + '. Ніхто не дивиться… здається.', opts: [
      { t: 'Діяти швидко', f: function () { return chance(riskP(s, 0.3)) ? noticed() : loot(); } },
      { t: 'Почекати слушного моменту', sub: 'безпечніше, але момент може минути', f: function () { if (chance(0.4)) return 'Момент минув — людина пішла.'; return chance(riskP(s, 0.15)) ? noticed() : loot(); } },
      { t: 'Покликати друга на шухер', sub: 'ділитися навпіл', dis: s.friends < 1, f: function () { if (chance(riskP(s, 0.17))) return noticed(); var before = s.money, r = loot(); s.money -= (s.money - before) / 2; if (chance(0.15)) { s.heat += 2; return r + ' Друг потім розхвалився всім — по району пішли розмови.'; } return r + ' Половину відда' + g(s, 'в', 'ла') + ' другові.'; } },
      { t: 'Передумати', f: function () { return 'Ти пройш' + g(s, 'ов', 'ла') + ' повз.'; } }] };
  } });
A({ id: 'scheme', hidden: 1, tab: 'risk', n: 'Схема з «легкими грошима»', d: 'Шахрайство: спосіб обираєш ти', show: function (s) { return s.age >= 18; },
  run: function (s) {
    function outcome(kind, base, pay, after) {
      if (chance(riskP(s, base))) return chance(0.35) ? (s.heat += 2, 'Жертви почали масово писати в поліцію — довелося все згорнути й залягти. Грошей — нуль.') : court(s, 'шахрайство', 2, 6);
      var e = M(s) * pay; if (chance(0.15)) { e *= 0.4; s.money += e; return 'Напарник, який тримав рахунки, зник із більшою частиною. Тобі лишилося ' + fmt(e) + '.'; }
      s.money += e; if (after) after(); return kind + ': +' + fmt(e) + '. Тепер головне — не світитися.';
    }
    return { title: 'Схема', text: 'Знайомий пропонує «тему». Варіантів кілька.', opts: [
      { t: 'Дзвінки «зі служби безпеки банку»', sub: 'харизма допомагає', f: function () { return outcome('Дзвінки', 0.28 - s.st.social / 600, rnd(0.3, 1.2) * (s.st.social / 60)); } },
      { t: 'Фейковий інтернет-магазин', sub: 'потрібне програмування', f: function () { return outcome('Інтернет-магазин', 0.24 - s.sk.code / 400, rnd(0.3, 1.5) * (0.5 + s.sk.code / 100)); } },
      { t: '«Інвестиційний клуб» для знайомих', sub: 'багато грошей, але постраждають свої', f: function () { return outcome('«Клуб»', 0.35, rnd(1, 3.5) * (s.st.social / 60), function () { s.friends = Math.max(0, s.friends - 2); add(s, { happy: -4 }); }); } },
      { t: 'Відмовитися', f: function () { return 'Ти відмови' + g(s, 'вся', 'лася') + '. Знайомий знайшов іншого.'; } }] };
  } });
A({ id: 'smuggle', hidden: 1, tab: 'risk', n: 'Контрабанда через кордон', d: 'Маршрут обираєш ти', show: function (s) { return s.age >= 18 && C(s).law < 0.7; },
  run: function (s) {
    var goods = pick(['сигарети', 'пальне', 'електроніку', 'алкоголь', 'ліки']), val = M(s) * rnd(0.3, 0.9);
    function seized(p) { return 'Партію (' + goods + ') конфіскували' + (p ? ', а тебе затримали.' : '. Тебе відпустили, але гроші в товар пропали.'); }
    return { title: 'Партія через кордон', text: 'Є партія: ' + goods + '. Як везти?', opts: [
      { t: 'Через пункт пропуску з «домовленістю»', sub: 'хабар ' + fmt(M(s) * 0.05), dis: s.money < M(s) * 0.05, f: function () { s.money -= M(s) * 0.05;
        if (chance(0.3)) return { title: 'На кордоні', text: 'Новий прикордонник «не в темі» і вимагає втричі більше.', opts: [
          { t: 'Доплатити ' + fmt(M(s) * 0.15), dis: s.money < M(s) * 0.15, f: function () { s.money -= M(s) * 0.15; s.money += val; return 'Доплати' + g(s, 'в', 'ла') + ' — партія пройшла: +' + fmt(val) + '.'; } },
          { t: 'Розвернутися', f: function () { return 'Ти розверну' + g(s, 'вся', 'лася') + '. Хабар пропав, товар лишився.'; } },
          { t: 'Їхати на свій ризик', f: function () { if (chance(riskP(s, 0.4))) return chance(0.5) ? seized(false) : court(s, 'контрабанду', 1, 4); s.money += val; return 'Пронесло: +' + fmt(val) + '.'; } }] };
        if (chance(riskP(s, 0.1))) return seized(false); s.money += val; return 'Усе за домовленістю: +' + fmt(val) + '.'; } },
      { t: 'Лісом уночі', sub: 'без хабарів, але небезпечно', f: function () { if (chance(0.1)) { add(s, { health: -10 }); return 'Ти зірва' + g(s, 'вся', 'лася') + ' в яр і пошкоди' + g(s, 'в', 'ла') + ' ногу. Партію кину' + g(s, 'в', 'ла') + '.'; } if (chance(riskP(s, 0.25))) return chance(0.4) ? seized(false) : court(s, 'контрабанду', 1, 4); var v = val * (chance(0.2) ? 0.6 : 1); s.money += v; return 'Дійш' + g(s, 'ов', 'ла') + ': +' + fmt(v) + '.'; } },
      { t: 'Через знайомого водія фури', sub: 'віддаси йому 40%', f: function () { if (chance(0.1)) return 'Водій зник разом із товаром.'; if (chance(riskP(s, 0.12))) return seized(false); s.money += val * 0.6; return 'Фура пройшла: +' + fmt(val * 0.6) + '.'; } },
      { t: 'Відмовитися', f: function () { return 'Ти не ризикуєш.'; } }] };
  } });

// ---- Угруповання ----
A({ id: 'join_gang', tab: 'risk', n: 'Вступити в угруповання', d: function (s) { return cartel(s) ? 'Картельна країна: поліція майже не заважає, але вбивають часто' : NARCO.indexOf(s.country) >= 0 ? 'Картель: великі гроші, висока смертність' : C(s).law < 0.5 ? 'Поліція тут слабка — ризик арешту нижчий' : 'Банда: поліція тут працює'; }, show: gangOK,
  run: function (s) {
    var p = clamp(0.3 + (s.st.social - 50) / 150 + s.sk.sport / 300 + (s.q <= 2 ? 0.15 : 0) - (s.age > 30 ? 0.2 : 0) + (cartel(s) ? 0.15 : 0), 0.05, 0.9);
    if (!chance(p)) return 'Тебе не взяли — «не наш».';
    s.gang = { rank: 0, yrs: 0, perf: 50, heat: 0, kind: gangKind(s) };
    mark(s, 'Вступ: ' + s.gang.kind); add(s, { happy: 2 }); s.parents.forEach(function (x) { x.rel -= 10; });
    return 'Ти тепер ' + rankName(s.gang).toLowerCase() + ' в ' + (s.gang.kind === 'картель' ? 'картелі' : 'мафіозній сімʼї') + '. Шляху назад може не бути.';
  } });
A({ id: 'job_gang', tab: 'risk', n: 'Взяти справу від угруповання', d: 'Вибір: перевезення, борги чи охорона', show: function (s) { return !!s.gang; },
  run: function (s) { return gangJob(s); } });
A({ id: 'bribe', tab: 'risk', n: 'Платити поліції', d: function (s) { return 'Ризик арешту ↓ на рік · ' + fmt(M(s) * (1 + s.gang.rank * 3)); }, show: function (s) { return !!s.gang && C(s).law < 0.8; },
  run: function (s) { var cost = M(s) * (1 + s.gang.rank * 3); s.money -= cost; if (chance(C(s).law * 0.3)) return busted2(s); return 'Потрібні люди отримали конверти.'; } });
A({ id: 'lowkey', tab: 'risk', n: 'Залягти на дно', d: 'Менше доходу, менше ризику, розшук спадає', show: function (s) { return !!s.gang; },
  run: function (s) { return 'Цього року ти не висовуєшся.'; } });
A({ id: 'leave_gang', tab: 'risk', n: 'Вийти з угруповання', ap: 0, d: function (s) { return 'Ризик помсти ~' + Math.round([0.03, 0.06, 0.1, 0.15, 0.25][s.gang.rank] * 100) + '%'; }, show: function (s) { return !!s.gang; },
  run: function (s) { var r = s.gang.rank; s.gangPast = s.gang; s.gang = null; if (chance([0.03, 0.06, 0.1, 0.15, 0.25][r])) { die(s, 'помста колишніх «колег»'); return 'Тебе не відпустили.'; } add(s, { happy: 5 }); mark(s, 'Вихід з угруповання'); return 'Ти вийш' + g(s, 'ов', 'ла') + '. Тепер головне — щоб про тебе забули.'; } });
A({ id: 'family_money', tab: 'money', n: 'Попросити гроші в батьків', d: 'На бізнес, житло чи старт', show: function (s) { return s.age >= 18 && s.d >= 8 && s.parents.some(function (p) { return p.alive; }) && !(s.flags.askYr && s.age - s.flags.askYr < 5); },
  run: function (s) { s.flags.askYr = s.age; var rel = s.parents.filter(function (p) { return p.alive; }).reduce(function (a, p) { return Math.max(a, p.rel); }, 0);
    if (!chance(0.3 + rel / 150)) return 'Батьки сказали, що час заробляти самому.';
    var a = s.flags.elite ? s.fam * rnd(0.01, 0.05) : M(s) * [0, 0, 0, 0, 0, 0, 0, 1, 2.5, 8][s.d - 1] * rnd(0.5, 1.2);
    if (s.flags.elite) s.fam -= a; s.money += a; return 'Батьки дали ' + fmt(a) + '.'; } });

// ---- Покупки ----
function buyPrompt(s) {
  var c = C(s), o = s.own;
  return { title: 'Покупки', text: 'Готівка: ' + fmt(s.money) + '. Речі дають щастя і статус, але кожна має річне утримання.', opts: [
    { t: 'Транспорт', sub: o.car ? 'зараз: ' + VEHICLE[o.car].n.toLowerCase() + ' (~' + fmt(o.carVal) + ')' : 'немає', f: function () { return vehPrompt(s); } },
    { t: 'Речі й гардероб', sub: 'зараз: ' + GEAR_LV[o.gear].n.toLowerCase(), f: function () { return tierPrompt(s, 'gear', GEAR_LV, 'Речі й гардероб'); } },
    { t: 'Облаштування дому', sub: 'зараз: ' + HOME_LV[o.homeLvl].n.toLowerCase() + (s.home ? '' : ' · у винайманому житлі при переїзді пропаде'), dis: s.withParents && s.age < 18, f: function () { return tierPrompt(s, 'homeLvl', HOME_LV, 'Облаштування дому'); } },
    { t: o.pet ? 'Домашня тварина: є' : 'Завести собаку чи кішку', sub: '~' + fmt(c.median * 0.05) + ' + ' + fmt(c.median * 0.04) + '/рік', dis: !!o.pet || s.money < c.median * 0.05, f: function () { return { title: 'Хто?', text: 'Собака додає прогулянок, кішка — затишку.', opts: [['dog', 'Собака'], ['cat', 'Кішка']].map(function (x) { return { t: x[1], f: function () { s.money -= c.median * 0.05; o.pet = x[0]; o.petAge = 0; return 'У тебе тепер ' + x[1].toLowerCase() + '!'; } }; }) }; } }] };
}
function vehPrompt(s) {
  var c = C(s), o = s.own, trade = o.car ? o.carVal : 0;
  var deals = yearly(s, 'veh', function () { return wsample(VEHICLES, 3, function (v) { return v.p < 3 ? 2 : 1; }).map(function (v) { return { id: v.id, pm: rnd(0.8, 1.15) }; }); });
  var opts = deals.v.filter(function (x) { return x.id !== o.car; }).map(function (x) {
    var v = VEHICLE[x.id], price = v.p * c.median * x.pm, need = price - trade;
    return { t: v.n + ' — ' + fmt(price) + (x.pm < 0.9 ? ' (вигідно)' : ''), sub: 'утримання ~' + fmt(v.up * c.median) + '/рік · щастя +' + v.hap + (v.soc ? ', статус +' + v.soc : '') + (v.id !== 'bike' ? ' · менше часу в дорозі' : ', здоровʼя +') + (trade ? ' · старе в залік ' + fmt(trade) : ''), dis: s.money < need || s.age < (v.id === 'bike' ? 6 : v.id === 'scooter' ? 16 : 18),
      f: function () { s.money -= need; o.car = v.id; o.carVal = price; mark(s, 'Купи' + g(s, 'в', 'ла') + ': ' + v.n.toLowerCase()); return 'Тепер у тебе ' + v.n.toLowerCase() + '.'; } };
  });
  if (o.car) opts.push({ t: 'Продати ' + VEHICLE[o.car].n.toLowerCase(), sub: fmt(o.carVal), f: function () { s.money += o.carVal; o.car = null; o.carVal = 0; return 'Транспорт продано.'; } });
  return { title: 'Транспорт', text: 'Оголошення цього року (нові — наступного). Ціни — у твоїй країні. Транспорт щороку дешевшає на ~13%.', opts: opts };
}
function tierPrompt(s, key, LVL, title) {
  var c = C(s), o = s.own, mult = key === 'homeLvl' ? (s.home ? (s.home.kind === 'Будинок' ? 1.6 : 1) : 0.6) : 1;
  return { title: title, text: 'Кожен рівень — разова покупка плюс утримання щороку.', opts: LVL.map(function (L, i) {
    var price = L.p * c.median * mult;
    return { t: L.n + (i ? ' — ' + fmt(price) : ''), sub: i === o[key] ? 'зараз у тебе' : i < o[key] ? 'простіше, гроші не повертаються' : 'щастя +' + L.hap + (L.soc ? ', статус +' + L.soc : '') + (L.health ? ', здоровʼя +' + L.health : ''), dis: i === o[key] || (i > o[key] && s.money < price),
      f: function () { if (i > o[key]) { s.money -= price; if (key === 'homeLvl' && s.home) s.home.val += price * 0.5; } o[key] = i; return title + ': ' + L.n.toLowerCase() + '.'; } };
  }) };
}
A({ id: 'buy', tab: 'money', n: 'Покупки', ap: 0, d: 'Транспорт, речі, облаштування дому, тварини', show: function (s) { return s.age >= 6; }, run: buyPrompt });

A({ id: 'shady', tab: 'risk', n: 'Тіньові пропозиції', d: 'Що тобі запропонували цього року', show: function (s) { return s.age >= 12 && !s.prison; },
  run: function (s) {
    var pool = ACTIONS.filter(function (a) { return a.hidden && a.tab === 'risk' && a.show(s); });
    var off = yearly(s, 'shady', function () { return wsample(pool, chance(0.5) ? 1 : 2, function (a) { return a.id === 'shadow' ? 2 : 1; }).map(function (a) { return a.id; }); });
    var opts = off.v.filter(function (id) { return off.used.indexOf(id) < 0; }).map(function (id) { var a = ACTIONS.filter(function (x) { return x.id === id; })[0]; return { t: a.n, sub: typeof a.d === 'function' ? a.d(s) : a.d, f: function () { off.used.push(id); return a.run(s); } }; });
    opts.push({ t: 'Відмовитися від усього', f: function () { off.used = off.v.slice(); return 'Ти не вʼязуєшся в сумнівне.'; } });
    return { title: 'Тіньові пропозиції', text: cartel(s) ? 'Тут таких пропозицій вистачає, а поліції — ні.' : 'Знайомі знайомих пропонують «підзаробити».', opts: opts };
  } });

// ---- Шлях нагору: переворот і своя сімʼя ----
A({ id: 'coup', tab: 'risk', n: 'Кинути виклик главі', d: 'Тільки для заступника: або все, або нічого', show: function (s) { return s.gang && s.gang.rank === 3 && !s.gang.own; },
  run: function (s) {
    var g2 = s.gang, top = rankName(g2, 4).toLowerCase();
    function win(txt) { g2.rank = 4; g2.heat += 3; mark(s, rankName(g2)); add(s, { happy: 5 }); return txt + ' Тепер ти — ' + top + '.'; }
    return { title: 'Переворот', text: 'Ти — друга людина в ' + (g2.kind === 'картель' ? 'картелі' : 'сімʼї') + '. Глава старіє і робить помилки. Як діяти?', opts: [
      { t: 'Таємна змова з іншими', sub: 'харизма й репутація; якщо злиють — кінець', f: function () { if (chance(0.2 + s.st.social / 300 + g2.perf / 400)) return win('Більшість стала на твій бік, і старого «відправили на пенсію».'); if (chance(0.5)) { die(s, 'змову викрили'); return 'Хтось злив змову.'; } g2.rank = 1; g2.perf = 30; return 'Змову викрили. Тебе понизили — живий лише завдяки старим заслугам.'; } },
      { t: 'Засідка', sub: 'найшвидше, найкривавіше', f: function () { if (chance(0.4 + s.sk.sport / 400)) { g2.warYrs = 2; return win('Засідка вдалася. Частина людей глави ще мститиме.'); } if (chance(0.6)) { die(s, 'загину' + g(s, 'в', 'ла') + ' під час перевороту'); return 'Засідка провалилася.'; } return court(s, 'замах на вбивство', 8, 15); } },
      { t: 'Здати главу поліції', sub: 'залежить від того, як тут працює закон', f: function () { if (chance(C(s).law * 0.8)) { if (chance(0.7)) return win('Главу заарештували, і місце звільнилося.'); die(s, 'помста за донос'); return 'Хтось дізнався, хто дав свідчення.'; } g2.heat += 2; return 'Поліція «загубила» твої свідчення. Залишається сподіватися, що глава не дізнається.'; } },
      { t: 'Передумати', f: function () { return 'Ти чекаєш свого часу.'; } }] };
  } });
A({ id: 'split', tab: 'risk', n: 'Створити власне угруповання', d: 'Одразу стаєш главою, але колишні «свої» оголосять війну', show: function (s) { return s.gang && s.gang.rank >= 1 && !s.gang.own; },
  run: function (s) {
    var g2 = s.gang;
    return { title: 'Своя справа', text: 'Ти можеш піти й забрати з собою кількох людей. Але колишні «свої» такого не прощають.', opts: [
      { t: 'Піти з людьми', sub: 'війна на 3 роки', f: function () { g2.own = true; g2.rank = 4; g2.size = 1 + Math.floor(s.st.social / 35); g2.warYrs = 3; g2.perf = 50; mark(s, rankName(g2)); return 'Ти — ' + rankName(g2).toLowerCase() + '. Людей: ' + g2.size + '. Тепер головне — пережити найближчі роки.'; } },
      { t: 'Домовитися про мирний відхід', sub: 'доведеться віддати частину грошей', f: function () { var pay = s.money * 0.4 + M(s) * g2.rank; s.money -= pay; if (chance(0.35 + s.st.social / 300)) { g2.own = true; g2.rank = 4; g2.size = 1; mark(s, rankName(g2)); return 'Заплати' + g(s, 'в', 'ла') + ' ' + fmt(pay) + ' — тебе відпустили з благословенням. Ти — ' + rankName(g2).toLowerCase() + '.'; } g2.warYrs = 3; g2.own = true; g2.rank = 4; g2.size = 1; return 'Гроші взяли, але війну все одно оголосили.'; } },
      { t: 'Залишитися', f: function () { return 'Поки що ти лишаєшся.'; } }] };
  } });
