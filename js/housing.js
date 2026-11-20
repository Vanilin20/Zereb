// ЖЕРЕБ — житло як драбина: з батьками → оренда (кімната, студія, квартира…) → власне житло з іпотекою → покращення, переїзди
// Район вирішує ціну і час у дорозі. Розмір — комфорт і місце для дітей.

var H_SIZE = [
  { n: 'Кімната в спільній квартирі', k: 0.45, sp: 0, hap: -3 },
  { n: 'Студія', k: 0.8, sp: 1, hap: 0 },
  { n: 'Однокімнатна квартира', k: 1, sp: 1, hap: 1 },
  { n: 'Двокімнатна квартира', k: 1.4, sp: 2, hap: 3 },
  { n: 'Трикімнатна квартира', k: 1.9, sp: 3, hap: 4 },
  { n: 'Будинок', k: 2.4, sp: 4, hap: 6 }
];
var H_DIST = [
  { n: 'поруч з роботою, центр', k: 1.35, h: 2 },
  { n: 'спальний район', k: 1, h: 6 },
  { n: 'передмістя', k: 0.72, h: 11 }
];
// Ставки іпотеки, приблизно (~2024); для решти — за рівнем розвитку
var MORT_RATE = { UA: 0.16, US: 0.07, CA: 0.055, GB: 0.05, DE: 0.04, FR: 0.04, NL: 0.04, PL: 0.075, CZ: 0.05, ES: 0.035, IT: 0.04, PT: 0.04, SE: 0.04, NO: 0.055, DK: 0.04, FI: 0.045, AT: 0.04, CH: 0.02, JP: 0.015, KR: 0.04, AU: 0.065, NZ: 0.065, IE: 0.04, IL: 0.055, TR: 0.4, AR: 0.5, BR: 0.11, MX: 0.11, IN: 0.09, CN: 0.04, ZA: 0.12, NG: 0.25, EG: 0.25, KZ: 0.16, GE: 0.12 };
function mortRate(s) { var c = C(s); return MORT_RATE[c.code] || (c.gdp > 40 ? 0.05 : c.gdp > 15 ? 0.09 : 0.15); }
function rentBase(s) { var c = C(s); return c.median * 0.2 * (c.house / 9); }
function rentOf(s, size, dist) { return rentBase(s) * H_SIZE[size].k * H_DIST[dist].k; }
function priceOf(s, size, dist) { return M(s) * C(s).house * H_SIZE[size].k * H_DIST[dist].k * 0.75; }
function houseName(h) { return H_SIZE[h.size].n + ', ' + H_DIST[h.dist].n; }
function needSpace(s) { var kids = s.kids.filter(function (k) { return k.alive && k.age < 18; }).length; return 1 + (s.partner && (s.partner.married || s.partner.yrs >= 2) ? 0 : 0) + Math.min(3, kids); }
function commuteH(s) {
  var h = s.house && !s.withParents ? H_DIST[s.house.dist].h : (s.urban ? 7 : 5);
  if (s.own && s.own.car) h = Math.round(h * 0.55);
  if (s.job && s.job.remote) h = 0;
  return h;
}

