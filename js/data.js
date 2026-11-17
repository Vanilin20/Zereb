// ЖЕРЕБ — дані. Приблизні значення (UN WPP / World Bank / UNICEF, ~2023).
// Поля: код, назва, прапор, народжень на рік (тис.), очікувана тривалість життя,
// смертність до 5 років (на 1000), ВВП на душу за ПКС (тис. $), частка, що закінчує
// старшу школу, частка міського населення, рівень конфлікту (0-2), набір імен,
// пенсія (частка медіанного доходу), строкова служба (1/0), сумарна народжуваність.
var RAW_COUNTRIES = [
  ['IN','Індія','🇮🇳',23000,72,29,9.2,.45,.36,0,'in',.10,0,2.0],
  ['CN','Китай','🇨🇳',9000,78,7,23,.75,.65,0,'cn',.30,0,1.0],
  ['NG','Нігерія','🇳🇬',7900,54,105,6,.45,.54,1,'wa',.03,0,5.1],
  ['PK','Пакистан','🇵🇰',6900,67,60,6.4,.30,.38,1,'pk',.05,0,3.5],
  ['ID','Індонезія','🇮🇩',4400,71,21,15,.60,.58,0,'sa',.10,0,2.1],
  ['CD','ДР Конго','🇨🇩',4400,61,76,1.6,.25,.47,2,'ea',.01,0,6.1],
  ['ET','Ефіопія','🇪🇹',3900,66,47,3,.15,.23,1,'ea',.02,0,4.1],
  ['US','США','🇺🇸',3600,78,6,80,.92,.83,0,'en',.40,0,1.6],
  ['BD','Бангладеш','🇧🇩',2900,74,29,8.6,.35,.40,0,'pk',.05,0,1.9],
  ['BR','Бразилія','🇧🇷',2500,76,14,20,.65,.88,0,'la',.50,0,1.6],
  ['EG','Єгипет','🇪🇬',2200,71,18,17,.60,.43,0,'ar',.20,1,2.8],
  ['TZ','Танзанія','🇹🇿',2200,67,43,3.6,.15,.37,0,'ea',.02,0,4.6],
  ['PH','Філіппіни','🇵🇭',2100,72,26,10.5,.65,.48,0,'sa',.10,0,1.9],
  ['MX','Мексика','🇲🇽',1900,75,13,23,.55,.81,1,'la',.30,0,1.8],
  ['UG','Уганда','🇺🇬',1600,64,40,3,.15,.26,0,'ea',.02,0,4.4],
  ['KE','Кенія','🇰🇪',1500,63,37,6,.40,.29,0,'ea',.05,0,3.2],
  ['AF','Афганістан','🇦🇫',1500,66,55,2,.20,.27,2,'pk',.01,0,4.8],
  ['SD','Судан','🇸🇩',1400,66,54,3.5,.20,.36,2,'ar',.01,0,4.4],
  ['VN','Вʼєтнам','🇻🇳',1400,74,20,14,.60,.39,0,'sa',.20,1,1.9],
  ['AO','Ангола','🇦🇴',1300,64,64,8,.25,.68,0,'ea',.03,1,5.0],
  ['NE','Нігер','🇳🇪',1200,63,115,1.6,.05,.17,1,'wa',.01,0,6.6],
  ['MZ','Мозамбік','🇲🇿',1200,63,67,1.5,.12,.38,1,'ea',.01,0,4.5],
  ['IQ','Ірак','🇮🇶',1100,72,24,11,.35,.71,1,'ar',.20,0,3.3],
  ['ZA','ПАР','🇿🇦',1100,62,32,15,.50,.68,0,'ea',.10,0,2.3],
  ['IR','Іран','🇮🇷',1100,77,12,18,.70,.77,1,'ir',.30,1,1.7],
  ['TR','Туреччина','🇹🇷',1000,77,9,40,.70,.77,0,'tr',.40,1,1.5],
  ['YE','Ємен','🇾🇪',900,64,60,2.5,.25,.39,2,'ar',.01,0,3.7],
  ['GH','Гана','🇬🇭',900,64,42,7,.45,.59,0,'wa',.05,0,3.5],
  ['CM','Камерун','🇨🇲',900,63,67,4.6,.25,.59,1,'wa',.03,0,4.3],
  ['ML','Малі','🇲🇱',900,61,94,2.6,.10,.46,2,'wa',.01,0,5.6],
  ['MG','Мадагаскар','🇲🇬',900,65,63,1.8,.12,.40,0,'ea',.02,0,3.8],
  ['MM','Мʼянма','🇲🇲',800,67,40,5.5,.30,.32,2,'sa',.03,1,2.1],
  ['JP','Японія','🇯🇵',730,84,2,49,.95,.92,0,'jp',.40,0,1.2],
  ['DE','Німеччина','🇩🇪',690,81,4,66,.88,.78,0,'eu',.48,0,1.4],
  ['FR','Франція','🇫🇷',680,83,4,58,.88,.82,0,'eu',.55,0,1.6],
  ['GB','Велика Британія','🇬🇧',680,81,4,54,.88,.84,0,'en',.40,0,1.5],
  ['SA','Саудівська Аравія','🇸🇦',600,78,6,65,.80,.85,0,'ar',.50,0,2.3],
  ['TH','Таїланд','🇹🇭',500,80,8,21,.65,.53,0,'sa',.15,1,1.3],
  ['NP','Непал','🇳🇵',500,71,26,4.8,.40,.22,0,'in',.05,0,2.0],
  ['CO','Колумбія','🇨🇴',500,77,12,21,.65,.82,1,'la',.30,0,1.6],
  ['AR','Аргентина','🇦🇷',460,77,7,27,.65,.92,0,'la',.40,0,1.4],
  ['IT','Італія','🇮🇹',380,83,3,55,.85,.72,0,'eu',.60,0,1.2],
  ['CA','Канада','🇨🇦',350,82,5,58,.92,.82,0,'en',.40,0,1.3],
  ['ES','Іспанія','🇪🇸',320,84,3,50,.75,.81,0,'eu',.55,0,1.2],
  ['AU','Австралія','🇦🇺',300,84,4,64,.90,.86,0,'en',.40,0,1.6],
  ['HT','Гаїті','🇭🇹',270,64,56,3.1,.25,.59,2,'la',.01,0,2.7],
  ['PL','Польща','🇵🇱',270,78,4,46,.93,.60,0,'pl',.45,0,1.2],
  ['KR','Південна Корея','🇰🇷',230,84,3,52,.96,.81,0,'kr',.30,1,0.7],
  ['UA','Україна','🇺🇦',190,69,8,15,.92,.70,2,'ua',.30,0,1.0],
  ['SE','Швеція','🇸🇪',100,83,2,66,.88,.88,0,'sc',.55,1,1.4],
  ['UZ','Узбекистан','🇺🇿',930,72,14,10,.90,.50,0,'ca',.20,1,3.3],
  ['DZ','Алжир','🇩🇿',900,77,22,13,.50,.75,0,'ar',.25,1,2.8],
  ['MA','Марокко','🇲🇦',650,75,17,9.5,.40,.65,0,'ar',.15,1,2.3],
  ['PE','Перу','🇵🇪',500,77,13,15,.75,.79,0,'la',.20,0,2.1],
  ['MY','Малайзія','🇲🇾',450,76,8,33,.60,.78,0,'ms',.25,0,1.8],
  ['KZ','Казахстан','🇰🇿',390,74,9,31,.90,.58,0,'ca',.30,1,3.0],
  ['LK','Шрі-Ланка','🇱🇰',300,77,7,14,.75,.19,0,'in',.15,0,2.0],
  ['CL','Чилі','🇨🇱',190,80,7,30,.85,.88,0,'la',.35,0,1.2],
  ['IL','Ізраїль','🇮🇱',180,83,3,50,.90,.93,1,'he',.40,2,2.9],
  ['NL','Нідерланди','🇳🇱',165,82,4,72,.85,.93,0,'nl',.60,0,1.5],
  ['RO','Румунія','🇷🇴',160,76,7,42,.80,.54,0,'ro',.40,0,1.7],
  ['BE','Бельгія','🇧🇪',113,82,4,65,.85,.98,0,'nl',.55,0,1.5],
  ['AZ','Азербайджан','🇦🇿',110,73,18,18,.85,.57,1,'az',.30,1,1.6],
  ['AE','ОАЕ','🇦🇪',100,79,6,78,.85,.87,0,'ar',.30,1,1.4],
  ['CZ','Чехія','🇨🇿',91,79,3,50,.93,.74,0,'cz',.45,0,1.6],
  ['HU','Угорщина','🇭🇺',85,76,4,42,.85,.73,0,'hu',.50,0,1.5],
  ['PT','Португалія','🇵🇹',85,82,3,45,.75,.67,0,'pt',.55,0,1.4],
  ['CH','Швейцарія','🇨🇭',80,84,4,86,.90,.74,0,'eu',.50,1,1.4],
  ['AT','Австрія','🇦🇹',77,82,4,68,.88,.59,0,'eu',.60,1,1.4],
  ['GR','Греція','🇬🇷',71,81,4,39,.85,.80,0,'gr',.55,1,1.3],
  ['RS','Сербія','🇷🇸',62,75,6,25,.85,.57,0,'bk',.40,0,1.6],
  ['NZ','Нова Зеландія','🇳🇿',60,82,5,50,.85,.87,0,'en',.40,0,1.6],
  ['DK','Данія','🇩🇰',57,82,4,74,.85,.88,0,'sc',.55,1,1.5],
  ['BG','Болгарія','🇧🇬',57,75,7,33,.80,.76,0,'bk',.40,0,1.7],
  ['IE','Ірландія','🇮🇪',55,83,3,120,.92,.64,0,'en',.40,0,1.6],
  ['SK','Словаччина','🇸🇰',54,77,6,40,.90,.54,0,'cz',.45,0,1.6],
  ['NO','Норвегія','🇳🇴',51,83,2,90,.85,.84,0,'sc',.55,2,1.4],
  ['FI','Фінляндія','🇫🇮',43,82,2,60,.90,.86,0,'sc',.55,1,1.3],
  ['GE','Грузія','🇬🇪',42,72,9,22,.85,.60,0,'ge',.25,1,2.0],
  ['AM','Вірменія','🇦🇲',36,75,11,20,.85,.63,1,'am',.25,1,1.6],
  ['SG','Сінгапур','🇸🇬',33,83,2,130,.95,1,0,'sa',.30,1,1.0],
  ['HR','Хорватія','🇭🇷',33,78,5,42,.90,.58,0,'bk',.45,0,1.5],
  ['MD','Молдова','🇲🇩',25,70,14,17,.75,.43,0,'ro',.30,0,1.8],
  ['LT','Литва','🇱🇹',20,76,3,48,.92,.68,0,'bt',.40,1,1.3],
  ['LV','Латвія','🇱🇻',14,75,4,40,.90,.69,0,'bt',.40,0,1.4],
  ['EE','Естонія','🇪🇪',11,78,2,46,.90,.69,0,'bt',.40,1,1.4]
];

