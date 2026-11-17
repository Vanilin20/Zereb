// ЖЕРЕБ — дії гравця (пісочниця). ap — скільки «часу» забирає дія (на рік 2–4 очки).
var TABS = [
  { id: 'me', n: 'Я' }, { id: 'hobby', n: 'Хобі' }, { id: 'edu', n: 'Освіта' }, { id: 'work', n: 'Робота' },
  { id: 'love', n: 'Люди' }, { id: 'money', n: 'Гроші' }, { id: 'biz', n: 'Бізнес' }, { id: 'move', n: 'Переїзд' }, { id: 'risk', n: 'Ризик' }
];
function A(o) { if (o.ap == null) o.ap = 1; ACTIONS.push(o); }
var ACTIONS = [];

// ---- Я ----
A({ id: 'sport', prisonOk: 1, tab: 'me', n: 'Спорт', d: 'Здоровʼя, навичка «Спорт»', show: function (s) { return s.age >= 5; },
  run: function (s) { var g2 = ri(4, 8); add(s, { sport: g2, happy: 2 }); s.st.health = clamp(s.st.health + ri(2, 5)); return 'Ти регулярно займав' + g(s, 'ся', 'ася') + ' спортом. Спорт +' + g2 + '.'; } });
A({ id: 'read', prisonOk: 1, tab: 'me', n: 'Читати', d: 'Розум, трохи письма', show: function (s) { return s.age >= 6 && !s.noSchoolRead; },
  run: function (s) { if (s.edu < 1 && !s.study && s.age > 10 && chance(0.6)) return 'Важко читати без школи — але ти потроху вчишся.'; add(s, { smarts: ri(2, 4), write: 1 }); return 'Кілька прочитаних книжок зробили тебе розумнішим.'; } });
A({ id: 'rest', prisonOk: 1, tab: 'me', n: 'Відпочити', d: 'Щастя', show: function (s) { return s.age >= 6; },
  run: function (s) { add(s, { happy: ri(5, 9), health: 1 }); return 'Ти дав' + g(s, '', 'ла') + ' собі відпочити.'; } });
A({ id: 'doctor', tab: 'me', n: 'Медогляд', d: function (s) { return 'Виявити хвороби рано · ' + fmt(treatCost(s, 0.04)); }, show: function (s) { return s.age >= 18; },
  run: function (s) { s.money -= treatCost(s, 0.04); if (!s.flags.genKnown && Math.max(s.gen.heart, s.gen.cancer) > 1.25 && chance(.5)) s.flags.genKnown = s.gen.heart > s.gen.cancer ? 'heart' : 'cancer'; s.st.health = clamp(s.st.health + 2); if (s.flags.ill && !s.flags.illKnown) { s.flags.illKnown = true; return illnessPrompt(s); } return 'Обстеження пройшло добре.'; } });
A({ id: 'travel', tab: 'me', n: 'Подорож', d: function (s) { return 'Щастя, враження · ' + fmt(M(s) * 0.15 * [0.6, 1, 2.5][s.ls]); }, show: function (s) { return s.age >= 16 && s.money >= M(s) * 0.15 * [0.6, 1, 2.5][s.ls]; },
  run: function (s) {
    var cost = M(s) * 0.15 * [0.6, 1, 2.5][s.ls]; s.money -= cost; s.stat.travels++;
    var dest = pick(COUNTRY_LIST.filter(function (c) { return c.code !== s.country && c.conflict < 2; }));
    add(s, { happy: ri(8, 14), eng: 2, social: 2 });
    return 'Подорож до ' + dest.name + ' ' + dest.flag + ' — ' + pick(['незабутньо.', 'втомливо, але варто того.', 'ти повернув' + g(s, 'ся', 'ася') + ' іншою людиною.', 'дорого, але щасливо.']);
  } });
A({ id: 'volunteer', tab: 'me', n: 'Волонтерство', d: 'Щастя, харизма, друзі', show: function (s) { return s.age >= 12; },
  run: function (s) { add(s, { happy: 4, social: 3 }); if (chance(0.3)) s.friends++; return 'Ти допомагав' + g(s, '', 'ла') + ' іншим. Це наповнює.'; } });
A({ id: 'habits', tab: 'me', n: 'Звички', ap: 0, d: function (s) { return ['фастфуд', 'звичайне харчування', 'здорове харчування'][s.diet] + ' · ' + (s.sleep ? 'висипаюся' : 'недосипаю'); }, show: function (s) { return s.age >= 14; },
  run: function (s) { return { title: 'Звички', text: 'Здорова їжа трохи дорожча, але береже серце. Недосип додає продуктивності на роботі, але бʼє по здоровʼю.', opts: [
    { t: 'Харчування: фастфуд', sub: 'дешевше, смачно, шкідливо', f: function () { s.diet = 0; return 'Ти їси що попало.'; } },
    { t: 'Харчування: звичайне', f: function () { s.diet = 1; return 'Звичайне харчування.'; } },
    { t: 'Харчування: здорове', sub: '+6% до витрат', f: function () { s.diet = 2; return 'Ти перейш' + g(s, 'ов', 'ла') + ' на здорове харчування.'; } },
    { t: s.sleep ? 'Спати менше, працювати більше' : 'Нормально висипатися', f: function () { s.sleep = s.sleep ? 0 : 1; return s.sleep ? 'Сон — святе.' : 'Тепер ти спиш по 5 годин.'; } }] }; } });
A({ id: 'therapy', tab: 'me', n: 'Психотерапія', d: function (s) { return 'Допомагає з пригніченим станом · ' + fmt(treatCost(s, 0.08)); }, show: function (s) { return s.age >= 14 && C(s).gdp > 3; },
  run: function (s) { s.money -= treatCost(s, 0.08); add(s, { happy: 6 }); if (s.flags.depr && chance(0.45)) { s.flags.depr = 0; s.lowYrs = 0; return 'Терапія допомогла: пригнічений стан відступив.'; } return s.flags.depr ? 'Терапія потроху допомагає. Варто продовжити.' : 'Розмови з психотерапевтом допомогли краще себе зрозуміти.'; } });
