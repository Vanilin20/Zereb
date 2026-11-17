// ЖЕРЕБ — випадкові події. run(s) повертає рядок (просто запис у життєпис) або { text, opts } (вибір).
function ev(id, a, w, cond, run, once) { EVENTS.push({ id: id, a: a, w: w, if: cond, run: run, once: !!once }); }
function O(t, f, sub) { return { t: t, f: f, sub: sub }; }
var poor = function (s) { return C(s).gdp < 10; };
var rich = function (s) { return C(s).gdp > 35; };

// ---------- Раннє дитинство ----------
ev('word', [1, 2], 6, null, function (s) { return 'Твоє перше слово — «' + pick(['мама', 'тато', 'дай', 'ні', 'кіт']) + '».'; }, true);
ev('walk', [1, 1], 6, null, function (s) { return g(s, 'Ти зробив', 'Ти зробила') + ' перші кроки.'; }, true);
ev('kidsick', [0, 5], function (s) { return C(s).u5 / 15; }, null, function (s) {
  var d = pick(C(s).u5 > 35 ? ['малярію', 'кишкову інфекцію', 'пневмонію', 'кір'] : ['грип', 'вітрянку', 'ангіну', 'бронхіт']);
  add(s, { health: -ri(5, 15) }); return g(s, 'Ти тяжко захворів', 'Ти тяжко захворіла') + ' на ' + d + '. Батьки не спали ночами.';
});
ev('daycare', [3, 5], 3, function (s) { return s.urban && C(s).gdp > 8; }, function (s) {
  return { text: 'Тебе віддали в садочок. Навколо купа незнайомих дітей.', opts: [
    O('Знайти друзів', function () { add(s, { social: 5 }); if (chance(.6)) s.friends++; return 'У садочку ти швидко знайш' + g(s, 'ов', 'ла') + ' друзів.'; }),
    O('Плакати й проситися додому', function () { add(s, { happy: -3 }); return 'Перші тижні в садочку були сльозами.'; })] };
}, true);
ev('fall', [2, 10], 2, null, function (s) { add(s, { health: -6 }); return g(s, 'Ти впав', 'Ти впала') + ' з ' + pick(['дерева', 'гойдалки', 'велосипеда', 'паркана']) + ' і ' + pick(['зламав' + g(s, '', 'ла') + ' руку', 'розбив' + g(s, '', 'ла') + ' коліно', 'отримав' + g(s, '', 'ла') + ' струс']) + '.'; });
ev('pet', [4, 13], 2, null, function (s) {
  var a = pick(['цуценя', 'кошеня']);
  return { text: 'Сусіди віддають ' + a + '.', opts: [
    O('Вмовити батьків узяти', function () { if (chance(0.3 + s.q * 0.12)) { s.flags.pet = 1; add(s, { happy: 10 }); return 'Тепер у тебе є ' + a + ' — найкращий друг.'; } add(s, { happy: -4 }); return 'Батьки сказали «ні».'; }),
    O('Пройти мимо', function () { return 'Ти пройш' + g(s, 'ов', 'ла') + ' мимо.'; })] };
}, true);

// ---------- Дитинство ----------
ev('bully', [7, 15], 3, function (s) { return !!s.study; }, function (s) {
  return { text: 'Старшокласник відбирає в тебе гроші на обід.', opts: [
    O('Дати відсіч', function () { if (chance(0.25 + s.sk.sport / 150 + s.st.health / 300)) { add(s, { social: 6, happy: 4 }); return 'Ти дав' + g(s, '', 'ла') + ' відсіч — більше не чіпають.'; } add(s, { health: -8, happy: -6 }); return 'Бійку ти програв' + g(s, '', 'ла') + '.'; }, 'спорт допомагає'),
    O('Розповісти вчителю', function () { if (chance(.55)) { add(s, { happy: 2 }); return 'Вчителька розібралася.'; } add(s, { social: -4, happy: -4 }); return 'Стало тільки гірше: тепер ти «стукач».'; }),
    O('Мовчки віддавати', function () { add(s, { happy: -7 }); return 'Ти віддавав' + g(s, '', 'ла') + ' гроші весь рік.'; })] };
});
ev('music_t', [6, 12], 2, function (s) { return !!s.study; }, function (s) {
  return { text: 'Вчителька музики помітила, що в тебе гарний слух.', opts: [
    O('Записатися в музичну школу', function () { s.flags.tal_music = 1; add(s, { music: 15, happy: 2 }); return 'Музична школа — і талант, що росте швидше.'; }, 'хобі «Музика» росте в 1,5 раза швидше'),
    O('Ні, ганяти мʼяча цікавіше', function () { add(s, { sport: 5 }); return 'Музика — не твоє.'; })] };
}, true);
ev('art_t', [5, 12], 2, null, function (s) {
  return { text: 'Твій малюнок повісили на шкільну виставку.', opts: [
    O('Піти в художню студію', function () { s.flags.tal_art = 1; add(s, { art: 15 }); return 'Студія розкрила твій талант до малювання.'; }, 'хобі «Малювання» росте швидше'),
    O('Це було випадково', function () { return 'Ти забув' + g(s, '', 'ла') + ' про малювання.'; })] };
}, true);
ev('sportclub', [7, 14], 2, null, function (s) {
  var sp = pick(['футболу', 'боротьби', 'плавання', 'легкої атлетики', 'баскетболу']);
  return { text: 'Тренер секції ' + sp + ' кличе тебе на перегляд.', opts: [
    O('Піти', function () { s.flags.tal_sport = 1; add(s, { sport: 15, health: 4 }); return 'Ти займаєшся в секції ' + sp + '.'; }, 'хобі «Спорт» росте швидше'),
    O('Не хочу', function () { return 'Спорт — не твоє.'; })] };
}, true);
ev('childlabor', [8, 14], 4, function (s) { return s.q <= 2 && poor(s) && !!s.study; }, function (s) {
  return { text: 'Родині бракує грошей. Батьки просять тебе ' + pick(['працювати в полі', 'торгувати на ринку', 'доглядати худобу', 'носити воду й дрова']) + ' замість школи. (Факт: ≈160 млн дітей у світі працюють — ILO/UNICEF, 2020.)', opts: [
    O('Допомагати родині', function () { s.money += M(s) * 0.05; s.parents.forEach(function (p) { p.rel += 8; }); if (chance(.5)) { s.study = null; mark(s, 'Покинув' + g(s, '', 'ла') + ' школу заради роботи'); return 'Ти покинув' + g(s, '', 'ла') + ' школу, щоб працювати. Родина вдячна.'; } add(s, { gpa: -15 }); return 'Ти працюєш і ходиш до школи через день.'; }),
    O('Наполягти на школі', function () { s.parents.forEach(function (p) { p.rel -= 10; }); add(s, { happy: -3, gpa: 5 }); return 'Ти відстояв' + g(s, '', 'ла') + ' своє право вчитися.'; })] };
});
ev('olympiad', [9, 17], 2, function (s) { return s.gpa > 72 && s.study && s.study.t === 'school'; }, function (s) {
  var sub = pick(['математики', 'фізики', 'хімії', 'історії', 'біології', 'інформатики']);
  return { text: 'Тебе відправляють на олімпіаду з ' + sub + '.', opts: [
    O('Готуватися ночами', function () { add(s, { smarts: 4, happy: -3 }); if (chance((s.st.smarts - 35) / 100)) { s.flags.olymp = 1; mark(s, 'Олімпіада з ' + sub); return 'Перше місце! Це допоможе при вступі.'; } return 'Призове місце не далося, але знань стало більше.'; }),
    O('Піти як є', function () { if (chance((s.st.smarts - 55) / 120)) { s.flags.olymp = 1; return 'Несподівано — призове місце!'; } return 'Без нагород.'; })] };
});
ev('pc', [8, 14], 3, function (s) { return !s.flags.pc && (s.q >= 3 || C(s).gdp > 15); }, function (s) {
  s.flags.pc = 1;
  return { text: 'Удома зʼявився компʼютер!', opts: [
    O('Грати в ігри', function () { add(s, { happy: 8 }); return 'Ти пропадаєш в іграх.'; }),
    O('Спробувати зробити свою гру', function () { s.flags.tal_code = 1; add(s, { code: 12, smarts: 2 }); return 'Перша «гра» з квадратиків — і інтерес до програмування.'; }, 'хобі «Програмування» росте швидше')] };
}, true);
ev('pfight', [5, 16], 2, function (s) { return s.parents.filter(function (p) { return p.alive; }).length === 2 && !s.flags.divorced; }, function (s) {
  if (chance(.35)) { s.flags.divorced = 1; add(s, { happy: -10 }); mark(s, 'Розлучення батьків'); return 'Батьки розлучилися. Ти живеш з мамою.'; }
  add(s, { happy: -4 }); return 'Батьки постійно сваряться. Вдома важко.';
});
ev('wallet', [8, 70], 1, null, function (s) {
  var m = M(s) * rnd(0.01, 0.05);
  return { text: 'Ти знайш' + g(s, 'ов', 'ла') + ' гаманець з ' + fmt(m) + ' і документами.', opts: [
    O('Повернути власнику', function () { add(s, { happy: 5, social: 2 }); if (chance(.3)) { s.money += m * 0.2; return 'Власник дуже дякував і дав винагороду.'; } return 'Власник був дуже вдячний.'; }),
    O('Залишити гроші собі', function () { s.money += m; add(s, { happy: -2 }); return 'Гроші твої, але на душі неприємно.'; })] };
});
ev('bestfriend', [6, 12], 3, null, function (s) { s.friends++; add(s, { social: 4, happy: 5 }); return 'Зʼявився найкращий друг — ' + nameFrom(s.country, s.sex) + '.'; }, true);