function clamp01(v) { return Math.max(0, Math.min(1, v)); }
// Правила країн (приблизно, станом на ~2024)
var LANG_OF = { IN: 'hi', CN: 'zh', NG: 'en', PK: 'ur', ID: 'id', CD: 'fr', ET: 'am', US: 'en', BD: 'bn', BR: 'pt', EG: 'ar', TZ: 'sw', PH: 'en', MX: 'es', UG: 'en', KE: 'en', AF: 'fa', SD: 'ar', VN: 'vi', AO: 'pt', NE: 'fr', MZ: 'pt', IQ: 'ar', ZA: 'en', IR: 'fa', TR: 'tr', YE: 'ar', GH: 'en', CM: 'fr', ML: 'fr', MG: 'fr', MM: 'my', JP: 'ja', DE: 'de', FR: 'fr', GB: 'en', SA: 'ar', TH: 'th', NP: 'ne', CO: 'es', AR: 'es', IT: 'it', CA: 'en', ES: 'es', AU: 'en', HT: 'fr', PL: 'pl', KR: 'ko', UA: 'uk', SE: 'sv', UZ: 'uz', DZ: 'ar', MA: 'ar', PE: 'es', MY: 'ms', KZ: 'kk', LK: 'si', CL: 'es', IL: 'he', NL: 'nl', RO: 'ro', BE: 'nl', AZ: 'az', AE: 'ar', CZ: 'cs', HU: 'hu', PT: 'pt', CH: 'de', AT: 'de', GR: 'el', RS: 'sr', NZ: 'en', DK: 'da', BG: 'bg', IE: 'en', SK: 'sk', NO: 'no', FI: 'fi', GE: 'ka', AM: 'hy', SG: 'en', HR: 'hr', MD: 'ro', LT: 'lt', LV: 'lv', EE: 'et' };
var LANG_NAMES = { en: 'Англійська', uk: 'Українська', pl: 'Польська', de: 'Німецька', fr: 'Французька', es: 'Іспанська', it: 'Італійська', pt: 'Португальська', nl: 'Нідерландська', sv: 'Шведська', no: 'Норвезька', da: 'Данська', fi: 'Фінська', cs: 'Чеська', sk: 'Словацька', hu: 'Угорська', ro: 'Румунська', bg: 'Болгарська', sr: 'Сербська', hr: 'Хорватська', el: 'Грецька', lt: 'Литовська', lv: 'Латиська', et: 'Естонська', ka: 'Грузинська', hy: 'Вірменська', az: 'Азербайджанська', kk: 'Казахська', uz: 'Узбецька', tr: 'Турецька', ar: 'Арабська', he: 'Іврит', fa: 'Перська', zh: 'Китайська', ja: 'Японська', ko: 'Корейська', hi: 'Гінді', ur: 'Урду', bn: 'Бенгальська', id: 'Індонезійська', ms: 'Малайська', vi: 'Вʼєтнамська', th: 'Тайська', my: 'Бірманська', ne: 'Непальська', si: 'Сингальська', sw: 'Суахілі', am: 'Амхарська' };
var LEARNABLE = ['pl', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'cs', 'sv', 'no', 'ja', 'ko', 'zh', 'ar', 'tr', 'he', 'uk', 'ro', 'el'];
var ENG_FRIENDLY = ['NL', 'SE', 'NO', 'DK', 'FI', 'SG', 'AE', 'IL', 'MY', 'CH', 'BE', 'EE', 'IN', 'PH', 'NG', 'KE'];
var RET_AGE = { UA: 60, PL: 65, DE: 67, FR: 64, US: 67, GB: 66, IT: 67, ES: 66, PT: 66, NL: 67, BE: 66, AT: 65, CH: 65, SE: 65, NO: 67, DK: 67, FI: 65, IE: 66, CZ: 65, SK: 63, HU: 65, RO: 65, BG: 64, GR: 67, HR: 65, RS: 65, LT: 65, LV: 65, EE: 65, MD: 63, GE: 65, AM: 63, AZ: 65, KZ: 63, UZ: 60, TR: 60, IL: 67, CN: 60, JP: 65, KR: 63, IN: 60, BR: 65, MX: 65, AR: 65, CL: 65, CA: 65, AU: 67, NZ: 65, SG: 63, AE: 60, SA: 60 };
var UNI_FEE = { DE: 'free', AT: 'free', CZ: 'free', SK: 'free', PL: 'free', NO: 'free', FI: 'free', DK: 'free', SE: 'free', FR: 'free', GR: 'free', HU: 'merit', EE: 'free', AR: 'free', BR: 'merit', UA: 'merit', RO: 'merit', BG: 'merit', MD: 'merit', KZ: 'merit', UZ: 'merit', GE: 'merit', TR: 'merit', IT: 'paid', ES: 'paid', BE: 'free', NL: 'paid', CH: 'free', IE: 'paid', US: 'high', GB: 'high', AU: 'high', CA: 'high', KR: 'high', JP: 'high', CL: 'high', NZ: 'high', SG: 'high' };
var TAX = { AE: 0, SA: 0, US: .22, DE: .33, FR: .30, BE: .38, DK: .38, SE: .30, NO: .29, FI: .30, AT: .32, IT: .30, NL: .30, PL: .22, UA: .23, CZ: .20, CH: .20, IE: .25, GB: .22, JP: .22, KR: .15, IL: .20, SG: .08, HU: .335, RO: .35, BG: .22, GE: .20, KZ: .10, UZ: .12, SK: .23, LT: .30, LV: .28, EE: .22, HR: .25, GR: .26, PT: .28, ES: .27, CA: .25, AU: .24, NZ: .22, CN: .15, IN: .10, BR: .20, MX: .15, TR: .22, CL: .12, AR: .20 };
var HEALTH = { US: 'paid', NG: 'paid', CD: 'paid', IN: 'mixed', CN: 'mixed', TH: 'free', KR: 'free', JP: 'free', UA: 'mixed', MD: 'mixed', GE: 'mixed', AM: 'mixed', AZ: 'mixed', KZ: 'mixed', UZ: 'mixed', TR: 'free', BR: 'free', MX: 'mixed', CL: 'mixed', AE: 'mixed', SG: 'mixed', SA: 'free', IL: 'free', RS: 'free', BG: 'mixed', RO: 'mixed' };
var HOUSE = { CN: 14, IN: 10, UA: 10, PL: 9, DE: 9, GB: 9, FR: 9, US: 5, CA: 8, AU: 9, JP: 7, KR: 12, TR: 9, BR: 9, MX: 7, CZ: 12, SK: 11, HU: 10, RO: 9, NL: 8, CH: 9, IE: 8, NO: 7, SE: 8, AE: 6, SG: 12, IL: 12, PT: 11, ES: 8, IT: 8, GR: 9, AT: 9, BE: 7, DK: 7, FI: 7, NZ: 9, GE: 10, KZ: 9, RS: 11, HR: 11, BG: 8, EE: 8, LT: 8, LV: 8, MD: 10 };
var LAW = { SG: .95, AE: .85, GE: .7, EE: .85, NG: .3, MX: .3, CO: .35, BR: .4, ZA: .4, HT: .2, CD: .2, YE: .2, SD: .2, AF: .3, UA: .5, MD: .45, KZ: .55, UZ: .55 };
var COUNTRIES = {};
var COUNTRY_LIST = RAW_COUNTRIES.map(function (r) {
  var c = {
    code: r[0], name: r[1], flag: r[2], births: r[3], le: r[4], u5: r[5], gdp: r[6],
    sec: r[7], urban: r[8], conflict: r[9], names: r[10], pens: r[11], consc: r[12], tfr: r[13]
  };
  c.median = c.gdp * 1000 * 0.35;           // медіанний річний дохід працівника, $ ПКС
  c.lang = LANG_OF[c.code] || 'xx';
  c.english = c.lang === 'en';
  c.engOk = c.english || ENG_FRIENDLY.indexOf(c.code) >= 0;   // на роботі можна обійтися англійською
  c.retAge = RET_AGE[c.code] || (c.gdp > 30 ? 65 : 60);
  c.feeType = UNI_FEE[c.code] || (c.gdp > 30 ? 'paid' : 'merit');
  c.fee = { free: 0.02, merit: 0.25, paid: 0.2, high: 0.55 }[c.feeType];
  c.tax = TAX[c.code] != null ? TAX[c.code] : (c.gdp > 40 ? 0.27 : c.gdp > 15 ? 0.17 : 0.08);
  c.health = HEALTH[c.code] || (c.gdp > 30 ? 'free' : c.gdp > 8 ? 'mixed' : 'paid');
  c.hq = clamp01(0.25 + Math.min(c.gdp, 70) / 90);         // якість медицини 0-1
  c.house = HOUSE[c.code] || (c.gdp > 40 ? 8 : c.gdp > 12 ? 9 : 7);
  c.law = LAW[c.code] != null ? LAW[c.code] : clamp01(0.3 + c.gdp / 110);
  COUNTRIES[c.code] = c;
  return c;
});
var TOTAL_BIRTHS = COUNTRY_LIST.reduce(function (a, c) { return a + c.births; }, 0);
var WORLD_LE = 73.3;