A({ id: 'smoke_quit', tab: 'me', n: 'Кинути курити', d: 'Складно, але продовжує життя', show: function (s) { return s.flags.smoker; },
  run: function (s) { if (chance(0.35)) { s.flags.smoker = false; add(s, { happy: 4 }); return 'Ти кинув' + g(s, '', 'ла') + ' курити!'; } add(s, { happy: -3 }); return 'Цього разу зірвав' + g(s, 'ся', 'ася') + '.'; } });
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
  run: function (s) { add(s, { happy: -2, smarts: 1 }); return 'Ти сидів' + g(s, '', 'ла') + ' над підручниками.'; } });
A({ id: 'skip', tab: 'edu', n: 'Прогулювати', d: 'Щастя ↑, бал ↓', show: function (s) { return !!s.study; },
  run: function (s) { add(s, { happy: 5, social: 2 }); return 'Пари можуть почекати.'; } });
A({ id: 'olymp', tab: 'edu', n: 'Готуватися до олімпіади', d: 'Розум; перемога допоможе при вступі', show: function (s) { return s.study && s.study.t === 'school' && s.age >= 10 && !s.flags.olymp; },
  run: function (s) { add(s, { smarts: 3, happy: -2 }); if (chance((s.st.smarts - 40) / 120)) { s.flags.olymp = 1; mark(s, 'Переможець олімпіади'); return 'Ти переміг' + g(s, '', 'ла') + ' на олімпіаді!'; } return 'Цього року без призу, але знань додалося.'; } });
A({ id: 'enroll_uni', tab: 'edu', n: 'Вступити до університету', d: 'Обрати спеціальність', show: function (s) { return !s.study && s.edu >= 3 && s.age >= 17 && s.age < 55; },
  run: function (s) { return { title: 'Спеціальність', text: 'Шанс вступу залежить від балу, розуму і профільних навичок.' + (s.job ? ' Працювати і вчитися — важко.' : ''), opts: uniOpts(s) }; } });
A({ id: 'enroll_master', tab: 'edu', n: 'Магістратура', d: 'Якщо маєш бакалавра', show: function (s) { return !s.study && s.edu === 5 && s.age < 50; },
  run: function (s) { var f = s.fields[s.fields.length - 1], p = admitChance(s, f, 'master'); if (chance(p)) { startStudy(s, 'master', f, 2); return 'Ти ' + g(s, 'вступив', 'вступила') + ' в магістратуру.'; } return 'У магістратуру не взяли.'; } });
A({ id: 'enroll_voc', tab: 'edu', n: 'Вступити до коледжу', d: 'Робоча професія', show: function (s) { return !s.study && s.edu >= 2 && s.age >= 16 && s.age < 50; },
  run: function (s) { return { title: 'Коледж', text: 'Обери напрям.', opts: vocOpts(s, s.edu >= 3 ? 2 : 3) }; } });
A({ id: 'course', tab: 'hobby', n: 'Платні курси', d: function (s) { return 'Навичка швидше, ніж самостійно · ' + fmt(M(s) * 0.1) + ' за рік навчання'; }, show: function (s) { return s.age >= 14 && C(s).gdp > 3; },
  run: function (s) { var cost = M(s) * 0.1; return { title: 'Який курс?', text: 'Курс триває рік і дає приблизно стільки, скільки 4–5 годин самостійних занять щотижня. Коштує ' + fmt(cost) + '.', opts: Object.keys(HOBBY).map(function (k) { var v = s.sk[k]; return { t: SKILL_NAMES[k], sub: 'зараз ' + Math.round(v) + ' → ~' + Math.round(clamp(v + hobbyGain(s, v, 4.5))), dis: s.money < cost, f: function () { s.money -= cost; s.sk[k] = clamp(v + hobbyGain(s, v, 4.5) * rnd(0.8, 1.2)); return 'Курс завершено: ' + SKILL_NAMES[k] + ' ' + Math.round(s.sk[k]) + '.'; } }; }) }; } });
A({ id: 'langcourse', tab: 'hobby', n: 'Мовні курси', d: function (s) { return 'Будь-яка мова · ' + fmt(M(s) * 0.08) + ' за рік'; }, show: function (s) { return s.age >= 10; },
  run: function (s) { var cost = M(s) * 0.08; return { title: 'Мовні курси', text: 'Рік курсів ≈ 4 години самостійних занять щотижня. Коштує ' + fmt(cost) + '.', opts: ['en'].concat(LEARNABLE).filter(function (l) { return langLevel(s, l) < 100; }).map(function (l) { var v = langLevel(s, l); return { t: LANG_NAMES[l], sub: 'зараз ' + Math.round(v), dis: s.money < cost, f: function () { s.money -= cost; var nv = clamp(v + hobbyGain(s, v, 4) * rnd(0.8, 1.2)); if (l === 'en') s.sk.eng = nv; else s.lang[l] = nv; return LANG_NAMES[l] + ': ' + Math.round(nv) + '/100.'; } }; }) }; } });
A({ id: 'picklang', tab: 'hobby', n: 'Яку мову вчити самостійно', ap: 0, d: function (s) { return s.langTarget ? LANG_NAMES[s.langTarget] + ' — години став у «Розкладі»' : 'Обери мову, потім додай години в «Розкладі»'; }, show: function (s) { return s.age >= 8; },
  run: function (s) { return { title: 'Мова для самостійного вивчення', text: 'Англійська вчиться окремим рядком у розкладі.', opts: LEARNABLE.filter(function (l) { return (s.lang[l] || 0) < 100; }).map(function (l) { return { t: LANG_NAMES[l], sub: 'зараз ' + Math.round(s.lang[l] || 0), f: function () { s.langTarget = l; if (!s.sched.lang) s.sched.lang = 3; return 'Тепер ти вчиш: ' + LANG_NAMES[l].toLowerCase() + '.'; } }; }) }; } });