// оголошення: щороку свої, однакові до кінця року
function listings(s, kind) {
  var Y = yearly(s, 'house_' + kind, function () {
    var inc = Math.max(s.lastInc || 0, M(s) * 0.4), sizes = kind === 'buy' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4];
    return [0, 1, 2].map(function (i) {
      var size = pick(sizes), dist = ri(0, 2), q = rnd(0.85, 1.2);
      return { size: size, dist: dist, q: q, price: priceOf(s, size, dist) * q, rent: rentOf(s, size, dist) * q, cond: pick(['', '', ' · свіжий ремонт', ' · потребує ремонту', ' · гучні сусіди', ' · гарний краєвид']) };
    });
  });
  return Y;
}
function rentOpt(s, L, Y, i, after) {
  var share = L.rent / Math.max(s.lastInc || 0, M(s) * 0.3);
  return { t: H_SIZE[L.size].n + ' · ' + H_DIST[L.dist].n, sub: fmt(L.rent) + '/рік (' + Math.round(share * 100) + '% доходу) · дорога ~' + H_DIST[L.dist].h + ' год/тиж' + L.cond, dis: Y.used.length > 0,
    f: function () {
      Y.used.push(i); var was = s.withParents;
      if (s.home) return 'У тебе вже є власне житло.';
      s.withParents = false; s.house = { type: 'rent', size: L.size, dist: L.dist, rent: L.rent, cond: L.cond, since: s.age };
      if (L.cond.indexOf('ремонт') >= 0 && L.cond.indexOf('потребує') >= 0) s.house.rent *= 0.85;
      s.money -= L.rent * 0.15; cashNote(s, 'Застава й переїзд', -L.rent * 0.15);
      add(s, { happy: was ? 6 : 2 }); if (was) mark(s, 'Самостійне життя');
      return (was ? 'Ти зʼїха' + g(s, 'в', 'ла') + ' від батьків!' : 'Ти переїха' + g(s, 'в', 'ла') + '.') + ' Тепер: ' + houseName(s.house).toLowerCase() + '.' + (share > 0.45 ? ' Оренда зʼїдатиме майже половину доходу.' : '') + (after || '');
    } };
}
function buyOpt(s, L, Y, i) {
  var rate = mortRate(s), down = L.price * 0.2, yrs = 25, pay = annuity(L.price - down, rate, yrs), inc = Math.max(s.lastInc || 0, 1);
  var ok = s.money >= L.price ? 'cash' : s.money >= down && canBorrow(s) && pay < inc * 0.45 && s.job ? 'mort' : null;
  var why = ok ? '' : s.money < down ? 'бракує на перший внесок (' + fmt(down) + ')' : !canBorrow(s) ? 'банк не дає іпотеку (кредитний рейтинг)' : !s.job ? 'без роботи іпотеку не дають' : 'платіж ' + fmt(pay) + '/рік — понад 45% доходу, банк відмовив';
  return { t: H_SIZE[L.size].n + ' · ' + H_DIST[L.dist].n + ' — ' + fmt(L.price), sub: ok === 'cash' ? 'одразу, без кредиту' + L.cond : ok ? 'іпотека ' + (rate * 100).toFixed(1).replace('.', ',') + '%: внесок ' + fmt(down) + ', далі ' + fmt(pay) + '/рік ' + yrs + ' р.' + L.cond : why, dis: !ok || Y.used.length > 0,
    f: function () {
      Y.used.push(i);
      var sold = 0; if (s.home) { sold = s.home.val * 0.95; s.money += sold; if (s.mort) { s.money -= s.mort.left; s.mort = null; } }
      if (ok === 'cash' || s.money >= L.price) s.money -= L.price;
      else { s.money -= down; s.mort = { left: L.price - down, rate: rate, pay: pay, yrs: yrs, miss: 0 }; }
      s.home = { kind: L.size === 5 ? 'Будинок' : 'Квартира', val: L.price, size: L.size, dist: L.dist };
      s.house = { type: 'own', size: L.size, dist: L.dist, since: s.age };
      s.withParents = false; s.own.homeLvl = L.cond.indexOf('свіжий') >= 0 ? 1 : 0;
      mark(s, 'Власне житло: ' + H_SIZE[L.size].n.toLowerCase()); add(s, { happy: 10 });
      return 'Ключі в тебе! ' + houseName(s.house) + '.' + (s.mort ? ' Іпотека: ' + fmt(s.mort.left) + ', ' + fmt(pay) + ' на рік.' : '') + (sold ? ' Старе житло продано за ' + fmt(sold) + '.' : '');
    } };
}
function annuity(P, r, n) { return r <= 0 ? P / n : P * r / (1 - Math.pow(1 + r, -n)); }