// ---------- Підлітковий вік ----------
ev('crush', [12, 17], 4, null, function (s) {
  var n = nameFrom(s.country, s.pref === 'same' ? s.sex : (s.sex === 'm' ? 'f' : 'm'));
  return { text: g(s, 'Ти закохався', 'Ти закохалася') + ' в ' + n + '.', opts: [
    O('Зізнатися', function () { if (chance(0.3 + s.st.social / 150)) { add(s, { happy: 12 }); mark(s, 'Перше кохання: ' + n); return n + ' відповіли взаємністю. Перше кохання!'; } add(s, { happy: -10 }); return n + ' сказали, що «давай будемо друзями».'; }),
    O('Мовчати', function () { add(s, { happy: -2 }); return 'Ти так і не наважи' + g(s, 'вся', 'лася') + '.'; })] };
}, true);
ev('smoke', [13, 20], 3, function (s) { return !s.flags.smoker && !s.flags.nosmoke; }, function (s) {
  return { text: 'Друзі за школою пропонують закурити. (Факт: тютюн щороку вбиває понад 8 млн людей — WHO.)', opts: [
    O('Спробувати', function () { if (chance(.5)) { s.flags.smoker = 1; return 'Одна сигарета — і звичка. Тепер ти куриш.'; } return 'Гидко. Більше не хочеться.'; }, 'може стати звичкою'),
    O('Відмовитися', function () { s.flags.nosmoke = 1; add(s, { social: -1 }); return 'Ти відмови' + g(s, 'вся', 'лася') + '.'; })] };
});
ev('party', [14, 22], 3, function (s) { return !!s.study; }, function (s) {
  return { text: 'Велика вечірка в ніч перед важливим іспитом.', opts: [
    O('Піти', function () { add(s, { happy: 6, social: 3, gpa: -8 }); if (chance(.15)) { s.flags.drink = 1; return 'Вечірка вдалася. Алкоголь стає звичкою.'; } return 'Вечірка була топ. Іспит — не дуже.'; }),
    O('Вчитися', function () { add(s, { gpa: 6, happy: -2 }); return 'Іспит складено добре.'; })] };
});
ev('cheat', [13, 18], 2, function (s) { return !!s.study; }, function (s) {
  return { text: 'Однокласник пропонує купити відповіді на іспит.', opts: [
    O('Купити', function () { if (chance(.25)) { add(s, { gpa: -20, happy: -8 }); return 'Тебе спіймали. Скандал і анульований іспит.'; } add(s, { gpa: 10 }); return 'Іспит складено «на відмінно».'; }),
    O('Відмовитися', function () { return 'Ти склав' + g(s, '', 'ла') + ' іспит сам' + g(s, '', 'а') + '.'; })] };
});
ev('exchange', [13, 17], 2, function (s) { return (s.q >= 4 || s.gpa > 85) && !!s.study; }, function (s) {
  var d = pick(COUNTRY_LIST.filter(function (c) { return c.gdp > 40 && c.code !== s.country; }));
  return { text: 'Є можливість поїхати за обміном до ' + d.name + ' ' + d.flag + ' на семестр.', opts: [
    O('Поїхати', function () { add(s, { eng: 15, social: 5, happy: 8 }); s.stat.travels++; s.flags.exchange = d.code; return 'Семестр у ' + d.name + ' змінив твій світогляд. Англійська значно краща.'; }),
    O('Залишитися', function () { return 'Може, колись іншим разом.'; })] };
}, true);
ev('viral', [13, 40], 1, function (s) { return C(s).gdp > 4; }, function (s) { s.fame = clamp(s.fame + 15); add(s, { social: 4 }); return 'Твоє відео випадково завірусилось. Слава росте.'; });
ev('tutor', [14, 17], 2, function (s) { return s.q >= 3 && s.study && s.study.t === 'school'; }, function (s) {
  return { text: 'Батьки пропонують найняти репетитора перед вступом.', opts: [
    O('Так', function () { add(s, { gpa: 10, smarts: 2, happy: -2 }); return 'Заняття з репетитором підтягнули бал.'; }),
    O('Сам' + g(s, '', 'а') + ' впораюся', function () { return 'Ти готуєшся самостійно.'; })] };
}, true);