// Відкритість для іммігрантів (умовно)
var OPENNESS = { US: .25, CA: .45, AU: .35, NZ: .35, GB: .35, IE: .35, DE: .45, AT: .35, CH: .25, NL: .4, BE: .35, PL: .55, CZ: .5, SE: .35, NO: .3, DK: .3, FI: .35, JP: .2, KR: .25, SG: .3, FR: .35, ES: .45, PT: .45, IT: .4, SA: .4, AE: .55, IL: .15 };

var NAMES = {
  ua: { m: ['Олександр','Дмитро','Андрій','Максим','Іван','Богдан','Артем','Назар','Михайло','Тарас','Остап','Ярослав'],
        f: ['Анна','Марія','Олена','Софія','Дарина','Катерина','Юлія','Оксана','Соломія','Вікторія','Ірина','Злата'],
        s: ['Коваленко','Шевченко','Бондаренко','Ткаченко','Кравчук','Мельник','Олійник','Лисенко','Савчук','Руденко','Гнатюк','Мороз'] },
  cz: { m: ['Jakub','Jan','Tomáš','Matěj','Lukáš','Martin','Ondřej','Peter'], f: ['Tereza','Eliška','Anna','Natálie','Lucie','Kristýna','Zuzana','Petra'], s: ['Novák','Svoboda','Dvořák','Černý','Procházka','Horváth','Kučera','Veselý'] },
  hu: { m: ['Bence','Máté','Levente','Dávid','Ádám','Gergő'], f: ['Hanna','Anna','Zsófia','Luca','Réka','Eszter'], s: ['Nagy','Kovács','Tóth','Szabó','Horváth','Varga'] },
  ro: { m: ['Andrei','Alexandru','Ion','Mihai','Ștefan','Vlad','Radu','Victor'], f: ['Maria','Elena','Ioana','Andreea','Ana','Cristina','Alina','Daniela'], s: ['Popescu','Ionescu','Rusu','Munteanu','Ciobanu','Popa','Stan','Moraru'] },
  bk: { m: ['Luka','Marko','Nikola','Stefan','Ivan','Georgi','Petar','Filip'], f: ['Ana','Milica','Elena','Marija','Sara','Petra','Desislava','Iva'], s: ['Jovanović','Horvat','Petrović','Ivanov','Kovačević','Georgiev','Babić','Dimitrov'] },
  gr: { m: ['Йоргос','Нікос','Дімітріс','Костас','Янніс','Александрос'], f: ['Марія','Елені','Катеріна','Софія','Ангелікі','Деспіна'], s: ['Пападопулос','Паппас','Ікономоу','Георгіу','Ніколау','Васіліу'] },
  nl: { m: ['Daan','Sem','Lucas','Bram','Thomas','Ruben','Jens','Lars'], f: ['Emma','Julia','Sophie','Fleur','Lotte','Sanne','Noor','Eva'], s: ['de Jong','Jansen','de Vries','Peeters','Bakker','Janssens','Visser','Smit'] },
  sc: { m: ['Oskar','William','Lucas','Elias','Emil','Mikkel','Aksel','Eino'], f: ['Alice','Maja','Freja','Ida','Nora','Ella','Aino','Sofie'], s: ['Andersson','Nielsen','Hansen','Johansson','Virtanen','Larsen','Berg','Korhonen'] },
  bt: { m: ['Lukas','Jānis','Matas','Rasmus','Kārlis','Mantas'], f: ['Emilija','Anna','Laura','Liis','Sofija','Elza'], s: ['Kazlauskas','Bērziņš','Tamm','Petrauskas','Kalniņš','Saar'] },
  ge: { m: ['Giorgi','Luka','Davit','Nikoloz','Levan','Irakli'], f: ['Nino','Mariam','Ana','Tamar','Salome','Elene'], s: ['Beridze','Kapanadze','Gelashvili','Maisuradze','Lomidze','Tsiklauri'] },
  am: { m: ['Davit','Narek','Hayk','Aram','Tigran','Armen'], f: ['Anahit','Mariam','Ani','Lilit','Nare','Gayane'], s: ['Grigoryan','Harutyunyan','Sargsyan','Hovhannisyan','Petrosyan','Khachatryan'] },
  az: { m: ['Əli','Hüseyn','Murad','Rauf','Elvin','Tural'], f: ['Leyla','Aysel','Nigar','Günel','Sevinc','Zəhra'], s: ['Məmmədov','Əliyev','Həsənov','Hüseynov','Quliyev','Abbasov'] },
  ca: { m: ['Аліхан','Тимур','Нурсултан','Азамат','Бехзод','Жасур','Даурен','Шерзод'], f: ['Айгерім','Мадіна','Дільноза','Жанар','Нігора','Асель','Камила','Зарина'], s: ['Ахметов','Юсупов','Каримов','Сейткалі','Рахімов','Нурланов','Ташкентов','Абдуллаєв'] },
  he: { m: ['Noam','David','Yosef','Itai','Ariel','Eitan'], f: ['Noa','Tamar','Maya','Shira','Yael','Avigail'], s: ['Cohen','Levi','Mizrahi','Peretz','Biton','Friedman'] },
  ms: { m: ['Muhammad','Ahmad','Adam','Aiman','Wei Jie','Arjun'], f: ['Nur','Aisyah','Siti','Mei Ling','Priya','Hana'], s: ['bin Abdullah','Tan','Lim','binti Ismail','Wong','Ng'] },
  pt: { m: ['João','Francisco','Santiago','Afonso','Tomás','Duarte'], f: ['Maria','Leonor','Matilde','Beatriz','Carolina','Inês'], s: ['Silva','Santos','Ferreira','Pereira','Oliveira','Costa'] },
  pl: { m: ['Jakub','Kacper','Filip','Szymon','Wojciech','Piotr','Mateusz','Antoni'],
        f: ['Zuzanna','Julia','Maja','Hanna','Lena','Alicja','Natalia','Agnieszka'],
        s: ['Kowalski','Nowak','Wiśniewski','Wójcik','Kamiński','Lewandowski','Zieliński','Dąbrowski'] },
  in: { m: ['Арджун','Рахул','Вікрам','Аміт','Раджеш','Санджай','Кіран','Ромеш','Аджай','Девендра'],
        f: ['Прія','Ананья','Діпіка','Кавія','Ліла','Ніша','Пуджа','Сіта','Мірa','Радха'],
        s: ['Шарма','Патель','Сінгх','Кумар','Гупта','Ядав','Редді','Дас','Наїр','Мішра'] },
  cn: { m: ['Вей','Хао','Лей','Мін','Цзюнь','Тао','Юй','Бо'],
        f: ['Лі На','Мей','Сяо','Їн','Лін','Цзін','Хуей','Ся'],
        s: ['Ван','Лі','Чжан','Лю','Чень','Ян','Хуан','Чжао'] },
  wa: { m: ['Чуквуемека','Емека','Олувасеун','Кваме','Муса','Ібрагім','Тунде','Секу'],
        f: ['Нгозі','Аміна','Фатімату','Адаезе','Абена','Йеванде','Айша','Чіамака'],
        s: ['Окафор','Адебайо','Бело','Менса','Траоре','Діалло','Оконкво','Ассане'] },
  ea: { m: ['Абебе','Баракa','Жозе','Мутомбо','Кофі','Сіфісо','Даніель','Ерік'],
        f: ['Аманi','Залія','Мерон','Ніа','Грейс','Есперанса','Тандіве','Фаїда'],
        s: ['Кібет','Мвангі','Бекеле','Ільунга','Сітоле','Окелло','Нджорогe','Масамба'] },
  ar: { m: ['Ахмед','Мухаммед','Омар','Юсеф','Халід','Алі','Хамза','Карім'],
        f: ['Фатіма','Мар\'ям','Нур','Лейла','Сара','Аїша','Ясмін','Хана'],
        s: ['аль-Хасан','Ібрагім','Мансур','Саїд','Абдалла','Хаддад','аль-Амін','Наср'] },
  pk: { m: ['Імран','Білал','Хасан','Аріф','Расул','Тарік','Фарук','Саїф'],
        f: ['Айша','Сана','Зейнаб','Рухсар','Нусрат','Хіна','Маліка','Шабана'],
        s: ['Хан','Ахмед','Чаудхрі','Малік','Хоссейн','Рахман','Кураші','Бутт'] },
  la: { m: ['Мігель','Габріель','Лукас','Матеус','Хосе','Дієго','Сантьяго','Рафаель'],
        f: ['Ізабелла','Валентина','Камила','Лусія','Габріела','Ана','Маріана','Фернанда'],
        s: ['Сілва','Гарсія','Родрігес','Лопес','Мартінес','Сантос','Перейра','Гомес'] },
  en: { m: ['Джеймс','Ліам','Ной','Ітан','Олівер','Джексон','Генрі','Майкл'],
        f: ['Олівія','Емма','Шарлотта','Амелія','Грейс','Софі','Емілі','Хлоя'],
        s: ['Сміт','Джонсон','Браун','Вільямс','Тейлор','Міллер','Девіс','Вілсон'] },
  eu: { m: ['Лукас','Луї','Лоренцо','Еліас','Пабло','Нільс','Фелікс','Маттео'],
        f: ['Емілія','Леа','Джулія','Марта','Ельза','Клара','Інес','Фрея'],
        s: ['Мюллер','Мартен','Россі','Фернандес','Андерссон','Шмідт','Бернар','Конті'] },
  sa: { m: ['Буді','Рісаль','Мінь','Сомчай','Аунг','Хуан','Агус','Туан'],
        f: ['Деві','Сіті','Лан','Малі','Су','Марісель','Путрі','Тхао'],
        s: ['Сантосо','Нгуєн','Чан','Вонг','Рейес','Віджая','Ле','Бусаба'] },
  jp: { m: ['Харуто','Рен','Юто','Со','Хіроші','Кента','Такумі','Даїкі'],
        f: ['Юї','Хіна','Сакура','Ао','Мію','Рін','Мей','Ханако'],
        s: ['Сато','Танака','Судзукі','Такахаші','Ватанабе','Іто','Ямамото','Накамура'] },
  kr: { m: ['Мінджун','Сохо','Джіху','Доюн','Хеджун','Юджін','Тевон','Сонмін'],
        f: ['Сео','Джию','Харин','Мінсо','Суа','Їсо','Даун','Чеюн'],
        s: ['Кім','Лі','Пак','Чхве','Чон','Кан','Чо','Юн'] },
  tr: { m: ['Мехмет','Мустафа','Емре','Бурак','Ахмет','Керем','Йусуф','Онур'],
        f: ['Зейнеп','Еліф','Мерве','Аслі','Дефне','Айше','Ебру','Селін'],
        s: ['Йилмаз','Кая','Демір','Шахін','Челік','Йилдиз','Озтюрк','Аслан'] },
  ir: { m: ['Реза','Алі','Амір','Мехді','Хосейн','Даріуш','Арман','Кіан'],
        f: ['Захра','Фатеме','Наргес','Ширін','Парісa','Мітра','Лейла','Ясаман'],
        s: ['Хоссейні','Ахмаді','Мохаммаді','Карімі','Резаї','Мусаві','Джафарі','Садеґі'] }
};

