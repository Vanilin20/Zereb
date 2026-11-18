// ЖЕРЕБ — громадянство і статус проживання (строки приблизні, за реальними правилами ~2024)
// pr — років до посвідки на постійне проживання; cit — років проживання до громадянства; lang — потрібний рівень мови; dual — чи дозволене подвійне громадянство
var NAT = {
  CA: { pr: 2, cit: 4, lang: 40, dual: 1 }, AU: { pr: 3, cit: 4, lang: 40, dual: 1 }, NZ: { pr: 3, cit: 5, lang: 40, dual: 1 },
  US: { pr: 4, cit: 9, lang: 40, dual: 1 }, GB: { pr: 5, cit: 6, lang: 50, dual: 1 }, IE: { pr: 5, cit: 5, lang: 30, dual: 1 },
  DE: { pr: 4, cit: 5, lang: 55, dual: 1 }, FR: { pr: 5, cit: 5, lang: 50, dual: 1 }, NL: { pr: 5, cit: 5, lang: 50, dual: 0 },
  BE: { pr: 5, cit: 5, lang: 50, dual: 1 }, AT: { pr: 5, cit: 10, lang: 55, dual: 0 }, CH: { pr: 10, cit: 10, lang: 55, dual: 1 },
  SE: { pr: 4, cit: 5, lang: 40, dual: 1 }, NO: { pr: 3, cit: 8, lang: 50, dual: 1 }, DK: { pr: 8, cit: 9, lang: 60, dual: 1 },
  FI: { pr: 4, cit: 8, lang: 50, dual: 1 }, PL: { pr: 5, cit: 8, lang: 55, dual: 1 }, CZ: { pr: 5, cit: 10, lang: 50, dual: 1 },
  ES: { pr: 5, cit: 10, lang: 40, dual: 0 }, PT: { pr: 5, cit: 5, lang: 40, dual: 1 }, IT: { pr: 5, cit: 10, lang: 50, dual: 1 },
  JP: { pr: 10, cit: 6, lang: 70, dual: 0 }, KR: { pr: 5, cit: 5, lang: 60, dual: 0 }, SG: { pr: 2, cit: 4, lang: 30, dual: 0 },
  AE: { pr: 99, cit: 99 }, SA: { pr: 99, cit: 99 }, IL: { pr: 99, cit: 99 }
};
var NO_DUAL_ORIGIN = ['CN', 'JP', 'IN', 'SG', 'KR', 'NL', 'AT', 'NP', 'UA'];   // ці країни не визнають другого громадянства своїх
function natRule(code) { return NAT[code] || { pr: 5, cit: 10, lang: 50, dual: 0 }; }
var STATUS_N = { citizen: 'громадянин', pr: 'постійне проживання', visa: 'віза / тимчасова посвідка', refugee: 'тимчасовий захист', illegal: 'без документів' };
function isCitizen(s, code) { return (s.citizen || [s.birth]).indexOf(code || s.country) >= 0; }
function resStatus(s) { if (isCitizen(s)) return 'citizen'; return s.status || 'visa'; }
function statusAfterMove(s, code, how) {
  if (isCitizen(s, code)) return 'citizen';
  if (/лотере/.test(how)) return 'pr';
  if (/захист/.test(how)) return 'refugee';
  if (how === 'переїзд') return COUNTRIES[code].gdp > C(s).gdp * 1.3 && COUNTRIES[code].law > 0.5 ? 'illegal' : 'visa';
  return 'visa';
}
function citTick(s, out) {
  if (!s.citizen) s.citizen = [s.birth];
  if (isCitizen(s) || s.prison || s.age < 16) return;
  var c = C(s), R2 = natRule(c.code), st = resStatus(s), lang = langLevel(s, c.lang) || 0;
  if (c.engOk && c.lang !== 'en') lang = Math.max(lang, s.sk.eng * 0.7);
  // нелегали: облави і депортація
  if (st === 'illegal' && chance(0.05 + c.law * 0.08)) { out.push(deportPrompt(s, 'Облава: у тебе немає документів.')); return; }
  // судимість без громадянства — ризик депортації
  if (hasRecord(s) && s.recordAge === s.age - 1 && c.law > 0.5 && chance(0.5)) { out.push(deportPrompt(s, 'Після вироку міграційна служба вирішує, чи залишати тебе в країні.')); return; }
  // віза без роботи чи навчання — можуть не продовжити
  if (st === 'visa' && !s.job && !s.study && !s.biz.length && !(s.partner && s.partner.married) && s.immYrs >= 1 && chance(0.3)) {
    out.push({ title: 'Віза закінчується', text: 'Без роботи чи навчання посвідку не продовжують. Що робиш?', opts: [
      { t: 'Повернутися додому', f: function () { return emigrate(s, s.birth, 'повернення'); } },
      { t: 'Залишитися нелегально', sub: 'робота тільки «в тіні», ризик облав', f: function () { s.status = 'illegal'; add(s, { happy: -8 }); return 'Ти залишаєшся без документів. Кожна перевірка — стрес.'; } },
      { t: 'Подати апеляцію з юристом', sub: fmt(M(s) * 0.15), dis: s.money < M(s) * 0.15, f: function () { s.money -= M(s) * 0.15; if (chance(0.45)) return 'Апеляцію задоволено: ще рік, щоб знайти роботу.'; s.status = 'illegal'; return 'Апеляцію відхилено. Офіційно ти маєш виїхати.'; } }] });
    return;
  }
  // постійне проживання
  if ((st === 'visa' || st === 'refugee') && s.immYrs >= R2.pr && (s.job || s.biz.length || st === 'refugee' || (s.partner && s.partner.married)) && !hasRecord(s) && !s.prAsked) {
    s.prAsked = s.age;
    var fee = M(s) * 0.05;
    out.push({ title: 'Посвідка на постійне проживання', text: 'Ти прожив' + g(s, '', 'ла') + ' у ' + c.name + ' ' + s.immYrs + ' р. Можна подаватися на постійне проживання.', opts: [
      { t: 'Подати документи', sub: fmt(fee) + ' · потрібні легальна робота й мова', f: function () { s.money -= fee; if (chance(0.45 + lang / 200 + (s.job ? 0.15 : 0))) { s.status = 'pr'; mark(s, 'Постійне проживання: ' + c.name); return 'Отримано посвідку на постійне проживання.'; } s.prAsked = s.age - 2; return 'Відмова: «недостатньо підстав». Спробуєш за кілька років.'; } },
      { t: 'Поки не подаватися', f: function () { s.prAsked = s.age - 3; return 'Може, згодом.'; } }] });
    return;
  }
  if (st === 'refugee' && s.immYrs >= 3 && !s.prAsked) s.prAsked = 0;
  // громадянство
  if (st === 'pr' && s.immYrs >= R2.cit && !hasRecord(s) && !(s.natAsked && s.age - s.natAsked < 2)) {
    s.natAsked = s.age;
    var keepOld = R2.dual && NO_DUAL_ORIGIN.indexOf(s.birth) < 0, nf = M(s) * 0.04;
    var ok = lang >= R2.lang;
    out.push({ title: 'Громадянство', text: 'Ти вже ' + s.immYrs + ' р. у ' + c.name + '. Можна подаватися на громадянство: іспит з мови й історії.' + (ok ? '' : ' Мови поки замало (' + Math.round(lang) + ' з ' + R2.lang + ').') + (keepOld ? '' : ' Але громадянство ' + COUNTRIES[s.birth].name + ' доведеться втратити.'), opts: [
      { t: 'Скласти іспит', sub: fmt(nf) + (ok ? '' : ' · шанси низькі'), dis: s.money < nf, f: function () { s.money -= nf; if (chance(ok ? 0.6 + s.st.smarts / 250 : 0.15)) { if (!keepOld) { var i = s.citizen.indexOf(s.birth); if (i >= 0) s.citizen.splice(i, 1); } s.citizen.push(c.code); s.status = 'citizen'; mark(s, 'Став' + g(s, '', 'ла') + ' громадянином ' + c.name); add(s, { happy: 10 }); return 'Присяга, новий паспорт — ти тепер громадян' + g(s, 'ин', 'ка') + ' ' + c.name + ' ' + c.flag + '.' + (keepOld ? ' І старе громадянство лишається.' : ''); } return 'Іспит не складено. Наступна спроба — за два роки.'; } },
      { t: 'Не подаватися', sub: keepOld ? '' : 'зберегти громадянство ' + COUNTRIES[s.birth].name, f: function () { return 'Ти лишаєшся з посвідкою на постійне проживання.'; } }] });
  }
}
function deportPrompt(s, why) {
  return { title: 'Депортація', text: why, opts: [
    { t: 'Виїхати добровільно', sub: 'без заборони повертатися', f: function () { return emigrate(s, s.birth, 'повернення'); } },
    { t: 'Найняти юриста', sub: fmt(M(s) * 0.3), dis: s.money < M(s) * 0.3, f: function () { s.money -= M(s) * 0.3; if (chance(0.35)) { if (s.status === 'illegal') s.status = 'visa'; return 'Юрист домігся тимчасового дозволу залишитися.'; } s.banned = s.banned || []; s.banned.push(s.country); var r = emigrate(s, s.birth, 'депортація'); return 'Не допомогло. ' + r + ' В\'їзд закрито.'; } },
    { t: 'Переховуватися', sub: 'ризиковано', f: function () { if (chance(0.5)) { s.status = 'illegal'; add(s, { happy: -10 }); return 'Ти переховуєшся. Жодної офіційної роботи.'; } s.banned = s.banned || []; s.banned.push(s.country); return emigrate(s, s.birth, 'депортація') + ' Вʼїзд закрито.'; } }] };
}
ACHIEVEMENTS.push({ id: 'passport', n: 'Новий паспорт', d: 'Отримати громадянство іншої країни', t: function (s) { return (s.citizen || []).some(function (x) { return x !== s.birth; }); } });
