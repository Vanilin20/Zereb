// ЖЕРЕБ — система часу: тижневий розклад.
// Кожного року в тебе є вільні години на тиждень (168 мінус сон, побут, навчання, робота, бізнес, діти, дорога).
// Ти розподіляєш їх між заняттями, і наприкінці року кожне заняття дає ефект пропорційно годинам.
var SCHED = [];
function S_(o) { o.max = o.max || 20; SCHED.push(o); }
function hobbyGain(s, v, h, talent) { return h * 1.2 * Math.max(0.05, 1 - v / 110) * (talent || 1) * (0.7 + s.st.smarts / 170); }

S_({ grp: 'body', id: 'sport', n: 'Спорт', age: 5, prisonOk: 1, d: 'Здоровʼя, навичка «Спорт»' });
S_({ grp: 'body', id: 'read', n: 'Читання', age: 6, prisonOk: 1, d: 'Розум, трохи письма' });
S_({ grp: 'body', id: 'study', n: 'Додаткове навчання', age: 6, show: function (s) { return !!s.study; }, d: 'Вищий бал, менше щастя' });
HOBBY_ACT.forEach(function (h) {
  S_({ grp: 'skill', id: 'h_' + h[0], skill: h[0], n: h[1], age: h[2], prisonOk: h[0] !== 'code' && h[0] !== 'cook', d: h[3],
    show: function (s) { return !(h[0] === 'eng' && s.sk.eng >= 100); } });
});
S_({ grp: 'skill', id: 'lang', n: 'Іноземна мова', age: 8, prisonOk: 1, d: function (s) { return s.langTarget ? LANG_NAMES[s.langTarget] + ' ' + Math.round(s.lang[s.langTarget] || 0) + ' · змінити — у вкладці «Хобі»' : 'Обери мову у вкладці «Хобі»'; }, show: function (s) { return !!s.langTarget; } });
S_({ grp: 'earn', id: 'free', n: 'Фриланс', age: 14, max: 30, d: function (s) { var k = s.freeSkill; return k ? HOBBY[k].free + ' · ~' + fmt(freelancePay(s, k) / 10) + ' за год/тиждень на рік' : ''; }, show: function (s) { return !!s.freeSkill && s.sk[s.freeSkill] >= 35; } });
S_({ grp: 'earn', id: 'teen', n: 'Підробіток', age: 13, d: function (s) { return '~' + fmt(M(s) * 0.004) + ' на рік за кожну годину на тиждень'; }, show: function (s) { return s.age < 18; } });
S_({ grp: 'earn', id: 'overtime', n: 'Понаднормова робота', max: 25, d: 'Продуктивність і шанс підвищення ↑, оплата ×1,5; здоровʼя ↓', show: function (s) { return s.job && !s.job.teen; } });
S_({ grp: 'people', id: 'friends', n: 'Друзі', age: 4, prisonOk: 1, d: function (s) { return 'Харизма, щастя · друзів: ' + s.friends; } });
S_({ grp: 'people', id: 'family', n: 'Батьки й рідні', age: 3, d: 'Стосунки з батьками', show: function (s) { return s.parents.some(function (p) { return p.alive; }); } });
S_({ grp: 'people', id: 'partner', n: 'Партнер', d: function (s) { return s.partner ? s.partner.name + ' · стосунки ' + Math.round(s.partner.rel) : ''; }, show: function (s) { return !!s.partner; } });
S_({ grp: 'people', id: 'kids', n: 'Діти', d: 'Стосунки з дітьми', show: function (s) { return s.kids.some(function (k) { return k.alive && k.age < 25; }); } });
S_({ grp: 'people', id: 'volunteer', n: 'Волонтерство', age: 12, d: 'Щастя, харизма, нові знайомі' });
S_({ grp: 'people', id: 'blog', n: 'Блог', age: 12, d: 'Слава, харизма', show: function (s) { return C(s).gdp > 2; } });