// Освіта: 0 немає, 1 початкова, 2 базова, 3 повна середня, 4 фахова (коледж), 5 бакалавр, 6 магістр, 7 доктор
var EDU_NAMES = ['Без освіти', 'Початкова школа', 'Базова середня (9 кл.)', 'Повна середня', 'Фахова передвища (коледж)', 'Бакалавр', 'Магістр', 'Доктор наук (PhD)'];

var UNI_FIELDS = {
  it:   { n: 'Компʼютерні науки', diff: .8, years: 4 },
  med:  { n: 'Медицина', diff: .55, years: 6 },
  law:  { n: 'Право', diff: .8, years: 4 },
  eng:  { n: 'Інженерія', diff: .9, years: 4 },
  econ: { n: 'Економіка і бізнес', diff: .9, years: 4 },
  arts: { n: 'Мистецтво і дизайн', diff: .85, years: 4 },
  ped:  { n: 'Педагогіка', diff: 1.1, years: 4 },
  agro: { n: 'Аграрні науки', diff: 1.15, years: 4 },
  sci:  { n: 'Природничі науки', diff: .95, years: 4 },
  hum:  { n: 'Гуманітарні науки і мови', diff: 1, years: 4 }
};
var VOC_FIELDS = {
  tech:   { n: 'Технічний (електрика, механіка)' },
  cook:   { n: 'Кулінарний' },
  nurse:  { n: 'Медичний коледж' },
  itv:    { n: 'IT-коледж' },
  beauty: { n: 'Сфера краси' },
  trans:  { n: 'Транспорт і логістика' }
};