A({ id: 'pickfree', tab: 'hobby', n: 'Навичка для фрилансу', ap: 0, d: function (s) { return s.freeSkill ? HOBBY[s.freeSkill].free + ' — години став у «Розкладі»' : 'Відкривається з навички 35'; }, show: function (s) { return s.age >= 14 && Object.keys(HOBBY).some(function (k) { return s.sk[k] >= 35; }); },
  run: function (s) { return { title: 'Фриланс', text: 'Скільки платять, залежить від майстерності, ринку країни, англійської й портфоліо. Години на фриланс ставиш у «Розкладі».', opts: Object.keys(HOBBY).filter(function (k) { return s.sk[k] >= 35; }).map(function (k) { var mk = hobbyMarket(s, k); return { t: HOBBY[k].free, sub: SKILL_NAMES[k] + ' ' + Math.round(s.sk[k]) + ' · ~' + fmt(freelancePay(s, k) / 10) + ' за год/тиждень на рік · ринок ' + (mk > 1 ? 'сильний' : mk > 0.7 ? 'нормальний' : 'слабкий'), f: function () { s.freeSkill = k; if (!s.sched.free) s.sched.free = 5; return 'Фриланс: ' + HOBBY[k].free.toLowerCase() + '.'; } }; }) }; } });
A({ id: 'dropout', tab: 'edu', n: 'Кинути навчання', ap: 0, d: 'Без диплома', show: function (s) { return s.study && (s.study.t !== 'school' || s.age >= 15); },
  run: function (s) { var t = studyName(s.study); s.study = null; add(s, { happy: 3 }); mark(s, 'Кинув' + g(s, '', 'ла') + ' навчання'); return 'Ти покинув' + g(s, '', 'ла') + ' навчання (' + t.toLowerCase() + ').'; } });

// ---- Робота ----
function jobOptions(s, apps) {
  var list = JOBS.map(function (j) { return { j: j, c: jobCheck(s, j) }; }).filter(function (x) { return x.c.ok && !(s.job && s.job.id === x.j.id); });
  list.sort(function (a, b) { return jobBase(s, b.j) - jobBase(s, a.j); });
  var opts = list.map(function (x) {
    var j = x.j, p = offerChance(s, j);
    var pay = jobBase(s, j) * immFactor(s);
    if (j.vol) pay *= fameMult(s.fame);
    var ai = x.c.viaHobby ? altInfo(s, j) : null;
    return { t: j.n, sub: 'шанс ' + Math.round(p * 100) + '% · ~' + fmt(pay) + '/рік' + (ai ? ' · через хобі (' + SKILL_NAMES[ai.k] + ')' : '') + (j.vol ? ' · дохід залежить від слави' : ''),
      f: function () {
        if (chance(p)) { takeJob(s, j, !!s.study); add(s, { happy: 5 }); return 'Тебе взяли: ' + j.n + (s.job.part ? ' (неповний день, поки вчишся)' : '') + '!' + (ai ? ' Хобі стало професією.' : ''); }
        apps--; if (apps <= 0) return 'Відмова на посаду «' + j.n + '». На цей рік спроби вичерпано.';
        var nx = jobOptions(s, apps); nx.text = 'Відмова на «' + j.n + '». Залишилось спроб: ' + apps + '.'; return nx;
      } };
  });
  return { title: 'Вакансії', text: 'Можеш подати 3 заявки за рік. Шанси залежать від освіти, навичок, досвіду, економіки й країни.', opts: opts.length ? opts : [{ t: 'Немає підходящих вакансій', sub: 'підвищуй освіту або навички', f: function () { return 'Підходящих вакансій не знайшлося.'; } }] };
}
A({ id: 'findjob', tab: 'work', n: 'Шукати роботу', d: function (s) { return 'До 3 заявок' + (hasRecord(s) ? ' · судимість знижує шанси' : ''); }, show: function (s) { return s.age >= 16 && !s.retired; }, run: function (s) { return jobOptions(s, 3); } });
A({ id: 'teenjob', tab: 'work', n: 'Підробіток', d: 'Кишенькові гроші', show: function (s) { return s.age >= 13 && s.age < 18; },
  run: function (s) { var ok = TEEN_JOBS.filter(function (t) { return !t.need || Object.keys(t.need).every(function (k) { return skillVal(s, k) >= t.need[k]; }); }); var t = pick(ok); var e = M(s) * t.pay; s.money += e; add(s, { happy: -1, social: 1 }); return t.n + ' — заробив' + g(s, '', 'ла') + ' ' + fmt(e) + '.'; } });
A({ id: 'work', tab: 'work', n: 'Працювати на повну', d: 'Продуктивність ↑ (шанс підвищення), щастя ↓', show: function (s) { return s.job && !s.job.teen; },
  run: function (s) { add(s, { happy: -3, health: -1 }); return 'Ти викладав' + g(s, 'ся', 'лася') + ' на роботі по максимуму.'; } });
A({ id: 'raise', tab: 'work', n: 'Попросити підвищення', d: 'Залежить від продуктивності', show: function (s) { var j = s.job && JOB[s.job.id]; return j && j.max && s.job.lvl < j.max && s.job.lvlYrs >= 2; },
  run: function (s) { var j = JOB[s.job.id]; var p = clamp((s.job.perf - 60) / 60 + (s.st.social - 50) / 250, 0.03, 0.6); if (chance(p)) { s.job.lvl++; s.job.lvlYrs = 0; add(s, { happy: 6 }); return 'Підвищили! Тепер ти ' + lvName(j, s.job.lvl).toLowerCase() + '.'; } s.job.perf -= 5; add(s, { happy: -3 }); return 'Начальство сказало «поки ні».'; } });
