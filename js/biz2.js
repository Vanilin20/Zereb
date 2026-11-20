// ЖЕРЕБ — бізнес як історія, а не меню
// Етапи: старт → ріст / стабільність / спад. Раз на 1–3 роки — подія бізнесу (добра чи погана) з вибором.
// Результат залежить від підготовки, навичок, грошей і ситуації, і гра пояснює причину.

function bizStage(b) {
  if (b.yrs < 2) return 'старт';
  var m = b.mom || 0, cur = b.stg;
  // гістерезис, щоб етап не перескакував щороку
  if (cur === 'ріст' && m > 0.012) return 'ріст';
  if (cur === 'спад' && m < -0.012) return 'спад';
  return m > 0.04 ? 'ріст' : m < -0.04 ? 'спад' : 'стабільність';
}
function bizMomTick(s, b) {
  var m = b.mom || 0;
  m = m * 0.8 + gauss() * 0.012;                       // імпульс згасає, трохи випадкового дрейфу
  if (b.yrs >= 8) m -= 0.004 * Math.min(10, b.yrs - 7);  // з роками формат старіє, якщо не оновлювати
  b.mom = clampM(m);
}
function clampM(v) { return Math.max(-0.15, Math.min(0.15, v)); }
function M2(s) { return M(s); }