var UNION_JOBS = ['factory', 'teacher', 'nurse', 'doctor', 'miner', 'builder', 'trucker', 'taxi', 'callc', 'courier'];
var RECORD_BAN = ['police', 'judge', 'civil', 'politician', 'teacher', 'pilot', 'banker', 'soldier', 'rescuer', 'lawyer', 'nanny'];
var NATIVE_EN = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'];
var SKILL_NAMES = { music: 'Музика', art: 'Малювання', code: 'Програмування', write: 'Письмо', cook: 'Кулінарія', sport: 'Спорт', eng: 'Англійська', biz: 'Підприємництво', craft: 'Ремесло' };

var LV = ['Початківець', 'Спеціаліст', 'Досвідчений', 'Старший', 'Керівник'];
var LV_PAY = [1, 1.3, 1.65, 2.1, 2.8];

// Професії. edu — мінімальна освіта; f — потрібні напрями (будь-який з); alt — альтернатива: навички замість диплома;
// pay — множник до медіанного доходу країни; g — частка «глобальної» зарплати (віддалена робота); max — макс. рівень;
// comp — шанс отримати оффер (базовий); vol — нестабільний дохід, залежить від слави; urban — тільки місто.
var JOBS = [
  { id: 'farmer', n: 'Фермер (власне господарство)', edu: 0, pay: .45, max: 2, comp: .95, risk: .02, st: 40, sat: 45, lv: ['Наймит','Фермер','Господар'] },
  { id: 'laborer', n: 'Різноробочий', edu: 0, pay: .55, max: 1, comp: .95, risk: .15, st: 55, sat: 30 },
  { id: 'cleaner', n: 'Прибиральник', edu: 0, pay: .55, max: 1, comp: .9, risk: .1, st: 40, sat: 30 },
  { id: 'vendor', n: 'Вуличний торговець', edu: 0, pay: .5, max: 2, comp: .95, risk: .1, st: 45, sat: 35 },
  { id: 'fisher', n: 'Рибалка', edu: 0, pay: .6, max: 2, comp: .8, risk: .08, st: 45, sat: 50 },
  { id: 'nanny', n: 'Доглядальниця / няня', edu: 1, pay: .65, max: 2, comp: .8, risk: .08, st: 45, sat: 50 },
  { id: 'miner', n: 'Шахтар', edu: 1, pay: 1.1, max: 3, comp: .75, risk: .1, st: 75, sat: 30, danger: 1 },
  { id: 'factory', n: 'Робітник на заводі', edu: 1, pay: .85, max: 3, comp: .8, risk: .12, st: 50, sat: 35, lv: ['Учень','Робітник','Майстер','Начальник зміни'] },
  { id: 'builder', n: 'Будівельник', edu: 1, pay: .95, max: 3, comp: .85, risk: .12, st: 60, sat: 40, lv: ['Підсобник','Будівельник','Бригадир','Виконроб'] },
  { id: 'courier', n: 'Курʼєр', edu: 1, pay: .7, max: 1, comp: .9, risk: .12, st: 50, sat: 35, urban: 1 },
  { id: 'waiter', n: 'Офіціант', edu: 2, pay: .7, max: 2, comp: .85, risk: .15, st: 55, sat: 40, urban: 1, lv: ['Офіціант','Старший офіціант','Адміністратор'] },
  { id: 'guard', n: 'Охоронець', edu: 2, pay: .75, max: 2, comp: .85, risk: .08, st: 35, sat: 35 },
  { id: 'seller', n: 'Продавець-консультант', edu: 2, pay: .75, max: 3, comp: .85, risk: .12, st: 45, sat: 40, lv: ['Продавець','Старший продавець','Адміністратор','Директор магазину'] },
  { id: 'taxi', n: 'Таксист', edu: 2, pay: .85, max: 1, comp: .85, risk: .08, st: 50, sat: 40, urban: 1 },
  { id: 'callc', n: 'Оператор кол-центру', edu: 3, pay: .85, max: 3, comp: .8, risk: .15, st: 65, sat: 25, urban: 1 },
  { id: 'soldier', n: 'Військовий за контрактом', edu: 2, pay: 1, max: 4, comp: .8, risk: .03, st: 70, sat: 45, age: [18, 45], danger: 1, lv: ['Рядовий','Сержант','Лейтенант','Капітан','Полковник'] },
  { id: 'police', n: 'Поліцейський', edu: 3, pay: 1.1, max: 4, comp: .65, risk: .02, st: 65, sat: 50, age: [18, 40], lv: ['Патрульний','Сержант','Інспектор','Капітан','Начальник відділу'] },
  { id: 'rescuer', n: 'Рятувальник', edu: 3, pay: 1.05, max: 3, comp: .6, risk: .02, st: 65, sat: 65, age: [18, 40], danger: 1 },
  { id: 'electric', n: 'Електрик', edu: 4, f: ['tech'], pay: 1.25, max: 3, comp: .8, risk: .06, st: 45, sat: 55 },
  { id: 'plumber', n: 'Сантехнік', edu: 4, f: ['tech'], pay: 1.15, max: 3, comp: .85, risk: .05, st: 45, sat: 50 },
  { id: 'mechanic', n: 'Автомеханік', edu: 4, f: ['tech', 'trans'], alt: { craft: 50 }, pay: 1.1, max: 3, comp: .85, risk: .06, st: 45, sat: 55 },
  { id: 'welder', n: 'Зварювальник', edu: 4, f: ['tech'], pay: 1.2, max: 3, comp: .85, risk: .07, st: 55, sat: 45 },
  { id: 'cook', n: 'Кухар', edu: 4, f: ['cook'], alt: { cook: 45 }, pay: 1, max: 3, comp: .85, risk: .1, st: 60, sat: 50, lv: ['Помічник кухаря','Кухар','Су-шеф','Старший кухар'] },
  { id: 'chef', n: 'Шеф-кухар', edu: 3, alt: { cook: 75 }, pay: 1.9, max: 4, comp: .4, risk: .06, st: 70, sat: 70, urban: 1, prev: { cook: 4 } },
  { id: 'hair', n: 'Перукар / бʼюті-майстер', edu: 4, f: ['beauty'], alt: { art: 40 }, pay: .95, max: 3, comp: .85, risk: .07, st: 40, sat: 60 },
  { id: 'nurse', n: 'Медсестра / медбрат', edu: 4, f: ['nurse', 'med'], pay: 1.2, max: 3, comp: .85, risk: .02, st: 65, sat: 60 },
  { id: 'trucker', n: 'Далекобійник', edu: 4, f: ['trans'], pay: 1.3, max: 2, comp: .8, risk: .07, st: 55, sat: 45 },
  { id: 'sysadmin', n: 'Сисадмін', edu: 4, f: ['itv', 'it'], alt: { code: 45 }, pay: 1.4, g: .2, max: 3, comp: .7, risk: .06, st: 45, sat: 55 },
  { id: 'dev', n: 'Програміст', edu: 5, f: ['it', 'sci', 'eng'], alt: { code: 60 }, pay: 2.2, g: .5, max: 4, comp: .55, risk: .07, st: 55, sat: 65, lv: ['Junior','Middle','Senior','Tech Lead','CTO'] },
  { id: 'gamedev', n: 'Розробник ігор', edu: 5, f: ['it', 'arts'], alt: { code: 55 }, pay: 1.8, g: .4, max: 4, comp: .4, risk: .12, st: 60, sat: 75, lv: ['Junior','Middle','Senior','Lead','Game Director'] },
  { id: 'datasci', n: 'Data Scientist', edu: 6, f: ['it', 'sci', 'econ'], pay: 2.6, g: .5, max: 4, comp: .45, risk: .06, st: 55, sat: 65 },
  { id: 'designer', n: 'Дизайнер', edu: 5, f: ['arts', 'it'], alt: { art: 60 }, pay: 1.4, g: .3, max: 4, comp: .55, risk: .1, st: 50, sat: 70 },
  { id: 'account', n: 'Бухгалтер', edu: 5, f: ['econ'], pay: 1.3, max: 4, comp: .7, risk: .05, st: 45, sat: 40, lv: ['Помічник','Бухгалтер','Старший бухгалтер','Гол. бухгалтер','Фінансовий директор'] },
  { id: 'market', n: 'Маркетолог', edu: 5, f: ['econ', 'hum', 'arts'], pay: 1.4, g: .15, max: 4, comp: .6, risk: .1, st: 55, sat: 55 },
  { id: 'banker', n: 'Банкір / фінансист', edu: 5, f: ['econ'], pay: 2.2, max: 4, comp: .4, risk: .07, st: 70, sat: 50, urban: 1, lv: ['Аналітик','Спеціаліст','Віце-президент','Директор','Партнер'] },
  { id: 'teacher', n: 'Вчитель', edu: 5, f: ['ped', 'hum', 'sci'], pay: 1, max: 3, comp: .8, risk: .02, st: 60, sat: 60, lv: ['Молодий вчитель','Вчитель','Вчитель вищої категорії','Директор школи'] },
  { id: 'lawyer', n: 'Юрист', edu: 5, f: ['law'], pay: 1.9, max: 4, comp: .55, risk: .05, st: 65, sat: 55, lv: ['Помічник юриста','Юрист','Старший юрист','Партнер','Керуючий партнер'] },
  { id: 'judge', n: 'Суддя', edu: 6, f: ['law'], pay: 3, max: 2, comp: .25, risk: .01, st: 60, sat: 60, prev: { lawyer: 6 }, age: [30, 70] },
  { id: 'engineer', n: 'Інженер', edu: 5, f: ['eng'], pay: 1.7, max: 4, comp: .7, risk: .06, st: 50, sat: 60, lv: ['Інженер-стажер','Інженер','Провідний інженер','Головний інженер','Технічний директор'] },
  { id: 'architect', n: 'Архітектор', edu: 5, f: ['eng', 'arts'], pay: 1.8, max: 4, comp: .5, risk: .08, st: 55, sat: 70 },
  { id: 'journal', n: 'Журналіст', edu: 5, f: ['hum'], alt: { write: 55 }, pay: 1.1, max: 4, comp: .55, risk: .1, st: 60, sat: 65, lv: ['Кореспондент','Журналіст','Оглядач','Редактор','Головний редактор'] },
  { id: 'translator', n: 'Перекладач', edu: 5, f: ['hum'], alt: { eng: 85 }, pay: 1.2, g: .2, max: 3, comp: .6, risk: .08, st: 40, sat: 55 },
  { id: 'psych', n: 'Психолог', edu: 6, f: ['sci', 'hum', 'med'], pay: 1.3, max: 3, comp: .55, risk: .05, st: 55, sat: 70 },
  { id: 'pharm', n: 'Фармацевт', edu: 5, f: ['med', 'sci'], pay: 1.6, max: 3, comp: .7, risk: .03, st: 45, sat: 50 },
  { id: 'doctor', n: 'Лікар', edu: 6, f: ['med'], pay: 2.4, max: 4, comp: .75, risk: .01, st: 75, sat: 70, lv: ['Інтерн','Лікар','Старший лікар','Завідувач відділення','Головний лікар'] },
  { id: 'surgeon', n: 'Хірург', edu: 6, f: ['med'], pay: 3.6, max: 3, comp: .35, risk: .01, st: 85, sat: 75, prev: { doctor: 3 }, need: { smarts: 70 } },
  { id: 'vet', n: 'Ветеринар', edu: 5, f: ['agro', 'med', 'sci'], pay: 1.3, max: 3, comp: .7, risk: .03, st: 50, sat: 70 },
  { id: 'agronom', n: 'Агроном', edu: 5, f: ['agro'], pay: 1.2, max: 3, comp: .8, risk: .04, st: 40, sat: 55 },
  { id: 'scientist', n: 'Науковець', edu: 6, f: ['sci', 'eng', 'it', 'med', 'agro'], pay: 1.4, max: 4, comp: .5, risk: .05, st: 50, sat: 75, lv: ['Лаборант','Молодший науковий','Науковий співробітник','Провідний науковець','Завідувач лабораторії'] },
  { id: 'prof', n: 'Викладач університету', edu: 7, pay: 1.6, max: 4, comp: .45, risk: .02, st: 50, sat: 70, lv: ['Асистент','Старший викладач','Доцент','Професор','Декан'] },
  { id: 'civil', n: 'Держслужбовець', edu: 5, pay: 1.2, max: 4, comp: .6, risk: .02, st: 45, sat: 40, lv: ['Спеціаліст','Головний спеціаліст','Начальник відділу','Директор департаменту','Заступник міністра'] },
  { id: 'manager', n: 'Менеджер', edu: 5, pay: 1.8, max: 4, comp: .5, risk: .08, st: 65, sat: 50, exp: 3, lv: ['Мол. менеджер','Менеджер','Старший менеджер','Директор','Генеральний директор'] },
  { id: 'pilot', n: 'Пілот', edu: 5, f: ['eng', 'trans'], pay: 3, max: 3, comp: .3, risk: .05, st: 60, sat: 75, need: { smarts: 60, health: 65 }, lv: ['Другий пілот','Пілот','Капітан','Шеф-пілот'] },
  { id: 'politician', n: 'Політик', edu: 5, pay: 2.5, max: 4, comp: .2, risk: .2, st: 80, sat: 55, need: { social: 70 }, prev: { civil: 4, lawyer: 4, journal: 4, manager: 4 }, lv: ['Депутат міськради','Депутат парламенту','Голова комітету','Міністр','Глава уряду'] },
  // Творчі професії з нестабільним доходом
  { id: 'musician', n: 'Музикант', edu: 0, alt: { music: 60 }, skillOnly: 1, pay: .9, max: 0, comp: .6, risk: .05, st: 50, sat: 80, vol: 'music' },
  { id: 'artist', n: 'Художник', edu: 0, alt: { art: 60 }, skillOnly: 1, pay: .7, max: 0, comp: .6, risk: .05, st: 40, sat: 80, vol: 'art' },
  { id: 'writer', n: 'Письменник', edu: 0, alt: { write: 60 }, skillOnly: 1, pay: .6, max: 0, comp: .6, risk: .05, st: 45, sat: 80, vol: 'write' },
  { id: 'blogger', n: 'Блогер', edu: 0, alt: { social: 60 }, skillOnly: 1, pay: .5, max: 0, comp: .7, risk: .05, st: 50, sat: 70, vol: 'social' },
  { id: 'athlete', n: 'Професійний спортсмен', edu: 0, alt: { sport: 75 }, skillOnly: 1, pay: 1.5, max: 0, comp: .5, risk: .1, st: 70, sat: 85, vol: 'sport', age: [16, 36] },
  { id: 'actor', n: 'Актор', edu: 0, alt: { social: 65, art: 30 }, skillOnly: 1, allAlt: 1, pay: 1, max: 0, comp: .35, risk: .1, st: 60, sat: 80, vol: 'social', urban: 1 }
];
var JOB = {};
JOBS.forEach(function (j) { JOB[j.id] = j; });