A({ id: 'switchco', tab: 'work', n: 'Перейти в іншу компанію', d: 'Шанс на вищу зарплату або посаду', show: function (s) { var j = s.job && JOB[s.job.id]; return j && !j.vol && !s.job.teen && s.job.yrs >= 3; },
  run: function (s) { var j = JOB[s.job.id], p = clamp(0.3 + s.job.perf / 250 + s.st.social / 400 - (s.econ < 0 ? 0.15 : 0), 0.1, 0.8);
    if (!chance(p)) return 'Співбесіди в інших компаніях нічого не дали.';
    var up = j.max && s.job.lvl < j.max && chance(0.2); if (up) s.job.lvl++;
    s.job.bonus = Math.min(1.6, (s.job.bonus || 1) * rnd(1.03, 1.12)); s.job.yrs = 0; s.job.lvlYrs = 0; s.job.perf = 55; add(s, { happy: 4 });
    return 'Нова компанія' + (up ? ', нова посада: ' + lvName(j, s.job.lvl).toLowerCase() : '') + ' і зарплата на ' + Math.round((s.job.bonus - 1) * 100) + '% вища за ринкову.'; } });
A({ id: 'quit', tab: 'work', n: 'Звільнитися', ap: 0, d: function (s) { return s.job ? JOB[s.job.id] ? JOB[s.job.id].n : '' : ''; }, show: function (s) { return s.job && !s.job.teen; },
  run: function (s) { var n = JOB[s.job.id].n; endJob(s, 'звільнився'); add(s, { happy: 2 }); return 'Ти звільнив' + g(s, 'ся', 'ася') + ' (' + n + ').'; } });
A({ id: 'retire', tab: 'work', n: 'Вийти на пенсію', ap: 0, d: function (s) { return '~' + fmt(pension(s)) + '/рік'; }, show: function (s) { return !s.retired && s.age >= C(s).retAge - 3; },
  run: function (s) { if (s.job) endJob(s, 'пенсія'); s.retired = true; mark(s, 'Пенсія'); add(s, { happy: 8 }); return 'Ти ' + g(s, 'вийшов', 'вийшла') + ' на пенсію.'; } });
A({ id: 'unretire', tab: 'work', n: 'Повернутися до роботи', ap: 0, d: 'Знову шукати роботу', show: function (s) { return s.retired && s.age < 80; }, run: function (s) { s.retired = false; return 'Пенсія — не для тебе. Знову в строю.'; } });

// ---- Люди ----
A({ id: 'parents', prisonOk: 1, tab: 'love', n: 'Час з батьками', d: 'Стосунки, щастя', show: function (s) { return s.parents.some(function (p) { return p.alive; }) && s.age >= 3; },
  run: function (s) { add(s, { happy: 3 }); var p = pick(s.parents.filter(function (x) { return x.alive; })); return 'Ти провів' + g(s, '', 'ла') + ' час із ' + (p.sex === 'f' ? 'мамою' : 'татом') + '.'; } });
A({ id: 'friends', prisonOk: 1, tab: 'love', n: 'Друзі', d: function (s) { return 'Друзів: ' + s.friends; }, show: function (s) { return s.age >= 4; },
  run: function (s) { add(s, { happy: 4, social: 2 }); if (s.friends < 8 && chance(0.25 + s.st.social / 200)) { s.friends++; return 'Зʼявився новий друг — ' + nameFrom(s.country, chance(.5) ? 'm' : 'f') + '. Друзів: ' + s.friends + '.'; } return s.friends ? 'Посиденьки з друзями.' : 'Поки не вдалося з кимось зблизитися.'; } });
A({ id: 'date', tab: 'love', n: 'Знайомства', d: 'Шукати пару', show: function (s) { return s.age >= 15 && !s.partner; }, run: function (s) { return datePrompt(s, 2); } });
function datePrompt(s, tries) {
  var p = newPartner(s);
  return { title: 'Знайомство', text: p.name + ', ' + p.age + ' р., ' + p.occ + '. Здається, між вами щось є.', opts: [
    { t: 'Запросити на побачення', sub: 'шанс залежить від харизми', f: function () { if (chance(0.35 + s.st.social / 150 + p.compat / 200)) { s.partner = p; add(s, { happy: 10 }); if (!s.flags.firstRel) { s.flags.firstRel = 1; mark(s, 'Перші стосунки: ' + p.name); } return 'Ви з ' + p.name + ' почали зустрічатися.'; } add(s, { happy: -4 }); return p.name + ' відмовил' + gp(p, 'ов', 'а') + '.'; } },
    tries > 0 ? { t: 'Шукати далі', f: function () { return datePrompt(s, tries - 1); } } : { t: 'Не зараз', f: function () { return 'Може, наступного року.'; } }
  ] };
}
A({ id: 'partner', tab: 'love', n: 'Час з партнером', d: function (s) { return s.partner ? s.partner.name + ' · стосунки ' + Math.round(s.partner.rel) : ''; }, show: function (s) { return !!s.partner; },
  run: function (s) { add(s, { happy: 4 }); return 'Ви з ' + s.partner.name + ' провели гарний час разом.'; } });
A({ id: 'propose', tab: 'love', n: 'Запропонувати шлюб', d: 'Після року стосунків', show: function (s) { return s.partner && !s.partner.married && s.partner.yrs >= 1 && s.age >= 18; },
  run: function (s) { var p = s.partner; if (chance(clamp((p.rel - 30) / 50, 0.05, 0.95))) { p.married = true; s.marriages++; var cost = M(s) * 0.3 * [0.5, 1, 3][s.ls]; s.money -= cost; add(s, { happy: 15 }); mark(s, 'Весілля з ' + p.name); return p.name + ' сказал' + gp(p, '', 'а') + ' «так»! Весілля коштувало ' + fmt(cost) + '.'; } p.rel -= 10; add(s, { happy: -8 }); return p.name + ' поки не готов' + gp(p, 'ий', 'а') + '.'; } });