// ---------- Молодість ----------
ev('roommate', [17, 23], 2, function (s) { return s.study && s.study.t !== 'school'; }, function (s) {
  return { text: 'Сусід по гуртожитку щоночі влаштовує гулянки.', opts: [
    O('Приєднатися', function () { add(s, { happy: 5, social: 4, gpa: -6 }); s.friends++; return 'Гуртожиток — найвеселіші роки.'; }),
    O('Поскаржитися коменданту', function () { add(s, { gpa: 3, social: -3 }); return 'Стало тихіше, але сусід образився.'; }),
    O('Зняти житло', function () { s.money -= M(s) * 0.15; add(s, { gpa: 4 }); return 'Окреме житло — дорожче, зате тиша.'; })] };
});
ev('cofounder', [20, 40], 2, function (s) { return s.money > M(s) * 0.3; }, function (s) {
  var f = nameFrom(s.country, chance(.5) ? 'm' : 'f');
  return { text: 'Друг ' + f + ' кличе тебе співзасновником стартапу. Потрібно вкласти ' + fmt(M(s) * 0.3) + '.', opts: [
    O('Увійти в справу', function () { s.money -= M(s) * 0.3; var r = R(); if (r < 0.6) { add(s, { biz: 8, happy: -5 }); return 'Стартап закрився за рік. Гроші втрачено, але досвід є.'; } if (r < 0.9) { s.money += M(s) * 0.5; add(s, { biz: 10 }); return 'Стартап продали невеликій компанії — ти в плюсі.'; } var v = M(s) * rnd(5, 40); s.money += v; mark(s, 'Успішний стартап'); return 'Стартап вистрілив! Твоя частка — ' + fmt(v) + '.'; }, 'ризиковано'),
    O('Відмовитися', function () { return 'Ти відмови' + g(s, 'вся', 'лася') + '.'; })] };
});
ev('crypto', [18, 50], 1, function (s) { return s.money > M(s) * 0.1; }, function (s) {
  var coin = pick(['$FROG', '$MOON', 'NeuroCoin', 'MetaKitty', '$WAGMI']);
  return { text: 'Знайомий радить вкластися в нову монету ' + coin + ': «це точно х100».', opts: [
    O('Вкласти 20% заощаджень', function () { var a = s.money * 0.2; s.money -= a; var r = R(); if (r < 0.65) return coin + ' виявився скамом. −' + fmt(a) + '.'; if (r < 0.9) { s.money += a * rnd(0.5, 2); return coin + ' трохи погойдався — ти ' + 'вийш' + g(s, 'ов', 'ла') + ' майже при своїх.'; } var w = a * rnd(5, 30); s.money += w; mark(s, 'Розбагатів' + g(s, '', 'ла') + ' на ' + coin); return coin + ' справді злетів! Ти забрав' + g(s, '', 'ла') + ' ' + fmt(w) + '.'; }),
    O('Не вʼязуватися', function () { return 'Ти не повір' + g(s, 'ив', 'ила') + ' в ' + coin + '.'; })] };
});
ev('scam', [16, 85], 1.2, function (s) { return s.money > M(s) * 0.05; }, function (s) {
  return { text: 'Дзвонять «зі служби безпеки банку»: «З вашої картки списують гроші, продиктуйте код з SMS».', opts: [
    O('Продиктувати код', function () { var l = s.money * 0.4; s.money -= l; add(s, { happy: -8 }); return 'Шахраї вкрали ' + fmt(l) + '.'; }),
    O('Покласти трубку', function () { return 'Ти поклав' + g(s, '', 'ла') + ' трубку. Це були шахраї.'; })] };
});
ev('witness', [20, 40], 2, function (s) { return s.friends > 0; }, function (s) { s.money -= M(s) * 0.05; add(s, { social: 4, happy: 5 }); return 'Ти ' + g(s, 'був свідком', 'була свідкою') + ' на весіллі найкращого друга.'; });
ev('abroad_offer', [22, 45], 2, function (s) { return s.edu >= 5 && s.sk.eng >= 50 && s.job && !s.immigrant; }, function (s) {
  var d = COUNTRIES[pick(EMIGRATE_TO.filter(function (c) { return c !== s.country && COUNTRIES[c].gdp > C(s).gdp; }))];
  if (!d) return null;
  return { text: 'Міжнародна компанія пропонує тобі роботу в ' + d.name + ' ' + d.flag + ' з оплатою переїзду.', opts: [
    O('Переїхати', function () { if (!s.job) return 'Пропозиція згоріла.'; var j = JOB[s.job.id]; var r = emigrate(s, d.code, 'робоча віза'); takeJob(s, j); return r; }, 'та сама професія, медіанний дохід там ' + fmt(d.median)),
    O('Залишитися вдома', function () { return 'Дім є дім.'; })] };
});
ev('burnout', [22, 60], 3, function (s) { return s.job && JOB[s.job.id] && JOB[s.job.id].st >= 55; }, function (s) {
  return { text: 'Ти відчуваєш, що вигораєш на роботі.', opts: [
    O('Взяти відпустку', function () { add(s, { happy: 8, health: 3 }); if (s.job) s.job.perf -= 8; return 'Відпустка допомогла.'; }),
    O('Терпіти', function () { add(s, { happy: -8, health: -5 }); if (s.job) s.job.perf += 5; return 'Ти стиснув' + g(s, '', 'ла') + ' зуби й працюєш далі.'; }),
    O('Звільнитися', function () { if (!s.job) return 'Ти вже не працюєш там.'; endJob(s, 'вигорання'); add(s, { happy: 6 }); return 'Ти звільнив' + g(s, 'ся', 'ася') + '. Час подумати, що далі.'; })] };
});
ev('boss', [18, 65], 2, function (s) { return s.job && !s.job.teen && s.job.lvl < 3; }, function (s) {
  return { text: 'Начальник накричав на тебе при всіх через чужу помилку.', opts: [
    O('Відповісти різко', function () { if (!s.job) return 'Вже неважливо.'; if (chance(.3)) { endJob(s, 'конфлікт'); return 'Тебе звільнили після сварки.'; } add(s, { social: 3 }); return 'Начальник вибачився. Колеги поважають.'; }),
    O('Промовчати', function () { add(s, { happy: -5 }); return 'Неприємний осад залишився.'; }),
    O('Поговорити наодинці', function () { if (s.job && chance(0.4 + s.st.social / 200)) { s.job.perf += 8; return 'Розмова вийшла конструктивною.'; } return 'Розмова нічого не змінила.'; })] };
});
ev('relocate', [25, 50], 2, function (s) { var j = s.job && JOB[s.job.id]; return j && j.max && s.job.lvl < j.max && s.job.lvl >= 1; }, function (s) {
  return { text: 'Тобі пропонують підвищення, але треба переїхати в інше місто.', opts: [
    O('Погодитися', function () { if (!s.job || !JOB[s.job.id] || s.job.lvl >= JOB[s.job.id].max) return 'Пропозиція вже неактуальна.'; s.job.lvl++; s.job.lvlYrs = 0; s.friends = Math.floor(s.friends / 2); if (s.partner) s.partner.rel -= 8; return 'Нове місто, нова посада: ' + lvName(JOB[s.job.id], s.job.lvl).toLowerCase() + '.'; }),
    O('Відмовитися', function () { return 'Ти залишив' + g(s, 'ся', 'ася') + ' на місці.'; })] };
});
ev('inherit', [20, 70], 0.4, null, function (s) { var v = M(s) * rnd(0.3, 3); s.money += v; return 'Далека родичка залишила тобі спадок: ' + fmt(v) + '.'; }, true);
ev('lottery', [18, 90], 0.15, null, function (s) { var v = M(s) * rnd(20, 100); s.money += v; mark(s, 'Виграш у лотерею'); return 'Ти виграв' + g(s, '', 'ла') + ' у лотерею ' + fmt(v) + '!'; }, true);
ev('crash', [16, 85], function (s) { return C(s).gdp < 20 ? 0.6 : 0.3; }, null, function (s) { var h = ri(8, 30); add(s, { health: -h }); var cost = M(s) * 0.1; s.money -= cost; if (h > 27 && chance(.04)) { die(s, 'ДТП'); return null; } return 'Ти потрапив' + g(s, '', 'ла') + ' у ДТП. ' + (h > 20 ? 'Довгі місяці лікування.' : 'Відбув' + g(s, 'ся', 'лася') + ' синцями.') + ' (Факт: у ДТП щороку гинуть ≈1,19 млн людей — WHO, 2023.)'; });
ev('robbed', [14, 80], function (s) { return C(s).gdp < 15 ? 1.2 : 0.4; }, null, function (s) { var l = Math.min(s.money, M(s) * rnd(0.03, 0.2)); s.money -= l; add(s, { happy: -6 }); return 'Тебе пограбували на вулиці' + (l > 1 ? ', забрали ' + fmt(l) : '') + '.'; });
ev('flood', [0, 90], function (s) { return ['BD', 'PH', 'ID', 'PK', 'IN', 'MM', 'VN', 'MZ', 'MG', 'NG', 'HT', 'CN'].indexOf(s.country) >= 0 ? 1.5 : 0.3; }, null, function (s) {
  var d = pick(['Повінь затопила', 'Тайфун зруйнував', 'Землетрус пошкодив', 'Буревій зніс дах на']);
  if (s.home) s.home.val *= 0.8; s.money -= Math.min(s.money, M(s) * 0.15); add(s, { happy: -8 });
  return d + ' ваш район. Багато чого довелося відновлювати.';
});
ev('side', [18, 55], 1.5, null, function (s) {
  return { text: 'Знайомий пропонує підробіток на вихідних.', opts: [
    O('Погодитися', function () { s.money += M(s) * 0.12; add(s, { happy: -3, health: -1 }); return 'Підробіток приніс ' + fmt(M(s) * 0.12) + '.'; }),
    O('Вихідні — це святе', function () { add(s, { happy: 2 }); return 'Ти відпочив' + g(s, '', 'ла') + '.'; })] };
});
ev('friendloan', [20, 70], 2, function (s) { return s.money > M(s) * 0.2 && s.friends > 0; }, function (s) {
  var a = M(s) * 0.15;
  return { text: 'Друг просить позичити ' + fmt(a) + '.', opts: [
    O('Позичити', function () { s.money -= a; if (chance(.55)) { s.money += a; return 'Друг повернув борг.'; } s.friends = Math.max(0, s.friends - 1); return 'Друг так і не повернув гроші. Дружба зіпсувалася.'; }),
    O('Відмовити', function () { if (chance(.4)) s.friends = Math.max(0, s.friends - 1); return 'Ти відмови' + g(s, 'в', 'ла') + '.'; })] };
});
ev('war_vol', [14, 70], 3, function (s) { return cf(s) === 2; }, function (s) {
  return { text: 'Твоє місто потребує допомоги: волонтери збирають гуманітарну допомогу.', opts: [
    O('Долучитися', function () { s.money -= Math.min(s.money, M(s) * 0.05); add(s, { happy: 4, social: 4 }); if (chance(.4)) s.friends++; return 'Ти волонтериш — і знаходиш однодумців.'; }),
    O('Донатити', function () { s.money -= Math.min(s.money, M(s) * 0.08); add(s, { happy: 3 }); return 'Ти допоміг' + g(s, '', 'ла') + ' грошима.'; }),
    O('Зараз немає сил', function () { return 'Ти береш' + g(s, '', '') + ' паузу.'; })] };
});
ev('war_evac', [0, 75], 2, function (s) { return cf(s) === 2 && !s.immigrant; }, function (s) {
  var dest = s.country === 'UA' ? 'PL' : pick(['DE', 'PL', 'CA']);
  return { text: 'Через бойові дії в регіоні родина вирішує, чи виїжджати.', opts: [
    O('Виїхати за кордон (' + COUNTRIES[dest].name + ')', function () { return emigrate(s, dest, 'тимчасовий захист'); }),
    O('Переїхати в безпечніший регіон', function () { add(s, { happy: -6 }); s.money -= Math.min(s.money, M(s) * 0.1); if (s.job && chance(.5)) endJob(s, 'переїзд'); return 'Ви переїхали в безпечніше місто.'; }),
    O('Залишитися вдома', function () { add(s, { happy: -8 }); if (chance(.08)) { add(s, { health: -25 }); return 'Під час обстрілу тебе поранило.'; } return 'Ви залишилися. Ночі в укритті стали звичними.'; })] };
});
ev('pandemic', [1, 95], 0.4, function (s) { return s.year > 2030; }, function (s) {
  return { text: 'У світі почалася пандемія нового вірусу.', opts: [
    O('Вакцинуватися й обережно жити', function () { add(s, { happy: -4 }); if (chance(.03)) add(s, { health: -10 }); return 'Пандемія минула для тебе легко.'; }),
    O('Жити як раніше', function () { if (chance(s.age > 60 ? 0.3 : 0.1)) { add(s, { health: -25 }); if (s.age > 70 && chance(.25)) { die(s, 'ускладнення вірусної інфекції'); return null; } return 'Ти тяжко перехворів' + g(s, '', 'ла') + '.'; } return 'Пронесло.'; })] };
}, true);