// Підробітки для підлітків
var TEEN_JOBS = [
  { id: 't_flyers', n: 'Роздавати листівки', pay: .06 },
  { id: 't_dishes', n: 'Мити посуд у кафе', pay: .09 },
  { id: 't_market', n: 'Допомагати на ринку', pay: .07 },
  { id: 't_tutor', n: 'Репетиторство для молодших', pay: .1, need: { smarts: 65 } },
  { id: 't_fix', n: 'Ремонт телефонів знайомим', pay: .1, need: { code: 30 } }
];

// Бізнеси. cost — стартовий капітал (× медіанний дохід); roi — річна віддача на капітал для середнього власника;
// vol — розкид; ramp — збитки першого року; cyc — чутливість до кризи; rel — профільні навички/професії.
var BIZ = [
  { id: 'kiosk', points: 1, n: 'Кіоск / маленька крамниця', cost: .8, roi: .12, vol: .22, ramp: .12, cyc: .1, rel: { jobs: ['seller','vendor'], skill: 'biz' } },
  { id: 'cafe', points: 1, n: 'Кавʼярня', cost: 2, roi: .11, vol: .25, ramp: .18, cyc: .15, rel: { jobs: ['waiter','cook','chef'], skill: 'cook' } },
  { id: 'restaurant', points: 1, n: 'Ресторан', cost: 5, roi: .12, vol: .32, ramp: .22, cyc: .2, rel: { jobs: ['cook','chef','waiter'], skill: 'cook' } },
  { id: 'online', n: 'Інтернет-магазин', cost: 1.2, roi: .13, vol: .35, ramp: .15, cyc: .1, rel: { jobs: ['market','seller','dev'], skill: 'code' } },
  { id: 'auto', points: 1, n: 'Автосервіс', cost: 2.5, roi: .14, vol: .18, ramp: .12, cyc: .1, rel: { jobs: ['mechanic','electric'], skill: 'craft' } },
  { id: 'salon', points: 1, n: 'Салон краси', cost: 1.5, roi: .12, vol: .2, ramp: .12, cyc: .12, rel: { jobs: ['hair'], skill: 'art' } },
  { id: 'farm', n: 'Фермерське господарство', cost: 3, roi: .08, vol: .25, ramp: .1, cyc: .05, rel: { jobs: ['farmer','agronom'], skill: 'craft' } },
  { id: 'build', n: 'Будівельна фірма', cost: 4, roi: .15, vol: .35, ramp: .15, cyc: .35, rel: { jobs: ['builder','engineer','architect','electric','plumber','welder'], skill: 'craft' } },
  { id: 'logistic', n: 'Логістична компанія', cost: 6, roi: .12, vol: .25, ramp: .15, cyc: .25, rel: { jobs: ['trucker','taxi','courier','manager'], skill: 'biz' } },
  { id: 'itstudio', n: 'IT-студія (аутсорс)', cost: 1.5, roi: .2, vol: .35, ramp: .2, cyc: .15, rel: { jobs: ['dev','gamedev','sysadmin','datasci','designer'], skill: 'code' } },
  { id: 'clinic', n: 'Приватна клініка', cost: 8, roi: .14, vol: .18, ramp: .15, cyc: .05, need: { field: 'med' }, points: 1, rel: { jobs: ['doctor','surgeon','nurse','pharm'], skill: 'biz' } },
  { id: 'medprac', n: 'Приватна медична практика', cost: 1.5, roi: .16, vol: .15, ramp: .1, cyc: .03, pay: 2.2, need: { job: 'doctor', yrs: 5 }, rel: { jobs: ['doctor', 'surgeon'], skill: 'biz' } },
  { id: 'lawprac', n: 'Власна юридична фірма', cost: 1, roi: .15, vol: .25, ramp: .12, cyc: .1, pay: 1.9, need: { job: 'lawyer', yrs: 5 }, rel: { jobs: ['lawyer', 'judge'], skill: 'biz' } },
  { id: 'archprac', n: 'Архітектурне бюро', cost: 1, roi: .14, vol: .3, ramp: .12, cyc: .3, pay: 1.7, need: { job: 'architect', yrs: 4 }, rel: { jobs: ['architect', 'engineer'], skill: 'art' } },
  { id: 'vetprac', n: 'Ветеринарна клініка', cost: 2, roi: .13, vol: .15, ramp: .1, cyc: .05, pay: 1.3, need: { job: 'vet', yrs: 4 }, rel: { jobs: ['vet'], skill: 'biz' } },
  { id: 'psyprac', n: 'Приватна практика психолога', cost: .3, roi: .12, vol: .2, ramp: .1, cyc: .1, pay: 1.3, need: { job: 'psych', yrs: 3 }, rel: { jobs: ['psych'], skill: 'biz' } },
  { id: 'gamestudio', n: 'Інді-студія ігор', cost: 1, roi: -.05, vol: .6, ramp: .2, cyc: .1, startup: 1, rel: { jobs: ['gamedev','dev','designer','artist'], skill: 'code' } },
  { id: 'startup', n: 'Технологічний стартап', cost: 2, roi: -.1, vol: .55, ramp: .2, cyc: .2, startup: 1, rel: { jobs: ['dev','datasci','manager','engineer'], skill: 'code' } }
];
var BIZM = {};
BIZ.forEach(function (b) { BIZM[b.id] = b; });