A({ id: 'baby', tab: 'love', n: 'Завести дитину', d: function (s) { return fertility(s) ? 'Шанс ~' + Math.round(fertility(s) * 100) + '% за рік' : 'Усиновлення'; }, show: function (s) { return s.partner && s.age >= 18 && s.age < 55 && s.partner.rel > 40; },
  run: function (s) {
    var adopt = !fertility(s);
    if (adopt ? chance(0.4) : chance(fertility(s))) {
      var sx = chance(0.51) ? 'm' : 'f'; var k = { name: nameFrom(s.country, sx), sex: sx, age: 0, alive: true, rel: 80 };
      s.kids.push(k); add(s, { happy: 12 }); mark(s, (s.kids.length === 1 ? 'Перша дитина: ' : 'Дитина: ') + k.name);
      return (adopt ? 'Ви усиновили ' : 'У вас ' + (sx === 'm' ? 'народився син' : 'народилася донька') + ' — ') + k.name + '!';
    }
    return adopt ? 'Процедура усиновлення затягнулася.' : 'Цього року не вийшло.';
  } });
A({ id: 'kids', tab: 'love', n: 'Час з дітьми', d: 'Стосунки з дітьми', show: function (s) { return s.kids.some(function (k) { return k.alive; }); },
  run: function (s) { add(s, { happy: 5 }); return 'Ти провів' + g(s, '', 'ла') + ' час із дітьми.'; } });
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
        f: function () { if (s.money >= cost) s.money -= cost; else { s.money -= down; s.debt += cost - down; } s.home = { kind: h[0], val: cost }; s.withParents = false; mark(s, 'Власне житло'); add(s, { happy: 10 }); return 'У тебе тепер власн' + (h[0] === 'Квартира' ? 'а квартира' : 'ий будинок') + '!'; } };
    });
    return { title: 'Житло', text: 'Власне житло — без оренди. Ціни в країні: ' + C(s).name + '.', opts: o };
  } });
A({ id: 'sellhome', tab: 'money', n: 'Продати житло', ap: 0, d: function (s) { return s.home ? fmt(s.home.val) : ''; }, show: function (s) { return !!s.home; },
  run: function (s) { var v = s.home.val; s.money += v; s.home = null; s.own.homeLvl = 0; return 'Житло продано за ' + fmt(v) + '.'; } });
A({ id: 'rental', tab: 'money', n: 'Квартира під оренду', ap: 0, d: function (s) { return fmt(M(s) * C(s).house) + ' · ~' + (42 / C(s).house).toFixed(1).replace('.', ',') + '% на рік'; }, show: function (s) { return s.age >= 21 && s.money >= M(s) * C(s).house; },
  run: function (s) { var c = M(s) * C(s).house; s.money -= c; s.rentals.push({ val: c }); return 'Ти купив' + g(s, '', 'ла') + ' квартиру для оренди. Їх у тебе: ' + s.rentals.length + '.'; } });
A({ id: 'lifestyle', tab: 'money', n: 'Стиль життя', ap: 0, d: function (s) { return ['Скромний', 'Звичайний', 'Розкішний'][s.ls]; }, show: function (s) { return s.age >= 16; },
  run: function (s) { return { title: 'Стиль життя', text: 'Більше витрат — більше щастя, але менше заощаджень.', opts: [['Скромний', 0], ['Звичайний', 1], ['Розкішний', 2]].map(function (x) { return { t: x[0], sub: 'витрати ×' + [0.7, 1, 1.9][x[1]], f: function () { s.ls = x[1]; return 'Стиль життя: ' + x[0].toLowerCase() + '.'; } }; }) }; } });

// ---- Бізнес ----
A({ id: 'openbiz', tab: 'biz', n: 'Відкрити бізнес', d: 'Видно ризик і твою підготовку', show: function (s) { return s.age >= 18; },
  run: function (s) {
    var opts = BIZ.map(function (T) {
      var why = bizCan(s, T);
      if (why) return { t: T.n, sub: why, dis: true, f: function () { return ''; } };
      var cost = bizCost(s, T.id), sv = bizSurvival(s, T.id), can = s.money >= cost || (s.money >= cost * 0.3 && canBorrow(s));
      return { t: T.n + ' — ' + fmt(cost), sub: 'підготовка: ' + bizReadyLabel(sv.q) + ' · шанс протриматися 3 роки без доплат ~' + Math.round(sv.p * 100) + '%' + (T.startup ? ' · рідко, але може «вистрілити»' : '') + (s.money < cost ? (can ? ' · решта в кредит' : canBorrow(s) ? ' · треба мати 30%' : ' · банк не дає кредит') : ''), dis: !can,
        f: function () { return openBiz(s, T.id); } };
    });
    return { title: 'Новий бізнес', text: 'Успіх залежить від розуму, досвіду в галузі, профільного хобі, навички підприємництва й того, чи ти працюєш у бізнесі сам. Готівка: ' + fmt(s.money) + '. Кредитний рейтинг: ' + Math.round(s.credit) + '. Власна практика відкривається після досвіду в професії.', opts: opts };
  } });
A({ id: 'bizmanage', tab: 'biz', n: 'Керувати бізнесом', ap: 0, d: function (s) { return s.biz.map(function (b) { return b.name; }).join(', '); }, show: function (s) { return s.biz.length > 0; },
  run: function (s) { return { title: 'Мої бізнеси', text: 'Обери бізнес.', opts: s.biz.map(function (b) { return { t: b.name, sub: 'рік ' + b.yrs + ' · ' + (b.last >= 0 ? '+' : '') + fmt(b.last) + ' · каса ' + fmt(b.cash) + ' · вартість ~' + fmt(bizValue(s, b)), f: function () { return bizMenu(s, b); } }; }) }; } });