// ---------- Дорослість ----------
ev('midlife', [40, 52], 3, null, function (s) {
  return { text: 'Криза середнього віку: здається, життя проходить повз.', opts: [
    O('Купити спорткар', function () { var c = M(s) * 1.5; if (s.money >= c) { s.money -= c; add(s, { happy: 12 }); return 'Спорткар! Сусіди заздрять.'; } add(s, { happy: -3 }); return 'На спорткар грошей немає.'; }),
    O('Знайти нове хобі', function () { var k = pick(['music', 'art', 'cook', 'write', 'craft']); s.sk[k] = clamp(s.sk[k] + 12); add(s, { happy: 8 }); return 'Нове захоплення: ' + SKILL_NAMES[k].toLowerCase() + '.'; }),
    O('Змінити кар’єру', function () { if (s.job) endJob(s, 'зміна карʼєри'); add(s, { happy: 5 }); return 'Ти звільнив' + g(s, 'ся', 'ася') + ', щоб почати щось нове.'; }),
    O('Просто пережити', function () { add(s, { happy: -3 }); return 'Минуло.'; })] };
}, true);
ev('parentill', [25, 70], 3, function (s) { return s.parents.some(function (p) { return p.alive && p.age > 55 && !p.ill; }); }, function (s) {
  var p = pick(s.parents.filter(function (x) { return x.alive && x.age > 55; })); var cost = treatCost(s, 0.7);
  p.ill = true;
  return { text: p.role + ' тяжко захворі' + (p.sex === 'f' ? 'ла' : 'в') + '. Лікування коштує ' + fmt(cost) + '.', opts: [
    O('Оплатити лікування', function () { if (s.money >= cost) s.money -= cost; else { s.debt += cost - s.money; s.money = 0; } if (chance(.7)) p.ill = false; p.rel += 15; return 'Ти оплатив' + g(s, '', 'ла') + ' лікування. ' + (p.ill ? 'Але стан важкий.' : p.role + ' одужує.'); }),
    O('Доглядати самому', function () { add(s, { happy: -6 }); if (s.job) s.job.perf -= 10; p.rel += 10; if (chance(.4)) p.ill = false; return 'Ти доглядаєш ' + (p.sex === 'f' ? 'маму' : 'тата') + ' сам' + g(s, '', 'а') + '.'; }),
    O('Не можу допомогти', function () { add(s, { happy: -8 }); return 'Тобі нічим допомогти.'; })] };
});
ev('kidtrouble', [30, 70], 3, function (s) { return s.kids.some(function (k) { return k.alive && k.age >= 12 && k.age <= 17; }); }, function (s) {
  var k = pick(s.kids.filter(function (x) { return x.alive && x.age >= 12 && x.age <= 17; }));
  return { text: gp(k, 'Твій син', 'Твоя донька') + ' ' + k.name + ' ' + pick(['побив' + gp(k, 'ся', 'ла') + ' в школі', 'прогулює уроки', 'прийш' + gp(k, 'ов', 'ла') + ' додому пізно вночі', 'отримав' + gp(k, '', 'ла') + ' двійку за річну']) + '.', opts: [
    O('Спокійно поговорити', function () { k.rel += 10; return 'Ви довго говорили. Здається, ' + k.name + ' почув' + gp(k, '', 'ла') + '.'; }),
    O('Суворо покарати', function () { k.rel -= 12; return k.name + ' образил' + gp(k, 'ся', 'ася') + ', але присмирнів' + gp(k, '', 'ла') + '.'; })] };
});
ev('kiduni', [35, 75], 4, function (s) { return s.kids.some(function (k) { return k.alive && k.age === 17; }); }, function (s) {
  var k = s.kids.filter(function (x) { return x.alive && x.age === 17; })[0]; var cost = Math.max(M(s) * 0.3, C(s).fee * M(s) * 4);
  return { text: k.name + ' вступає до університету. Допоможеш з оплатою (' + fmt(cost) + ' за все навчання)?', opts: [
    O('Оплатити', function () { if (s.money >= cost) s.money -= cost; else { s.debt += cost - s.money; s.money = 0; } k.rel += 15; k.edu = 1; return 'Ти оплатив' + g(s, '', 'ла') + ' навчання ' + k.name + '.'; }),
    O('Нехай заробить сам' + gp(k, '', 'а'), function () { k.rel -= 8; return k.name + ' піде працювати й вчитися заочно.'; })] };
});
ev('reunion', [30, 65], 2, null, function (s) { add(s, { social: 3, happy: 4 }); if (chance(.3)) s.friends++; return 'Зустріч випускників. Хтось розбагатів, хтось розлучився, хтось зовсім не змінився.'; });
ev('flirt', [25, 60], 2, function (s) { return s.partner && s.partner.married; }, function (s) {
  return { text: 'Колега відверто фліртує з тобою.', opts: [
    O('Чітко зупинити', function () { s.partner.rel += 3; return 'Ти поставив' + g(s, '', 'ла') + ' межу.'; }),
    O('Піддатися', function () { if (chance(.5)) { s.partner.rel -= 40; add(s, { happy: -10 }); return s.partner.name + ' дізнал' + gp(s.partner, 'ся', 'ася') + ' про зраду.'; } add(s, { happy: 3 }); return 'Ніхто нічого не дізнався. Поки що.'; })] };
});
ev('checkup', [40, 80], 2, null, function (s) {
  if (chance(0.08 + (s.age - 40) / 300)) getIll(s, pick(['рак на ранній стадії', 'проблеми із серцем', 'цукровий діабет', 'гіпертонія', 'хвороба нирок']));
  var ck = treatCost(s, 0.05);
  return { text: 'Лікар радить пройти повне обстеження (' + fmt(ck) + ').', opts: [
    O('Пройти', function () { s.money -= ck; if (!s.flags.genKnown && Math.max(s.gen.heart, s.gen.cancer) > 1.25) { s.flags.genKnown = s.gen.heart > s.gen.cancer ? 'heart' : 'cancer'; } if (s.flags.ill && !s.flags.illKnown) { s.flags.illKnown = true; return illnessPrompt(s); } return 'Усе в нормі.'; }),
    O('Відкласти', function () { return 'Може, наступного року.'; })] };
});
ev('ill', [35, 95], function (s) { return (s.age - 30) / 80 * (s.flags.smoker ? 1.8 : 1) * Math.sqrt(s.gen.heart * s.gen.cancer) * (s.diet === 0 ? 1.3 : s.diet === 2 ? 0.85 : 1); }, function (s) { return !s.flags.ill; }, function (s) {
  getIll(s, s.gen.cancer > 1.35 && chance(.5) ? 'рак' : s.gen.heart > 1.35 && chance(.5) ? 'проблеми із серцем' : pick(s.flags.smoker ? ['рак легенів', 'хронічна хвороба легень', 'проблеми із серцем'] : ['рак', 'проблеми із серцем', 'цукровий діабет', 'хвороба нирок', 'хвороба печінки']));
  if (chance(.4)) { s.flags.illKnown = true; return illnessPrompt(s); }
  add(s, { health: -5 }); return 'Останнім часом ти почуваєшся гірше.';
});
ev('heart', [45, 95], function (s) { return ((s.flags.smoker ? 0.5 : 0.15) + (s.age - 45) / 100) * s.gen.heart * (s.diet === 0 ? 1.4 : 1); }, null, function (s) { add(s, { health: -25 });  mark(s, 'Інфаркт'); return 'Серцевий напад. Тебе врятували, але здоровʼя вже не те.'; });
ev('competitor', [18, 90], 4, function (s) { return s.biz.length > 0; }, function (s) {
  var b = pick(s.biz);
  return { text: 'Поруч із «' + b.name + '» відкрився сильний конкурент.', opts: [
    O('Знизити ціни', function () { b.comp += 0.06; return 'Ціни знижено — клієнти лишились, маржа впала.'; }),
    O('Вкластися в якість (' + fmt(b.cap * 0.15) + ')', function () { if (s.money >= b.cap * 0.15) { s.money -= b.cap * 0.15; b.cap *= 1.15; return 'Інвестиції в якість окупляться.'; } b.comp += 0.1; return 'Грошей на це не знайшлося — конкурент забирає клієнтів.'; }),
    O('Нічого не робити', function () { b.comp += 0.12; return 'Частина клієнтів пішла до конкурента.'; })] };
});
ev('bigclient', [18, 90], 3, function (s) { return s.biz.length > 0; }, function (s) {
  var b = pick(s.biz);
  return { text: 'Великий клієнт хоче довгостроковий контракт з «' + b.name + '», але з відтермінуванням оплати.', opts: [
    O('Підписати', function () { if (chance(.75)) { b.cash += b.cap * 0.25; return 'Контракт приніс солідний прибуток.'; } b.cash -= b.cap * 0.15; return 'Клієнт затримав оплату — касовий розрив.'; }),
    O('Відмовитися', function () { return 'Ти не ризикуєш.'; })] };
});
ev('taxcheck', [18, 90], function (s) { return C(s).gdp < 30 ? 3 : 1.5; }, function (s) { return s.biz.length > 0; }, function (s) {
  var b = pick(s.biz), fine = b.cap * 0.15, q = bizQ(s, b), dirty = s.lastShadow && s.age - s.lastShadow <= 3;
  var pClean = dirty ? 0.6 : q < 35 ? 0.2 : 0.05;
  var bribe = b.cap * 0.05 * (cartel(s) ? 0.5 : 1), pBribe = clamp(1.05 - C(s).law * 1.1 + (cartel(s) ? 0.25 : 0), 0.05, 0.92);
  return { text: 'До «' + b.name + '» прийшла податкова перевірка.' + (dirty ? ' Нещодавні заробітки «в конверті» можуть спливти.' : ''), opts: [
    O('Показати все як є', function () { if (!chance(pClean)) return 'Перевірка пройшла чисто — порушень не знайшли.'; b.cash -= fine * (dirty ? 1.5 : 0.4); return dirty ? 'Знайшли неоформлені доходи: штраф ' + fmt(fine * 1.5) + '.' : 'Знайшли помилки в документах: штраф ' + fmt(fine * 0.4) + '.'; }, 'ризик штрафу ~' + Math.round(pClean * 100) + '%' + (dirty ? ' (через тіньові заробітки)' : q < 35 ? ' (безлад у документах)' : '')),
    O('Дати хабар ' + fmt(bribe), function () { b.cash -= bribe; if (chance(pBribe)) return 'Інспектор узяв конверт і пішов. Більше нічого платити не треба.'; b.cash -= fine * 2.5; s.record++; s.recordAge = s.age; add(s, { happy: -10 }); return 'Хабар не взяли — це була провокація. Великий штраф ' + fmt(fine * 2.5) + ' і судимість.'; }, 'спрацює з шансом ~' + Math.round(pBribe * 100) + '%; провал — великий штраф і судимість')] };
});
ev('promo_job', [20, 60], 2, function (s) { return s.job && JOB[s.job.id] && JOB[s.job.id].id === 'dev' || (s.sk.code > 60 && s.age > 18); }, function (s) {
  s.fame = clamp(s.fame + 8); s.port.code = (s.port.code || 0) + 2;
  return 'Твій пет-проєкт на GitHub набрав тисячі зірочок. Рекрутери пишуть щодня.';
});
ev('doctor_save', [25, 70], 3, function (s) { return s.job && ['doctor', 'surgeon', 'nurse', 'rescuer'].indexOf(s.job.id) >= 0; }, function (s) { add(s, { happy: 8 }); if (s.job) s.job.perf += 10; return 'Ти врятував' + g(s, '', 'ла') + ' життя людині, яку вже вважали безнадійною.'; });
ev('student_thanks', [30, 80], 3, function (s) { return yearsIn(s, 'teacher') >= 8; }, function (s) { add(s, { happy: 8 }); return 'Колишній учень знайшов тебе, щоб подякувати: «Ви змінили моє життя».'; });
ev('festival', [16, 60], 3, function (s) { return s.sk.music >= 50; }, function (s) {
  return { text: 'Тебе запросили виступити на ' + pick(['міському фестивалі', 'великому весіллі', 'відкритті клубу']) + '.', opts: [
    O('Виступити', function () { if (chance(s.sk.music / 120)) { s.fame = clamp(s.fame + 10); s.money += M(s) * 0.05; return 'Виступ був вогонь. Слава росте.'; } add(s, { happy: -4 }); return 'Хвилювання взяло своє — виступ так собі.'; }),
    O('Відмовитися', function () { return 'Сцена почекає.'; })] };
});
ev('sport_injury', [16, 40], 3, function (s) { return s.job && s.job.id === 'athlete'; }, function (s) { add(s, { health: -20, sport: -10 }); s.fame -= 10; return 'Важка травма. Карʼєра під загрозою.'; });
ev('mentor', [16, 40], 2, function (s) { return Object.keys(HOBBY).some(function (k) { return s.sk[k] >= 40; }); }, function (s) {
  var k = pick(Object.keys(HOBBY).filter(function (x) { return s.sk[x] >= 40; }));
  return { text: 'Майстер своєї справи (' + SKILL_NAMES[k].toLowerCase() + ') пропонує тобі менторство за символічну плату.', opts: [
    O('Погодитися', function () { s.money -= M(s) * 0.03; s.sk[k] = clamp(s.sk[k] + 12); return SKILL_NAMES[k] + ': ' + Math.round(s.sk[k]) + '. Ментор відкрив те, чого не знайдеш у туторіалах.'; }),
    O('Вчитися самому', function () { return 'Ти обираєш свій шлях.'; })] };
});