// ----------------------------------------------------------------------
// Пул подій бізнесу. Кожна: cond(s,b) і mk(s,b) → промпт
// ----------------------------------------------------------------------
var BIZ_EVENTS = [
  { id: 'viral', w: 1, cond: function (s, b) { return b.yrs >= 1; }, mk: function (s, b) {
    var q = bizQ(s, b), cost = M(s) * 0.3;
    return { text: 'Про «' + b.name + '» написав популярний блогер. Наступного дня — черга клієнтів.', opts: [
      { t: 'Найняти тимчасових людей і працювати довше', sub: fmt(cost) + ' · встигнеш обслужити всіх — якщо команда готова', dis: s.money < cost && b.cash < cost, f: function () { payBiz(s, b, cost); if (q >= 50) { b.mom = clampM((b.mom || 0) + 0.07); return 'Ви витримали наплив — і багато хто став постійним клієнтом. Підготовка «' + bizReadyLabel(q) + '» дозволила.'; } b.mom = clampM((b.mom || 0) - 0.03); return 'Новенькі не впоралися: черги, помилки, злі відгуки. Підготовки «' + bizReadyLabel(q) + '» не вистачило для такого потоку.'; } },
      { t: 'Працювати як завжди', sub: 'частина людей піде, не дочекавшись', f: function () { b.mom = clampM((b.mom || 0) + 0.025); return 'Хвиля трохи підняла продажі й спала.'; } }] };
  } },
  { id: 'bigclient', w: 1, cond: function (s, b) { return b.yrs >= 1; }, mk: function (s, b) {
    var q = bizQ(s, b), gain = Math.max(M(s) * 0.4, Math.abs(b.last || 0) * 0.6), cap = q >= 55 || (b.staff || 0) >= 3;
    return { text: 'Велика компанія хоче контракт на рік: великий обсяг і жорсткі терміни.', opts: [
      { t: 'Підписати', sub: cap ? 'команда має потягнути' : 'ризиковано: у тебе мало людей і досвіду', f: function () { if (chance(cap ? 0.8 : 0.35)) { b.cash += gain; b.mom = clampM((b.mom || 0) + 0.02); return 'Контракт виконано: +' + fmt(gain) + ' у касу і гарна рекомендація.'; } b.cash -= gain * 0.4; b.mom = clampM((b.mom || 0) - 0.04); return 'Терміни зірвано: штрафи ' + fmt(gain * 0.4) + ', а звичайні клієнти тиждень чекали своїх замовлень. ' + (cap ? 'Просто не пощастило з постачанням.' : 'Забагато для такої маленької команди.'); } },
      { t: 'Відмовитися', sub: 'синиця в руках', f: function () { return 'Ти лиши' + g(s, 'в', 'ла') + ' все як є.'; } }] };
  } },
  { id: 'compclosed', w: 0.8, cond: function (s, b) { return b.yrs >= 2; }, mk: function (s, b) {
    var ad = M(s) * 0.25, eq = b.cap * 0.25;
    return { text: 'Головний конкурент поруч закрився. Його клієнти шукають, куди піти.', opts: [
      { t: 'Реклама для його клієнтів', sub: fmt(ad), dis: s.money < ad && b.cash < ad, f: function () { payBiz(s, b, ad); b.mom = clampM((b.mom || 0) + 0.06); b.comp = Math.max(0, (b.comp || 0) - 0.03); return 'Більшість його клієнтів прийшли до тебе.'; } },
      { t: 'Викупити його обладнання за безцінь', sub: fmt(eq) + ' · обладнання вартує більше', dis: s.money < eq && b.cash < eq, f: function () { payBiz(s, b, eq); b.cap += eq * 1.5; return 'Обладнання за пів ціни. Тепер можна обслуговувати більше людей.'; } },
      { t: 'Нічого не робити', f: function () { b.mom = clampM((b.mom || 0) + 0.02); return 'Частина клієнтів прийшла сама.'; } }] };
  } },
  { id: 'buyout', w: 0.6, cond: function (s, b) { return b.yrs >= 3 && (b.last || 0) > 0; }, mk: function (s, b) {
    var v = bizValue(s, b) * rnd(1.0, 1.6);
    return { text: 'Підприємець хоче купити «' + b.name + '» за ' + fmt(v) + '.', opts: [
      { t: 'Продати', f: function () { closeBiz(s, b, 'продано', v); add(s, { happy: 6 }); return 'Угоду закрито: ' + fmt(v) + '.'; } },
      { t: 'Торгуватися', sub: 'харизма й навичка бізнесу', f: function () { if (chance(0.3 + s.st.social / 300 + s.sk.biz / 300)) { var v2 = v * rnd(1.1, 1.25); closeBiz(s, b, 'продано', v2); add(s, { happy: 8 }); return 'Ти виби' + g(s, 'в', 'ла') + ' ще ' + fmt(v2 - v) + '. Продано за ' + fmt(v2) + '.'; } return 'Покупець образився і пішов. Бізнес лишається твоїм.'; } },
      { t: 'Не продавати', f: function () { return 'Ти віриш у свою справу.'; } }] };
  } },
  { id: 'second', w: 0.8, cond: function (s, b) { return BIZM[b.type].points && b.yrs >= 3 && bizStage(b) !== 'спад' && (b.points || 1) < 8; }, mk: function (s, b) {
    var T = BIZM[b.type], cost = T.cost * M(s) * rnd(0.9, 1.2), q = bizQ(s, b), p = clamp(0.3 + q / 180 + s.sk.biz / 400, 0.2, 0.85);
    return { text: 'Звільнилося приміщення в хорошому районі — ідеально для ще однієї точки «' + b.name + '».', opts: [
      { t: 'Відкрити ще одну точку', sub: fmt(cost) + (p > 0.6 ? ' · ти вже знаєш, як це робити' : ' · без досвіду управління це лотерея'), dis: s.money < cost && b.cash < cost, f: function () { payBiz(s, b, cost); b.points = (b.points || 1) + 1; if (chance(p)) { b.cap += cost; b.mom = clampM((b.mom || 0) + 0.02); return 'Нова точка запрацювала. Точок: ' + b.points + '.'; } b.cap += cost * 0.35; b.mom = clampM((b.mom || 0) - 0.03); return 'Точку відкрили, але район виявився «мертвим» після шостої вечора. Вона ледве покриває оренду.'; } },
      { t: 'Не розширюватися', f: function () { return 'Обережність — теж стратегія.'; } }] };
  } },
  { id: 'investor', w: 0.5, cond: function (s, b) { return b.yrs >= 2 && !b.inv && (BIZM[b.type].startup || bizStage(b) === 'ріст'); }, mk: function (s, b) {
    var amt = b.cap * rnd(0.5, 1.2), stake = clamp(amt / (bizValue(s, b) / (b.share || 1) + amt), 0.1, 0.45);
    return { text: 'Інвестор пропонує ' + fmt(amt) + ' за ' + Math.round(stake * 100) + '% «' + b.name + '».', opts: [
      { t: 'Погодитися', sub: 'більше грошей на ріст, менше твоїх дивідендів', f: function () { b.inv = s.age; b.cap += amt; b.share = (b.share || 1) * (1 - stake); b.mom = clampM((b.mom || 0) + 0.03); return 'Гроші на рахунку. Твоя частка тепер ' + Math.round(b.share * 100) + '%.'; } },
      { t: 'Відмовитися', f: function () { b.inv = s.age; return 'Ти лишаєшся повн' + g(s, 'им', 'ою') + ' власни' + g(s, 'ком', 'цею') + '.'; } }] };
  } },
  { id: 'newcomp', w: 1.2, cond: function (s, b) { return b.yrs >= 1; }, mk: function (s, b) {
    var q = bizQ(s, b), qc = M(s) * 0.35;
    return { text: 'Поруч відкрився сильний конкурент: новіше, дешевше, з гучною рекламою.', opts: [
      { t: 'Знизити ціни', sub: 'клієнти лишаться, прибуток зменшиться', f: function () { b.cash -= Math.max(0, b.last || 0) * 0.3; b.mom = clampM((b.mom || 0) - 0.01); return 'Ти втрима' + g(s, 'в', 'ла') + ' клієнтів ціною маржі.'; } },
      { t: 'Вкластися в якість', sub: fmt(qc) + (q >= 45 ? ' · є на чому будувати' : ' · база слабка'), dis: s.money < qc && b.cash < qc, f: function () { payBiz(s, b, qc); if (q >= 45) { b.mom = clampM((b.mom || 0) + 0.02); return 'Люди помітили різницю — і лишилися з тобою.'; } b.mom = clampM((b.mom || 0) - 0.03); return 'Гроші пішли, але з підготовкою «' + bizReadyLabel(q) + '» конкурента не переплюнеш.'; } },
      { t: 'Нічого не робити', sub: 'частина клієнтів піде', f: function () { b.mom = clampM((b.mom || 0) - 0.05); b.comp = (b.comp || 0) + 0.02; return 'Частина клієнтів перейшла до нового.'; } }] };
  } },
  { id: 'keyquit', w: 0.9, cond: function (s, b) { return (b.staff || 0) >= 1 || b.mgr; }, mk: function (s, b) {
    var who = b.mgr ? 'управитель' : 'найкращий працівник', raise = M(s) * 0.4;
    return { text: 'Твій ' + who + ' іде до конкурентів — там платять більше.', opts: [
      { t: 'Підняти зарплату', sub: fmt(raise), dis: s.money < raise && b.cash < raise, f: function () { payBiz(s, b, raise); return who === 'управитель' ? 'Управитель лишився.' : 'Працівник лишився і тепер ще більше старається.'; } },
      { t: 'Відпустити', sub: 'частина клієнтів піде за ним', f: function () { if (b.mgr) { b.mgr = false; b.effort = 1; } else b.staff = Math.max(0, b.staff - 1); b.mom = clampM((b.mom || 0) - 0.04); return 'Пішов — і забрав кількох постійних клієнтів.' + (who === 'управитель' ? ' Тепер ти керуєш сам' + g(s, '', 'а') + '.' : ''); } }] };
  } },
  { id: 'supplier', w: 1, cond: function (s, b) { return true; }, mk: function (s, b) {
    var p = clamp(0.3 + s.st.smarts / 250 + s.sk.biz / 300, 0.2, 0.8);
    return { text: 'Основний постачальник підняв ціни на третину.', opts: [
      { t: 'Шукати нового постачальника', sub: p > 0.55 ? 'ти знаєш ринок' : 'можна нарватися на гірший товар', f: function () { if (chance(p)) return 'Знайшовся постачальник навіть дешевший за старого.'; b.mom = clampM((b.mom || 0) - 0.03); return 'Новий постачальник дешевший, але якість гірша — клієнти скаржаться.'; } },
      { t: 'Підняти ціни для клієнтів', f: function () { b.mom = clampM((b.mom || 0) - 0.02); return 'Частина клієнтів пішла, решта платить більше.'; } },
      { t: 'Проковтнути', sub: 'менше прибутку цього року', f: function () { b.cash -= b.cap * 0.07; return 'Ти втрима' + g(s, 'в', 'ла') + ' ціни. Цього року заробиш менше.'; } }] };
  } },
  { id: 'disaster', w: 0.5, cond: function (s, b) { return b.yrs >= 1; }, mk: function (s, b) {
    var dmg = b.cap * rnd(0.25, 0.5), what = pick(['Пожежа', 'Затоплення від сусідів зверху', 'Крадіжка обладнання']);
    if (b.insured) { b.cash -= dmg * 0.1; return { text: what + ' в «' + b.name + '». Збитки ' + fmt(dmg) + '.', opts: [{ t: 'Звернутися до страхової', f: function () { return 'Страховка покрила майже все. Франшиза — ' + fmt(dmg * 0.1) + '.'; } }] }; }
    return { text: what + ' в «' + b.name + '». Збитки ' + fmt(dmg) + '. Страховки не було.', opts: [
      { t: 'Відновити за свої', sub: fmt(dmg), dis: s.money < dmg && b.cash < dmg && !canBorrow(s), f: function () { payBiz(s, b, dmg); return 'Відновлено. Місяць простою.'; } },
      { t: 'Відновити частково', sub: 'дешевше, але бізнес стане меншим', f: function () { payBiz(s, b, dmg * 0.4); b.cap -= dmg * 0.6; b.mom = clampM((b.mom || 0) - 0.02); return 'Відкрилися, але вже не в повну силу.'; } },
      { t: 'Закрити бізнес', f: function () { closeBiz(s, b, 'закрито після ' + what.toLowerCase(), b.cap * 0.1 + Math.max(0, b.cash)); add(s, { happy: -10 }); return 'Ти закри' + g(s, 'в', 'ла') + ' «' + b.name + '».'; } }] };
  } },
  { id: 'insurance', w: 0.6, cond: function (s, b) { return !b.insured && b.yrs >= 1; }, mk: function (s, b) {
    var cost = b.cap * 0.012;
    return { text: 'Страховий агент пропонує застрахувати «' + b.name + '» від пожежі, затоплення й крадіжки.', opts: [
      { t: 'Застрахувати', sub: '~' + fmt(cost) + '/рік', f: function () { b.insured = 1; return 'Поліс оформлено. Сподіваєшся, не знадобиться.'; } },
      { t: 'Обійдуся', f: function () { return 'Ти вирішив' + g(s, '', 'ла') + ' не платити за «а раптом».'; } }] };
  } },
  { id: 'inspect', w: 0.9, cond: function (s, b) { return b.yrs >= 1; }, mk: function (s, b) {
    var c = C(s), q = bizQ(s, b), fine = M(s) * rnd(0.2, 0.6), bribe = fine * 0.4;
    var o = [
      { t: 'Виправити все й заплатити штраф', sub: q >= 50 ? 'порушень мало' : 'порушень багато', f: function () { var f2 = q >= 50 ? fine * 0.3 : fine; payBiz(s, b, f2); return 'Штраф ' + fmt(f2) + '. Тепер усе за правилами.'; } }];
    if (c.law < 0.7) o.push({ t: 'Домовитися з інспектором', sub: fmt(bribe) + ' · тут «так прийнято»', f: function () { payBiz(s, b, bribe); if (chance(c.law * 0.3)) return court(s, 'хабар посадовій особі', 1, 3); return 'Конверт — і перевірка нічого не знайшла.'; } });
    o.push({ t: 'Оскаржити в суді', sub: 'юрист і нерви', f: function () { payBiz(s, b, M(s) * 0.15); if (chance(0.25 + c.law * 0.35)) return 'Суд скасував штраф.'; payBiz(s, b, fine); return 'Суд програно: і штраф, і юрист.'; } });
    return { text: 'До «' + b.name + '» прийшла перевірка: санстанція, пожежники й податкова в один тиждень.', opts: o };
  } },
  { id: 'racket', w: 0.8, cond: function (s, b) { return C(s).law < 0.5 && !b.roof && !s.gang; }, mk: function (s, b) {
    var c = C(s), pay = Math.max(M(s) * 0.15, Math.max(0, b.last || 0) * 0.15);
    return { text: 'До тебе прийшли «серйозні люди»: хочуть ' + fmt(pay) + ' на рік «за спокій».', opts: [
      { t: 'Платити', sub: 'спокій за гроші', f: function () { b.roof = pay; return 'Тепер ти щороку платиш ' + fmt(pay) + '. Ніхто не чіпає.'; } },
      { t: 'Піти в поліцію', sub: 'поліція тут ' + (c.law < 0.3 ? 'майже не працює' : 'працює через раз'), f: function () { if (chance(c.law)) return 'Поліція спрацювала: їх затримали.'; var d = b.cap * 0.3; b.cap -= d; b.mom = clampM((b.mom || 0) - 0.05); return 'Поліція «прийняла заяву». Через тиждень у «' + b.name + '» вибили вітрини й підпалили склад.'; } },
      { t: 'Відмовити', sub: 'ризиковано', f: function () { if (chance(0.4)) return 'Більше не приходили. Мабуть, знайшли легшу ціль.'; add(s, { health: -15 }); b.cap *= 0.8; return 'Тебе зустріли біля машини. Лікарня, а потім — розбитий магазин.'; } }] };
  } },
  { id: 'scandal', w: 0.7, cond: function (s, b) { return b.yrs >= 1; }, mk: function (s, b) {
    return { text: 'Клієнтка виклала відео, де «' + b.name + '» виглядає жахливо. Його переглянули сотні тисяч.', opts: [
      { t: 'Публічно вибачитися і компенсувати', sub: 'харизма вирішує', f: function () { if (chance(0.35 + s.st.social / 180)) { b.mom = clampM((b.mom || 0) + 0.01); return 'Людям сподобалося, як ти відреагува' + g(s, 'в', 'ла') + '. Історія навіть пішла на користь.'; } b.mom = clampM((b.mom || 0) - 0.02); return 'Вибачення сприйняли як «відмазку». Шторм ущух за місяць.'; } },
      { t: 'Ігнорувати', f: function () { b.mom = clampM((b.mom || 0) - 0.04); return 'Ти промовча' + g(s, 'в', 'ла') + ', а відгуки посипалися ще й на картах.'; } },
      { t: 'Подати до суду за наклеп', sub: 'ефект Стрейзанд', f: function () { b.mom = clampM((b.mom || 0) - 0.06); return 'Про позов написали новини. Тепер відео бачили всі.'; } }] };
  } },
  { id: 'ad', w: 1, cond: function (s, b) { return true; }, mk: function (s, b) {
    var q = bizQ(s, b), st = bizStage(b), cost = M(s) * rnd(0.25, 0.6);
    return { text: 'Рекламна агенція пропонує кампанію для «' + b.name + '».', opts: [
      { t: 'Замовити кампанію', sub: fmt(cost), dis: s.money < cost && b.cash < cost, f: function () { payBiz(s, b, cost); if (q >= 50 && st !== 'спад') { b.mom = clampM((b.mom || 0) + 0.05); return 'Реклама окупилася: нові клієнти лишилися, бо їм сподобалося.'; } b.mom = clampM((b.mom || 0) + 0.005); return 'Реклама не окупилася: люди прийшли, але не повернулися — ' + (st === 'спад' ? 'сам формат уже застарів.' : 'якість поки не дотягує (підготовка «' + bizReadyLabel(q) + '»).'); } },
      { t: 'Не треба', f: function () { return 'Ти покладаєшся на сарафанне радіо.'; } }] };
  } },
  { id: 'burnout', w: 1.2, cond: function (s, b) { return !b.mgr && (s.biz.length > 1 || s.job) && b.yrs >= 1; }, mk: function (s, b) {
    var cost = C(s).median * 0.8;
    return { text: 'Ти розриваєшся між ' + (s.job ? 'роботою' : 'кількома справами') + ' і «' + b.name + '». Сил уже немає.', opts: [
      { t: 'Найняти управителя', sub: '~' + fmt(cost) + '/рік · тобі лишаться лише дивіденди', f: function () { b.mgr = true; return 'Управитель узяв усе на себе. Ти нарешті спиш.'; } },
      { t: 'Тягнути далі', sub: 'здоровʼя і якість постраждають', f: function () { add(s, { health: -6, happy: -6 }); b.mom = clampM((b.mom || 0) - 0.02); return 'Ти тягнеш. Поки що.'; } },
      { t: 'Продати «' + b.name + '»', sub: '~' + fmt(bizValue(s, b) * 0.85), f: function () { var v = bizValue(s, b) * 0.85; closeBiz(s, b, 'продано', v); return 'Продано за ' + fmt(v) + '. Одним клопотом менше.'; } }] };
  } },
  { id: 'aging', w: 1.5, cond: function (s, b) { return b.yrs >= 7 && (b.mom || 0) < -0.02; }, mk: function (s, b) {
    var cost = b.cap * 0.25, q = bizQ(s, b), p = clamp(0.35 + q / 200, 0.3, 0.8);
    return { text: '«' + b.name + '» застаріває: молоді клієнти йдуть до новіших місць, прибуток тане.', opts: [
      { t: 'Ребрендинг і оновлення', sub: fmt(cost) + (p > 0.6 ? ' · є з чим працювати' : ' · шанси так собі'), dis: s.money < cost && b.cash < cost, f: function () { payBiz(s, b, cost); if (chance(p)) { b.mom = 0.07; b.cap += cost * 0.6; return 'Оновлення вдалося — «' + b.name + '» знову на слуху.'; } return 'Нова вивіска, старі проблеми. Клієнти не повернулися.'; } },
      { t: 'Доїти до кінця', sub: 'забирати все, нічого не вкладати', f: function () { b.div = 1; b.mom = clampM((b.mom || 0) - 0.02); return 'Ти забираєш усі гроші. Справа доживає свій вік.'; } },
      { t: 'Продати, поки є що продавати', sub: '~' + fmt(bizValue(s, b) * 0.8), f: function () { var v = bizValue(s, b) * 0.8; closeBiz(s, b, 'продано', v); return 'Продано за ' + fmt(v) + '.'; } }] };
  } }
];
// платити з каси бізнесу, а якщо там бракує — зі своїх
function payBiz(s, b, a) { var fromB = Math.min(Math.max(0, b.cash), a); b.cash -= fromB; s.money -= a - fromB; }