// Хобі → професія. free — назва фрилансу (з 35), g — глобальність ринку фрилансу, jobs — куди веде навичка.
var HOBBY = {
  music: { free: 'Грати на весіллях і в барах', g: 0, jobs: ['musician', 'teacher'], biz: [] },
  art:   { free: 'Малювати на замовлення', g: .3, jobs: ['artist', 'designer', 'hair', 'actor'], biz: ['salon'] },
  code:  { free: 'Фриланс-програмування', g: .6, jobs: ['dev', 'gamedev', 'sysadmin'], biz: ['itstudio', 'online', 'gamestudio', 'startup'] },
  write: { free: 'Писати статті й тексти', g: .3, jobs: ['writer', 'journal'], biz: [] },
  cook:  { free: 'Готувати на замовлення', g: 0, jobs: ['cook', 'chef'], biz: ['cafe', 'restaurant'] },
  sport: { free: 'Тренувати людей', g: 0, jobs: ['athlete', 'rescuer', 'soldier'], biz: [] },
  eng:   { free: 'Репетиторство з англійської', g: .3, jobs: ['translator'], biz: [] },
  craft: { free: 'Ремонти й дрібна робота руками', g: 0, jobs: ['mechanic', 'builder'], biz: ['auto', 'build', 'farm'] },
  biz:   { free: 'Перепродаж речей', g: .1, jobs: ['manager'], biz: [] }
};

var EMIGRATE_TO =['PL', 'DE', 'GB', 'US', 'CA', 'AU', 'SE', 'FR', 'ES', 'IT', 'JP', 'KR', 'SA'];

// Майно. p — ціна (× медіанний річний дохід країни), up — утримання на рік, hap/soc — щастя і статус, health — вплив на здоровʼя.
var VEHICLES = [
  { id: 'bike', n: 'Велосипед', p: 0.06, up: 0.01, hap: 2, soc: 0, health: 2 },
  { id: 'scooter', n: 'Скутер', p: 0.25, up: 0.04, hap: 3, soc: 1 },
  { id: 'usedcar', n: 'Вживане авто', p: 0.8, up: 0.12, hap: 4, soc: 2 },
  { id: 'car', n: 'Нове авто', p: 2, up: 0.2, hap: 6, soc: 4 },
  { id: 'premium', n: 'Преміум-авто', p: 5, up: 0.45, hap: 8, soc: 8 },
  { id: 'supercar', n: 'Спорткар', p: 12, up: 1, hap: 10, soc: 12 }
];
var VEHICLE = {}; VEHICLES.forEach(function (v) { VEHICLE[v.id] = v; });
var GEAR_LV = [
  { n: 'Базові речі', p: 0, hap: 0, soc: 0 },
  { n: 'Добрий одяг і гаджети', p: 0.3, hap: 2, soc: 2 },
  { n: 'Дорогі бренди', p: 1.2, hap: 4, soc: 5 },
  { n: 'Люкс: годинники, прикраси, дизайнерський одяг', p: 4, hap: 6, soc: 9 }
];
var HOME_LV = [
  { n: 'Мінімум', p: 0, hap: 0, health: 0 },
  { n: 'Затишно: нормальні меблі й техніка', p: 0.4, hap: 3, health: 1 },
  { n: 'Гарний ремонт', p: 1.5, hap: 6, health: 2 },
  { n: 'Дизайнерський інтерʼєр', p: 5, hap: 9, health: 2 }
];