// ---------- Старість ----------
ev('fall_old', [70, 110], 1.5, null, function (s) { add(s, { health: -12 }); return 'Ти посковзну' + g(s, 'вся', 'лася') + ' і зламав' + g(s, '', 'ла') + ' стегно. Відновлення довге.'; });
ev('grandvisit', [60, 110], 4, function (s) { return s.grandkids > 0; }, function (s) { add(s, { happy: 8 }); return 'Онуки приїхали на все літо. Галасливо й щасливо.'; });
ev('memoir', [60, 100], 2, function (s) { return s.sk.write > 40; }, function (s) {
  return { text: 'Тобі є що розповісти. Написати мемуари?', opts: [
    O('Написати', function () { add(s, { happy: 6 }); if (chance(s.sk.write / 300)) { s.fame = clamp(s.fame + 20); s.money += M(s) * 0.5; return 'Мемуари стали бестселером!'; } return 'Мемуари прочитали рідні — і цього досить.'; }),
    O('Нехай памʼятають так', function () { return 'Спогади залишаться з тобою.'; })] };
}, true);
ev('will', [65, 100], 3, function (s) { return netWorth(s) > M(s); }, function (s) {
  return { text: 'Час подумати про заповіт.', opts: [
    O('Все — дітям', function () { s.flags.will = 'kids'; return 'Заповіт складено на користь родини.'; }),
    O('Частину — на благодійність', function () { s.flags.will = 'charity'; add(s, { happy: 8 }); var d = netWorth(s) * 0.1; s.money -= Math.min(s.money, d); return 'Ти пожертвував' + g(s, '', 'ла') + ' частину статку.'; })] };
}, true);
ev('oldfriend', [60, 110], 3, function (s) { return s.friends > 0; }, function (s) { s.friends--; add(s, { happy: -8 }); return 'Помер давній друг. Вас ставало дедалі менше.'; });
ev('garden', [60, 100], 2, null, function (s) { add(s, { happy: 5, health: 2 }); return 'Ти завів' + g(s, '', 'ла') + ' город. Помідори цього року — найкращі в окрузі.'; });