function bizMenu(s, b) {
  var o = [];
  if (!b.focus) o.push({ t: 'Працювати в бізнесі на повну (1 дія)', sub: 'підготовка ↑ цього року', dis: s.ap < 1, f: function () { s.ap--; b.focus = true; add(s, { happy: -2 }); return 'Цього року ти тягнеш «' + b.name + '» на собі.'; } });
  var ex = b.cap * 0.5;
  o.push({ t: 'Розширити за ' + fmt(ex), sub: 'більший оборот і більший ризик', dis: s.money < ex, f: function () { s.money -= ex; b.cap += ex; return '«' + b.name + '» розширено.'; } });
  var maxStaff = Math.max(1, Math.floor(b.cap / (M(s) * 0.3)));
  var addN = Math.min(3, maxStaff - (b.staff || 0)), hire = addN * M(s) * 0.3;
  o.push({ t: 'Найняти працівників (' + (b.staff || 0) + ' → ' + ((b.staff || 0) + addN) + ') за ' + fmt(hire), sub: 'наймання й обладнання зараз; далі кожен коштує ~' + fmt(M(s) * 0.9) + '/рік із каси й приносить більше, якщо добре керуєш · макс. ' + maxStaff + ' на капітал ' + fmt(b.cap), dis: addN <= 0 || s.money < hire, f: function () { s.money -= hire; b.staff = (b.staff || 0) + addN; return 'У «' + b.name + '» тепер ' + b.staff + ' працівників.'; } });
  if (b.staff) o.push({ t: 'Скоротити працівників (' + b.staff + ' → ' + Math.max(0, b.staff - 3) + ')', f: function () { b.staff = Math.max(0, b.staff - 3); add(s, { happy: -2 }); return 'Довелося скоротити людей.'; } });
  var T = BIZM[b.type];
  if (T.points) { var pc = T.cost * M(s); o.push({ t: 'Відкрити ще одну точку за ' + fmt(pc), sub: 'точок: ' + (b.points || 1), dis: s.money < pc, f: function () { s.money -= pc; b.cap += pc * 0.8; b.cash += pc * 0.2; b.points = (b.points || 1) + 1; mark(s, '«' + b.name + '»: ' + b.points + ' точки'); return 'Відкрито нову точку «' + b.name + '». Усього: ' + b.points + '.'; } }); }
  if (T.points && b.fran == null && (b.points || 1) >= 3 && b.yrs >= 4) o.push({ t: 'Запустити франшизу', sub: 'інші відкриватимуть точки під твоїм брендом і платитимуть роялті', f: function () { b.fran = 0; mark(s, 'Франшиза «' + b.name + '»'); return 'Франшизу «' + b.name + '» запущено.'; } });
  if (!b.inv) o.push({ t: 'Залучити інвестора', sub: 'гроші в обмін на частку · твоя частка ' + Math.round((b.share || 1) * 100) + '%', f: function () {
    b.inv = s.age; var q = bizQ(s, b), p = clamp(0.15 + q / 150 + (b.last > 0 ? 0.15 : 0) + (T.startup ? 0.1 : 0), 0.05, 0.85);
    if (!chance(p)) return 'Інвестори подивилися цифри й відмовили.';
    var amt = b.cap * rnd(0.5, 1.5), stake = amt / (bizValue(s, b) / (b.share || 1) + amt); b.cap += amt; b.share = (b.share || 1) * (1 - stake);
    return 'Інвестор вклав ' + fmt(amt) + ' за ' + Math.round(stake * 100) + '% «' + b.name + '». Твоя частка тепер ' + Math.round(b.share * 100) + '%.'; } });
  o.push({ t: b.mgr ? 'Звільнити управителя' : 'Найняти управителя', sub: b.mgr ? 'керуватимеш сам' : 'коштує ~' + fmt(M(s) * 0.8) + '/рік, звільняє твій час', f: function () { b.mgr = !b.mgr; b.effort = b.mgr ? 0.2 : (s.job ? 0.5 : 1); return b.mgr ? 'Управитель найнятий.' : 'Ти знову керуєш сам.'; } });
  o.push({ t: 'Дивіденди: ' + Math.round(b.div * 100) + '% → ' + (b.div > 0.4 ? '20%' : '70%'), sub: 'скільки прибутку забирати собі', f: function () { b.div = b.div > 0.4 ? 0.2 : 0.7; return 'Тепер забираєш ' + Math.round(b.div * 100) + '% вільного прибутку.'; } });
  o.push({ t: 'Продати за ~' + fmt(bizValue(s, b)), f: function () { var v = bizValue(s, b) * rnd(0.85, 1.15); closeBiz(s, b, 'продано', v); mark(s, 'Продав' + g(s, '', 'ла') + ' «' + b.name + '»'); return 'Ти продав' + g(s, '', 'ла') + ' «' + b.name + '» за ' + fmt(v) + '.'; } });
  o.push({ t: 'Ліквідувати бізнес', sub: 'розпродати майно (~' + fmt(b.cap * 0.25 + b.cash) + ') і закрити назавжди', f: function () { var v = b.cap * 0.25 + b.cash; closeBiz(s, b, 'закрито', v); return '«' + b.name + '» ліквідовано.'; } });
  return { title: b.name, text: 'Рік роботи: ' + b.yrs + '. Підготовка: ' + bizReadyLabel(bizQ(s, b)) + '. Працівників: ' + (b.staff || 0) + (b.points > 1 ? ', точок: ' + b.points : '') + (b.fran != null ? ', франчайзі: ' + b.fran : '') + (b.share < 1 ? ', твоя частка ' + Math.round(b.share * 100) + '%' : '') + '. Минулий рік: ' + fmt(b.last) + '. Ти отримав' + g(s, '', 'ла') + ' з нього дивідендів: ' + fmt(b.paid) + '.', opts: o };
}

// ---- Переїзд ----
A({ id: 'tocity', tab: 'move', n: 'Переїхати в місто', d: 'Більше роботи, дорожче життя', show: function (s) { return !s.urban && s.age >= 16; },
  run: function (s) { s.urban = true; s.withParents = false; if (s.job && JOB[s.job.id] && JOB[s.job.id].id === 'farmer') endJob(s, 'переїзд'); add(s, { happy: -3 }); s.friends = Math.floor(s.friends / 2); mark(s, 'Переїзд у місто'); return 'Ти ' + g(s, 'переїхав', 'переїхала') + ' до міста.'; } });
A({ id: 'tovillage', tab: 'move', n: 'Переїхати в село', d: 'Спокій і дешевше', show: function (s) { return s.urban && s.age >= 30; },
  run: function (s) { s.urban = false; if (s.job && JOB[s.job.id].urban) endJob(s, 'переїзд'); add(s, { happy: 3 }); return 'Ти перебрав' + g(s, 'ся', 'лася') + ' за місто.'; } });