// Нерівність (Gini, приблизно, World Bank) і безробіття (%, приблизно, ILO) — ~2022–2024
var GINI = { IN: 33, CN: 37, NG: 35, PK: 30, ID: 38, CD: 45, ET: 35, US: 40, BD: 32, BR: 52, EG: 32, TZ: 40, PH: 41, MX: 45, UG: 43, KE: 39, AF: 31, SD: 34, VN: 36, AO: 51, NE: 33, MZ: 54, IQ: 30, ZA: 63, IR: 35, TR: 42, YE: 37, GH: 44, CM: 47, ML: 36, MG: 43, MM: 31, JP: 33, DE: 32, FR: 32, GB: 33, SA: 46, TH: 35, NP: 33, CO: 55, AR: 42, IT: 35, CA: 32, ES: 34, AU: 34, HT: 41, PL: 29, KR: 31, UA: 26, SE: 29, UZ: 31, DZ: 28, MA: 40, PE: 40, MY: 41, KZ: 29, LK: 38, CL: 43, IL: 38, NL: 26, RO: 34, BE: 26, AZ: 27, AE: 26, CZ: 26, HU: 30, PT: 33, CH: 33, AT: 30, GR: 33, RS: 33, NZ: 32, DK: 28, BG: 39, IE: 30, SK: 23, NO: 27, FI: 27, GE: 34, AM: 28, SG: 37, HR: 29, MD: 26, LT: 35, LV: 34, EE: 31 };
var UNEMP = { ZA: 32, ES: 12, GR: 11, IR: 9, TR: 9, IT: 7, FR: 7, UA: 13, PL: 3, CZ: 3, DE: 3, US: 4, JP: 2.6, KR: 2.8, IN: 8, BR: 8, CO: 10, MA: 12, DZ: 12, SD: 20, YE: 18, AF: 14, IQ: 15, EG: 7, KE: 6, HT: 15, AM: 9, GE: 11, RS: 9, MD: 4, BG: 4, RO: 5.5, HU: 4, LT: 7, LV: 6.5, EE: 6.5, FI: 8, SE: 8, NO: 4, DK: 5, NL: 3.7, BE: 5.6, AT: 5.3, CH: 4, IE: 4.4, PT: 6.5, HR: 6, SK: 6, CL: 8.5, PE: 7, AR: 7, MX: 3, VN: 2, TH: 1, PH: 4, ID: 5, MY: 3.5, SG: 2, CN: 5, BD: 5, PK: 8, LK: 5, NP: 10, UZ: 7, KZ: 5, AZ: 6, IL: 3.5, AE: 3, SA: 5, NG: 5, ET: 4, GH: 4, CM: 4, TZ: 3, UG: 3, MZ: 4, MG: 3, ML: 3, NE: 1, CD: 5, AO: 15, MM: 3, AU: 3.8, CA: 6, GB: 4.2, NZ: 4.5 };
COUNTRY_LIST.forEach(function (c) { c.gini = (GINI[c.code] || 35) / 100; c.unemp = (UNEMP[c.code] || 6) / 100; });
// Наскільки великим може вирости бізнес цього типу (× стартового капіталу), далі віддача падає
var BIZ_SCALE = { kiosk: 8, cafe: 10, restaurant: 12, online: 40, auto: 10, salon: 8, farm: 15, build: 30, logistic: 35, itstudio: 30, clinic: 20, medprac: 6, lawprac: 6, archprac: 6, vetprac: 6, psyprac: 4, gamestudio: 60, startup: 150 };

// Податки (приблизно, ~2024): верхня ставка на доходи, плоска шкала, податок на прибуток, на інвестиційний дохід, на нерухомість, на статки
var TOP_TAX = { SE: .52, DK: .52, FI: .50, NO: .47, BE: .50, AT: .50, DE: .45, FR: .49, NL: .495, IT: .43, ES: .47, PT: .48, GB: .45, IE: .48, US: .40, CA: .45, AU: .45, NZ: .39, JP: .45, KR: .45, IL: .50, CH: .40, PL: .32, CZ: .23, SK: .25, LT: .32, LV: .31, HR: .30, GR: .44, TR: .40, CN: .45, IN: .39, BR: .275, MX: .35, AR: .35, CL: .40, CO: .39, PE: .30, ZA: .45, NG: .24, EG: .275, MA: .38, DZ: .35, SA: 0, AE: 0, SG: .24, MY: .30, TH: .35, VN: .35, ID: .35, PH: .35, PK: .35, BD: .25, AZ: .14 };
var FLAT_TAX = ['UA', 'RO', 'BG', 'EE', 'GE', 'KZ', 'UZ', 'MD', 'HU', 'AM', 'RS'];
var CORP_TAX = { US: .21, DE: .30, FR: .25, GB: .25, IT: .24, ES: .25, PL: .19, UA: .18, CZ: .21, SK: .21, HU: .09, RO: .16, BG: .10, IE: .125, NL: .258, BE: .25, AT: .23, CH: .15, SE: .206, NO: .22, DK: .22, FI: .20, EE: .20, LT: .16, LV: .20, GR: .22, PT: .21, HR: .18, RS: .15, GE: .15, AM: .18, AZ: .20, KZ: .20, UZ: .15, MD: .12, TR: .25, IL: .23, AE: .09, SA: .20, CN: .25, IN: .25, JP: .30, KR: .24, SG: .17, MY: .24, TH: .20, VN: .20, ID: .22, PH: .25, BR: .34, MX: .30, AR: .35, CL: .27, CO: .35, PE: .295, ZA: .27, NG: .30, EG: .225, AU: .30, NZ: .28, CA: .26 };
var CAP_TAX = { US: .15, DE: .26, PL: .19, UA: .23, AE: 0, SA: 0, SG: 0, CH: 0, FR: .30, GB: .2, SE: .3, DK: .27, NO: .22, NL: .3, ES: .21, IT: .26 };
var PROP_TAX = { US: .01, CA: .008, GB: .006, FR: .005, AE: 0, SA: 0, UA: .001 };
var WEALTH_TAX = { ES: .01, NO: .01, CH: .005 };
COUNTRY_LIST.forEach(function (c) {
  c.top = TOP_TAX[c.code] != null ? TOP_TAX[c.code] : Math.max(c.tax, 0.3);
  c.flat = FLAT_TAX.indexOf(c.code) >= 0;
  c.corp = CORP_TAX[c.code] != null ? CORP_TAX[c.code] : 0.25;
  c.capTax = CAP_TAX[c.code] != null ? CAP_TAX[c.code] : 0.2;
  c.propTax = PROP_TAX[c.code] != null ? PROP_TAX[c.code] : 0.003;
  c.wealthTax = WEALTH_TAX[c.code] || 0;
});
// Сфери бізнесу: криза в сфері бʼє по всіх її бізнесах одразу
var SECTOR = { kiosk: 'торгівля', online: 'торгівля', cafe: 'їжа', restaurant: 'їжа', auto: 'транспорт', logistic: 'транспорт', salon: 'послуги', farm: 'агро', build: 'будівництво', archprac: 'будівництво', itstudio: 'IT', gamestudio: 'IT', startup: 'IT', clinic: 'медицина', medprac: 'медицина', vetprac: 'медицина', psyprac: 'послуги', lawprac: 'послуги' };