// ---------- Професійні події ----------
function onJob(ids) { return function (s) { return s.job && !s.job.teen && ids.indexOf(s.job.id) >= 0; }; }
function perf(s, d) { if (s.job) s.job.perf = clamp(s.job.perf + d); }
ev('strike', [18, 70], 3, onJob(UNION_JOBS), function (s) {
  return { text: 'Профспілка оголошує страйк: вимагають підвищення зарплат і кращих умов.', opts: [
    O('Страйкувати разом з усіма', function () { if (!s.job) return 'Вже неактуально.'; var r = R(); if (r < 0.55) { s.job.bonus = (s.job.bonus || 1) * 1.1; add(s, { happy: 5, social: 3 }); return 'Страйк переміг: зарплату підняли на 10%.'; } if (r < 0.7) { endJob(s, 'страйк'); add(s, { happy: -8 }); return 'Керівництво звільнило активістів, і тебе теж.'; } add(s, { happy: -2 }); return 'Страйк нічого не дав, але ти був' + g(s, '', 'ла') + ' зі своїми.'; }),
    O('Вийти на роботу', function () { perf(s, 8); s.friends = Math.max(0, s.friends - 1); add(s, { social: -4 }); return 'Колеги тепер дивляться косо, зате начальство помітило.'; })] };
});
ev('dev_legacy', [20, 65], 3, onJob(['dev', 'gamedev', 'sysadmin', 'datasci']), function (s) {
  return { text: 'Тобі доручили переписати старий код, який ніхто не розуміє і всі бояться чіпати.', opts: [
    O('Переписати все з нуля', function () { if (chance(.45)) { perf(s, 15); add(s, { code: 5 }); return 'Вийшло! Система тепер швидка, тебе згадують на нарадах.'; } perf(s, -12); return 'Дедлайн зірвано, прод упав двічі.'; }),
    O('Обережно рефакторити частинами', function () { perf(s, 6); add(s, { code: 3 }); return 'Повільно, але надійно.'; })] };
});
ev('police_bribe', [18, 60], 3, onJob(['police']), function (s) {
  return { text: 'Водій, якого ти зупинив' + g(s, '', 'ла') + ', пропонує «вирішити питання на місці».', opts: [
    O('Взяти гроші', function () { if (chance(0.15 + C(s).law * 0.3)) return sentence(s, ri(2, 4), 'хабар'); s.money += M(s) * 0.1; return 'Гроші в кишені. Совість — окреме питання.'; }),
    O('Скласти протокол', function () { perf(s, 5); return 'Усе за законом.'; })] };
});
ev('teacher_inspect', [22, 65], 3, onJob(['teacher', 'prof']), function (s) {
  return { text: 'До тебе на урок прийшла перевірка.', opts: [
    O('Провести відкритий урок по-своєму', function () { if (chance(0.4 + s.st.social / 200)) { perf(s, 12); return 'Комісія в захваті від уроку.'; } perf(s, -6); return 'Комісія сказала, що «не за програмою».'; }),
    O('Все строго за методичкою', function () { perf(s, 3); return 'Нудно, але без зауважень.'; })] };
});
ev('lawyer_case', [24, 70], 3, onJob(['lawyer', 'judge']), function (s) {
  return { text: 'Тобі пропонують резонансну справу: складну, але про неї пишуть усі новини.', opts: [
    O('Взятися', function () { if (chance(0.3 + s.st.smarts / 200)) { perf(s, 18); s.fame = clamp(s.fame + 12); return 'Ти виграв' + g(s, '', 'ла') + ' справу. Про тебе говорять.'; } perf(s, -8); return 'Справу програно публічно.'; }),
    O('Відмовитися', function () { return 'Тиха практика теж практика.'; })] };
});
ev('builder_unsafe', [18, 65], 3, onJob(['builder', 'miner', 'welder', 'electric']), function (s) {
  return { text: 'Бригадир просить працювати без страховки, бо «терміни горять».', opts: [
    O('Працювати як скажуть', function () { if (chance(.12)) { add(s, { health: -25 }); return 'Падіння з висоти. Довге лікування.'; } perf(s, 6); return 'Встигли в терміни.'; }),
    O('Відмовитися', function () { perf(s, -4); return 'Безпека важливіша. Бригадир незадоволений.'; })] };
});
ev('driver_acc', [18, 70], 3, onJob(['taxi', 'trucker', 'driver', 'courier']), function (s) { if (chance(.4)) { add(s, { health: -12 }); s.money -= M(s) * 0.05; return 'Аварія на роботі: машина в ремонті, ти на лікарняному.'; } perf(s, 4); return 'Рік без жодної подряпини — премія.'; });
ev('banker_deal', [24, 65], 3, onJob(['banker', 'account', 'manager']), function (s) {
  return { text: 'Клієнт пропонує ризиковану угоду з великою комісією.', opts: [
    O('Провести угоду', function () { if (chance(.6)) { perf(s, 15); s.money += M(s) * 0.3; return 'Угода принесла рекордну премію.'; } perf(s, -20); if (chance(.3)) { endJob(s, 'провал угоди'); return 'Угода провалилася. Тебе звільнили.'; } return 'Угода провалилася. Догана.'; }),
    O('Відмовитися', function () { return 'Обережність — теж професіоналізм.'; })] };
});
ev('journal_scoop', [20, 65], 3, onJob(['journal', 'writer', 'blogger']), function (s) {
  return { text: 'Джерело принесло тобі документи про корупцію впливової людини.', opts: [
    O('Публікувати', function () { if (chance(.65)) { s.fame = clamp(s.fame + 18); perf(s, 15); mark(s, 'Гучне розслідування'); return 'Розслідування сколихнуло країну.'; } add(s, { happy: -10 }); return 'Почалися погрози й суди. Важкий рік.'; }),
    O('Не ризикувати', function () { return 'Документи лягли в шухляду.'; })] };
});
ev('scientist_grant', [25, 75], 3, onJob(['scientist', 'prof']), function (s) {
  if (chance(0.25 + s.st.smarts / 250)) { perf(s, 15); s.fame = clamp(s.fame + 5); return 'Твоя стаття вийшла у відомому журналі. Отримано великий грант.'; }
  perf(s, -3); return 'Заявку на грант відхилили. Наступного разу.';
});
ev('chef_critic', [20, 70], 3, onJob(['cook', 'chef']), function (s) {
  if (chance(s.sk.cook / 120)) { perf(s, 14); s.fame = clamp(s.fame + 8); return 'Ресторанний критик назвав твою страву найкращою в місті.'; }
  perf(s, -5); return 'Критик написав розгромний відгук.';
});
ev('farmer_season', [16, 85], 4, onJob(['farmer', 'agronom']), function (s) {
  var r = R();
  if (r < 0.3) { s.money -= M(s) * 0.15; add(s, { happy: -6 }); return pick(['Посуха знищила половину врожаю.', 'Град побив урожай.', 'Ціни на зерно обвалилися.']); }
  if (r > 0.75) { s.money += M(s) * 0.25; return 'Рекордний врожай!'; }
  return 'Звичайний сезон: важка праця і нормальний врожай.';
});
ev('soldier_deploy', [18, 50], 3, onJob(['soldier']), function (s) {
  return { text: 'Твій підрозділ відправляють у небезпечну місію' + (cf(s) === 2 ? ' на передову' : ' за кордон') + '.', opts: [
    O('Їхати', function () { s.money += M(s) * 0.4; if (chance(cf(s) === 2 ? 0.12 : 0.04)) { add(s, { health: -35 }); return 'Тяжке поранення. Ти вижив' + g(s, '', 'ла') + ', але ціною здоровʼя.'; } perf(s, 15); return 'Місію виконано. Бойові виплати і повага.'; }),
    O('Подати рапорт на інше місце', function () { perf(s, -10); return 'Тебе перевели в тил.'; })] };
});
ev('pilot_emerg', [22, 65], 2, onJob(['pilot']), function (s) { if (chance(s.st.smarts / 110)) { s.fame = clamp(s.fame + 15); perf(s, 20); mark(s, 'Аварійна посадка'); return 'Аварійна посадка з відмовою двигуна — всі живі. Ти герой новин.'; } add(s, { happy: -8 }); return 'Складний рейс, розслідування, але обійшлося.'; });
ev('nurse_night', [18, 65], 3, onJob(['nurse', 'doctor', 'surgeon']), function (s) {
  return { text: 'Лікарня просить брати додаткові нічні зміни.', opts: [
    O('Брати', function () { s.money += M(s) * 0.15; add(s, { health: -5, happy: -3 }); perf(s, 6); return 'Гроші є, сил немає.'; }),
    O('Відмовитися', function () { return 'Ти береш' + g(s, '', '') + ' тільки свої зміни.'; })] };
});
ev('seller_target', [18, 65], 3, onJob(['seller', 'market', 'callc']), function (s) { if (chance(.5)) { perf(s, 10); return 'План продажів перевиконано — премія.'; } perf(s, -6); return 'План провалено. Начальник незадоволений.'; });
ev('politics_elect', [25, 80], 4, onJob(['politician']), function (s) {
  return { text: 'Вибори. Йдеш на переобрання?', opts: [
    O('Так', function () { if (chance(0.3 + s.st.social / 200 + s.fame / 300)) { perf(s, 15); s.fame = clamp(s.fame + 10); if (s.job.lvl < 4 && chance(.4)) { s.job.lvl++; return 'Перемога — і підвищення: ' + lvName(JOB.politician, s.job.lvl).toLowerCase() + '.'; } return 'Тебе переобрали.'; } endJob(s, 'програв вибори'); return 'Ти програв' + g(s, '', 'ла') + ' вибори.'; }),
    O('Піти з політики', function () { endJob(s, 'пішов з політики'); add(s, { happy: 6 }); return 'Політика позаду.'; })] };
});