function emigrate(s, code, how) {
  var from = C(s);
  s.country = code; s.immigrant = code !== s.birth; s.immYrs = 0;
  if (s.countries.indexOf(code) < 0) s.countries.push(code);
  if (s.job) endJob(s, 'еміграція');
  s.biz.slice().forEach(function (b) { closeBiz(s, b, 'продано через переїзд', bizValue(s, b) * 0.6); });
  s.friends = Math.floor(s.friends * 0.3); s.withParents = false; s.urban = true;
  if (s.home) { s.money += s.home.val; s.home = null; }
  s.own.homeLvl = 0; if (s.own.car && s.own.car !== 'bike') { s.money += s.own.carVal * 0.8; s.own.car = null; s.own.carVal = 0; }
  if (s.partner && !s.partner.married) { s.partner = null; s.exes++; }
  add(s, { happy: -6 });
  mark(s, 'Переїзд: ' + from.name + ' → ' + COUNTRIES[code].name);
  return 'Ти ' + g(s, 'переїхав', 'переїхала') + ' до ' + COUNTRIES[code].name + ' ' + COUNTRIES[code].flag + ' (' + how + '). Нова мова, нові правила, нове життя.';
}
A({ id: 'emigrate', tab: 'move', n: 'Емігрувати', d: 'Робоча віза, навчання, біженство, лотерея', show: function (s) { return s.age >= 17; },
  run: function (s) {
    var o = [];
    EMIGRATE_TO.filter(function (c) { return c !== s.country; }).forEach(function (code) {
      var d = COUNTRIES[code], open = OPENNESS[code] || 0.3, cost = d.median * 0.08;
      var lang = workLang(s, code);
      var work = s.edu >= 4 && s.age <= 50 ? (hasRecord(s) ? 0.3 : 1) * clamp(open * 0.55 * (0.15 + lang) * (s.edu >= 5 ? 1.2 : 0.7) * (1 + Math.min(10, yearsWorked(s)) / 12) * (s.job && JOB[s.job.id] && JOB[s.job.id].g ? 1.4 : 1), 0.02, 0.8) : 0;
      var studyP = s.age <= 30 && s.edu >= 3 && code !== 'SA' ? clamp(open * 0.8 * (s.gpa / 100) * (0.3 + lang), 0.02, 0.8) : 0;
      var ref = cf(s) === 2 && ['PL', 'DE', 'CA', 'SE', 'FR', 'ES', 'IT', 'GB'].indexOf(code) >= 0 ? (['PL', 'DE'].indexOf(code) >= 0 ? 0.85 : 0.5) : 0;
      if (work) o.push({ t: d.flag + ' ' + d.name + ' — робоча віза', sub: 'шанс ' + Math.round(work * 100) + '% · мова: ' + LANG_NAMES[d.lang] + ' ' + Math.round(langLevel(s, d.lang)) + (d.engOk && d.lang !== 'en' ? ' (вистачить і англійської)' : '') + ' · медіана ' + fmt(d.median), dis: s.money < cost,
        f: function () { s.money -= cost; if (chance(work)) return emigrate(s, code, 'робоча віза'); return 'Візу до ' + d.name + ' не дали.'; } });
      if (studyP) { var fee = d.fee * d.median * 1.5 + d.median * 0.3; o.push({ t: d.flag + ' ' + d.name + ' — навчання', sub: 'шанс ' + Math.round(studyP * 100) + '% · перший рік ~' + fmt(fee), dis: s.money < fee,
        f: function () { if (!chance(studyP)) return 'Університет у ' + d.name + ' відмовив.'; s.money -= fee; var r = emigrate(s, code, 'студентська віза'); return { title: 'Спеціальність', text: r + ' Обери, що вивчати.', opts: uniOpts(s) }; } }); }
      if (ref) o.push({ t: d.flag + ' ' + d.name + ' — як біженець', sub: 'шанс ' + Math.round(ref * 100) + '% · через війну вдома', f: function () { if (chance(ref)) return emigrate(s, code, 'тимчасовий захист'); return 'Виїхати не вдалося.'; } });
      if (code === 'US' && !s.used.dv) o.push({ t: '🇺🇸 Лотерея грін-карт', sub: 'шанс ~1%, безкоштовно', f: function () { s.used.dv = 1; if (chance(0.012) && s.edu >= 3) return emigrate(s, 'US', 'виграш у лотерею грін-карт'); return 'У лотерею цього року не пощастило.'; } });
    });
    var curGdp = C(s).gdp;
    COUNTRY_LIST.filter(function (d) { return d.code !== s.country && EMIGRATE_TO.indexOf(d.code) < 0 && (d.gdp <= curGdp * 1.3 || d.law < 0.5); }).sort(function (a, b) { return a.name.localeCompare(b.name, 'uk'); }).forEach(function (d) {
      var cost = Math.max(M(s), d.median) * 0.05;
      o.push({ t: d.flag + ' ' + d.name + ' — просто переїхати', sub: 'шанс ~85% · ' + fmt(cost) + ' · закон: ' + (d.law > 0.75 ? 'суворий' : d.law > 0.5 ? 'працює' : 'слабкий') + (NARCO.indexOf(d.code) >= 0 ? ' · тут діють картелі' : '') + (d.conflict === 2 ? ' · війна' : ''), dis: s.money < cost,
        f: function () { s.money -= cost; if (chance(0.85)) return emigrate(s, d.code, 'переїзд'); return 'На кордоні щось пішло не так — довелося повернутися.'; } });
    });
    if (s.immigrant) o.unshift({ t: COUNTRIES[s.birth].flag + ' Повернутися додому', sub: COUNTRIES[s.birth].name, f: function () { return emigrate(s, s.birth, 'повернення'); } });
    return { title: 'Еміграція', text: 'Шанс залежить від освіти, мови країни, досвіду й відкритості. Після переїзду платять менше, поки не вивчиш мову і не адаптуєшся; мова підтягується сама, якщо живеш там.', opts: o.length ? o : [{ t: 'Немає варіантів', sub: 'потрібна освіта від коледжу або вік до 30 для навчання', f: function () { return 'Поки варіантів немає.'; } }] };
  } });