function bizEventTick(s, out) {
  if (!s.biz.length || s.prison) return;
  s.biz.forEach(function (b) { bizMomTick(s, b); if (b.nextEv == null) b.nextEv = s.age + ri(2, 4); if (b.roof) { b.cash -= b.roof; } if (b.insured) b.cash -= b.cap * 0.012; });
  if (out.length >= 2) return;
  var due = s.biz.filter(function (b) { return s.age >= b.nextEv; });
  if (!due.length) return;
  var b = pick(due); b.nextEv = s.age + ri(2, 4);
  var pool = BIZ_EVENTS.filter(function (e) { return e.cond(s, b) && b.lastEv !== e.id; });
  if (!pool.length) return;
  var e = wsample(pool, 1, function (x) { return x.w; })[0];
  b.lastEv = e.id;
  var p = e.mk(s, b); p.title = '«' + b.name + '» · ' + bizStage(b);
  out.push(p);
}

// ----------------------------------------------------------------------
// Без меню: лише «Продати або закрити» і стан справ
// ----------------------------------------------------------------------
(function () {
  var a = ACTIONS.filter(function (x) { return x.id === 'bizmanage'; })[0];
  a.n = 'Продати або закрити бізнес';
  a.d = function (s) { return s.biz.map(function (b) { return b.name + ' — ' + bizStage(b); }).join(', '); };
  a.run = function (s) {
    return { title: 'Твої бізнеси', text: 'Розвиток іде через події, що трапляються самі. Тут — лише вихід.', opts: s.biz.map(function (b) {
      var v = bizValue(s, b) * rnd(0.85, 1.05);
      return { t: b.name + ' · ' + bizStage(b), sub: 'рік ' + b.yrs + ' · минулий рік ' + (b.last >= 0 ? '+' : '−') + fmt(Math.abs(b.last || 0)) + ' · покупці дають ~' + fmt(v), f: function () {
        return { title: b.name, text: 'Що робиш?', opts: [
          { t: 'Продати за ~' + fmt(v), f: function () { closeBiz(s, b, 'продано', v); return 'Продано за ' + fmt(v) + '.'; } },
          { t: 'Ліквідувати', sub: 'розпродати майно (~' + fmt(b.cap * 0.3 + Math.max(0, b.cash)) + ')', f: function () { closeBiz(s, b, 'закрито', b.cap * 0.3 + Math.max(0, b.cash)); add(s, { happy: -6 }); return 'Ти закри' + g(s, 'в', 'ла') + ' «' + b.name + '».'; } },
          { t: 'Лишити', f: function () { return 'Справа живе далі.'; } }] };
      } };
    }) };
  };
  // старі «можливості» з fix3 більше не потрібні
  bizMenu = function (s, b) { return a.run(s); };
})();
(function () { var lt = life2Tick; life2Tick = function (s, out) { lt(s, out); bizEventTick(s, out); }; })();