// ---------- Угруповання ----------
ev('gang_offer', [14, 25], 3, function (s) { return gangOK(s) && C(s).law < 0.6 && s.d <= 4; }, function (s) {
  return { text: 'Хлопці з району пропонують «легкі гроші»: треба лише дещо передати й ні про що не питати.', opts: [
    O('Погодитися', function () { s.gang = { rank: 0, yrs: 0, perf: 50, heat: 0, kind: gangKind(s) }; mark(s, 'Вступ: ' + s.gang.kind); s.money += M(s) * 0.1; return 'Перші гроші — і ти вже частина ' + (s.gang.kind === 'картель' ? 'картелю' : 'угруповання') + '.'; }, 'вступ в угруповання'),
    O('Відмовитися', function () { add(s, { social: -2 }); return 'Ти відмови' + g(s, 'вся', 'лася') + '. Дехто з них потім сів.'; })] };
});
ev('gang_war', [15, 70], 5, function (s) { return !!s.gang && !s.prison; }, function (s) {
  return { text: 'Конкуренти почали війну за територію.', opts: [
    O('Воювати', function () { s.gangWar = true; if (s.gang) s.gang.perf += 20; return 'Ти в самому пеклі. Цей рік буде небезпечним.'; }, 'ризик загинути цього року ×2,5, але шанс на підвищення'),
    O('Домовлятися', function () { if (chance(0.3 + s.st.social / 200)) { if (s.gang) s.gang.perf += 10; return 'Ти домовив' + g(s, 'ся', 'лася') + ' про перемирʼя. Бос оцінив.'; } s.gangWar = true; return 'Переговори зірвалися.'; }),
    O('Пересидіти', function () { if (s.gang) s.gang.perf -= 15; return 'Ти сховав' + g(s, 'ся', 'лася') + '. Свої це запамʼятали.'; })] };
});
ev('gang_betray', [16, 70], 2, function (s) { return s.gang && s.gang.rank >= 2; }, function (s) {
  return { text: 'Поліція пропонує угоду: свобода в обмін на свідчення проти боса.', opts: [
    O('Погодитися', function () { s.gangPast = s.gang; s.gang = null; if (chance(0.25)) { die(s, 'помста за зраду'); return 'Тебе знайшли.'; } s.heat = 0; mark(s, 'Свідок обвинувачення'); return 'Ти дав' + g(s, '', 'ла') + ' свідчення. Нове імʼя, нове місто.'; }, 'ризик помсти'),
    O('Відмовитися', function () { if (s.gang) s.gang.perf += 10; return 'Ти не зраджуєш своїх.'; })] };
});