function yearsWorked(s) { return s.workYears; }

function availableActions(s, tab) {
  return ACTIONS.filter(function (a) { return a.tab === tab && s.alive && (!s.prison || a.prisonOk) && a.show(s); });
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
A({ id: 'shadow', tab: 'risk', n: 'Робота «в конверті»', d: 'Без податків; невеликий ризик штрафу', show: function (s) { return s.age >= 16; },
  run: function (s) { var e = M(s) * rnd(0.1, 0.2); if (chance(0.06 * (0.4 + C(s).law))) { var f = e * 2; s.money -= f; return 'Податкова помітила неоформлений заробіток — штраф ' + fmt(f) + '.'; } s.shadow = (s.shadow || 0) + e; s.lastShadow = s.age; return 'Цього року ти отримаєш ' + fmt(e) + ' без податків.'; } });
A({ id: 'steal', tab: 'risk', n: 'Дрібна крадіжка', d: 'Мало грошей, високий ризик', show: function (s) { return s.age >= 12; },
  run: function (s) { if (crimeCaught(s, 0.3)) { if (s.age < 18) { s.flags.juvenile = 1; add(s, { happy: -8 }); s.parents.forEach(function (p) { p.rel -= 15; }); s.heat = 0; return 'Тебе спіймали. Поліція, ювенальний облік і дуже важка розмова з батьками.'; } if (chance(0.5)) { var f = M(s) * 0.1; s.money -= f; s.record++; s.recordAge = s.age; s.heat = 0; return 'Спіймали: штраф ' + fmt(f) + ' і судимість.'; } return busted(s, ri(1, 2), 'крадіжку'); }
    var e = M(s) * rnd(0.01, 0.06); s.money += e; add(s, { happy: -2 }); return 'Вкрадено на ' + fmt(e) + '. На душі неспокійно.'; } });
A({ id: 'scheme', tab: 'risk', n: 'Афера', d: 'Гроші, якщо пощастить. Кожна наступна — ризикованіша', show: function (s) { return s.age >= 18; },
  run: function (s) { if (crimeCaught(s, 0.3 - s.st.smarts / 600)) return busted(s, ri(2, 6), 'шахрайство');
    var e = M(s) * rnd(0.15, 0.9) * (s.st.smarts / 70); s.money += e; return 'Афера вдалася: +' + fmt(e) + '. Але тепер за тобою можуть стежити.'; } });
A({ id: 'smuggle', tab: 'risk', n: 'Контрабанда через кордон', d: 'Ризиковано; залежить від того, як працює закон у країні', show: function (s) { return s.age >= 18 && C(s).law < 0.7; },
  run: function (s) { if (crimeCaught(s, 0.28)) return busted(s, ri(2, 5), 'контрабанду'); var e = M(s) * rnd(0.2, 0.8); s.money += e; return 'Партія пройшла: +' + fmt(e) + '.'; } });

// ---- Угруповання ----
A({ id: 'join_gang', tab: 'risk', n: 'Вступити в угруповання', d: function (s) { return cartel(s) ? 'Картельна країна: поліція майже не заважає, але вбивають часто' : NARCO.indexOf(s.country) >= 0 ? 'Картель: великі гроші, висока смертність' : C(s).law < 0.5 ? 'Поліція тут слабка — ризик арешту нижчий' : 'Банда: поліція тут працює'; }, show: gangOK,
  run: function (s) {
    var p = clamp(0.3 + (s.st.social - 50) / 150 + s.sk.sport / 300 + (s.q <= 2 ? 0.15 : 0) - (s.age > 30 ? 0.2 : 0) + (cartel(s) ? 0.15 : 0), 0.05, 0.9);
    if (!chance(p)) return 'Тебе не взяли — «не наш».';
    s.gang = { rank: 0, yrs: 0, perf: 50, heat: 0, kind: gangKind(s) };
    mark(s, 'Вступ: ' + s.gang.kind); add(s, { happy: 2 }); s.parents.forEach(function (x) { x.rel -= 10; });
    return 'Ти тепер у ' + (s.gang.kind === 'картель' ? 'картелі' : s.gang.kind === 'банда' ? 'банді' : 'угрупованні') + '. Шляху назад може не бути.';
  } });
A({ id: 'job_gang', tab: 'risk', n: 'Взяти серйозну справу', d: 'Більше грошей і шанс на підвищення, але більше уваги поліції', show: function (s) { return !!s.gang; },
  run: function (s) { add(s, { happy: -2 }); return 'Справу взято. Наслідки — наприкінці року.'; } });
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
  var opts = VEHICLES.filter(function (v) { return v.id !== o.car; }).map(function (v) {
    var price = v.p * c.median, need = price - trade;
    return { t: v.n + ' — ' + fmt(price), sub: 'утримання ~' + fmt(v.up * c.median) + '/рік · щастя +' + v.hap + (v.soc ? ', статус +' + v.soc : '') + (v.id !== 'bike' ? ' · менше часу в дорозі' : ', здоровʼя +') + (trade ? ' · старе в залік ' + fmt(trade) : ''), dis: s.money < need || s.age < (v.id === 'bike' ? 6 : v.id === 'scooter' ? 16 : 18),
      f: function () { s.money -= need; o.car = v.id; o.carVal = price; mark(s, 'Купив' + g(s, '', 'ла') + ': ' + v.n.toLowerCase()); return 'Тепер у тебе ' + v.n.toLowerCase() + '.'; } };
  });
  if (o.car) opts.push({ t: 'Продати ' + VEHICLE[o.car].n.toLowerCase(), sub: fmt(o.carVal), f: function () { s.money += o.carVal; o.car = null; o.carVal = 0; return 'Транспорт продано.'; } });
  return { title: 'Транспорт', text: 'Ціни — у твоїй країні. Транспорт щороку дешевшає на ~13%.', opts: opts };
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