// ---------------- Дії ----------------
(function () {
  ['moveout', 'moveback', 'home', 'sellhome'].forEach(function (id) { var a = ACTIONS.filter(function (x) { return x.id === id; })[0]; if (a) a.show = function () { return false; }; });
})();
A({ id: 'h_rent', tab: 'love', n: 'Знайти житло в оренду', ap: 1, d: function (s) { return s.withParents ? 'Зʼїхати від батьків: кілька оголошень цього року' : 'Переїхати: ' + (s.house ? houseName(s.house).toLowerCase() + ' зараз' : ''); },
  show: function (s) { return s.age >= 17 && !s.home && !s.prison && s.urban !== undefined; },
  run: function (s) { var Y = listings(s, 'rent'); return { title: 'Оренда', text: 'Оголошення цього року. Ближче до роботи — дорожче, далі — більше часу в дорозі.' + (needSpace(s) > 2 ? ' З дітьми в маленькій квартирі буде тісно.' : ''), opts: Y.v.map(function (L, i) { return rentOpt(s, L, Y, i); }).concat([{ t: 'Лишитися, де є', f: function () { return 'Ти поки нікуди не переїжджаєш.'; } }]) }; } });
A({ id: 'h_parents', tab: 'love', n: 'Повернутися до батьків', ap: 0, d: 'Без оренди, але й без свободи', show: function (s) { return !s.withParents && !s.home && s.age >= 18 && s.parents.some(function (p) { return p.alive; }); },
  run: function (s) { s.withParents = true; s.house = { type: 'parents', size: 1, dist: 1 }; add(s, { happy: -6 }); return 'Ти знову живеш з батьками. Мама рада, ти — не дуже.'; } });
A({ id: 'h_buy', tab: 'money', n: 'Купити житло', ap: 1, d: function (s) { return 'Ціни ~' + C(s).house + ' річних доходів · іпотека ~' + (mortRate(s) * 100).toFixed(1).replace('.', ',') + '%'; },
  show: function (s) { return s.age >= 20 && !s.prison && (s.money > M(s) * 0.5 || s.home); },
  run: function (s) { var Y = listings(s, 'buy'); return { title: 'Купити житло', text: 'Цього року на ринку три варіанти. Банк вимагає 20% першого внеску і платіж не більше 45% доходу.' + (s.home ? ' Нинішнє житло буде продано.' : ''), opts: Y.v.map(function (L, i) { return buyOpt(s, L, Y, i); }).concat([{ t: 'Не купувати', f: function () { return 'Ти вирішив' + g(s, '', 'ла') + ' зачекати.'; } }]) }; } });
A({ id: 'h_improve', tab: 'money', n: 'Покращити житло', ap: 1, d: function (s) { return 'Зараз: ' + HOME_LV[s.own.homeLvl || 0].n.toLowerCase(); }, show: function (s) { return !!s.home && !s.prison; },
  run: function (s) {
    var o = [], lv = s.own.homeLvl || 0, k = H_SIZE[s.home.size || 2].k;
    if (lv < HOME_LV.length - 1) { var p = HOME_LV[lv + 1].p * M(s) * k; o.push({ t: 'Ремонт: ' + HOME_LV[lv + 1].n.toLowerCase(), sub: fmt(p) + ' · частина вкладень додається до вартості', dis: s.money < p, f: function () { s.money -= p; s.own.homeLvl = lv + 1; s.home.val += p * 0.6; if (chance(0.25)) { s.money -= p * 0.3; return 'Ремонт затягнувся і вийшов на третину дорожчим, але результат тішить.'; } return 'Ремонт завершено.'; } }); }
    if (s.home.size === 5) { var ext = M(s) * 1.5; o.push({ t: 'Добудувати кімнату / мансарду', sub: fmt(ext), dis: s.money < ext, f: function () { s.money -= ext; s.home.val += ext * 0.9; add(s, { happy: 4 }); return 'Добудова готова: тепер місця вистачить усім.'; } }); }
    if (s.home.size < 5 && !s.home.rentedOut) o.push({ t: 'Здати одну кімнату', sub: '+' + fmt(rentOf(s, 0, s.home.dist)) + '/рік · чужа людина вдома', f: function () { s.home.rentedOut = 1; add(s, { happy: -3 }); return 'Тепер у тебе квартирант.'; } });
    if (s.home.rentedOut) o.push({ t: 'Попросити квартиранта зʼїхати', f: function () { s.home.rentedOut = 0; add(s, { happy: 3 }); return 'Знову вся квартира твоя.'; } });
    o.push({ t: 'Нічого не робити', f: function () { return 'Все як є.'; } });
    return { title: 'Твоє житло', text: houseName(s.house || s.home) + '. Вартість ~' + fmt(s.home.val) + (s.mort ? '. Іпотека: ще ' + fmt(s.mort.left) + '.' : '.'), opts: o };
  } });