// ---------- Повсякденний реалізм: маленькі сцени з контекстом країни ----------
var tropical = function (s) { return ['NG', 'CD', 'ET', 'TZ', 'UG', 'KE', 'AO', 'NE', 'MZ', 'GH', 'CM', 'ML', 'MG', 'SD', 'HT'].indexOf(s.country) >= 0; };
ev('water', [4, 15], 4, function (s) { return C(s).gdp < 6 && !s.urban && s.d <= 5; }, function (s) { add(s, { happy: -2, health: -1, sport: 1 }); return 'Щоранку ти ходиш по воду до колонки за кілометр — ще до сходу сонця. (Факт: ≈2,2 млрд людей не мають безпечної питної води вдома — WHO/UNICEF, 2022.)'; });
ev('nolight', [6, 18], 3, function (s) { return C(s).gdp < 5 && s.d <= 6; }, function (s) { add(s, { gpa: -3 }); return 'Вдома немає електрики: уроки — при ліхтарику, поки не сяде батарейка. (Факт: ≈685 млн людей живуть без електрики — IEA/World Bank, 2022.)'; });
ev('mosquito', [0, 10], 3, tropical, function (s) {
  return { text: 'Сезон дощів — і хмари комарів. (Факт: малярія щороку забирає ≈600 тис. життів, переважно дітей в Африці — WHO.)', opts: [
    O('Витратитися на москітну сітку', function () { s.money -= M(s) * 0.01; s.flags.net = 1; return 'Тепер спиш під сіткою.'; }, '~' + fmt(M(s) * 0.01)),
    O('Обійдемося', function () { if (chance(0.35)) { add(s, { health: -15 }); return 'Малярія. Важкі тижні з лихоманкою.'; } return 'Цього разу пронесло.'; })] };
}, true);
ev('ball', [5, 11], 3, function (s) { return C(s).gdp < 8; }, function (s) { add(s, { happy: 4, sport: 3, social: 2 }); return 'Ви з дітьми з вулиці зробили мʼяч із пакетів і мотузки — і грали до темряви.'; });
ev('airraid', [0, 90], 6, function (s) { return s.country === 'UA' && cf(s) === 2; }, function (s) { add(s, { happy: -3, health: -1 }); return pick(['Повітряна тривога вночі — знову коридор і «правило двох стін».', 'Графіки відключень: працюєш і вчишся під генератор.', 'Зранку новини з рідного міста. Цілий день тримає тривога.', 'Школа знову онлайн через тривоги.']); });
ev('unexp', [18, 95], 6, function (s) { return !s.withParents; }, function (s) {
  var x = pick([['зламалася пральна машина', 0.04], ['розбився телефон', 0.03], ['стоматолог', 0.05], ['ремонт даху/сантехніки', 0.08], ['штраф за паркування', 0.01], ['подорожчала оренда', 0.06], ['ліки для родини', 0.04]]);
  var cost = M(s) * x[1] * rnd(0.7, 1.4); s.money -= cost; return 'Непередбачені витрати: ' + x[0] + ' — ' + fmt(cost) + '.';
});
ev('rentup', [18, 70], 2, function (s) { return !s.home && !s.withParents && s.urban; }, function (s) {
  return { text: 'Власник квартири піднімає оренду на 15%.', opts: [
    O('Платити', function () { s.money -= M(s) * 0.03; return 'Довелося платити більше.'; }),
    O('Шукати дешевше житло', function () { s.money -= M(s) * 0.02; add(s, { happy: -4 }); return 'Переїзд забрав сили, але нове житло дешевше.'; })] };
});
ev('firstpay', [16, 30], 8, function (s) { return s.job && !s.job.teen && s.job.yrs === 1 && !s.flags.firstPay; }, function (s) {
  s.flags.firstPay = 1; var p = jobPay(s), c = C(s);
  return 'Перша повноцінна зарплата: ' + fmt(p) + ' на рік — це ' + (p > c.median * 1.3 ? 'більше' : p < c.median * 0.8 ? 'менше' : 'приблизно стільки ж,') + ' ніж у типового працівника в ' + c.name + '. У світі це більше, ніж у ' + Math.round(globalPct(p) * 100) + '% людей.';
}, true);
ev('remit', [20, 65], 5, function (s) { return s.immigrant && s.parents.some(function (p) { return p.alive; }) && s.lastInc > M(s) * 0.5; }, function (s) {
  return { text: 'Батьки вдома ледве зводять кінці з кінцями. (Факт: мігранти надсилають у країни з низьким і середнім доходом ≈650 млрд $ на рік — World Bank, 2023.)', opts: [
    O('Надсилати 10% доходу', function () { s.money -= s.lastInc * 0.1; s.parents.forEach(function (p) { p.rel += 10; }); add(s, { happy: 3 }); return 'Ти щомісяця надсилаєш гроші рідним.'; }),
    O('Поки не можу', function () { s.parents.forEach(function (p) { p.rel -= 5; }); return 'Самому б вижити.'; })] };
});
ev('studloan', [18, 24], 6, function (s) { return s.study && s.study.t === 'uni' && C(s).feeType === 'high' && s.d <= 7 && !s.flags.loan; }, function (s) {
  s.flags.loan = 1; var a = tuition(s, 'uni') * 3; s.debt += a; return 'Ти ' + g(s, 'взяв', 'взяла') + ' студентський кредит на ' + fmt(a) + '. (Факт: американці винні за студентськими кредитами ≈1,7 трлн $ — Federal Reserve, 2024.)';
}, true);
ev('heat', [0, 95], 2, function (s) { return ['IN', 'PK', 'BD', 'SA', 'AE', 'IQ', 'EG', 'SD', 'ML', 'NE', 'MX'].indexOf(s.country) >= 0; }, function (s) { add(s, { health: s.age > 65 ? -6 : -2 }); return 'Аномальна спека: +45° у тіні. ' + (s.age > 65 ? 'Літнім людям у таку погоду особливо важко.' : 'Вночі не заснути.'); });
ev('commute', [18, 65], 3, function (s) { return s.job && s.urban && !(s.own && s.own.car) && C(s).gdp > 5; }, function (s) { add(s, { happy: -2 }); return 'Дорога на роботу — півтори години в один бік у переповненому транспорті.'; });
ev('layoffwave', [20, 64], 3, function (s) { return s.job && s.econ < 0 && !s.job.teen; }, function (s) {
  return { text: 'У компанії хвиля скорочень. Начальник пропонує або піти на мінімалку, або «за власним бажанням».', opts: [
    O('Погодитися на меншу зарплату', function () { if (s.job) s.job.bonus = (s.job.bonus || 1) * 0.85; add(s, { happy: -5 }); return 'Зарплату урізали на 15%, але робота є.'; }),
    O('Піти й шукати нову', function () { endJob(s, 'скорочення'); return 'Ти пішов' + g(s, '', 'ла') + ' з компанії.'; })] };
});
ev('parentcare', [35, 70], 3, function (s) { return s.parents.some(function (p) { return p.alive && p.age >= 80; }); }, function (s) {
  var p = s.parents.filter(function (x) { return x.alive && x.age >= 80; })[0];
  return { text: p.role + ' вже не може жити сам' + (p.sex === 'f' ? 'а' : '') + '. Що робите?', opts: [
    O('Забрати до себе', function () { p.rel += 15; add(s, { happy: -4 }); s.flags.careHome = 0; return 'Тепер ' + (p.sex === 'f' ? 'мама' : 'тато') + ' живе з тобою. Важко, але поруч.'; }, '+8 год/тиждень на догляд'),
    O('Будинок для літніх людей', function () { var c2 = M(s) * (C(s).gdp > 30 ? 1.2 : 0.4); s.money -= c2; p.rel -= 10; return 'Будинок для літніх: ' + fmt(c2) + ' на рік. Ти відвідуєш у вихідні.'; }, '~' + fmt(M(s) * (C(s).gdp > 30 ? 1.2 : 0.4)) + '/рік'),
    O('Найняти доглядальницю', function () { var c3 = M(s) * 0.6; s.money -= c3; return 'Доглядальниця приходить щодня.'; }, '~' + fmt(M(s) * 0.6))] };
}, true);