function schedItems(s) { return SCHED.filter(function (it) { return s.age >= (it.age || 16) && (!s.prison || it.prisonOk) && (!it.show || it.show(s)); }); }
function freeHours(s) {
  if (s.age < 4) return 0;
  if (s.age < 6) return 20;
  if (s.prison) return 35;
  var h = 168 - (s.sleep ? 56 : 45) - 21;
  if (s.study) h -= s.study.t === 'school' ? 32 : 30;
  if (s.job) h -= s.job.teen ? 0 : s.job.part ? 20 : 40;
  s.biz.forEach(function (b) { h -= b.mgr ? 4 : b.effort >= 1 ? 45 : 22; });
  if (s.gang) h -= 15;
  h -= chores(s);
  if (s.chronic) h -= s.chronic.length * 2;   // лікарі, процедури, втома
  var small = s.kids.filter(function (k) { return k.alive && k.age < 12; }).length;
  h -= Math.min(24, small * 8) * (s.partner ? 0.6 : 1);
  if (s.job || s.study) h -= s.own && s.own.car ? 3 : s.urban ? 7 : 5;
  return Math.max(0, Math.round(h));
}
// Обовʼязки, яких не уникнути: допомога вдома в бідних родинах, догляд за хворими батьками
function chores(s) {
  var c = C(s), h = 0;
  if (s.age >= 6 && s.age < 18 && s.withParents) h += s.d <= 3 && c.gdp < 15 ? (s.urban ? 8 : 14) : s.d <= 5 ? 4 : 2;
  if (s.age >= 18 && s.parents.some(function (p) { return p.alive && (p.ill || p.age >= 82); })) h += 8;
  return h;
}
function schedUsed(s) { var t = 0; schedItems(s).forEach(function (it) { t += s.sched[it.id] || 0; }); return t; }
// Підрізати розклад, якщо вільного часу стало менше
function schedFit(s) {
  var items = schedItems(s), free = freeHours(s), used = 0;
  Object.keys(s.sched).forEach(function (k) { if (!items.some(function (it) { return it.id === k; })) s.sched[k] = 0; });
  items.forEach(function (it) { used += s.sched[it.id] || 0; });
  if (used > free && used > 0) { var f = free / used; items.forEach(function (it) { s.sched[it.id] = Math.floor((s.sched[it.id] || 0) * f); }); }
}
function schedDefaults(s) {
  if (!s.sched) s.sched = {};
  if (s.age === 6) { s.sched.sport = 3; s.sched.friends = 4; s.sched.read = 2; s.sched.family = 3; }
  if (s.age === 18) { s.sched.study = s.study ? 4 : 0; s.sched.teen = 0; }
}
// Ефекти року від розкладу. Повертає побічний дохід.
function schedTick(s) {
  if (!s.sched) s.sched = {};
  schedFit(s);
  var h = {}, items = schedItems(s);
  items.forEach(function (it) { h[it.id] = s.sched[it.id] || 0; });
  h.rest = Math.max(0, freeHours(s) - schedUsed(s));
  s.h = h;
  var side = 0;
  if (h.read) { add(s, { smarts: h.read * 0.35, write: h.read * 0.1 }); }
  if (h.study) add(s, { smarts: h.study * 0.1, happy: -h.study * 0.15 });
  items.forEach(function (it) {
    if (!it.skill || !h[it.id]) return;
    var k = it.skill;
    if (k === 'code' && s.q <= 2 && C(s).gdp < 10 && !s.flags.pc && s.age < 18) return;
    var v = s.sk[k], nv = clamp(v + hobbyGain(s, v, h[it.id], s.flags['tal_' + k] ? 1.4 : 1));
    s.sk[k] = nv;
    if (v < 35 && nv >= 35 && s.age >= 14 && k in HOBBY) { say(s, SKILL_NAMES[k] + ' ' + Math.round(nv) + ': відкрито фриланс «' + HOBBY[k].free + '».', 'good'); if (!s.freeSkill) s.freeSkill = k; }
    if (k in HOBBY) HOBBY[k].jobs.forEach(function (id) { var j = JOB[id]; if (j.alt && j.alt[k]) { var need = skillNeed(s, k, j.alt[k]); if (v < need && nv >= need) say(s, SKILL_NAMES[k] + ' ' + Math.round(nv) + ': тепер можна пробувати без диплома — ' + j.n.toLowerCase() + '.', 'good'); } });
  });
  if (h.sport) s.sk.sport = clamp(s.sk.sport);
  if (h.lang && s.langTarget) { var lv = s.lang[s.langTarget] || 0; s.lang[s.langTarget] = clamp(lv + hobbyGain(s, lv, h.lang)); }
  if (h.free && s.freeSkill) {
    var k2 = s.freeSkill, e = freelancePay(s, k2) * h.free / 10 * rnd(0.7, 1.3);
    side += e; s.port[k2] = (s.port[k2] || 0) + h.free / 6; s.sk[k2] = clamp(s.sk[k2] + h.free * 0.15);
    if (k2 === 'music' || k2 === 'art' || k2 === 'write') s.fame = clamp(s.fame + h.free * 0.1);
  }
  if (h.teen) side += M(s) * 0.004 * h.teen * rnd(0.8, 1.2);
  if (h.overtime && s.job) { add(s, { health: -h.overtime * 0.15, happy: -h.overtime * 0.2 }); side += jobPay(s) * h.overtime / 40 * 1.5; }
  if (h.friends) { add(s, { social: h.friends * 0.4, happy: h.friends * 0.25 }); if (s.friends < 10 && chance(h.friends * 0.04 + s.st.social / 400)) { s.friends++; } }
  if (h.family) add(s, { happy: h.family * 0.2 });
  if (h.volunteer) { add(s, { happy: h.volunteer * 0.3, social: h.volunteer * 0.2 }); if (chance(h.volunteer * 0.03)) s.friends++; }
  if (h.blog) {
    var best = Math.max(s.sk.music, s.sk.art, s.sk.cook, s.sk.code, s.sk.write, s.sk.sport, s.st.social);
    var gain = ((best - 40) / 10 + rnd(-2, 4)) * h.blog / 6; if (chance(0.01 * h.blog + best / 3000)) { gain += 18; say(s, 'Твоє відео стало вірусним!', 'good'); }
    s.fame = clamp(s.fame + gain); add(s, { social: h.blog * 0.15 });
  }
  if (s.age >= 6) { if (h.rest < 4) { add(s, { happy: -6, health: -2 }); } else add(s, { happy: Math.min(8, h.rest * 0.2) }); }
  return side;
}