A({ id: 'h_sell', tab: 'money', n: 'Продати житло', ap: 0, d: function (s) { return s.home ? '~' + fmt(s.home.val * 0.95) + (s.mort ? ' · мінус іпотека ' + fmt(s.mort.left) : '') : ''; }, show: function (s) { return !!s.home; },
  run: function (s) { return { title: 'Продати житло', text: 'Ріелтор і податки заберуть ~5%.' + (s.mort ? ' З виручки спершу закриють іпотеку.' : ''), opts: [
    { t: 'Продати і знімати', f: function () { var v = s.home.val * 0.95 * rnd(0.95, 1.05); s.money += v; if (s.mort) { s.money -= s.mort.left; s.mort = null; } var d = s.home.dist || 1; s.home = null; s.own.homeLvl = 0; s.house = { type: 'rent', size: 2, dist: d, rent: rentOf(s, 2, d), since: s.age }; return 'Продано за ' + fmt(v) + '. Ти знімаєш двокімнатну неподалік.'; } },
    { t: 'Не продавати', f: function () { return 'Лишаєш.'; } }] }; } });

// ---------------- Щороку ----------------
function housingTick(s, out) {
  if (!s.house) s.house = s.withParents || s.age < 18 ? { type: 'parents', size: 1, dist: 1 } : s.home ? { type: 'own', size: s.home.size != null ? s.home.size : 2, dist: s.home.dist != null ? s.home.dist : 1 } : { type: 'rent', size: 2, dist: 1, rent: rentOf(s, 2, 1), since: s.age };
  if (s.home && s.house.type !== 'own') s.house = { type: 'own', size: s.home.size != null ? s.home.size : 2, dist: s.home.dist != null ? s.home.dist : 1 };
  // іпотека: окремо від звичайних боргів, за ставкою країни
  if (s.mort) {
    var M2 = s.mort, interest = M2.left * M2.rate, pay = Math.min(M2.pay, M2.left + interest);
    if (s.money + (s.lastInc || 0) * 0.3 >= pay) { s.money -= pay; M2.left = M2.left + interest - pay; cashNote(s, 'Іпотека (з них відсотки ' + fmt(interest) + ')', -pay); M2.miss = 0; }
    else { M2.left += interest; M2.miss++; s.credit = clamp(s.credit - 15); say(s, 'Не вистачило на платіж за іпотеку. Банк надсилає попередження.', 'bad');
      if (M2.miss === 1 && s.home && out.length < 2) out.push({ title: 'Іпотека під загрозою', text: 'Ти пропусти' + g(s, 'в', 'ла') + ' платіж. Ще один — і банк забере житло й продасть з торгів дешево.', opts: [
        { t: 'Продати самому, поки не пізно', sub: 'ринкова ціна (~' + fmt(s.home.val * 0.95) + ') замість торгів', f: function () { var v = s.home.val * 0.95; s.money += v - (s.mort ? s.mort.left : 0); s.mort = null; s.home = null; s.own.homeLvl = 0; s.house = { type: 'rent', size: 2, dist: 1, rent: rentOf(s, 2, 1), since: s.age }; add(s, { happy: -6 }); return 'Продано. Іпотеку закрито, решта — твоя. Тепер знімаєш.'; } },
        { t: 'Затягнути паски й платити', sub: 'якщо наступного року не вийде — втратиш житло', f: function () { add(s, { happy: -4 }); return 'Ти урізаєш усе, щоб утримати дім.'; } }] });
      if (M2.miss >= 2 && s.home) { var v = s.home.val * 0.8; var rest = Math.max(0, M2.left - v); s.home = null; s.mort = null; s.own.homeLvl = 0; if (rest) addDebt(s, rest, 'іпотека після вилучення житла'); s.house = { type: 'rent', size: 1, dist: 2, rent: rentOf(s, 1, 2), since: s.age }; add(s, { happy: -15 }); say(s, 'Банк забрав житло за борги по іпотеці й продав з торгів. Ти знімаєш студію на околиці.', 'bad'); }
    }
    if (s.mort && M2.left <= 1) { s.mort = null; mark(s, 'Іпотеку виплачено'); add(s, { happy: 8 }); say(s, 'Останній платіж! Житло повністю твоє.', 'good'); }
  }
  if (s.home && s.home.rentedOut) { var rr = rentOf(s, 0, s.home.dist || 1); s.money += rr; cashNote(s, 'Квартирант', rr); }
  // тіснота: діти в маленькому житлі
  var sz = s.withParents ? 1 : H_SIZE[s.house.size].sp;
  if (!s.withParents && needSpace(s) > sz + 1) { add(s, { happy: -3 }); if (s.partner) s.partner.rel -= 2; if (!s.crampSay || s.age - s.crampSay >= 5) { s.crampSay = s.age; say(s, 'Тісно: ' + (s.kids.length > 1 ? 'діти' : 'дитина') + ' і ви в ' + H_SIZE[s.house.size].n.toLowerCase().replace('квартира', 'квартирі').replace('студія', 'студії').replace('кімната в спільній квартирі', 'одній кімнаті') + '. Час думати про більше житло.', 'bad'); } }
  if (!s.withParents) add(s, { happy: H_SIZE[s.house.size].hap * 0.15 });
  // з батьками після 25 — тиснуть і батьки, і самооцінка; перша пропозиція зʼїхати
  if (s.withParents && s.age >= 19 && s.age <= 35 && (s.job || s.lastInc > M(s) * 0.5) && !s.prison && !(s.moveAsk && s.age - s.moveAsk < 3) && out.length < 2) {
    s.moveAsk = s.age; var Y = listings(s, 'rent');
    out.push({ title: s.age >= 25 ? 'Тобі ' + s.age + ', а ти досі з батьками' : 'Час жити окремо?', text: 'Є кілька варіантів оренди. Або можна ще пожити з батьками й економити.', opts: Y.v.map(function (L, i) { return rentOpt(s, L, Y, i); }).concat([{ t: 'Ще пожити з батьками', sub: 'економія, але' + (s.age >= 25 ? ' батьки вже натякають' : ' мало свободи'), f: function () { if (s.age >= 25) add(s, { happy: -3 }); return 'Ти лишаєшся вдома. Гроші цілі, свободи мало.'; } }]) });
  }
  // власник продає квартиру — треба шукати нову
  if (s.house.type === 'rent' && !s.withParents && s.age - (s.house.since || 0) >= 2 && chance(0.05) && out.length < 2) {
    var Y2 = listings(s, 'rent');
    out.push({ title: 'Власник продає квартиру', text: 'Маєш місяць, щоб зʼїхати. Ось що є на ринку:', opts: Y2.v.map(function (L, i) { return rentOpt(s, L, Y2, i); }).concat(s.parents.some(function (p) { return p.alive; }) ? [{ t: 'Тимчасово до батьків', f: function () { s.withParents = true; s.house = { type: 'parents', size: 1, dist: 1 }; add(s, { happy: -6 }); return 'Поки що — до батьків.'; } }] : []) });
  }
}
YEARLY.push(housingTick);
// реальна оренда в бюджеті замість умовної
function rentCost(s) { if (s.home || s.withParents || s.prison) return 0; var h = s.house; return h && h.type === 'rent' ? h.rent * (1 + (s.econ < 0 ? 0 : 0.02 * Math.min(10, s.age - (h.since || s.age)))) : rentBase(s) * [0.8, 1, 1.6][s.ls]; }