// Дії, що стали частиною розкладу, прибираємо зі списку разових дій
(function () {
  var moved = ['sport', 'read', 'rest', 'volunteer', 'freelance', 'blog', 'study', 'skip', 'teenjob', 'work', 'parents', 'friends', 'partner', 'kids', 'lang'];
  for (var i = ACTIONS.length - 1; i >= 0; i--) { var a = ACTIONS[i]; if (moved.indexOf(a.id) >= 0 || a.id.indexOf('h_') === 0) ACTIONS.splice(i, 1); }
})();
function hoursBreakdown(s) {
  var r = [['сон', s.sleep ? 56 : 45], ['їжа й побут', 21]];
  if (s.prison) return [['вʼязниця', 168 - 35]];
  if (s.study) r.push([s.study.t === 'school' ? 'школа' : 'навчання', s.study.t === 'school' ? 32 : 30]);
  if (s.job && !s.job.teen) r.push(['робота', s.job.part ? 20 : 40]);
  var bz = 0; s.biz.forEach(function (b) { bz += b.mgr ? 4 : b.effort >= 1 ? 45 : 22; }); if (bz) r.push(['бізнес', bz]);
  if (s.gang) r.push(['угруповання', 15]);
  var ch = chores(s); if (ch) r.push([s.age < 18 ? 'допомога вдома' : 'догляд за батьками', ch]);
  var small = s.kids.filter(function (k) { return k.alive && k.age < 12; }).length; if (small) r.push(['малі діти', Math.round(Math.min(24, small * 8) * (s.partner ? 0.6 : 1))]);
  if (s.job || s.study) r.push(['дорога', s.own && s.own.car ? 3 : s.urban ? 7 : 5]);
  return r;
}
TABS.unshift({ id: 'sched', n: 'Розклад' });

var SCHED_GROUPS = [['body', 'Тіло й розум'], ['skill', 'Навички й мови'], ['earn', 'Додатковий заробіток'], ['people', 'Люди']];
