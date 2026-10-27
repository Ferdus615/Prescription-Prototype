/* PharmaZ247 prescription module prototype. Vanilla JS, all state in memory. */
(function () {
  'use strict'
  var D = window.DATA
  var TODAY = new Date(D.today + 'T00:00:00')
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var UNITS = { tab: 'tablets', cap: 'capsules', ml: 'ml', tsp: 'tsp (5 ml)', drop: 'drops', puff: 'puffs', unit: 'units', sachet: 'sachets', amp: 'ampoules', bag: 'bags' }
  var UNITS_BN = { tab: 'ট্যাবলেট', cap: 'ক্যাপসুল', ml: 'মিলি', tsp: 'চা-চামচ', drop: 'ফোঁটা', puff: 'পাফ', unit: 'ইউনিট', sachet: 'প্যাকেট', amp: 'অ্যাম্পুল', bag: 'ব্যাগ' }
  var FOOD = { before: 'Before meal', after: 'After meal', with: 'With meal', any: 'Any time' }
  var FOOD_BN = { before: 'খাবারের আগে', after: 'খাবারের পরে', with: 'খাবারের সাথে', any: '' }
  var SLOT_OPTS = ['0', '½', '1', '1½', '2', '3']
  var DX_TYPES = { PROVISIONAL: 'Provisional', DIFFERENTIAL: 'Differential', FINAL: 'Final' }
  var SCEN = { returning: 'p1', first: 'p2', family: 'p3' }

  var S = {
    view: 'appointments', pid: null, serial: null, scenario: 'returning', warnStyle: 'inline',
    seq: 1, rxCounter: 51, draft: null, popupQ: [], sg: null, savedAt: null, tplTab: 'condition', drawerRx: null,
    tpl: JSON.parse(JSON.stringify(D.medTemplates)), instr: D.instrFormats.slice(),
    sections: D.sections.map(function (s) { return { id: s.id, hidden: false, collapsed: false } }), customSecs: [], secOverride: {}, saved: JSON.parse(JSON.stringify(D.noteSuggest)), msSel: null,
    ordMine: JSON.parse(JSON.stringify(D.orderSuggest.mine)), ordTab: 'diet', vf: { rx: '', code: '', result: null }, pv: null, showErr: false, protoOpen: true, lastIssued: null,
    bndDefault: true, printHist: false, pvDig: null, lib: { cat: 'all', form: null }, slotDay: null
  }

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s) }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)) }
  function esc(s) {
    var m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return m[c] })
  }
  function pd(iso) { return new Date(iso + 'T00:00:00') }
  function fmt(d) { if (typeof d === 'string') d = pd(d); return d.getDate() + ' ' + MON[d.getMonth()] }
  function fmtY(d) { if (typeof d === 'string') d = pd(d); return fmt(d) + ' ' + d.getFullYear() }
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x }
  /* PHAR-1723: DIG decides whether bn() turns digits into Bangla digits. Printed sheet + patient view switch it per prescription via withDig(). */
  var DIG = true
  function bn(n) { var t = String(n); return DIG ? t.replace(/\d/g, function (c) { return '০১২৩৪৫৬৭৮৯'.charAt(+c) }) : t }
  function withDig(on, fn) { var o = DIG; DIG = on !== false; try { return fn() } finally { DIG = o } }
  var BN_MON = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']
  function bnDate(d) { if (typeof d === 'string') d = pd(d); return bn(d.getDate()) + ' ' + BN_MON[d.getMonth()] + ' ' + bn(d.getFullYear()) }
  function num(s) {
    s = String(s == null ? '' : s).trim()
    var m = s.match(/^(\d+)?\s*½$/)
    if (m) return (m[1] ? +m[1] : 0) + 0.5
    var v = parseFloat(s)
    return isNaN(v) ? 0 : v
  }
  function pad(n, w) { var s = String(n); while (s.length < w) s = '0' + s; return s }
  function medById(id) { for (var i = 0; i < D.meds.length; i++) if (D.meds[i].id === id) return D.meds[i]; return null }
  function pat() { return D.patients[S.pid] }
  function appt() { return D.appointments.filter(function (a) { return a.serial === S.serial })[0] }
  function hasBangla(t) { return /[ঀ-৿]/.test(t) }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
  function codeFor(no) {
    for (var i = 0; i < D.verifyDb.length; i++) if (D.verifyDb[i].no === no) return D.verifyDb[i].code
    return genCode(no)
  }
  function genCode(no) {
    var r = rng(hash(no)), a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''
    for (var j = 0; j < 8; j++) { s += a.charAt(Math.floor(r() * a.length)); if (j === 3) s += '-' }
    return s
  }
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.className = 'toast show'
    clearTimeout(toast.h); toast.h = setTimeout(function () { t.className = 'toast' }, 2600)
  }
  function nyi(what) { toast('Prototype: not built' + (what ? ' (' + what + ')' : '')) }
  function keepFocus(fn) {
    var a = document.activeElement, k = a && a.getAttribute ? a.getAttribute('data-fk') : null
    fn()
    if (k) { var e = $('[data-fk="' + k + '"]'); if (e) e.focus() }
  }
  function qrHtml(seed) {
    var n = 25, r = rng(hash(seed)), cells = '', x, y
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) {
      var f = finder(x, y, n), on = f === null ? r() > 0.5 : f
      cells += on ? '<i class="on"></i>' : '<i></i>'
    }
    return '<div class="qr" style="--n:' + n + '" aria-label="QR code placeholder">' + cells + '</div>'
  }
  function finder(x, y, n) {
    var cs = [[0, 0], [n - 7, 0], [0, n - 7]]
    for (var i = 0; i < 3; i++) {
      var dx = x - cs[i][0], dy = y - cs[i][1]
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) return Math.max(Math.abs(dx - 3), Math.abs(dy - 3)) !== 2
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) return false
    }
    return null
  }

  /* ---------- history / checks ---------- */
  function ownRxs() {
    return (D.history[S.pid] || []).filter(function (r) { return isMine(r) && !(S.draft && S.draft.editing === r.id) }).sort(function (a, b) { return a.date < b.date ? 1 : -1 })
  }
  function sourceRxs() {
    return (D.history[S.pid] || []).filter(function (r) { return !(S.draft && S.draft.editing === r.id) }).sort(function (a, b) { return a.date < b.date ? 1 : -1 }).slice(0, 2)
  }
  function genericsOf(g) { return String(g || '').toLowerCase().split('+').map(function (x) { return x.trim() }).filter(Boolean) }
  function daysText(d) { return d === null ? 'continuous' : d + (d === 1 ? ' day' : ' days') }
  function courseStatus(rx, days) {
    if (days === null) return { on: true, text: 'ongoing (continuous)' }
    var end = addDays(pd(rx.date), days - 1)
    return end >= TODAY ? { on: true, text: 'ongoing until ' + fmt(end) } : { on: false, text: 'course ended on ' + fmt(end) }
  }
  function checkLine(l, idx) {
    if (isStop(l)) return { free: false, stop: true, matches: [] }
    if (l.free || !l.generic) return { free: true, matches: [] }
    var gs = genericsOf(l.generic), matches = []
    sourceRxs().forEach(function (rx) {
      if (l.cf && l.cf === rx.id) return /* D: continuation is not warned against its own source */
      rx.lines.forEach(function (sl) {
        if (sl.stop) return
        var m = medById(sl.medId), common = gs.filter(function (g) { return genericsOf(m.generic).indexOf(g) >= 0 })
        if (common.length) matches.push({ kind: 'prev', rx: rx, m: m, sl: sl, common: common, st: courseStatus(rx, sl.days) })
      })
    })
    S.draft.lines.slice(0, idx).forEach(function (o, i) {
      if (isStop(o)) return
      var common = gs.filter(function (g) { return genericsOf(o.generic).indexOf(g) >= 0 })
      if (common.length) matches.push({ kind: 'current', other: o, n: i + 1, common: common })
    })
    return { free: false, matches: matches }
  }
  function allChecks() { return S.draft.lines.map(function (l, i) { return checkLine(l, i) }) }
  function warnCounts() {
    var cks = allChecks(), w = 0, a = 0
    cks.forEach(function (c, i) { if (c.matches.length) { w++; if (S.draft.lines[i].ack) a++ } })
    return { w: w, a: a, cks: cks }
  }

  /* ---------- medicine lines ---------- */
  function lineFrom(id, o) {
    o = o || {}
    var m = medById(id), d = m.def || {}
    var days = o.days !== undefined ? o.days : d.days
    var line = {
      id: 'L' + (S.seq++), medId: id, brand: m.brand, generic: m.generic, strength: m.strength, form: m.form, company: m.company, free: false,
      mode: o.mode || d.mode || 'pattern', slots: (o.slots || d.slots || ['1', '0', '1']).slice(), intervalH: o.intervalH || d.intervalH || 8, prnMax: o.prnMax || d.prnMax || 3,
      amount: o.amount || '1', unit: o.unit || d.unit || 'tab', food: o.food || d.food || 'after', route: o.route || d.route || 'Oral',
      durVal: String(days || o.durVal || 7), durUnit: o.durUnit || 'days', cont: o.cont !== undefined ? o.cont : !!d.cont,
      steps: (o.steps || []).map(stepOf), startMode: 'now', startN: '', startDate: '',
      instrs: toList(o.instrs !== undefined ? o.instrs : o.instr), caution: o.caution || '', cf: o.cf || null, collapsed: !!o.cf, ack: false, cls: m.cls || ''
    }
    Object.assign(line, xDefaults()); putX(line, o.x); syncWk(line)
    return line
  }
  function freeLine(text) {
    var line = {
      id: 'L' + (S.seq++), medId: null, brand: text, generic: '', strength: '', form: '', company: '', free: true, mode: 'pattern', slots: ['1', '0', '1'], intervalH: 8, prnMax: 3,
      amount: '1', unit: 'tab', food: 'after', route: 'Oral', durVal: '5', durUnit: 'days', cont: false, steps: [], startMode: 'now', startN: '', startDate: '',
      instrs: [], caution: '', cf: null, collapsed: false, ack: false, cls: ''
    }
    return Object.assign(line, xDefaults())
  }
  // perDay / totalDays / doseText / durText take a line OR one of its dosage steps (same field names).
  function perDay(l) {
    if (l.mode === 'pattern') return l.slots.reduce(function (a, s) { return a + num(s) }, 0)
    if (l.mode === 'interval') return 24 / (num(l.intervalH) || 24)
    return num(l.prnMax)
  }
  function totalDays(l) {
    if (l.cont) return 30
    var v = num(l.durVal)
    return l.durUnit === 'weeks' ? v * 7 : l.durUnit === 'months' ? v * 30 : v
  }
  function qty(l) {
    if (isStop(l)) return 0
    if (manualQty(l)) return Math.ceil(num(l.qtyMan))
    return Math.ceil(stepsOf(l).reduce(function (a, s) { return a + perDay(s) * num(s.amount) * totalDays(s) }, 0))
  }
  function qtyText(l) {
    if (isStop(l)) return 'none (stop line - not dispensed)'
    if (manualQty(l)) return qty(l) ? qty(l) + ' ' + (UNITS[l.unit] || l.unit) + ' (entered by doctor)' : 'enter quantity'
    var q = qty(l), t = q + ' ' + (UNITS[l.unit] || l.unit), last = stepsOf(l)[stepsOf(l).length - 1]
    return last.cont ? t + (stepped(l) ? ' (last step: 30-day supply)' : ' (30-day supply)') : t
  }
  function doseOne(s) {
    if (s.mode === 'pattern') return s.slots.join('+')
    if (s.mode === 'interval') return 'every ' + s.intervalH + ' h'
    return 'SOS (max ' + s.prnMax + '/day)'
  }
  function doseText(l) {
    if (!stepped(l)) return doseOne(l)
    return l.steps.map(function (s, k) { return (k + 1) + ') ' + s.amount + ' ' + l.unit + ' ' + doseOne(s) + ' for ' + durText(s).toLowerCase() }).join(', then ')
  }
  function durText(l) {
    if (!stepped(l)) return l.cont ? 'Continue' : l.durVal + ' ' + l.durUnit
    var last = l.steps[l.steps.length - 1]
    return last.cont ? courseDays(l) + ' days, then continue' : courseDays(l) + ' days in ' + l.steps.length + ' steps'
  }
  function lineName(l) { return l.brand + (l.strength ? ' ' + l.strength : '') }

  /* ---------- extra line fields: infusion / sliding scale (PHAR-1717), stop + continue-previous (PHAR-1718), SOS reason + side (PHAR-1721), weight dosing (PHAR-1722), allergy (PHAR-1724) ---------- */
  // line.kind: MEDICINE (default) | STOP (not dispensed) | CONT (copied from an earlier Rx, dispensed like a normal line).
  // All fields below are LINE-level: with dosage steps (PHAR-1716) they apply to the whole line, except weight dosing, which is single-dose only.
  var XF = ['stopReason', 'asNeededReason', 'side', 'infVol', 'infUnit', 'rateValue', 'rateUnit', 'overHours', 'dpkOn', 'dpk', 'dpkPer', 'dpkOvr', 'wkText', 'qtyMan']
  var SIDE_ROUTES = { 'Eye drop': ['চোখে', 'eye'], 'Ear drop': ['কানে', 'ear'], 'Nasal': ['নাকে', 'nostril'] }
  var SIDE_BN = { RIGHT: 'ডান', LEFT: 'বাম', BOTH: 'দুই' }
  var SIDE_EN = { RIGHT: 'Right', LEFT: 'Left', BOTH: 'Both' }
  function xDefaults() { return { kind: 'MEDICINE', stopReason: '', asNeededReason: '', side: '', infVol: '', infUnit: 'ml', rateValue: '', rateUnit: 'drops/min', overHours: '', cond: [], dpkOn: false, dpk: '', dpkPer: 'dose', dpkOvr: '', wkText: '', qtyMan: '', allergyOvr: '', allergyAck: false } }
  function putX(l, x) {
    if (!x) return
    XF.forEach(function (k) { if (x[k] !== undefined) l[k] = x[k] })
    if (x.cond) l.cond = x.cond.map(function (r) { return { c: r.c, d: r.d } })
  }
  function extraOf(l) {
    var x = { route: l.route }
    XF.forEach(function (k) { x[k] = l[k] })
    x.cond = l.cond.map(function (r) { return { c: r.c, d: r.d } })
    return x
  }
  function isStop(l) { return l.kind === 'STOP' }
  function sideOn(o) { return !!SIDE_ROUTES[o.route] }
  function sideEn(o) { var r = SIDE_ROUTES[o.route]; return r && o.side ? SIDE_EN[o.side] + ' ' + r[1] + (o.side === 'BOTH' ? 's' : '') : '' }
  function sideBn(o) { var r = SIDE_ROUTES[o.route]; return r && o.side ? SIDE_BN[o.side] + ' ' + r[0] : '' }
  function infOn(o) { return (o.route === 'IV' || o.route === 'SC') && !!(num(o.infVol) || num(o.rateValue) || num(o.overHours)) }
  function infEn(o) {
    var t = []
    if (num(o.infVol)) t.push(o.infVol + ' ' + o.infUnit)
    if (num(o.rateValue)) t.push('at ' + o.rateValue + ' ' + o.rateUnit)
    if (num(o.overHours)) t.push('over ' + o.overHours + ' h')
    return t.join(' ')
  }
  function infBn(o) {
    var t = []
    if (num(o.infVol)) t.push(bn(o.infVol) + ' ' + (o.infUnit === 'L' ? 'লিটার' : 'মিলি'))
    if (num(o.rateValue)) t.push(o.rateUnit === 'ml/hr' ? 'প্রতি ঘণ্টায় ' + bn(o.rateValue) + ' মিলি' : 'প্রতি মিনিটে ' + bn(o.rateValue) + ' ফোঁটা')
    if (num(o.overHours)) t.push(bn(o.overHours) + ' ঘণ্টায়')
    return t.join(' &middot; ')
  }
  // Infusion and sliding-scale quantities are typed by the doctor, never computed.
  function manualQty(l) { return !isStop(l) && (infOn(l) || l.cond.length > 0) }
  function hasPrn(l) { return stepsOf(l).some(function (s) { return s.mode === 'prn' }) }
  function syncReason(l) { if (!hasPrn(l)) l.asNeededReason = '' }
  function extrasSummary(l) {
    var t = []
    if (sideEn(l)) t.push(sideEn(l))
    if (l.asNeededReason && hasPrn(l)) t.push('if: ' + l.asNeededReason)
    if (infOn(l)) t.push(infEn(l))
    if (l.cond.length) t.push('sliding scale (' + l.cond.length + ' rows)')
    if (l.dpkOn && l.wkText && !stepped(l)) t.push(l.wkText)
    return t
  }

  /* weight-based dosing (PHAR-1722): dose = mg/kg x weight (O/E vitals); ml or units from the strength; the doctor can override */
  function strengthParts(str) { var m = String(str || '').match(/([\d.]+)\s*mg(?:\s*\/\s*([\d.]+)\s*ml)?/i); return m ? { mg: +m[1], ml: m[2] ? +m[2] : 0 } : null }
  function r1(x) { return Math.round(x * 10) / 10 }
  function wkCalc(l) {
    var w = S.draft ? num(S.draft.vitals.weight) : 0, dpk = num(l.dpk), sp = strengthParts(l.strength)
    if (!w) return { ok: false, err: 'weight' }
    if (!dpk) return { ok: false, err: 'dpk' }
    if (!sp) return { ok: false, err: 'strength' }
    var n = perDay(l)
    if (l.dpkPer === 'day' && !n) return { ok: false, err: 'freq' }
    var mg = l.dpkPer === 'day' ? dpk * w / n : dpk * w
    var amt = sp.ml ? Math.round(mg / sp.mg * sp.ml * 2) / 2 : Math.round(mg / sp.mg * 2) / 2
    amt = Math.max(0.5, amt)
    var unit = sp.ml ? 'ml' : l.unit, ovr = num(l.dpkOvr), fin = ovr || amt
    var finMg = sp.ml ? fin / sp.ml * sp.mg : fin * sp.mg, daily = finMg * n, m = l.medId ? medById(l.medId) : null
    var max = m && m.maxMgKgDay ? m.maxMgKgDay * w : 0
    return { ok: true, w: w, mg: mg, amt: amt, unit: unit, ovr: ovr, fin: fin, finMg: finMg, daily: daily, max: max, over: !!(max && daily > max + 1e-9), sp: sp }
  }
  function wkTextOf(l, c) {
    return l.dpk + ' mg/kg/' + l.dpkPer + ' x ' + c.w + ' kg = ' + r1(c.mg) + ' mg per dose -> ' + c.amt + ' ' + c.unit + ' per dose' + (c.ovr ? ' (doctor set ' + c.ovr + ' ' + c.unit + ')' : '')
  }
  function syncWk(l) {
    if (!l.dpkOn || stepped(l) || isStop(l)) return
    var c = wkCalc(l)
    if (!c.ok) { l.wkText = ''; return }
    l.unit = c.unit; l.amount = String(c.fin); l.wkText = wkTextOf(l, c)
  }
  function wkHtml(l) {
    var c = wkCalc(l)
    if (!c.ok) {
      var msg = { weight: 'Weight is required: enter the patient\'s weight in the strip above (O/E vitals).', dpk: 'Enter the dose in mg per kg.', strength: 'This product has no mg strength to calculate from.', freq: 'Set how often it is given to split a per-day dose.' }[c.err]
      return '<span class="fld-err" role="alert">' + esc(msg) + '</span>' + (c.err === 'weight' ? ' <button class="link" data-act="focusWeight">Enter weight</button>' : '')
    }
    var h = '<b>' + c.w + ' kg x ' + esc(l.dpk) + ' mg/kg' + (l.dpkPer === 'day' ? '/day &divide; ' + perDay(l) + ' doses' : '') + ' = ' + r1(c.mg) + ' mg per dose</b> &rarr; <b>' + c.amt + ' ' + esc(c.unit) + '</b> <span class="muted small">(' + esc(l.strength) + ', rounded to 0.5)</span>'
    if (c.ovr) h += '<div class="small">Doctor override: <b>' + c.ovr + ' ' + esc(c.unit) + '</b> per dose = ' + r1(c.finMg) + ' mg (' + r1(c.finMg / c.w) + ' mg/kg)</div>'
    if (c.over) h += '<div class="warn-t2 small" role="alert">&#9888; Daily dose ' + r1(c.daily) + ' mg is above the catalogue maximum of ' + medById(l.medId).maxMgKgDay + ' mg/kg/day (' + r1(c.max) + ' mg for ' + c.w + ' kg). Warning only - the decision is yours.</div>'
    return h
  }
  function weightErrSync() {
    if (!S.draft) return
    var need = S.draft.lines.some(function (l) { return l.dpkOn && !stepped(l) && !isStop(l) && !num(S.draft.vitals.weight) }), e = $('#wErr'), i = $('[data-bind="vitals.weight"]')
    if (e) e.textContent = need ? 'Weight is required for weight-based dosing' : ''
    if (i) i.classList.toggle('err', need)
  }

  /* allergy check (PHAR-1724): patient's allergies + "Allergy: ..." chips in this Rx's drug-history section, against the drug class or generic */
  function allergyList() {
    var out = pat().allergies.slice()
    ;((S.draft && S.draft.notes.dh) || []).forEach(function (n) {
      var m = /^allergy\s*:\s*(.+)$/i.exec(n.t), a = m ? m[1].trim() : ''
      if (a && out.map(function (x) { return x.toLowerCase() }).indexOf(a.toLowerCase()) < 0) out.push(a)
    })
    return out
  }
  function allergyHits(l) {
    if (l.free || isStop(l) || !l.generic) return []
    var cls = (l.cls || '').toLowerCase(), gs = genericsOf(l.generic)
    return allergyList().filter(function (a) { var x = a.toLowerCase(); return x === cls || gs.indexOf(x) >= 0 })
  }
  function allergyCounts() {
    var w = 0, a = 0
    S.draft.lines.forEach(function (l) { if (allergyHits(l).length) { w++; if (l.allergyAck) a++ } })
    return { w: w, a: a }
  }
  function allergyCard(l, hits, ctx) {
    var nm = hits.join(', ')
    if (l.allergyAck) {
      return '<div class="warn-card al acked"><span>&#10003; Allergy override kept: ' + esc(nm) + ' &ndash; reason: ' + esc(l.allergyOvr) + '</span> <button class="link" data-act="allergyUndo" data-id="' + l.id + '">Undo</button></div>'
    }
    var head = ctx === 'popup' ? '<div class="warn-for">' + esc(lineName(l)) + ' <small>' + esc(l.generic) + '</small></div>' : ''
    return '<div class="warn-card al" role="alert"><div class="warn-t"><span class="ico">!</span><strong>Known allergy: ' + esc(nm) + '</strong></div>' + head +
      '<p class="al-t">' + esc(pat().name) + ' has a recorded <b>' + esc(nm) + '</b> allergy. ' + esc(lineName(l)) + ' is ' + (l.cls && l.cls.toLowerCase() === hits[0].toLowerCase() ? 'a <b>' + esc(l.cls) + '</b>-class drug' : '<b>' + esc(l.generic) + '</b>') + '.</p>' +
      '<label class="fld"><span>Override reason (stored on the line, required to keep it)</span><input class="txt" ' + f(l, 'allergyOvr') + ' value="' + esc(l.allergyOvr) + '" placeholder="e.g. Tolerated before, specialist advised"></label>' +
      '<div class="warn-a"><button class="btn sm" data-act="allergyAck" data-id="' + l.id + '">Keep with override reason</button>' +
      '<button class="btn sm ghost danger-text" data-act="removeLine" data-id="' + l.id + '">Remove</button></div>' +
      '<p class="hint">Warnings never block you. The decision is yours.</p></div>'
  }

  /* validation (field-level) shown after a failed Complete */
  function validateRx() {
    var errs = []
    if (!medOn() && S.draft.lines.length) errs.push('Medicines: Medicine prescribing is not enabled for this doctor')
    if (isAnimal() && secOn('b:animalPatient') && !num(S.draft.vitals.weight)) errs.push('Animal weight: weight (kg) is required for an animal patient')
    if (secOn('b:growth') && !num(S.draft.vitals.weight)) errs.push('Growth: weight (kg) is required, it drives mg/kg dosing')
    S.draft.lines.forEach(function (l, i) {
      if (isStop(l)) return
      if (l.cond.some(function (r) { return !r.c.trim() || !r.d.trim() })) errs.push('Line ' + (i + 1) + ': every sliding-scale row needs a condition and a dose')
      if (l.dpkOn && !stepped(l)) {
        if (!num(S.draft.vitals.weight)) errs.push('Line ' + (i + 1) + ': enter the patient\'s weight (O/E vitals) for weight-based dosing')
        else if (!num(l.dpk)) errs.push('Line ' + (i + 1) + ': enter the mg per kg')
      }
    })
    S.draft.res.forEach(function (r, i) { ['name', 'value', 'date'].forEach(function (f) { var m = resMsg(r, f); if (m) errs.push('Report result ' + (i + 1) + ': ' + m) }) })
    if (secOn('advice')) S.draft.notes.advice.forEach(function (c, i) { if (!hasBangla(c.t)) errs.push('Advice ' + (i + 1) + ': Advice must be written in Bangla') })
    return errs.concat(xAllErrs())
  }

  /* ---------- dosage steps (PHAR-1716): tapering, loading dose, delayed start ---------- */
  // A line with 2+ steps runs them in order (FHIR Dosage.sequence); its flat dose fields are then ignored.
  // Unit, food, route, instructions and caution stay on the line. Only the last step may be "Continue".
  function stepOf(s) {
    return { mode: s.mode || 'pattern', slots: (s.slots || ['1', '0', '0']).slice(), intervalH: s.intervalH || 8, prnMax: s.prnMax || 3,
      amount: String(s.amount || '1'), durVal: String(s.durVal || s.days || 5), durUnit: s.durUnit || 'days', cont: !!s.cont }
  }
  function stepped(l) { return !!(l.steps && l.steps.length > 1) }
  function stepsOf(l) { return stepped(l) ? l.steps : [l] }
  function courseDays(l) { return stepsOf(l).reduce(function (a, s) { return a + (s.cont ? 0 : totalDays(s)) }, 0) }
  function stepSummary(l) { return l.steps.length + ' steps: ' + l.steps.map(function (s) { return s.amount }).join('→') + ' ' + l.unit + (l.steps[l.steps.length - 1].cont ? ' then continue' : '') }
  function startOffset(l) {
    if (l.startMode === 'after') return Math.max(0, Math.floor(num(l.startN)))
    if (l.startMode === 'date' && l.startDate) return Math.max(0, Math.round((pd(l.startDate) - TODAY) / 864e5))
    return 0
  }
  function startLabel(l) {
    var n = startOffset(l)
    return n ? 'Starts ' + fmt(addDays(TODAY, n)) + (l.startMode === 'after' ? ' (after ' + daysText(n) + ')' : '') : ''
  }
  // Calendar range of each step, counted from the start date.
  function stepRanges(l) {
    var at = addDays(TODAY, startOffset(l))
    return stepsOf(l).map(function (s) {
      if (s.cont) return fmt(at) + ' onwards'
      var n = Math.max(1, totalDays(s)), from = at
      at = addDays(at, n)
      return n === 1 ? fmt(from) : fmt(from) + ' – ' + fmt(addDays(from, n - 1))
    })
  }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2) }
  // Turns a single-dose line into step 1 + a copy as step 2 (a "Continue" stays on the new last step), or appends a copy of the last step.
  function stepAdd(l) {
    var wk = l.dpkOn
    if (wk) { l.dpkOn = false; l.dpkOvr = ''; l.wkText = '' } /* PHAR-1722: weight-based dosing is single-dose only */
    if (!stepped(l)) l.steps = [stepOf(l)]
    var last = l.steps[l.steps.length - 1], next = stepOf(last)
    if (last.cont) { last.cont = false; if (!num(last.durVal)) last.durVal = '1' }
    l.steps.push(next); l.collapsed = false
    replaceLine(l); toast('Step ' + l.steps.length + ' added - set its dose and duration' + (wk ? ' (weight-based dosing switched off for this line)' : ''))
  }
  function stepDel(l, k) {
    l.steps.splice(k, 1)
    if (l.steps.length === 1) { Object.assign(l, stepOf(l.steps[0])); l.steps = []; toast('Back to a single dose') }
    syncReason(l); replaceLine(l); weightErrSync()
  }

  /* Auto taper: fixed timing, amount per dose falls by a set step every N days. */
  function taperModal(id) {
    var l = lineById(id), a = num(stepsOf(l)[0].amount), from = a > 1 ? a : 8, by = Math.max(0.5, Math.round(from / 4 * 2) / 2)
    S.taper = { id: id, from: String(from), by: String(by), every: '5', to: String(by) }
    var t = S.taper, inp = function (k, lab, step) { return '<label class="fld"><span>' + lab + '</span><input type="number" min="0.5" step="' + step + '" data-tp="' + k + '" value="' + esc(t[k]) + '"></label>' }
    openModal({ title: 'Auto taper - ' + lineName(l), cls: 'sm', body: '<div class="g g-taper">' + inp('from', 'Start amount (' + l.unit + ' per dose)', '0.5') + inp('by', 'Reduce by', '0.5') +
      inp('every', 'Every (days)', '1') + inp('to', 'Last amount', '0.5') + '</div>' +
      '<p class="muted small">Timing stays as in step 1 (' + esc(doseOne(stepsOf(l)[0])) + '); only the amount per dose changes. Replaces the current steps - you can edit each step after.</p>' +
      '<div class="qa-prev" id="tpPrev">' + taperPrevHtml() + '</div>',
      foot: '<button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn primary" data-act="taperApply">Apply steps</button>' })
  }
  function taperAmounts() {
    var t = S.taper, from = num(t.from), by = num(t.by), to = num(t.to), out = []
    if (!(from > 0 && by > 0 && to > 0)) return out
    for (var x = from; x >= to - 1e-9 && out.length < 20; x = Math.round((x - by) * 100) / 100) out.push(x)
    return out
  }
  function taperPrevHtml() {
    var l = lineById(S.taper.id), am = taperAmounts(), every = Math.floor(num(S.taper.every)), base = stepsOf(l)[0]
    if (am.length < 2 || every < 1) return '<span class="warn-t2">Needs at least 2 steps - check the numbers.</span>'
    var q = Math.ceil(perDay(base) * every * am.reduce(function (a, x) { return a + x }, 0))
    return '<b>' + am.length + ' steps:</b> ' + am.join(' → ') + ' ' + esc(l.unit) + ' per dose, ' + daysText(every) + ' each &middot; ' + (am.length * every) + ' days &middot; Qty ' + q + ' ' + esc(UNITS[l.unit] || l.unit)
  }
  function taperApply() {
    var l = lineById(S.taper.id), am = taperAmounts(), every = String(Math.floor(num(S.taper.every))), base = stepOf(stepsOf(l)[0])
    if (am.length < 2 || !num(every)) return toast('Needs at least 2 steps - check the numbers')
    l.steps = am.map(function (x) { return Object.assign(stepOf(base), { amount: String(x), durVal: every, durUnit: 'days', cont: false }) })
    l.collapsed = false; closeModal(); replaceLine(l); toast('Taper set: ' + am.length + ' steps')
  }

  function addLine(l, silent) {
    S.draft.lines.push(l)
    var ck = checkLine(l, S.draft.lines.length - 1)
    if (!silent && S.warnStyle === 'popup' && ((ck.matches.length && !l.cf) || allergyHits(l).length)) S.popupQ.push(l.id)
    return l
  }
  function addMedicine(id, o) {
    var l = addLine(lineFrom(id, o))
    renderRx(); renderBar(); flashLine(l.id); drainPopups()
    return l
  }
  function flashLine(id) {
    var e = $('#line-' + id)
    if (e) { e.classList.add('flash'); e.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }
  }

  /* ---------- draft ---------- */
  function nextRxNo() { return 'RX-A12345-' + pad(S.rxCounter, 4) }
  function newDraft(p) {
    S.sections = S.sections.filter(function (c) { return !c.adhoc }) /* ad-hoc blocks last for one prescription only */
    var notes = {}
    allSecDefs().forEach(function (s) { if (s.kind === 'chips' || s.kind === 'advice') notes[s.id] = [] })
    var dr = {
      vitals: Object.assign({}, p.vitals), notes: notes, dx: [], dxType: 'PROVISIONAL', tests: [], libAdvice: [],
      fu: { unit: 'days', n: '', note: '', rem: true, remDays: '1', slot: null }, res: [], blocks: {}, bnd: S.bndDefault, orders: [], refs: [], adm: null, cert: null, lines: [], continued: null, bannerOff: false, rxNo: nextRxNo()
    }
    applyPrefill(dr, p)
    return dr
  }
  /* ---------- PHAR-1693: pre-fill from the patient record + write-back on issue ---------- */
  // Pre-fill (design 5.x): K/C/O + allergies from the patient record; D/H, P/H, F/H from this doctor's last prescription; vitals from check-in (already copied above).
  // Write-back (D8, add-only): on issue, new K/C/O and allergy values are ADDED to the record. Removing a chip never deletes from the record. Drafts never write back.
  function inList(list, t) { t = String(t).trim().toLowerCase(); return (list || []).some(function (x) { return String(x).trim().toLowerCase() === t }) }
  function allergyOf(t) { var m = /^allergy\s*:\s*(.+)$/i.exec(t); return m ? m[1].trim() : '' }
  function pfItems(p) {
    var last = p.last || {}, out = { kco: [], dh: [], ph: [], fh: [] }
    if (isAnimal(p)) return out /* the owner's record is never copied to an animal (design 4.5) */
    ;(p.chronic || []).forEach(function (t) { out.kco.push({ t: t, src: 'record' }) })
    ;(p.allergies || []).forEach(function (a) { out.dh.push({ t: 'Allergy: ' + a, src: 'record' }) })
    ;['dh', 'ph', 'fh'].forEach(function (k) { (last[k] || []).forEach(function (t) { out[k].push({ t: t, src: 'last' }) }) })
    return out
  }
  function applyPrefill(dr, p) {
    var items = pfItems(p), n = 0
    Object.keys(items).forEach(function (k) {
      if (!dr.notes[k]) return
      items[k].forEach(function (c) { if (!inList(dr.notes[k].map(function (x) { return x.t }), c.t)) { dr.notes[k].push(c); n++ } })
    })
    return n
  }
  function recAdds() {
    var p = pat(), dr = S.draft, kco = [], al = []
    if (isAnimal(p)) return { kco: [], al: [], n: 0 } /* never write animal data to the owner's record */
    ;(dr.notes.kco || []).forEach(function (c) { if (!inList(p.chronic, c.t) && !inList(kco, c.t)) kco.push(c.t) })
    ;(dr.notes.dh || []).forEach(function (c) { var a = allergyOf(c.t); a = a.charAt(0).toUpperCase() + a.slice(1); if (a && !inList(p.allergies, a) && !inList(al, a)) al.push(a) })
    return { kco: kco, al: al, n: kco.length + al.length }
  }
  function recText(w) { return (w.kco.length ? 'K/C/O: ' + w.kco.join(', ') : '') + (w.kco.length && w.al.length ? '; ' : '') + (w.al.length ? 'Allergy: ' + w.al.join(', ') : '') }
  function pfBar() {
    var p = pat(), dr = S.draft, c = { record: 0, last: 0 }
    if (isAnimal(p)) return '<div class="pfbar" id="pfBar"><div><b>Animal patient:</b> the owner\'s comorbidity, allergies and history are <b>not</b> copied here, and nothing from this prescription is written to the owner\'s record. Owner: ' + esc(ownerOf(p).name) + '.</div></div>'
    Object.keys(dr.notes).forEach(function (k) { dr.notes[k].forEach(function (x) { if (x.src) c[x.src]++ }) })
    var w = recAdds(), vit = Object.keys(dr.vitals).some(function (k) { return dr.vitals[k] })
    return '<div class="pfbar" id="pfBar"><div><b>Pre-filled for this visit:</b> ' + (vit ? 'vitals from check-in' : 'no vitals') + ', ' + c.record + ' from the patient record (comorbidity, allergies), ' + c.last + ' from ' + (p.last ? 'your last visit (' + esc(fmt(p.last.date)) + ', ' + esc(p.last.no) + ': D/H, P/H, F/H)' : 'no earlier visit with you') + '. Edit or remove anything; removing a chip never deletes it from the record.</div>' +
      '<div class="pf-w">' + (w.n ? 'On issue these will be <b>added to the patient record</b> (add-only): ' + esc(recText(w)) : 'Nothing new to add to the patient record yet. New comorbidities and allergies you add here are saved to the record when you issue (drafts never write back).') + '</div>' +
      '<div class="pf-a"><button class="link" data-act="pfApply">Re-apply pre-fill</button><button class="link" data-act="pfClear"' + (c.record + c.last ? '' : ' disabled') + '>Clear pre-filled</button></div></div>'
  }
  function openConsult(pid, serial) {
    S.pid = pid; S.serial = serial; S.draft = newDraft(pat()); S.popupQ = []; S.showErr = false; S.savedAt = null; S.view = 'consult'
    closeModal(); render()
  }
  function openForScenario(sc) {
    S.scenario = sc
    var a = D.appointments.filter(function (x) { return x.patientId === SCEN[sc] })[0]
    openConsult(SCEN[sc], a.serial)
  }

  /* ---------- modal / drawer ---------- */
  function openModal(o) {
    var root = $('#modalRoot')
    root.innerHTML = '<div class="backdrop ' + (o.drawer ? 'is-drawer' : '') + '" data-act="backdrop"><div class="modal ' + (o.cls || '') + '" role="dialog" aria-modal="true" aria-label="' + esc(o.title) + '">' +
      '<header class="modal-h"><h3>' + esc(o.title) + '</h3><button class="icon-btn" data-act="closeModal" aria-label="Close">&times;</button></header>' +
      '<div class="modal-b">' + o.body + '</div>' + (o.foot ? '<footer class="modal-f">' + o.foot + '</footer>' : '') + '</div></div>'
    S.modal = o
    var f = $('#modalRoot [autofocus], #modalRoot input, #modalRoot .modal-b button, #modalRoot .modal-f .btn')
    if (f) f.focus()
  }
  function closeModal() { $('#modalRoot').innerHTML = ''; S.modal = null; drainPopups() }
  function drainPopups() {
    if (S.modal || !S.popupQ.length || S.view !== 'consult') return
    var id = S.popupQ.shift(), l = lineById(id)
    if (!l) return drainPopups()
    showWarnPopup(l)
  }
  function lineById(id) { return S.draft.lines.filter(function (l) { return l.id === id })[0] }
  function lineIdx(id) { return S.draft.lines.indexOf(lineById(id)) }

  /* ---------- warning cards ---------- */
  function matchRow(m) {
    if (m.kind === 'current') {
      return '<li><span class="mr-main">Also on this prescription: line ' + m.n + ' - <b>' + esc(lineName(m.other)) + '</b> (' + esc(m.other.generic) + ')</span></li>'
    }
    var main, pill = '<span class="pill ' + (m.st.on ? 'on' : 'off') + '">' + esc(m.st.text) + '</span>'
    if (isMine(m.rx)) {
      main = '<b>You</b> prescribed ' + esc(m.m.brand + ' ' + m.m.strength) + ' (' + esc(m.m.generic) + ') &middot; ' + esc(m.sl.pattern) + ' &middot; ' + daysText(m.sl.days) +
        ' &middot; ' + fmt(m.rx.date) + ' (v' + m.rx.version + ')'
    } else { /* D1: another doctor's Rx - generic, strength, frequency, duration, date only. No brand / doctor / notes. */
      main = '<b>' + esc(m.m.generic) + '</b> ' + esc(m.m.strength) + ' &middot; ' + esc(m.sl.pattern) + ' &middot; ' + daysText(m.sl.days) +
        ' &middot; ' + fmt(m.rx.date) + ' &middot; <i>by another doctor</i>'
    }
    return '<li><span class="mr-main">' + main + '</span>' + pill + '<small class="mr-common">Common ingredient: ' + esc(m.common.join(', ')) + '</small></li>'
  }
  function warnCard(l, ck, ctx) {
    if (l.ack && ctx !== 'popup') {
      return '<div class="warn-card acked"><span>&#10003; Acknowledged &ndash; already on ' + esc(l.generic) + ' (kept by you)</span> <button class="link" data-act="unack" data-id="' + l.id + '">Undo</button></div>'
    }
    var head = ctx === 'inline' ? '' : '<div class="warn-for">' + esc(lineName(l)) + ' <small>' + esc(l.generic) + '</small></div>'
    return '<div class="warn-card" role="alert"><div class="warn-t"><span class="ico">!</span><strong>Already on this medicine</strong></div>' + head +
      '<ul>' + ck.matches.map(matchRow).join('') + '</ul>' +
      '<div class="warn-a"><button class="btn sm" data-act="ack" data-id="' + l.id + '">Keep (acknowledge)</button>' +
      '<button class="btn sm ghost" data-act="editDose" data-id="' + l.id + '">Edit dose</button>' +
      '<button class="btn sm ghost danger-text" data-act="removeLine" data-id="' + l.id + '">Remove</button></div>' +
      '<p class="hint">Warnings never block you. The decision is yours.</p></div>'
  }
  function showWarnPopup(l) {
    var ck = checkLine(l, lineIdx(l.id)), al = allergyHits(l)
    openModal({ title: 'Medication check', cls: 'sm', body: (al.length ? allergyCard(l, al, 'popup') : '') + (ck.matches.length ? warnCard(l, ck, 'popup') : '') })
  }
  function badge(l, ck) {
    if (ck.free) return '<span class="badge grey" title="Free-text medicine is not checked">not checked</span>'
    if (!ck.matches.length) return ''
    var act = S.warnStyle === 'popup' ? 'openPopup' : 'focusWarn'
    return '<button class="badge ' + (l.ack ? 'ack' : 'warn') + '" data-act="' + act + '" data-id="' + l.id + '">' + (l.ack ? '&#10003; Acknowledged' : '&#9888; Already on') + '</button>'
  }

  /* ---------- top bar / views ---------- */
  function renderTop() {
    var tabs = [['appointments', 'Appointments'], ['consult', 'Consultation'], ['prx', 'Patient Rx'], ['profile', 'My profile'], ['verify', 'Verify (public)'], ['patient', 'Patient view'], ['pos', 'Pharmacy staff (POS)'], ['guide', 'Guide']]
    $('#topbar').innerHTML = '<div class="brand"><span class="logo">Rx</span><div><strong>PharmaZ247</strong><small>Doctor Portal &middot; prototype</small></div></div>' +
      '<nav aria-label="Main">' + tabs.map(function (t) {
        return '<button class="tab' + (S.view === t[0] ? ' active' : '') + '" data-act="goto" data-v="' + t[0] + '">' + t[1] + '</button>'
      }).join('') + '</nav><div class="who">' + (S.view === 'pos' ? '<span class="avatar">RH</span><span>Rakib Hasan (Cashier)</span>' : '<span class="avatar">' + esc(initials(doc().name)) + '</span><span>' + esc(doc().name) + '</span>') + '</div>'
  }
  function render() {
    renderTop(); renderProto()
    document.body.setAttribute('data-ws', S.warnStyle)
    var v = S.view
    document.body.setAttribute('data-view', v)
    if (v === 'appointments') renderAppointments()
    else if (v === 'consult') renderConsult()
    else if (v === 'profile') renderProfile()
    else if (v === 'verify') renderVerify()
    else if (v === 'prx') renderPrx()
    else if (v === 'pos') renderPos()
    else if (v === 'ext') renderExt()
    else if (v === 'guide') renderGuide()
    else renderPatient()
    window.scrollTo(0, 0)
  }
  function renderAppointments() {
    var rows = D.appointments.filter(function (a) { return a.doc === S.doc && (!a.date || a.date === D.today) }).map(function (a) {
      var p = D.patients[a.patientId], done = a.status === 'Done'
      return '<li class="appt"><div class="serial">#' + a.serial + '<small>' + a.time + '</small></div>' +
        '<div class="a-main"><strong>' + esc(p.name) + '</strong> <span class="muted">' + esc(p.age + ' / ' + p.sex) + '</span>' +
        (a.tag ? ' <span class="tag">' + esc(a.tag) + '</span>' : '') +
        '<div class="muted">' + esc(a.reason) + (p.relation ? ' &middot; ' + esc(p.relation) : '') + ownerTag(p) + '</div></div>' +
        '<span class="status ' + a.status.toLowerCase() + '">' + a.status + '</span>' +
        '<button class="btn ' + (done ? 'ghost' : 'primary') + '" data-act="' + (done ? 'viewDone' : 'openAppt') + '" data-serial="' + a.serial + '">' + (done ? 'View' : 'Open consultation') + '</button></li>'
    }).join('')
    $('#view').innerHTML = '<div class="page narrow"><div class="page-h"><div><h1>Today\'s appointments</h1><p class="muted">Wednesday, 21 Oct 2026 &middot; ' + esc(doc().chamber) + '</p></div>' +
      '<button class="btn ghost" data-act="nyi" data-w="Walk-in registration">+ Add walk-in</button></div>' + (S.welcomeOff ? '' : '<div class="g-welcome" role="region" aria-label="Welcome"><div><strong>New here?</strong> Open the guide - 2-minute tour. It explains this prototype and takes you to each feature.</div><div class="g-wb"><button class="btn primary sm" data-act="gOpen" data-id="start">Open the guide</button><button class="icon-btn" data-act="gWelcomeOff" aria-label="Dismiss the welcome card" title="Dismiss">&times;</button></div></div>') + '<ul class="appts">' + rows + '</ul></div>'
  }

  /* ---------- consult skeleton ---------- */
  function renderConsult() {
    var d = doc(), a = appt()
    $('#view').innerHTML = '<div class="consult">' +
      '<div class="c-head"><div><strong>' + esc(d.name) + '</strong> <span class="muted">' + esc(d.degrees) + ' &middot; ' + esc(specLine(d)) + ' &middot; ' + esc(regShort(d)) + '</span></div>' +
      '<div class="c-meta"><span>' + esc(d.chamber) + '</span><span>' + fmtY(D.today) + '</span><span class="tag">Serial #' + a.serial + '</span><span class="muted">' + (S.draft.editing ? 'Editing ' : 'Draft ') + esc(S.draft.rxNo) + '</span><button class="g-help" data-act="gHelp" data-id="notes" aria-label="Open the user guide" title="Help: open the guide">?</button></div></div>' +
      '<section class="strip" id="strip"></section><div id="banner"></div>' +
      '<div class="c-body"><aside class="notes" id="notes" aria-label="Clinical notes"></aside><section class="rx" id="rx" aria-label="Medicines"></section><aside class="medcheck" id="medcheck" aria-label="Medication check"></aside></div>' +
      '<div class="actionbar" id="bar"></div></div>'
    renderStrip()
    if (!presOn()) { $('.c-body').innerHTML = '<div class="rx-off blocked" id="presOff"><b>Prescribing is disabled for this doctor</b><p>The platform admin has switched prescribing off for ' + esc(d.name) + ' (error 403, not tied to any field). Existing prescriptions stay readable and printable. Use Prototype controls to switch it back on.</p></div>'; $('#bar').innerHTML = ''; return }
    renderBanner(); renderNotes(); renderRx(); renderBar()
  }
  function bmi() {
    var v = S.draft.vitals, w = num(v.weight), h = num(v.height) / 100
    return w && h ? (w / (h * h)).toFixed(1) : '-'
  }
  function renderStrip() {
    var p = pat(), v = S.draft.vitals, an = animalOf(p), ow = ownerOf(p)
    function vi(k, label, unit, w) {
      return '<label class="vi"><span>' + label + '</span><span class="vin"><input data-bind="vitals.' + k + '" value="' + esc(v[k]) + '" style="width:' + w + 'em" aria-label="' + label + '"><em>' + unit + '</em></span></label>'
    }
    var idb = an
      ? '<div class="p-id"><div class="p-name"><strong>' + esc(an.name) + '</strong> <span class="muted">' + esc(animalDesc(an)) + '</span></div><div class="muted">Owner: ' + esc(ow.name) + ' &middot; ' + esc(ow.phone) + '</div>' +
        '<div><span class="chip vet">For animal use only</span>' + an.features.map(function (x) { return '<span class="chip grey">' + esc(x) + '</span>' }).join('') + '</div></div>'
      : '<div class="p-id"><div class="p-name"><strong>' + esc(p.name) + '</strong> <span class="muted">' + esc(p.age + ' / ' + p.sex) + '</span></div>' +
        '<div class="muted">' + esc(p.phone) + '</div>' + (p.relation ? '<div class="rel">' + esc(p.relation) + ' (family account)</div>' : '') +
        '<div>' + (p.allergies.length ? p.allergies.map(function (x) { return '<span class="chip allergy">Allergy: ' + esc(x) + '</span>' }).join('') : '<span class="chip grey">No known allergies</span>') + '</div></div>'
    var vit = an
      ? vi('temp', 'Temp', '&deg;F', 4) + vi('pulse', 'Pulse', '/min', 3) + vi('rr', 'Resp', '/min', 3) + vi('weight', 'Weight', 'kg', 4) + '<div class="vi-n muted small">' + esc(DX.vnorm()) + '</div><div class="vi-err" id="wErr" role="alert"></div>'
      : vi('bp', 'BP', 'mmHg', 5) + vi('pulse', 'Pulse', '/min', 3) + vi('temp', 'Temp', '&deg;F', 4) + vi('weight', 'Weight', 'kg', 3) + vi('height', 'Height', 'cm', 3) +
        '<div class="vi"><span>BMI</span><span class="vin"><strong id="bmi">' + bmi() + '</strong><em>kg/m&sup2;</em></span></div>' + vi('spo2', 'SpO2', '%', 3) + '<div class="vi-err" id="wErr" role="alert"></div>'
    $('#strip').innerHTML = idb + '<div class="vitals">' + vit + '</div>'
    weightErrSync()
  }

  /* ---------- continue banner ---------- */
  function renderBanner() {
    var el = $('#banner'), own = ownRxs(), dr = S.draft, c = dr.continued
    if (!medOn()) { el.innerHTML = ''; return }
    if (c) {
      el.innerHTML = '<div class="cont-chip"><span class="chip teal">Continuing from ' + esc(c.no) + ' (v' + c.version + ') &middot; will be saved as v' + c.next + '</span>' +
        '<button class="link" data-act="undoContinue">Undo (remove copied items)</button><button class="link" data-act="startFresh">Start new</button></div>'
      return
    }
    if (!own.length || dr.bannerOff) { el.innerHTML = ''; return }
    var r = own[0]
    el.innerHTML = '<div class="banner"><div><strong>Returning patient</strong> &mdash; your last prescription ' + fmtY(r.date) + ' &middot; ' + esc(r.no) + ' (v' + r.version + ')</div>' +
      '<div class="b-act"><button class="btn primary sm" data-act="continue" data-id="' + r.id + '">Continue from this</button><button class="btn ghost sm" data-act="viewPrev">View previous</button>' +
      '<button class="btn ghost sm" data-act="startNew">Start new</button></div></div>'
  }
  function continueFrom(id) {
    var rx = (D.history[S.pid] || []).filter(function (r) { return r.id === id })[0], dr = S.draft
    var maxV = ownRxs()[0].version
    rx.lines.forEach(function (hl) {
      if (hl.stop) return /* a stop line is not carried forward */
      addLine(lineFromHist(hl, rx), true) /* a taper keeps its steps; the start date is not copied */
    })
    rx.tests.forEach(function (t) { if (!hasTest(t)) dr.tests.push({ t: t, cont: true }) }) /* D2: only medicines + advised tests are copied */
    dr.continued = { id: rx.id, no: rx.no, version: rx.version, next: maxV + 1 }
    closeModal(); renderBanner(); renderNotes(); renderRx(); renderBar()
    var w = warnCounts().w
    toast('Copied ' + rx.lines.length + ' medicines and ' + rx.tests.length + ' tests. Notes, vitals and diagnosis left empty.' + (w ? ' ' + w + ' needs a check.' : ''))
  }
  // Copy of an issued line (schedule, extras) as a new editable line; used by Continue from previous and Continue previous medicines.
  function lineFromHist(hl, rx) {
    var o = hl.steps ? { steps: hl.steps, unit: hl.unit } : hl.dose ? Object.assign({}, hl.dose, { days: hl.days === null ? undefined : hl.days, cont: hl.days === null }) : { slots: hl.pattern.split('+'), days: hl.days === null ? undefined : hl.days, cont: hl.days === null }
    return lineFrom(hl.medId, Object.assign(o, { food: hl.food, cf: rx.id, x: hl.x }))
  }
  function undoContinue() {
    var dr = S.draft
    dr.lines = dr.lines.filter(function (l) { return !l.cf })
    dr.tests = dr.tests.filter(function (t) { return !t.cont })
    dr.continued = null; dr.bannerOff = false
    renderBanner(); renderNotes(); renderRx(); renderBar()
    toast('Copied items removed')
  }
  function startFresh() {
    if (!window.confirm('Clear all medicines and tests from this draft?')) return
    var dr = S.draft
    dr.lines = []; dr.tests = []; dr.continued = null; dr.bannerOff = true
    renderBanner(); renderNotes(); renderRx(); renderBar()
  }
  function viewPrev(selId) {
    var own = ownRxs(); if (!own.length) return
    var sel = own.filter(function (r) { return r.id === (selId || S.drawerRx) })[0] || own[0]
    S.drawerRx = sel.id
    var chain = own.slice().reverse().map(function (r) {
      return '<button class="chain-b' + (r.id === sel.id ? ' sel' : '') + '" data-act="selectRx" data-id="' + r.id + '">v' + r.version + ' &middot; ' + fmt(r.date) + '</button>'
    }).join('<span class="arrow">&rarr;</span>')
    var lines = sel.lines.map(function (l) {
      if (l.stop) return '<tr><td colspan="4"><b>STOP: ' + esc(l.name) + '</b>' + (l.reason ? '<small>' + esc(l.reason) + '</small>' : '') + '</td></tr>'
      var m = medById(l.medId)
      return '<tr><td><b>' + esc(m.brand + ' ' + m.strength) + '</b><small>' + esc(m.generic) + '</small></td><td>' + esc(l.pattern) + '</td><td>' + esc(FOOD[l.food]) + '</td><td>' + daysText(l.days) + '</td></tr>'
    }).join('')
    var body = '<p class="muted">Your own prescriptions for ' + esc(pat().name) + ' &middot; read-only</p><div class="chain">' + chain + '</div>' +
      '<div class="ro"><h4>' + esc(sel.no) + ' &middot; v' + sel.version + ' &middot; ' + fmtY(sel.date) + '</h4>' +
      '<div class="ro-g"><b>C/C</b><span>' + esc(sel.cc.join('; ') || '-') + '</span><b>Dx</b><span>' + esc(sel.dx.map(function (x) { return x.t + ' (' + DX_TYPES[x.type] + ')' }).join('; ') || '-') + '</span></div>' +
      '<table class="mini"><thead><tr><th>Medicine</th><th>Dose</th><th>Food</th><th>Duration</th></tr></thead><tbody>' + lines + '</tbody></table>' +
      '<div class="ro-g"><b>Tests</b><span>' + esc(sel.tests.join(', ') || '-') + '</span><b>Advice</b><span>' + esc(sel.advice.join('; ') || '-') + '</span><b>Follow-up</b><span>' + esc(sel.follow || '-') + '</span></div></div>'
    openModal({ title: 'Previous prescriptions', drawer: true, cls: 'drawer', body: body,
      foot: '<button class="btn primary" data-act="continue" data-id="' + sel.id + '">Continue from this (v' + sel.version + ')</button><button class="btn ghost" data-act="closeModal">Close</button>' })
  }

  /* ---------- notes (left panel) ---------- */
  function allSecDefs() { return D.sections.concat(BLOCK_DEFS, S.customSecs) }
  // Built-in sections can be renamed per doctor: the override is laid over the default definition.
  function secDef(id) { var d = allSecDefs().filter(function (s) { return s.id === id })[0], o = S.secOverride[id]; return d && o ? Object.assign({}, d, o) : d }
  function secOn(id) { var c = cfg(id); return !!c && !c.hidden }
  function hasTest(t) { return S.draft.tests.some(function (x) { return x.t === t }) }
  function renderNotes() {
    keepFocus(function () {
      var vis = S.sections.filter(function (c) { return !c.hidden }), removed = S.sections.length - vis.length
      $('#notes').innerHTML = '<div class="notes-h"><h2>Clinical notes</h2><span class="notes-ha"><button class="btn ghost sm" data-act="customise">Manage sections</button></span></div>' + tplBar() + pfBar() +
        vis.map(function (c) { return sectionHtml(secDef(c.id), c) }).join('') +
        '<div class="sec-quick"><input class="txt" id="secQuick" placeholder="+ New section: type a name and press Enter" aria-label="Add a new note section"></div>' +
        (removed ? '<p class="muted small">' + removed + ' section' + (removed > 1 ? 's' : '') + ' removed &middot; <button class="link" data-act="customise">restore in Manage sections</button></p>' : '')
    })
  }
  function chipsHtml(sec, arr) {
    return '<div class="chips">' + arr.map(function (c, i) {
      var al = sec === 'dh' ? allergyOf(c.t) : '', fresh = (sec === 'kco' && !inList(pat().chronic, c.t)) || (al && !inList(pat().allergies, al))
      return '<span class="chip' + (c.src ? ' pf' : '') + '">' + esc(c.t) + (c.src ? '<em class="ctag pf" title="Pre-filled from ' + (c.src === 'record' ? 'the patient record' : 'your last visit') + '">' + (c.src === 'record' ? 'record' : 'last visit') + '</em>' : '') + (fresh ? '<em class="ctag newrec" title="Not on the patient record yet - added to it when you issue">+ record</em>' : '') + starBtn(sec, c.t) + '<button data-act="chipDel" data-sec="' + sec + '" data-i="' + i + '" aria-label="Remove ' + esc(c.t) + '">&times;</button></span>'
    }).join('') + '</div>'
  }
  /* Saving a note to the doctor's list: ☆ on a chip saves it, ★ means it is already in the list (click to take it off). */
  function isSaved(sec, t) { return (S.saved[sec] || []).some(function (s) { return s.t.toLowerCase() === t.toLowerCase() }) }
  function starBtn(sec, t) {
    var on = isSaved(sec, t)
    return '<button class="star' + (on ? ' on' : '') + '" data-act="noteStar" data-sec="' + sec + '" data-v="' + esc(t) + '" title="' + (on ? 'In your list - click to remove it from your list' : 'Save to your list - suggested next time') + '" aria-label="' + (on ? 'Remove ' + esc(t) + ' from your list' : 'Save ' + esc(t) + ' to your list') + '">' + (on ? '&#9733;' : '&#9734;') + '</button>'
  }
  function sgInput(kind, key, ph) {
    return '<div class="sg-wrap' + (kind === 'note' ? ' has-save' : '') + '"><input class="txt" data-sugg="' + kind + ':' + key + '" data-fk="in.' + key + '" placeholder="' + esc(ph) + '" autocomplete="off">' +
      (kind === 'note' ? '<button class="btn sm ghost sg-save" data-act="noteSaveTyped" data-sec="' + key + '" title="Add what you typed and save it to your list for next time">&#9734; Save to list</button>' : '') +
      '<div class="sugg" role="listbox"></div></div>'
  }
  function sectionHtml(def, cfg) {
    var dr = S.draft, id = def.id, body = ''
    if (def.kind === 'chips') body = chipsHtml(id, dr.notes[id]) + sgInput('note', id, 'Type, or pick from your previous entries') + (id === 'oi' ? resHtml() : '')
    else if (def.kind === 'tests') body = testsHtml()
    else if (def.kind === 'dx') body = dxHtml()
    else if (def.kind === 'advice') body = adviceHtml()
    else if (def.kind === 'block') body = blockHtml(def.bid)
    else body = followHtml()
    var n = def.kind === 'block' ? blockCount(def.bid) : def.kind === 'chips' ? dr.notes[id].length + (id === 'oi' ? dr.res.length : 0) : def.kind === 'tests' ? dr.tests.length : def.kind === 'dx' ? dr.dx.length : def.kind === 'advice' ? dr.notes.advice.length + dr.libAdvice.length : 0
    return '<section class="sec' + (cfg.collapsed ? ' collapsed' : '') + '" data-sec="' + id + '"><header class="sec-h">' +
      '<button class="sec-t" data-act="secCollapse" data-sec="' + id + '" aria-expanded="' + !cfg.collapsed + '"><span class="car">&#9662;</span>' + esc(def.title) + ' <abbr>' + def.abbr + '</abbr>' + (n ? '<span class="cnt">' + n + '</span>' : '') + '</button>' +
      '<button class="icon-btn" data-act="secHide" data-sec="' + id + '" title="Remove this section (restore any time from Manage sections)" aria-label="Remove section ' + esc(def.title) + '">&times;</button></header>' +
      '<div class="sec-b">' + body + '</div></section>'
  }
  function testsHtml() {
    var dr = S.draft
    return '<div class="chips">' + dr.tests.map(function (t, i) {
      return '<span class="chip">' + esc(t.t) + (t.cont ? '<em class="ctag">continued</em>' : '') + '<button data-act="testDel" data-i="' + i + '" aria-label="Remove ' + esc(t.t) + '">&times;</button></span>'
    }).join('') + '</div>' + sgInput('test', 'tests', 'Search lab tests (CBC, HbA1c, ECG...)') +
      '<div class="tt"><span class="muted small">Test templates:</span>' + D.testTemplates.map(function (t) { return '<button class="btn sm ghost" data-act="testTpl" data-id="' + t.id + '">' + esc(t.name) + '</button>' }).join('') + '</div>'
  }
  function dxHtml() {
    var dr = S.draft
    return '<div class="seg" role="group" aria-label="Diagnosis type for next entry">' + Object.keys(DX_TYPES).map(function (k) {
      return '<button class="' + (dr.dxType === k ? 'on' : '') + '" data-act="dxType" data-t="' + k + '">' + DX_TYPES[k] + '</button>'
    }).join('') + '</div><div class="chips">' + dr.dx.map(function (x, i) {
      return '<span class="chip">' + esc(x.t) + starBtn('dx', x.t) + '<button class="dxt ' + x.type + '" data-act="dxCycle" data-i="' + i + '" title="Click to change type">' + DX_TYPES[x.type] + '</button><button data-act="dxDel" data-i="' + i + '" aria-label="Remove">&times;</button></span>'
    }).join('') + '</div>' + sgInput('note', 'dx', 'Add diagnosis (type: ' + DX_TYPES[dr.dxType].toLowerCase() + ')')
  }
  function adviceHtml() {
    var dr = S.draft
    var lib = dr.libAdvice.map(function (id) {
      var a = D.adviceLibrary.filter(function (x) { return x.id === id })[0]
      return '<span class="chip advice"><span><b>' + esc(a.bn) + '</b><small>' + esc(a.en) + '</small></span><button data-act="libDel" data-id="' + id + '" aria-label="Remove">&times;</button></span>'
    }).join('')
    var free = dr.notes.advice.map(function (c, i) {
      return '<span class="chip advice"><span>' + esc(c.t) + (hasBangla(c.t) ? '' : '<small class="need' + (S.showErr ? ' fld-err' : '') + '">' + (S.showErr ? 'Advice must be written in Bangla' : 'Bangla text needed - required to complete') + '</small>') + '</span>' + starBtn('advice', c.t) + '<button data-act="chipDel" data-sec="advice" data-i="' + i + '" aria-label="Remove">&times;</button></span>'
    }).join('')
    return '<div class="chips col">' + lib + free + '</div>' + sgInput('note', 'advice', 'Type advice (Bangla + English) or pick a saved line') +
      '<button class="btn sm ghost" data-act="openLib">Health advice library</button>'
  }
  // Follow-up is always "after N <unit>": days, weeks or months. The calendar date is derived for display and print.
  var FU_UNITS = [['days', 'Days'], ['weeks', 'Weeks'], ['months', 'Months']]
  function fuUnitLabel(unit, n) { var u = unit || 'days'; return num(n) === 1 ? u.slice(0, -1) : u }
  function followDue() {
    var f = S.draft.fu, n = num(f.n); if (!n) return null
    if (f.unit === 'weeks') return addDays(TODAY, n * 7)
    if (f.unit === 'months') { // calendar months; a day the target month lacks rolls to its last day (31 Jan + 1 month = 28/29 Feb)
      var day = TODAY.getDate(), x = new Date(TODAY.getFullYear(), TODAY.getMonth() + n, 1)
      x.setDate(Math.min(day, new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate())); return x
    }
    return addDays(TODAY, n)
  }
  function followDate() { var d = followDue(); return d ? fmtY(d) : '' }
  function followText() { var f = S.draft.fu; return num(f.n) ? 'after ' + num(f.n) + ' ' + fuUnitLabel(f.unit, f.n) + ' (' + followDate() + ')' : '' }
  function fuVisit() { var f = S.draft.fu; return f.slot ? pd(f.slot.date) : followDue() }
  function fuSendOn() { var v = fuVisit(); return v ? addDays(v, -num(S.draft.fu.remDays)) : null }
  function followHtml() {
    var f = S.draft.fu
    return '<div class="seg" role="group" aria-label="Follow-up unit">' + FU_UNITS.map(function (u) { return '<button class="' + (f.unit === u[0] ? 'on' : '') + '" data-act="fuMode" data-m="' + u[0] + '">' + u[1] + '</button>' }).join('') + '</div>' +
      '<label class="inl">After <input class="num" type="number" min="1" data-bind="fu.n" value="' + esc(f.n) + '" data-fk="fu.n" aria-label="Follow-up after how many ' + f.unit + '"> ' + f.unit + '</label>' +
      '<div class="muted small" id="fuInfo">' + (followDate() ? 'Follow-up on ' + followDate() : '') + '</div>' +
      '<input class="txt" data-bind="fu.note" value="' + esc(f.note) + '" placeholder="Note (e.g. With reports)" aria-label="Follow-up note">' + fuExtra()
  }
  // PHAR-1699: book the follow-up slot + patient reminder SMS (simulated). Rules for slot days / reminder timing are assumed - check against ticket.
  function fuExtra() {
    var f = S.draft.fu, due = followDue(), p = pat()
    if (!due) return '<div class="fu-x muted small" id="fuX">Set the follow-up to book a slot and schedule a patient reminder.</div>'
    var send = fuSendOn(), past = send <= TODAY
    return '<div class="fu-x" id="fuX"><div class="fu-book">' + (f.slot ? '<span class="badge ok">Booked</span> <b>' + esc(fmtY(f.slot.date)) + ', ' + esc(f.slot.time) + '</b> <button class="link" data-act="fuBook">Change</button> <button class="link" data-act="fuUnbook">Cancel booking</button>' : '<button class="btn sm ghost" data-act="fuBook">Book follow-up slot</button> <span class="muted small">optional - holds a time on ' + esc(followDate()) + '</span>') + '</div>' +
      '<label class="chk-i"><input type="checkbox" data-act="fuRem"' + (f.rem ? ' checked' : '') + '> Send the patient a reminder SMS</label>' +
      (f.rem ? '<div class="inl">Send <div class="seg" role="group" aria-label="Reminder days before">' + ['1', '2', '3', '7'].map(function (d) { return '<button class="' + (f.remDays === d ? 'on' : '') + '" data-act="fuRemDays" data-m="' + d + '">' + d + '</button>' }).join('') + '</div> day' + (f.remDays === '1' ? '' : 's') + ' before</div>' +
        '<div class="muted small">' + (past ? 'That day (' + esc(fmtY(send)) + ') is today or earlier - the SMS goes out right after you issue.' : 'SMS on ' + esc(fmtY(send)) + ' at 9:00 am') + ' to ' + esc(p.phone) + ' &middot; <button class="link" data-act="fuSms">Preview SMS (Bangla)</button></div>' : '') + '</div>'
  }
  function fuSlotModal() {
    var due = followDue(), days = [0, 1, 2, 3].map(function (k) { return addDays(due, k) }), sel = S.slotDay || isoDate(due), F = D.fuSlots, cur = S.draft.fu.slot
    var d = pd(sel), closed = d.getDay() === F.closedDow
    openModal({ title: 'Book follow-up slot', cls: 'sm', body: '<p class="muted small">Follow-up is due ' + esc(followDate()) + '. Pick a time that day, or one of the next open days.</p><div class="seg" role="group" aria-label="Day">' +
      days.map(function (x) { var iso = isoDate(x); return '<button class="' + (iso === sel ? 'on' : '') + '" data-act="fuDay" data-d="' + iso + '">' + esc(fmt(x)) + (x.getDay() === F.closedDow ? ' (closed)' : '') + '</button>' }).join('') + '</div>' +
      (closed ? '<div class="note">The chamber is closed on Fridays. Pick another day.</div>' : '<div class="slots">' + F.times.map(function (t) { var taken = F.taken.indexOf(t) >= 0, on = cur && cur.date === sel && cur.time === t; return '<button class="btn sm' + (on ? ' primary' : '') + '" data-act="fuPick" data-d="' + sel + '" data-t="' + t + '"' + (taken ? ' disabled title="Taken"' : '') + '>' + t + (taken ? ' taken' : '') + '</button>' }).join('') + '</div>'),
      foot: '<button class="btn ghost" data-act="closeModal">Close</button>' })
  }
  function smsText() {
    var p = pat(), dr = S.draft, f = dr.fu, v = fuVisit(), D0 = doc()
    var note = f.note ? (hasBangla(f.note) ? f.note : /report/i.test(f.note) ? 'রিপোর্টসহ আসবেন।' : '') : ''
    return withDig(dr.bnd, function () {
      return 'প্রিয় ' + p.name + ', ' + D0.nameBn + ' আপনাকে ' + bnDate(v) + ' তারিখে' + (f.slot ? ' ' + bn(f.slot.time) + ' টায়' : '') + ' ' + D0.chamberBn + '-এ ফলো-আপের জন্য আসতে বলেছেন। ' + (note ? note + ' ' : '') + 'প্রেসক্রিপশন: ' + dr.rxNo
    })
  }
  function fuSmsModal() {
    var f = S.draft.fu, send = fuSendOn()
    openModal({ title: 'Reminder SMS preview', cls: 'sm', body: '<div class="sms"><div class="sms-to">To: ' + esc(pat().phone) + ' &middot; from PharmaZ247</div><div class="sms-b">' + esc(smsText()) + '</div></div>' +
      '<p class="muted small">Scheduled ' + esc(fmtY(send)) + ' at 9:00 am (' + f.remDays + ' day' + (f.remDays === '1' ? '' : 's') + ' before the visit). Digits follow the Bangla-digit print setting. Simulated - nothing is sent.</p>',
      foot: '<button class="btn ghost" data-act="closeModal">Close</button><button class="btn" data-act="fuTestSms">Send me a test SMS</button>' })
  }
  /* ---------- PHAR-1698: report entry (On Investigation results) ---------- */
  // Structured results under O/I: test, result, unit, reference range, date, flag. Rows can be started from the tests advised at the doctor's last visit (src/link).
  // Clinical values always print in English digits (design 3.2). Reference ranges are mock, not clinically verified.
  var FLAGS = [['', 'Auto'], ['N', 'Normal'], ['H', 'High'], ['L', 'Low'], ['A', 'Abnormal']]
  var FLAG_T = { H: 'High', L: 'Low', A: 'Abnormal', N: 'Normal' }
  function resAuto(r) {
    var t = String(r.value).trim(), ref = String(r.ref).replace(/\s/g, ''), v = parseFloat(t), m
    if (!/^-?[\d.]+$/.test(t) || isNaN(v)) return ''
    if ((m = /^([\d.]+)-([\d.]+)$/.exec(ref))) return v < +m[1] ? 'L' : v > +m[2] ? 'H' : 'N'
    if ((m = /^<([\d.]+)$/.exec(ref))) return v >= +m[1] ? 'H' : 'N'
    if ((m = /^>([\d.]+)$/.exec(ref))) return v <= +m[1] ? 'L' : 'N'
    return ''
  }
  function resFlag(r) { return r.flag || resAuto(r) }
  function flagBadge(r) { var f = resFlag(r); return f ? '<span class="rflag ' + f + '">' + FLAG_T[f] + '</span>' : '' }
  function resRows(name, src, link) {
    var rf = D.labRef[name] || {}, names = rf.panel || [name]
    return names.map(function (n) { var x = D.labRef[n] || {}; return { id: xId(), name: n, value: '', unit: x.unit || '', ref: x.ref || '', date: D.today, flag: '', src: src || '', link: link || '' } })
  }
  function resMsg(r, f) {
    if (f === 'name' && !r.name.trim()) return 'Test name is required'
    if (f === 'value' && !String(r.value).trim()) return 'Result is required'
    if (f === 'date') return !r.date ? 'Report date is required' : r.date > D.today ? 'Report date cannot be in the future' : ''
    return ''
  }
  function rIn(r, f, label, type, ph) {
    var m = S.showErr ? resMsg(r, f) : ''
    return '<label class="fld rf-' + f + '"><span>' + label + '</span><input class="txt' + (m ? ' err' : '') + '" type="' + (type || 'text') + '" data-rk="' + r.id + '" data-rf="' + f + '" data-fk="r.' + r.id + '.' + f + '" value="' + esc(r[f]) + '" placeholder="' + esc(ph || '') + '"' + (f === 'name' ? ' list="labDl"' : '') + (f === 'date' ? ' max="' + D.today + '"' : '') + '>' + (m ? '<span class="fld-err">' + esc(m) + '</span>' : '') + '</label>'
  }
  function resRowHtml(r) {
    return '<div class="rr" id="res-' + r.id + '"><div class="rr-g">' + rIn(r, 'name', 'Test', 'text', 'e.g. Hb, HbA1c') + rIn(r, 'value', 'Result', 'text', 'e.g. 9.2') + rIn(r, 'unit', 'Unit', 'text', 'g/dL') + rIn(r, 'ref', 'Reference range', 'text', 'e.g. 12.0-15.5') + rIn(r, 'date', 'Date', 'date') +
      '<label class="fld"><span>Flag</span><select data-rk="' + r.id + '" data-rf="flag" data-fk="r.' + r.id + '.flag">' + opts(FLAGS, r.flag) + '</select></label></div>' +
      '<div class="rr-a"><span id="rfl-' + r.id + '">' + flagBadge(r) + '</span>' + (r.src ? '<em class="ctag" title="Linked to the test advised in ' + esc(r.link) + '">advised: ' + esc(r.src) + '</em>' : '') + '<button class="link danger" data-act="resDel" data-id="' + r.id + '">Remove</button></div></div>'
  }
  function resHtml() {
    var dr = S.draft, prev = ownRxs()[0], adv = prev ? prev.tests : [], names = D.labTests.slice()
    Object.keys(D.labRef).forEach(function (k) { if (names.indexOf(k) < 0) names.push(k) })
    return '<div class="res" id="oiRes"><div class="res-h"><b>Report results</b> <span class="muted small">test, result, unit, range, date, flag</span></div>' +
      (adv.length ? '<div class="res-adv"><span class="muted small">Advised at your last visit (' + esc(prev.no) + ', ' + esc(fmt(prev.date)) + '):</span><div class="res-btns">' + adv.map(function (t) {
        var done = dr.res.some(function (r) { return r.src === t }); return '<button class="btn sm ghost" data-act="resFromTest" data-t="' + esc(t) + '">' + esc(t) + (done ? ' <em class="ctag">entered</em>' : ' &rarr; enter result') + '</button>' }).join('') + '</div></div>' : '') +
      dr.res.map(resRowHtml).join('') + '<button class="btn sm ghost" data-act="resAdd">+ Add result</button><datalist id="labDl">' + names.map(function (n) { return '<option value="' + esc(n) + '">' }).join('') + '</datalist></div>'
  }
  function resPrint(r) {
    var f = resFlag(r), fl = f === 'H' || f === 'L' || f === 'A' ? ' <i class="pf-' + f + '">' + f + '</i>' : ''
    return esc(r.name) + ' <strong>' + esc(r.value) + '</strong> ' + esc(r.unit) + fl + ' <small>' + (r.ref ? '(' + esc(r.ref) + ') ' : '') + esc(fmt(r.date)) + '</small>'
  }
  function resTable(res) {
    return '<table class="pm-tbl pn-res"><thead><tr><th>Test</th><th>Result</th><th>Range</th><th>Date</th></tr></thead><tbody>' + res.map(function (r) {
      var f = resFlag(r), ab = f === 'H' || f === 'L' || f === 'A'
      return '<tr' + (ab ? ' class="abn"' : '') + '><td>' + esc(r.name) + '</td><td><b>' + esc(r.value) + '</b> ' + esc(r.unit) + (ab ? ' <span class="rflag ' + f + '">' + FLAG_T[f] + '</span>' : '') + '</td><td>' + esc(r.ref) + '</td><td>' + esc(fmt(r.date)) + '</td></tr>'
    }).join('') + '</tbody></table>'
  }
  function resChange(el, live) {
    var r = S.draft.res.filter(function (x) { return x.id === el.getAttribute('data-rk') })[0], f = el.getAttribute('data-rf'); if (!r) return
    r[f] = el.value
    var b = $('#rfl-' + r.id); if (b) b.innerHTML = flagBadge(r)
    if (live || f !== 'name') return
    var rf = D.labRef[r.name]; if (!rf) return
    if (rf.panel) { var i = S.draft.res.indexOf(r); Array.prototype.splice.apply(S.draft.res, [i, 1].concat(resRows(r.name, r.src, r.link))) }
    else { if (!r.unit) r.unit = rf.unit; if (!r.ref) r.ref = rf.ref }
    renderNotes()
  }
  /* ---------- Manage note sections: every section (built-in or the doctor's own) + its saved notes ---------- */
  function hasSaved(d) { return d.kind === 'chips' || d.kind === 'dx' || d.kind === 'advice' }
  function customiseModal() {
    var on = [], off = []
    S.sections.forEach(function (c, i) { (c.hidden ? off : on).push({ c: c, i: i }) })
    if (!S.msSel || !cfg(S.msSel) || cfg(S.msSel).hidden) S.msSel = on.length ? on[0].c.id : null
    var rows = on.map(function (o, k) {
      var d = secDef(o.c.id), n = hasSaved(d) ? (S.saved[d.id] || []).length : null
      return '<li class="ms-row' + (S.msSel === d.id ? ' on' : '') + '"><button class="ms-name" data-act="msSel" data-sec="' + d.id + '">' + esc(d.title) + ' <abbr>' + esc(d.abbr) + '</abbr>' +
        (d.custom ? ' <em class="ctag">yours</em>' : '') + (n !== null ? '<small>' + n + ' saved note' + (n === 1 ? '' : 's') + '</small>' : '') + '</button>' +
        '<span class="qa-act"><button class="icon-btn" data-act="secUp" data-i="' + o.i + '" aria-label="Move ' + esc(d.title) + ' up"' + (k === 0 ? ' disabled' : '') + '>&uarr;</button>' +
        '<button class="icon-btn" data-act="secDown" data-i="' + o.i + '" aria-label="Move ' + esc(d.title) + ' down"' + (k === on.length - 1 ? ' disabled' : '') + '>&darr;</button>' +
        '<button class="icon-btn danger-text" data-act="secHide" data-sec="' + d.id + '" aria-label="Remove section ' + esc(d.title) + '" title="Remove from my form">&times;</button></span></li>'
    }).join('')
    var removed = off.map(function (o) {
      var d = secDef(o.c.id)
      return '<li class="ms-row off"><span class="ms-name">' + esc(d.title) + ' <abbr>' + esc(d.abbr) + '</abbr>' + (d.custom ? ' <em class="ctag">yours</em>' : '') + '</span>' +
        '<span class="qa-act"><button class="btn sm ghost" data-act="secRestore" data-sec="' + d.id + '">Restore</button>' +
        (d.custom ? '<button class="btn sm ghost danger-text" data-act="secDel" data-sec="' + d.id + '">Delete forever</button>' : '') + '</span></li>'
    }).join('')
    var left = '<div><p class="muted small">Sections on your form (' + on.length + '). Click one to rename it or manage its saved notes.</p><ol class="tpl-list ms-list">' + rows + '</ol>' +
      (removed ? '<p class="muted small ms-sub">Removed sections (' + off.length + ')</p><ol class="tpl-list ms-list">' + removed + '</ol>' : '') + secAddForm() + '</div>'
    openModal({ title: 'Manage note sections', cls: 'wide', body: '<div class="qa-grid">' + left + '<div class="qa-form" id="msPanel">' + msPanel(S.msSel) + '</div></div>',
      foot: '<button class="btn ghost" data-act="secReset">Reset to speciality default</button><button class="btn ghost" data-act="blockPick">+ Add block</button><button class="btn primary" data-act="closeModal">Done</button>' })
  }
  function msPanel(id) {
    var d = id && secDef(id)
    if (!d) return '<div class="empty"><strong>No sections on your form</strong><p>Restore one or add your own.</p></div>'
    var top = '<h4>' + esc(d.title) + (d.custom ? ' <em class="ctag">yours</em>' : '') + '</h4><div class="sec-add-r">' +
      '<label class="fld grow"><span>Name</span><input class="txt" data-secname="' + id + '" value="' + esc(d.title) + '"></label>' +
      '<label class="fld"><span>Short label</span><input class="txt abbr-in" data-secabbr="' + id + '" value="' + esc(d.abbr) + '" maxlength="6"></label></div>'
    if (!hasSaved(d)) return top + '<p class="muted">' + (d.kind === 'block' ? blockInfo(d) : d.kind === 'tests' ? 'Advised tests use your test templates instead of saved notes.' : 'Follow-up has no saved notes - set it with Days / Weeks / Months.') + '</p>'
    var list = (S.saved[id] || []).map(function (s, k) {
      return '<li class="ms-note"><input class="txt ms-ntxt" data-noteedit="' + id + '" data-k="' + k + '" value="' + esc(s.t) + '" aria-label="Edit saved note"><small>' + (s.n ? 'used ' + s.n + '&times;' : 'not used yet') + '</small>' +
        '<button class="icon-btn danger-text" data-act="noteDel" data-sec="' + id + '" data-k="' + k + '" aria-label="Delete saved note ' + esc(s.t) + '">&times;</button></li>'
    }).join('')
    return top + '<div class="fld"><span>Saved notes (' + (S.saved[id] || []).length + ')</span>' +
      '<p class="muted small">Suggested when you type in this section; most used and recent first. You can also save a note while typing: pick &ldquo;Add and save to my notes&rdquo;.</p>' +
      (list ? '<ul class="ms-notes">' + list + '</ul>' : '<p class="muted small">No saved notes yet.</p>') +
      '<span class="iadd"><input class="txt" id="msNewNote" placeholder="Add a saved note and press Enter" aria-label="New saved note"><button class="btn sm primary" data-act="noteAdd">Add</button></span></div>'
  }
  function saveNote(id, t) {
    t = (t || '').trim(); if (!t) { toast('Type a note first'); return false }
    var list = S.saved[id] = S.saved[id] || []
    if (list.some(function (s) { return s.t.toLowerCase() === t.toLowerCase() })) { toast('Already in your saved notes'); return false }
    list.unshift({ t: t, n: 0, d: 0 }); return true
  }
  function noteEdit(el) {
    var list = S.saved[el.getAttribute('data-noteedit')], k = +el.getAttribute('data-k'), v = el.value.trim()
    if (!v) { el.value = list[k].t; return toast('A saved note cannot be empty - use the × to delete it') }
    if (list.some(function (s, i) { return i !== k && s.t.toLowerCase() === v.toLowerCase() })) { el.value = list[k].t; return toast('Already in your saved notes') }
    list[k].t = v; toast('Saved note updated')
  }
  function sectionEntryCount(id) {
    var d = secDef(id), dr = S.draft; if (!dr || !d) return 0
    return d.kind === 'block' ? blockCount(d.bid) : d.kind === 'chips' ? (dr.notes[id] || []).length : d.kind === 'tests' ? dr.tests.length : d.kind === 'dx' ? dr.dx.length : d.kind === 'advice' ? dr.notes.advice.length + dr.libAdvice.length : 0
  }
  function secRemove(id) {
    var d = secDef(id), n = sectionEntryCount(id)
    cfg(id).hidden = true; renderNotes(); renderBar(); if (S.modal && S.modal.title === 'Manage note sections') customiseModal()
    toast('Removed "' + d.title + '"' + (n ? ' - its ' + n + ' entr' + (n > 1 ? 'ies are' : 'y is') + ' kept and come back if you restore it' : '') + '. Restore any time from Manage sections.')
  }
  /* ---------- the doctor's own note sections ---------- */
  function secAddForm() {
    return '<div class="sec-add"><strong>Add your own section</strong><div class="sec-add-r">' +
      '<input class="txt" id="secNewName" placeholder="Section name, e.g. Menstrual history" aria-label="New section name">' +
      '<input class="txt abbr-in" id="secNewAbbr" placeholder="Short" maxlength="6" aria-label="Short label (optional)">' +
      '<button class="btn primary sm" data-act="secAdd">Add</button></div><p class="muted small">Works like the other note sections: type entries, save the ones you reuse, and it prints on the prescription. You can also type a name in the &ldquo;+ New section&rdquo; field under your notes.</p></div>'
  }
  function secAbbr(title) { return title.split(/\s+/).filter(Boolean).slice(0, 3).map(function (w) { return w.charAt(0).toUpperCase() }).join('/') }
  function secAddNamed(title, abbr) {
    title = (title || '').trim(); abbr = (abbr || '').trim()
    if (!title) { toast('Give the section a name'); return null }
    if (allSecDefs().some(function (s) { return secDef(s.id).title.toLowerCase() === title.toLowerCase() })) { toast('A section with this name already exists - restore it from Manage sections if you removed it'); return null }
    var def = { id: 'u' + (S.seq++), title: title, abbr: abbr || secAbbr(title), kind: 'chips', custom: true }
    S.customSecs.push(def); S.saved[def.id] = []
    // New sections go after the last free-text note section, before Advised tests.
    var at = S.sections.findIndex(function (c) { return c.id === 'tests' }); if (at < 0) at = S.sections.length
    S.sections.splice(at, 0, { id: def.id, hidden: false, collapsed: false })
    if (S.draft) S.draft.notes[def.id] = []
    toast('Added "' + title + '" - it is saved for all your patients')
    return def
  }
  function secAdd() {
    var def = secAddNamed(($('#secNewName') || {}).value, ($('#secNewAbbr') || {}).value)
    if (def) { S.msSel = def.id; renderNotes(); customiseModal() }
  }
  function secAddQuick(el) {
    var def = secAddNamed(el.value, '')
    if (!def) return
    renderNotes(); var i = $('[data-fk="in.' + def.id + '"]'); if (i) i.focus()
  }
  function secDel(id) {
    var def = secDef(id)
    S.customSecs = S.customSecs.filter(function (s) { return s.id !== id })
    S.sections = S.sections.filter(function (c) { return c.id !== id })
    delete S.saved[id]; if (S.draft) delete S.draft.notes[id]
    renderNotes(); customiseModal(); toast('Deleted "' + def.title + '" and its saved notes. Issued prescriptions keep it.')
  }
  function secRename(el, field) {
    var id = el.getAttribute(field === 'title' ? 'data-secname' : 'data-secabbr'), v = el.value.trim(), cur = secDef(id)
    if (!v) { el.value = cur[field]; return toast(field === 'title' ? 'The name cannot be empty' : 'The short label cannot be empty') }
    if (field === 'title' && allSecDefs().some(function (s) { return s.id !== id && secDef(s.id).title.toLowerCase() === v.toLowerCase() })) { el.value = cur.title; return toast('Another section already has this name') }
    var raw = allSecDefs().filter(function (s) { return s.id === id })[0]
    if (raw.custom) raw[field] = v
    else { var o = S.secOverride[id] = S.secOverride[id] || {}; o[field] = v }
    renderNotes(); customiseModal()
  }
  /* ---------- PHAR-1694: health advice library - attach, add, edit, delete, reorder. Categories are assumed (check against ticket). Bangla mandatory, English optional (design 3.2). ---------- */
  function catName(id) { var c = D.adviceCats.filter(function (x) { return x[0] === id })[0]; return c ? c[1] : id }
  function libVisible() { return D.adviceLibrary.filter(function (a) { return S.lib.cat === 'all' || a.cat === S.lib.cat }) }
  function libBnErr(v) { return !String(v).trim() ? 'Bangla text is required' : !hasBangla(v) ? 'Advice must be written in Bangla' : '' }
  function libModal() {
    if (S.lib.form) return libForm()
    var list = libVisible(), cats = [['all', 'All']].concat(D.adviceCats.map(function (c) { return [c[0], c[1]] }))
    var rows = list.map(function (a, i) {
      var on = S.draft.libAdvice.indexOf(a.id) >= 0
      return '<li><label><input type="checkbox" data-act="libToggle" data-id="' + a.id + '"' + (on ? ' checked' : '') + '><span><b>' + esc(a.title) + '</b> <em class="ctag plain">' + esc(catName(a.cat)) + '</em><span class="bn">' + esc(a.bn) + '</span><small>' + esc(a.en) + '</small></span></label>' +
        '<span class="lib-a"><button class="icon-btn" data-act="libMove" data-id="' + a.id + '" data-d="-1"' + (i === 0 ? ' disabled' : '') + ' aria-label="Move up">&uarr;</button><button class="icon-btn" data-act="libMove" data-id="' + a.id + '" data-d="1"' + (i === list.length - 1 ? ' disabled' : '') + ' aria-label="Move down">&darr;</button>' +
        '<button class="link" data-act="libEdit" data-id="' + a.id + '">Edit</button><button class="link danger" data-act="libRemove" data-id="' + a.id + '">Delete</button></span></li>'
    }).join('')
    openModal({ title: 'Health advice library', body: '<p class="muted small">Tick to add a line to this prescription. Every line needs Bangla text; English is optional. Edits and deletes do not change prescriptions already issued.</p>' +
      '<div class="seg" role="group" aria-label="Category">' + cats.map(function (c) { return '<button class="' + (S.lib.cat === c[0] ? 'on' : '') + '" data-act="libCat" data-c="' + c[0] + '">' + esc(c[1]) + '</button>' }).join('') + '</div>' +
      '<ul class="lib">' + (rows || '<li class="muted">No advice items in this category.</li>') + '</ul>',
      foot: '<button class="btn ghost" data-act="libNew">+ New advice item</button><button class="btn primary" data-act="closeModal">Done</button>' })
  }
  function libPrev(f) { return '<div class="chip advice"><span><b>' + esc(f.bn || 'বাংলা লেখা এখানে দেখা যাবে') + '</b>' + (f.en ? '<small>' + esc(f.en) + '</small>' : '') + '</span></div>' }
  function libForm() {
    var f = S.lib.form
    openModal({ title: f.id ? 'Edit advice item' : 'New advice item', cls: 'sm', body:
      '<label class="fld"><span>Short name (to find it in the list)</span><input class="txt" data-lf="title" value="' + esc(f.title) + '" placeholder="e.g. Low salt diet"></label>' +
      '<label class="fld"><span>Category</span><select data-lf="cat">' + opts(D.adviceCats.map(function (c) { return [c[0], c[1] + ' / ' + c[2]] }), f.cat) + '</select></label>' +
      '<label class="fld"><span>বাংলা (required - printed for every patient)</span><textarea class="txt' + (f.err.bn ? ' err' : '') + '" rows="2" data-lf="bn" placeholder="যেমন: লবণ কম খাবেন">' + esc(f.bn) + '</textarea><span class="fld-err" id="lfErr">' + esc(f.err.bn || '') + '</span></label>' +
      '<label class="fld"><span>English (optional - shown under the Bangla)</span><textarea class="txt" rows="2" data-lf="en" placeholder="e.g. Reduce salt intake">' + esc(f.en) + '</textarea></label>' +
      (f.id ? '' : '<label class="chk-i"><input type="checkbox" data-lf="attach"' + (f.attach ? ' checked' : '') + '> Also add it to this prescription</label>') +
      '<div class="lib-prev" id="libPrev"><span class="muted small">How it prints:</span>' + libPrev(f) + '</div>',
      foot: '<button class="btn ghost" data-act="libCancel">Cancel</button><button class="btn primary" data-act="libSave">Save</button>' })
  }
  function libFormChange(el) {
    var f = S.lib.form, k = el.getAttribute('data-lf'); if (!f) return
    f[k] = el.type === 'checkbox' ? el.checked : el.value
    var pv = $('#libPrev'); if (pv) pv.innerHTML = '<span class="muted small">How it prints:</span>' + libPrev(f)
    if (k === 'bn' && f.err.bn) { f.err.bn = libBnErr(f.bn); var e = $('#lfErr'); if (e) e.textContent = f.err.bn }
  }
  function libSave() {
    var f = S.lib.form, m = libBnErr(f.bn)
    if (m) { f.err = { bn: m }; libForm(); var t = $('[data-lf="bn"]'); if (t) t.focus(); return }
    var title = f.title.trim() || (f.en.trim() || f.bn.trim()).slice(0, 40), a
    if (f.id) { a = D.adviceLibrary.filter(function (x) { return x.id === f.id })[0]; a.title = title; a.cat = f.cat; a.bn = f.bn.trim(); a.en = f.en.trim() }
    else { a = { id: 'lib' + (S.seq++), cat: f.cat, title: title, bn: f.bn.trim(), en: f.en.trim() }; D.adviceLibrary.push(a); if (f.attach) S.draft.libAdvice.push(a.id) }
    S.lib.form = null; renderNotes(); libModal(); toast('Saved to the advice library: ' + title)
  }

  /* ---------- Rx panel ---------- */
  function renderRx() {
    if (!medOn()) return renderRxOff()
    keepFocus(function () {
      var dr = S.draft, wc = warnCounts()
      var src = sourceRxs()
      var checked = src.length ? 'Checked against: ' + src.map(function (r) { return fmt(r.date) + ' (' + (isMine(r) ? 'you' : 'another doctor') + ')' }).join(', ') : 'No previous prescriptions found for this patient'
      $('#rx').innerHTML = '<div class="rx-h"><h2><span class="rxs">&#8478;</span> Medicines <span class="cnt">' + dr.lines.length + '</span></h2>' +
        '<div class="rx-tools"><button class="btn ghost sm" data-act="openTpl">Apply template</button><button class="btn ghost sm" data-act="saveTpl">Save current as template</button></div></div>' +
        sgInput('med', 'med', 'Search medicine by brand, generic or company - press Enter to add (shortcut: /)') +
        '<div class="rx-add"><button class="btn sm ghost" data-act="stopOpen">+ Stop a medicine</button><button class="btn sm ghost" data-act="cpOpen">+ Continue previous medicines</button></div>' +
        '<div class="quick"><span class="muted small">Quick add:</span>' + S.tpl.presets.map(function (p) {
          return '<span class="qchip"><button class="btn sm ghost" data-act="addPreset" data-id="' + p.id + '" title="' + esc(p.name) + '">' + esc(p.name.split(' - ')[0]) + '</button>' +
            '<button class="qdel" data-act="presetDel" data-id="' + p.id + '" aria-label="Remove ' + esc(p.name) + ' from quick add" title="Remove from quick add">&times;</button></span>'
        }).join('') + (S.tpl.presets.length ? '' : '<span class="muted small">empty - press &#9734; on any medicine line</span>') +
        '<button class="link" data-act="qaManage">Manage</button></div>' +
        '<div class="checked-bar"><span>' + esc(checked) + '</span>' + (wc.w ? '<span class="pill on">' + wc.w + ' warning' + (wc.w > 1 ? 's' : '') + ' &middot; ' + wc.a + ' acknowledged</span>' : '') + '</div>' +
        (dr.lines.length ? dr.lines.map(function (l, i) { return lineHtml(l, i, wc.cks[i]) }).join('') : '<div class="empty"><strong>No medicines yet</strong><p>Search above, use Quick add, apply a template' + (ownRxs().length && !dr.continued ? ', or continue from the previous prescription' : '') + '.</p></div>') + ordersHtml()
      renderMedcheck(wc); weightErrSync()
    })
    if (S.draft.blocks && secOn('b:foodSafety')) blockRefresh('foodSafety')
    blocksSync()
  }
  function renderMedcheck(wc) {
    var dr = S.draft, el = $('#medcheck')
    if (S.warnStyle !== 'panel') { el.innerHTML = ''; return }
    var items = dr.lines.map(function (l, i) {
      var ck = wc.cks[i]
      if (ck.stop) return '<li class="mc-row"><span class="badge grey">stop</span> ' + esc(lineName(l)) + ' <small>stop line, not dispensed</small></li>'
      var alr = allergyHits(l).length ? '<li class="mc-row"><span class="badge warn">&#9888; Allergy</span> ' + esc(lineName(l)) + ' <small>' + esc(allergyHits(l).join(', ')) + (l.allergyAck ? ' - override kept' : ' - see the line (reason needed)') + '</small></li>' : ''
      if (alr && ck.free) return alr
      if (ck.free) return '<li class="mc-row"><span class="badge grey">not checked</span> ' + esc(lineName(l)) + ' <small>free text</small></li>'
      if (!ck.matches.length) return alr || '<li class="mc-row ok"><span class="okmark">&#10003;</span> ' + esc(lineName(l)) + ' <small>no overlap</small></li>'
      return alr + '<li id="mc-' + l.id + '">' + warnCard(l, ck, 'panel') + '</li>'
    }).join('')
    el.innerHTML = '<h3>Medication check</h3><p class="muted small">Compares each medicine with the patient\'s last two issued prescriptions (any doctor), this prescription, and known allergies.</p>' +
      (dr.lines.length ? '<ul>' + items + '</ul>' : '<p class="muted">Add medicines to see the check.</p>')
  }
  function lineHtml(l, i, ck) {
    var warn = S.warnStyle === 'inline' && ck.matches.length ? '<div class="line-warn" id="lw-' + l.id + '">' + warnCard(l, ck, 'inline') + '</div>' : ''
    var al = allergyHits(l), alc = al.length ? '<div class="line-warn" id="al-' + l.id + '">' + allergyCard(l, al, 'inline') + '</div>' : ''
    var alb = al.length ? ' <span class="badge ' + (l.allergyAck ? 'ack' : 'warn') + '">' + (l.allergyAck ? '&#10003; Allergy override' : '&#9888; Allergy') + '</span>' : ''
    var free = ck.free ? '<div class="line-warn"><div class="notchecked">Not checked against previous prescriptions (free-text medicine).</div></div>' : ''
    return '<article class="line' + ((ck.matches.length && !l.ack) || (al.length && !l.allergyAck) ? ' has-warn' : '') + (isStop(l) ? ' is-stop' : '') + '" id="line-' + l.id + '"><header class="line-h">' +
      '<span class="ln">' + (i + 1) + '</span><div class="ln-name"><strong>' + esc(lineName(l)) + '</strong> <span class="muted">' + esc(l.form) + '</span>' +
      (isStop(l) ? ' <span class="ctag stop">STOP</span>' : l.kind === 'CONT' ? ' <span class="ctag">continue previous</span>' : l.cf ? ' <span class="ctag">continued</span>' : '') + ' ' + badge(l, ck) + alb + '<small>' + esc(l.generic || 'free text') + (l.company ? ' &middot; ' + esc(l.company) : '') + '</small></div>' +
      '<div class="ln-sum" id="sum-' + l.id + '">' + sumText(l) + '</div><div class="ln-act">' +
      (l.free || isStop(l) ? '' : '<button class="icon-btn" data-act="presetSave" data-id="' + l.id + '" aria-label="Add ' + esc(lineName(l)) + ' with this dose to quick add" title="Add to quick add (saves this dose, food, duration and instructions)">&#9734;</button>') +
      '<button class="icon-btn" data-act="lineUp" data-id="' + l.id + '" aria-label="Move up"' + (i === 0 ? ' disabled' : '') + '>&uarr;</button>' +
      '<button class="icon-btn" data-act="lineDown" data-id="' + l.id + '" aria-label="Move down"' + (i === S.draft.lines.length - 1 ? ' disabled' : '') + '>&darr;</button>' +
      '<button class="icon-btn" data-act="lineCollapse" data-id="' + l.id + '" aria-label="Collapse">' + (l.collapsed ? '&#9656;' : '&#9662;') + '</button>' +
      '<button class="icon-btn danger-text" data-act="removeLine" data-id="' + l.id + '" aria-label="Remove ' + esc(lineName(l)) + '">&times;</button></div></header>' +
      (l.collapsed ? '' : lineBody(l)) + alc + warn + free + '</article>'
  }
  function sumText(l) {
    if (isStop(l)) return '<b>Stop this medicine</b>' + (l.stopReason ? ' &middot; ' + esc(l.stopReason) : '') + ' &middot; not dispensed'
    var st = startLabel(l), xs = extrasSummary(l)
    return (stepped(l) ? '<span class="ctag">taper</span> ' + esc(stepSummary(l)) : esc(doseText(l))) + ' &middot; ' + esc(FOOD[l.food]) + ' &middot; ' + esc(durText(l)) + (st ? ' &middot; ' + esc(st) : '') + (xs.length ? ' &middot; ' + esc(xs.join(' · ')) : '') + ' &middot; <b>Qty ' + esc(qtyText(l)) + '</b>' + (l.instrs.length ? ' &middot; ' + l.instrs.length + ' instruction' + (l.instrs.length > 1 ? 's' : '') : '') }
  function opts(list, cur) { return list.map(function (o) { var v = o[0], t = o[1]; return '<option value="' + esc(v) + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>' }).join('') }
  /* ---------- instructions: several per medicine line ---------- */
  // Owner id is a line id, or 'qa' for the Manage quick add form.
  function toList(v) { return Array.isArray(v) ? v.slice() : (v ? [v] : []) }
  function instrOwner(id) { return id === 'qa' ? S.qaLine : lineById(id) }
  function instrEditor(id, list) {
    var chips = list.map(function (t, k) { return '<span class="chip">' + esc(t) + '<button data-act="instrDel" data-id="' + id + '" data-k="' + k + '" aria-label="Remove instruction ' + esc(t) + '">&times;</button></span>' }).join('')
    var sug = S.instr.filter(function (t) { return list.indexOf(t) < 0 }).slice(0, 5)
      .map(function (t) { return '<button class="chip sug" data-act="instrPick" data-id="' + id + '" data-v="' + esc(t) + '">+ ' + esc(t) + '</button>' }).join('')
    return '<div class="fld"><span>Instructions' + (list.length ? ' (' + list.length + ')' : '') + '</span>' + (chips ? '<div class="ichips">' + chips + '</div>' : '') +
      '<span class="iadd"><input class="txt" id="ii-' + id + '" data-instr="' + id + '" placeholder="Type an instruction and press Enter - add as many as needed" aria-label="New instruction">' +
      '<button class="btn sm ghost" data-act="instrAdd" data-id="' + id + '">Add</button></span></div>' +
      '<div class="sugs"><span class="muted small">Your saved formats:</span>' + (sug || '<span class="muted small">all added</span>') +
      '<button class="link" data-act="instrSave" data-id="' + id + '">+ Save typed text as my format</button></div>'
  }
  function instrPush(id, t) {
    t = (t || '').trim(); if (!t) return toast('Type an instruction first')
    var o = instrOwner(id); if (o.instrs.indexOf(t) >= 0) return toast('Already added')
    o.instrs.push(t); instrRefresh(id)
  }
  function instrRefresh(id) {
    if (id === 'qa') $('#qaForm').innerHTML = qaFormHtml(); else replaceLine(instrOwner(id))
    var i = $('#ii-' + id); if (i) i.focus()
  }
  function f(l, name) { return 'data-line="' + l.id + '" data-f="' + name + '" data-fk="' + l.id + '.' + name + '"' }
  // A step's fields carry data-step so lineChange writes them to l.steps[k] instead of the line.
  function fs(l, k, name) { return 'data-line="' + l.id + '" data-step="' + k + '" data-f="' + name + '" data-fk="' + l.id + '.s' + k + '.' + name + '"' }
  function doseHtml(s, at) {
    if (s.mode === 'pattern') return ['Morning', 'Noon', 'Night'].map(function (lab, k) {
      return '<label class="slot"><span>' + lab + '</span><select ' + at('slot' + k) + ' aria-label="' + lab + ' dose">' + opts(SLOT_OPTS.map(function (x) { return [x, x] }), s.slots[k]) + '</select></label>'
    }).join('')
    if (s.mode === 'interval') return '<label class="slot wide"><span>Every (hours)</span><input type="number" min="1" max="24" ' + at('intervalH') + ' value="' + esc(s.intervalH) + '"></label>'
    return '<label class="slot wide"><span>SOS - max per day</span><input type="number" min="1" ' + at('prnMax') + ' value="' + esc(s.prnMax) + '"></label>'
  }
  function modeSel(s, at) { return '<select ' + at('mode') + ' aria-label="Dose type">' + opts([['pattern', 'Morning-Noon-Night'], ['interval', 'Every N hours'], ['prn', 'SOS / PRN']], s.mode) + '</select>' }
  function durHtml(s, at) {
    return '<span class="two"><input type="number" min="1" ' + at('durVal') + ' value="' + esc(s.durVal) + '"' + (s.cont ? ' disabled' : '') + ' aria-label="Duration"><select ' + at('durUnit') + (s.cont ? ' disabled' : '') + ' aria-label="Duration unit">' + opts([['days', 'days'], ['weeks', 'weeks'], ['months', 'months']], s.durUnit) + '</select></span>'
  }
  function unitSel(l) { return '<select ' + f(l, 'unit') + ' aria-label="Unit">' + opts(Object.keys(UNITS).map(function (k) { return [k, k] }), l.unit) + '</select>' }
  function stepsHtml(l) {
    var n = l.steps.length, rg = stepRanges(l)
    return '<div class="steps"><div class="steps-h"><strong>Dosage steps</strong> <span class="muted small">run in order, one after another &middot; unit</span> ' + unitSel(l) + '</div>' +
      l.steps.map(function (s, k) {
        var at = function (name) { return fs(l, k, name) }, last = k === n - 1
        return '<div class="step"><span class="ln">' + (k + 1) + '</span><label class="fld"><span>Dose type</span>' + modeSel(s, at) + '</label>' +
          '<div class="slots">' + doseHtml(s, at) + '</div>' +
          '<label class="fld small"><span>Amount each</span><input type="number" min="0.5" step="0.5" ' + at('amount') + ' value="' + esc(s.amount) + '" aria-label="Step ' + (k + 1) + ' amount"></label>' +
          '<label class="fld"><span>Duration</span>' + durHtml(s, at) + '</label>' +
          (last ? '<label class="fld chk"><span>&nbsp;</span><span><input type="checkbox" ' + at('cont') + (s.cont ? ' checked' : '') + '> Continue</span></label>' : '<span class="then">then &darr;</span>') +
          '<span class="rng" id="rng-' + l.id + '-' + k + '">' + esc(rg[k]) + '</span>' +
          '<button class="icon-btn danger-text" data-act="stepDel" data-id="' + l.id + '" data-k="' + k + '" aria-label="Remove step ' + (k + 1) + '">&times;</button></div>'
      }).join('') + '</div>'
  }
  function startHtml(l) {
    var extra = l.startMode === 'after' ? '<input type="number" min="1" ' + f(l, 'startN') + ' value="' + esc(l.startN) + '" placeholder="days" aria-label="Start after how many days">'
      : l.startMode === 'date' ? '<input type="date" min="' + D.today + '" ' + f(l, 'startDate') + ' value="' + esc(l.startDate) + '" aria-label="Start date">' : ''
    return '<div class="g g-start"><label class="fld"><span>Start</span><span class="two"><select ' + f(l, 'startMode') + ' aria-label="When to start">' + opts([['now', 'Today'], ['after', 'After N days'], ['date', 'On a date']], l.startMode) + '</select>' + extra + '</span></label>' +
      '<span class="st-lab muted small" id="st-' + l.id + '">' + esc(startLabel(l)) + '</span>' +
      '<span class="step-tools"><button class="btn sm ghost" data-act="stepAdd" data-id="' + l.id + '" title="Tapering, loading dose then maintenance, or any change of dose over time">+ Add dose step</button>' +
      '<button class="btn sm ghost" data-act="taper" data-id="' + l.id + '" title="Generate a step-down taper">Auto taper&hellip;</button></span></div>'
  }
  function extrasHtml(l) {
    var h = '', many = stepped(l), tools = ''
    if (hasPrn(l)) h += '<label class="fld grow"><span>SOS reason - when to take it (Bangla OK)</span><input class="txt" ' + f(l, 'asNeededReason') + ' value="' + esc(l.asNeededReason) + '" placeholder="e.g. জ্বর ১০০°F এর বেশি হলে / if pain"></label>'
    if (sideOn(l)) h += '<label class="fld"><span>Side (' + SIDE_ROUTES[l.route][1] + ')</span><select ' + f(l, 'side') + ' aria-label="Side">' + opts([['', 'Not set'], ['RIGHT', 'Right'], ['LEFT', 'Left'], ['BOTH', 'Both']], l.side) + '</select></label>'
    if (h) h = '<div class="g g-x">' + h + '</div>'
    if (l.route === 'IV' || l.route === 'SC') {
      h += '<div class="xbox"><div class="xh"><strong>Infusion</strong> <span class="muted small">optional - for drips; prints e.g. &ldquo;1000 ml at 20 drops/min over 8 h&rdquo;</span></div><div class="g g-inf">' +
        '<label class="fld"><span>Volume</span><span class="two"><input type="number" min="0" ' + f(l, 'infVol') + ' value="' + esc(l.infVol) + '" aria-label="Infusion volume"><select ' + f(l, 'infUnit') + ' aria-label="Volume unit">' + opts([['ml', 'ml'], ['L', 'L']], l.infUnit) + '</select></span></label>' +
        '<label class="fld"><span>Rate</span><span class="two"><input type="number" min="0" ' + f(l, 'rateValue') + ' value="' + esc(l.rateValue) + '" aria-label="Infusion rate"><select ' + f(l, 'rateUnit') + ' aria-label="Rate unit">' + opts([['drops/min', 'drops/min'], ['ml/hr', 'ml/hr']], l.rateUnit) + '</select></span></label>' +
        '<label class="fld"><span>Over (hours)</span><input type="number" min="0" step="0.5" ' + f(l, 'overHours') + ' value="' + esc(l.overHours) + '" aria-label="Over how many hours"></label></div></div>'
    }
    if (!many) tools += '<label class="chk-i"><input type="checkbox" ' + f(l, 'dpkOn') + (l.dpkOn ? ' checked' : '') + '> Dose by weight (mg/kg)</label>'
    if (!l.cond.length) tools += '<button class="btn sm ghost" data-act="condAdd" data-id="' + l.id + '" title="Dose depends on a reading, e.g. insulin by blood sugar">+ Sliding scale</button>'
    if (tools) h += '<div class="xtools">' + tools + '</div>'
    if (l.dpkOn && !many) {
      h += '<div class="xbox"><div class="xh"><strong>Weight-based dose</strong> <span class="muted small">weight is taken from the O/E vitals above</span></div><div class="g g-wk">' +
        '<label class="fld small"><span>Dose (mg per kg)</span><input type="number" min="0" step="0.5" ' + f(l, 'dpk') + ' value="' + esc(l.dpk) + '" aria-label="mg per kg"></label>' +
        '<label class="fld"><span>Per</span><select ' + f(l, 'dpkPer') + ' aria-label="Per dose or per day">' + opts([['dose', 'per dose'], ['day', 'per day (split by doses/day)']], l.dpkPer) + '</select></label>' +
        '<label class="fld small"><span>Override amount (' + esc(l.unit) + ')</span><input type="number" min="0" step="0.5" ' + f(l, 'dpkOvr') + ' value="' + esc(l.dpkOvr) + '" placeholder="auto" aria-label="Override amount"></label></div>' +
        '<div class="wk-res" id="wk-' + l.id + '">' + wkHtml(l) + '</div></div>'
    }
    if (l.cond.length) {
      h += '<div class="xbox"><div class="xh"><strong>Sliding scale</strong> <span class="muted small">dose depends on the reading &middot; printed as a small table</span> <button class="link" data-act="condClear" data-id="' + l.id + '">Remove scale</button></div><table class="cond"><thead><tr><th>Condition</th><th>Dose</th><th></th></tr></thead><tbody>' +
        l.cond.map(function (r, i) {
          var fc = function (k) { return 'data-line="' + l.id + '" data-f="cond" data-ci="' + i + '" data-cf="' + k + '" data-fk="' + l.id + '.c' + i + '.' + k + '"' }
          var ec = S.showErr && !r.c.trim() ? '<span class="fld-err">Condition is required</span>' : '', ed = S.showErr && !r.d.trim() ? '<span class="fld-err">Dose is required</span>' : ''
          return '<tr><td><input class="txt' + (ec ? ' err' : '') + '" ' + fc('c') + ' value="' + esc(r.c) + '" placeholder="e.g. RBS 11–14 mmol/L" aria-label="Condition">' + ec + '</td><td><input class="txt' + (ed ? ' err' : '') + '" ' + fc('d') + ' value="' + esc(r.d) + '" placeholder="e.g. 6 units" aria-label="Dose">' + ed + '</td>' +
            '<td><button class="icon-btn danger-text" data-act="condDel" data-id="' + l.id + '" data-k="' + i + '" aria-label="Remove row ' + (i + 1) + '">&times;</button></td></tr>'
        }).join('') + '</tbody></table><button class="btn sm ghost" data-act="condAdd" data-id="' + l.id + '">+ Add row</button></div>'
    }
    return h
  }
  function stopBody(l) {
    return '<div class="line-b"><div class="stop-note">Printed as &ldquo;বন্ধ করুন / STOP&rdquo;. Never counted for dispensing and not checked for warnings.</div>' +
      '<label class="fld"><span>Reason (optional)</span><input class="txt" ' + f(l, 'stopReason') + ' value="' + esc(l.stopReason) + '" placeholder="e.g. causes gastric upset / পেটে জ্বালা করছে"></label></div>'
  }
  function lineBody(l) {
    if (isStop(l)) return stopBody(l)
    var at = function (name) { return f(l, name) }, many = stepped(l)
    return '<div class="line-b">' + (many ? stepsHtml(l) : '<div class="g g-dose"><label class="fld"><span>Dose type</span>' + modeSel(l, at) + '</label>' +
      '<div class="slots">' + doseHtml(l, at) + '</div>' +
      '<label class="fld small"><span>Amount each' + (l.dpkOn ? ' (by weight)' : '') + '</span><span class="two"><input type="number" min="0.5" step="0.5" ' + f(l, 'amount') + ' value="' + esc(l.amount) + '"' + (l.dpkOn ? ' disabled title="Set by weight - use Override amount below"' : '') + ' aria-label="Dose amount">' + unitSel(l) + '</span></label></div>') +
      '<div class="g g-4' + (many ? ' no-dur' : '') + '"><label class="fld"><span>Food</span><select ' + f(l, 'food') + '>' + opts(Object.keys(FOOD).map(function (k) { return [k, FOOD[k]] }), l.food) + '</select></label>' +
      '<label class="fld"><span>Route</span><select ' + f(l, 'route') + '>' + opts(ROUTES.map(function (x) { return [x, x] }), l.route) + '</select></label>' +
      (many ? '' : '<label class="fld"><span>Duration</span>' + durHtml(l, at) + '</label>' +
      '<label class="fld chk"><span>&nbsp;</span><span><input type="checkbox" ' + f(l, 'cont') + (l.cont ? ' checked' : '') + '> Continue</span></label>') + '</div>' +
      startHtml(l) + extrasHtml(l) +
      '<div class="qtyrow">' + (manualQty(l) ? 'Dispense quantity (enter manually - not computed for infusion / sliding scale): <input class="txt qin" ' + f(l, 'qtyMan') + ' value="' + esc(l.qtyMan) + '" aria-label="Dispense quantity"> ' + esc(UNITS[l.unit] || l.unit) + ' &rarr; ' : 'Dispense quantity (auto' + (many ? ', sum of all steps' : '') + '): ') + '<b id="qty-' + l.id + '">' + esc(qtyText(l)) + '</b></div>' +
      instrEditor(l.id, l.instrs) +
      '<label class="fld"><span>Caution</span><input class="txt" ' + f(l, 'caution') + ' value="' + esc(l.caution) + '" placeholder="e.g. May cause drowsiness"></label></div>'
  }
  function patchLine(l) {
    var q = $('#qty-' + l.id), s = $('#sum-' + l.id)
    if (q) q.textContent = qtyText(l)
    if (s) s.innerHTML = sumText(l)
    var st = $('#st-' + l.id); if (st) st.textContent = startLabel(l)
    var wk = $('#wk-' + l.id); if (wk) wk.innerHTML = wkHtml(l)
    if (l.dpkOn) { var am = $('[data-fk="' + l.id + '.amount"]'), un = $('[data-fk="' + l.id + '.unit"]'); if (am) am.value = l.amount; if (un) un.value = l.unit }
    stepRanges(l).forEach(function (r, k) { var e = $('#rng-' + l.id + '-' + k); if (e) e.textContent = r })
  }
  function replaceLine(l) {
    keepFocus(function () {
      var e = $('#line-' + l.id); if (!e) return
      var i = lineIdx(l.id), t = document.createElement('div')
      t.innerHTML = lineHtml(l, i, checkLine(l, i)); e.parentNode.replaceChild(t.firstChild, e)
    })
  }

  /* ---------- Stop a medicine (PHAR-1718) ---------- */
  // The patient's current medicines come from the last two issued prescriptions. Another doctor's Rx shows generic + strength only (D1).
  function stopModal() {
    var cur = []
    sourceRxs().forEach(function (rx) {
      rx.lines.forEach(function (sl) {
        if (sl.stop) return
        var m = medById(sl.medId), nm = isMine(rx) ? m.brand + ' ' + m.strength : m.generic + ' ' + m.strength
        if (cur.indexOf(nm) < 0) cur.push(nm)
      })
    })
    openModal({ title: 'Stop a medicine', cls: 'sm', body: '<p class="muted small">Tell the patient to stop a medicine they take. It prints as &ldquo;বন্ধ করুন / STOP&rdquo;, is never dispensed and is not checked for warnings.</p>' +
      (cur.length ? '<div class="sugs"><span class="muted small">Patient\'s current medicines:</span>' + cur.map(function (n) { return '<button class="chip sug" data-act="stopPick" data-v="' + esc(n) + '">' + esc(n) + '</button>' }).join('') + '</div>' : '') +
      '<label class="fld"><span>Medicine to stop (pick above, search the catalogue, or type any name)</span><input class="txt" id="stopName" list="stopList" autofocus placeholder="e.g. Aspirin 75 mg"><datalist id="stopList">' + D.meds.map(function (m) { return '<option value="' + esc(m.brand + ' ' + m.strength) + '">' }).join('') + '</datalist><span class="fld-err" id="stopErr"></span></label>' +
      '<label class="fld"><span>Reason (optional)</span><input class="txt" id="stopReason" placeholder="e.g. causes gastric upset / পেটে জ্বালা করছে"></label>',
      foot: '<button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn primary" data-act="stopAdd">Add stop line</button>' })
  }
  function stopAdd() {
    var name = $('#stopName').value.trim(), reason = $('#stopReason').value.trim()
    if (!name) { $('#stopErr').textContent = 'Medicine name is required'; $('#stopName').focus(); return }
    var cat = D.meds.filter(function (m) { return (m.brand + ' ' + m.strength).toLowerCase() === name.toLowerCase() })[0]
    var l = cat ? lineFrom(cat.id) : freeLine(name)
    l.kind = 'STOP'; l.stopReason = reason; l.collapsed = false; l.cf = null
    addLine(l, true); closeModal(); renderRx(); renderBar(); flashLine(l.id); toast('Stop line added - it prints as STOP and is not dispensed')
  }

  /* ---------- Continue previous medicines (PHAR-1718) ---------- */
  // Offers only prescriptions this doctor can read: their own. Another doctor's Rx appears only if the patient shares it (R3/R4) - none are shared in the demo.
  function cpModal() {
    var own = visibleRxs(S.pid)
    var list = own.map(function (rx) {
      return '<h4>' + esc(rx.no) + ' &middot; v' + rx.version + ' &middot; ' + fmtY(rx.date) + (isMine(rx) ? '' : ' &middot; <span class="tag shared">shared by patient</span>') + '</h4><ul class="tpl-list">' + rx.lines.map(function (hl, k) {
        if (hl.stop) return ''
        var m = medById(hl.medId), added = S.draft.lines.some(function (x) { return x.medId === hl.medId && x.cf === rx.id })
        return '<li><div><strong>' + esc(m.brand + ' ' + m.strength) + '</strong><small>' + esc(m.generic) + ' &middot; ' + esc(hl.steps ? hl.steps.length + ' steps' : hl.pattern) + ' &middot; ' + daysText(hl.days) + '</small></div>' +
          '<button class="btn sm ' + (added ? 'ghost' : 'primary') + '" data-act="cpAdd" data-rx="' + rx.id + '" data-k="' + k + '"' + (added ? ' disabled' : '') + '>' + (added ? 'Added' : 'Continue') + '</button></li>'
      }).join('') + '</ul>'
    }).join('')
    openModal({ title: 'Continue previous medicines', body: '<p class="muted small">Copies a medicine with its schedule (you can edit it) marked &ldquo;চলবে / Continue&rdquo;. It is dispensed like any other line. Only prescriptions you can read are listed: your own, and another doctor&rsquo;s only when the patient has shared it with you. Anything not shared does not appear here.</p>' +
      (list || '<div class="empty"><strong>Nothing to continue</strong><p>No earlier prescription by you for this patient.</p></div>'),
      foot: '<button class="btn primary" data-act="closeModal">Done</button>' })
  }

  /* ---------- action bar / template modals ---------- */
  function renderBar() {
    var wc = warnCounts(), dr = S.draft, ac = allergyCounts()
    $('#bar').innerHTML = '<div class="bar-s"><strong>' + dr.lines.length + '</strong> medicine' + (dr.lines.length === 1 ? '' : 's') + ' &middot; ' + dr.tests.length + ' test' + (dr.tests.length === 1 ? '' : 's') + (dr.orders.length ? ' &middot; ' + dr.orders.length + ' order' + (dr.orders.length === 1 ? '' : 's') : '') + (dr.refs.length || dr.adm || dr.cert ? ' &middot; ' + (dr.refs.length + (dr.adm ? 1 : 0) + (dr.cert ? 1 : 0)) + ' referral / admission / certificate' : '') +
      (wc.w ? ' &middot; <span class="warn-t2">&#9888; ' + wc.w + ' warning' + (wc.w > 1 ? 's' : '') + ' (' + wc.a + ' acknowledged)</span>' : '') +
      (ac.w ? ' &middot; <span class="err-t">&#9888; ' + ac.w + ' allergy warning' + (ac.w > 1 ? 's' : '') + ' (' + ac.a + ' with override reason)</span>' : '') +
      '<span class="muted small">' + (S.savedAt ? ' &middot; Draft saved ' + S.savedAt : ' &middot; Not saved yet') + '</span></div>' +
      '<div class="bar-a"><button class="btn ghost" data-act="saveDraft">Save draft</button><button class="btn" data-act="preview">Preview</button><button class="btn primary" data-act="complete">' + (dr.editing ? 'Save edit' : 'Complete') + '</button></div>'
  }
  function tplModal() {
    var T = S.tplTab, tabs = [['condition', 'Condition templates'], ['combos', 'Saved combinations'], ['presets', 'Single-medicine presets']]
    var list
    if (T === 'condition') list = S.tpl.condition.map(function (c) {
      return '<li><div><strong>' + esc(c.name) + '</strong><small>' + c.meds.length + ' medicines &middot; ' + (c.tests ? c.tests.length : 0) + ' tests' + (c.orders && c.orders.length ? ' &middot; ' + c.orders.length + ' orders' : '') + (c.followN ? ' &middot; follow-up after ' + c.followN + ' ' + fuUnitLabel(c.followUnit, c.followN) : '') + '</small><small>' + esc(c.meds.map(function (m) { return medById(m.id).brand }).join(', ')) + '</small></div><button class="btn sm primary" data-act="applyCond" data-id="' + c.id + '">Apply</button></li>'
    }).join('')
    else if (T === 'combos') list = S.tpl.combos.map(function (c) {
      return '<li><div><strong>' + esc(c.name) + '</strong><small>' + esc(c.meds.map(function (m) { return medById(m.id).brand }).join(' + ')) + '</small></div><button class="btn sm primary" data-act="applyCombo" data-id="' + c.id + '">Add all</button></li>'
    }).join('')
    else list = S.tpl.presets.map(function (p) {
      return '<li><div><strong>' + esc(p.name) + '</strong></div><button class="btn sm primary" data-act="addPreset" data-id="' + p.id + '" data-close="1">Add</button></li>'
    }).join('')
    openModal({ title: 'Apply template', body: '<div class="tabs">' + tabs.map(function (t) { return '<button class="' + (T === t[0] ? 'on' : '') + '" data-act="tplTab" data-t="' + t[0] + '">' + t[1] + '</button>' }).join('') + '</div><ul class="tpl-list">' + list + '</ul>',
      foot: '<button class="btn ghost" data-act="closeModal">Close</button>' })
  }
  function saveTplModal() {
    var n = S.draft.lines.filter(function (l) { return !l.free && !isStop(l) }).length
    if (!n) { toast('Add at least one catalogue medicine first'); return }
    openModal({ title: 'Save current as template', cls: 'sm', body: '<label class="fld"><span>Template name</span><input class="txt" id="tplName" autofocus placeholder="e.g. My acute gastritis set"></label>' +
      '<fieldset class="radios"><label><input type="radio" name="tplType" value="combos" checked> Saved combination (medicines only)</label><label><input type="radio" name="tplType" value="condition"> Condition template (medicines + tests + other orders + diagnosis + follow-up)</label></fieldset>' +
      '<p class="muted small">' + n + ' catalogue medicine(s) will be saved with their dose, food and duration. Free-text lines are skipped.</p>',
      foot: '<button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn primary" data-act="saveTplGo">Save template</button>' })
  }
  function saveTplGo() {
    var name = $('#tplName').value.trim(); if (!name) { toast('Give the template a name'); return }
    var type = $('input[name="tplType"]:checked').value, dr = S.draft
    var meds = dr.lines.filter(function (l) { return !l.free && !isStop(l) }).map(function (l) {
      return { id: l.medId, slots: l.slots.slice(), mode: l.mode, intervalH: l.intervalH, prnMax: l.prnMax, amount: l.amount, unit: l.unit, food: l.food, route: l.route, durVal: l.durVal, durUnit: l.durUnit, cont: l.cont, days: l.cont ? undefined : num(l.durVal), steps: stepped(l) ? l.steps.map(stepOf) : undefined, instrs: l.instrs.slice(), x: extraOf(l) }
    })
    var t = { id: 'u' + (S.seq++), name: name, meds: meds }
    if (type === 'condition') { t.tests = dr.tests.map(function (x) { return x.t }); t.advice = dr.libAdvice.slice(); t.dx = dr.dx.length ? dr.dx[0].t : ''; t.followN = num(dr.fu.n); t.followUnit = dr.fu.unit; t.orders = dr.orders.map(function (o) { return { type: o.type, en: o.en, bn: o.bn, d: o.d } }) }
    S.tpl[type].push(t)
    closeModal(); toast('Saved "' + name + '" - find it under Apply template')
  }
  /* ---------- Quick add: manage screen ---------- */
  // Quick add chips are the doctor's single-medicine presets (PHAR-1696 storage) shown as a one-click bar.
  var QA_MAX = 10
  var ROUTES = ['Oral', 'SC', 'IM', 'IV', 'Topical', 'Inhalation', 'Eye drop', 'Ear drop', 'Nasal', 'Rectal']
  function presetFromLine(l) {
    return { name: lineName(l) + ' - ' + (stepped(l) ? stepSummary(l) : doseText(l)) + ' ' + FOOD[l.food].toLowerCase() + ', ' + durText(l), med: {
      id: l.medId, mode: l.mode, slots: l.slots.slice(), intervalH: l.intervalH, prnMax: l.prnMax, amount: l.amount, unit: l.unit,
      food: l.food, route: l.route, days: num(l.durVal), durUnit: l.durUnit, cont: l.cont, steps: stepped(l) ? l.steps.map(stepOf) : undefined, instrs: l.instrs.slice(), caution: l.caution, x: extraOf(l) } }
  }
  function presetDetail(p) { return p.name.split(' - ').slice(1).join(' - ') }
  function qaManage() { S.qaEdit = null; qaRender() }
  // S.qaEdit: null = list only, 'new' = blank form, preset id = editing that preset. S.qaLine = the form's working line.
  function qaRender() {
    var n = S.tpl.presets.length
    var list = S.tpl.presets.map(function (p, i) {
      return '<li class="qa-row' + (S.qaEdit === p.id ? ' on' : '') + '"><span class="ln">' + (i + 1) + '</span><div class="qa-txt"><strong>' + esc(p.name.split(' - ')[0]) + '</strong><small>' + esc(presetDetail(p)) + '</small></div>' +
        '<span class="qa-act"><button class="icon-btn" data-act="qaMove" data-id="' + p.id + '" data-d="-1" aria-label="Move ' + esc(p.name) + ' up"' + (i === 0 ? ' disabled' : '') + '>&uarr;</button>' +
        '<button class="icon-btn" data-act="qaMove" data-id="' + p.id + '" data-d="1" aria-label="Move ' + esc(p.name) + ' down"' + (i === n - 1 ? ' disabled' : '') + '>&darr;</button>' +
        '<button class="btn sm ghost" data-act="qaEdit" data-id="' + p.id + '">Edit</button>' +
        '<button class="icon-btn danger-text" data-act="qaDel" data-id="' + p.id + '" aria-label="Delete ' + esc(p.name) + '">&times;</button></span></li>'
    }).join('')
    var left = '<div class="qa-list"><div class="qa-lh"><strong>Your quick add (' + n + '/' + QA_MAX + ')</strong>' +
      '<button class="btn sm primary" data-act="qaNew"' + (n >= QA_MAX ? ' disabled title="Limit reached - delete one first"' : '') + '>+ New</button></div>' +
      (list ? '<ol class="tpl-list">' + list + '</ol>' : '<p class="muted">No quick add medicines yet.</p>') +
      '<p class="muted small">The order here is the order of the chips above the medicine list. While prescribing you can also press &#9734; on any medicine line.</p></div>'
    openModal({ title: 'Manage quick add', cls: 'wide', body: '<div class="qa-grid">' + left + '<div class="qa-form" id="qaForm">' + qaFormHtml() + '</div></div>',
      foot: '<button class="btn primary" data-act="closeModal">Done</button>' })
  }
  function qaFormHtml() {
    if (!S.qaEdit) return '<div class="empty"><strong>Pick a quick add to edit</strong><p>or press <b>+ New</b> to create one.</p></div>'
    var l = S.qaLine, q = function (k) { return 'data-qf="' + k + '"' }, dose
    if (stepped(l)) return qaSteppedHtml(l, q)
    if (l.mode === 'pattern') dose = ['Morning', 'Noon', 'Night'].map(function (lab, k) { return '<label class="slot"><span>' + lab + '</span><select ' + q('slot' + k) + ' aria-label="' + lab + ' dose">' + opts(SLOT_OPTS.map(function (x) { return [x, x] }), l.slots[k]) + '</select></label>' }).join('')
    else if (l.mode === 'interval') dose = '<label class="slot wide"><span>Every (hours)</span><input type="number" min="1" max="24" ' + q('intervalH') + ' value="' + esc(l.intervalH) + '"></label>'
    else dose = '<label class="slot wide"><span>SOS - max per day</span><input type="number" min="1" ' + q('prnMax') + ' value="' + esc(l.prnMax) + '"></label>'
    return '<h4>' + (S.qaEdit === 'new' ? 'New quick add' : 'Edit quick add') + '</h4>' +
      '<label class="fld"><span>Medicine</span><select ' + q('medId') + '>' + opts(D.meds.map(function (m) { return [m.id, m.brand + ' ' + m.strength + ' ' + m.form + ' - ' + m.generic] }), l.medId) + '</select></label>' +
      '<div class="g g-dose"><label class="fld"><span>Dose type</span><select ' + q('mode') + '>' + opts([['pattern', 'Morning-Noon-Night'], ['interval', 'Every N hours'], ['prn', 'SOS / PRN']], l.mode) + '</select></label><div class="slots">' + dose + '</div>' +
      '<label class="fld small"><span>Amount each</span><span class="two"><input type="number" min="0.5" step="0.5" ' + q('amount') + ' value="' + esc(l.amount) + '" aria-label="Dose amount"><select ' + q('unit') + ' aria-label="Unit">' + opts(Object.keys(UNITS).map(function (k) { return [k, k] }), l.unit) + '</select></span></label></div>' +
      '<div class="g g-4"><label class="fld"><span>Food</span><select ' + q('food') + '>' + opts(Object.keys(FOOD).map(function (k) { return [k, FOOD[k]] }), l.food) + '</select></label>' +
      '<label class="fld"><span>Route</span><select ' + q('route') + '>' + opts(ROUTES.map(function (x) { return [x, x] }), l.route) + '</select></label>' +
      '<label class="fld"><span>Duration</span><span class="two"><input type="number" min="1" ' + q('durVal') + ' value="' + esc(l.durVal) + '"' + (l.cont ? ' disabled' : '') + ' aria-label="Duration"><select ' + q('durUnit') + (l.cont ? ' disabled' : '') + ' aria-label="Duration unit">' + opts([['days', 'days'], ['weeks', 'weeks'], ['months', 'months']], l.durUnit) + '</select></span></label>' +
      '<label class="fld chk"><span>&nbsp;</span><span><input type="checkbox" ' + q('cont') + (l.cont ? ' checked' : '') + '> Continue</span></label></div>' +
      instrEditor('qa', l.instrs) +
      (extrasSummary(l).length ? '<p class="muted small">Also saved with this quick add: ' + esc(extrasSummary(l).join(' · ')) + ' (edit these on a prescription line, then press &#9734;).</p>' : '') +
      '<div class="qa-prev" id="qaPrev">' + qaPrevHtml() + '</div>' +
      '<div class="qa-fb"><button class="btn ghost" data-act="qaCancel">Cancel</button><button class="btn primary" data-act="qaSave">' + (S.qaEdit === 'new' ? 'Add to quick add' : 'Save changes') + '</button></div>'
  }
  // A tapered quick add keeps its steps; they are shown read-only here and edited on a prescription line.
  function qaSteppedHtml(l, q) {
    var rg = stepRanges(l)
    return '<h4>Edit quick add</h4><p><b>' + esc(lineName(l)) + '</b> <span class="ctag">taper</span></p>' +
      '<ol class="steps-ro">' + l.steps.map(function (s, k) { return '<li>' + esc(s.amount + ' ' + l.unit + ' ' + doseOne(s) + ' - ' + durText(s)) + ' <small class="muted">(' + esc(rg[k]) + ' if started today)</small></li>' }).join('') + '</ol>' +
      '<div class="g g-4"><label class="fld"><span>Food</span><select ' + q('food') + '>' + opts(Object.keys(FOOD).map(function (k) { return [k, FOOD[k]] }), l.food) + '</select></label>' +
      '<label class="fld"><span>Route</span><select ' + q('route') + '>' + opts(ROUTES.map(function (x) { return [x, x] }), l.route) + '</select></label></div>' +
      '<p class="muted small">To change the steps: add this chip to a prescription, edit the steps on the line, then press &#9734; to save it as a new quick add.</p>' +
      instrEditor('qa', l.instrs) +
      '<div class="qa-prev" id="qaPrev">' + qaPrevHtml() + '</div>' +
      '<div class="qa-fb"><button class="btn ghost" data-act="qaCancel">Cancel</button><button class="btn primary" data-act="qaSave">Save changes</button></div>'
  }
  function qaPrevHtml() {
    var p = presetFromLine(S.qaLine)
    return '<span class="muted small">Chip</span> <span class="btn sm ghost">' + esc(p.name.split(' - ')[0]) + '</span> <span class="muted small">adds</span> <b>' + esc(presetDetail(p)) + '</b>'
  }
  // Selects that change the form's shape re-render it; other fields only refresh the preview, so a pending click on Save is not lost.
  function qaChange(el) {
    var k = el.getAttribute('data-qf'), l = S.qaLine
    if (k === 'medId') S.qaLine = lineFrom(el.value)
    else if (k.indexOf('slot') === 0) l.slots[+k.slice(4)] = el.value
    else if (k === 'cont') l.cont = el.checked
    else l[k] = el.value
    if (k === 'medId' || k === 'mode' || k === 'cont') $('#qaForm').innerHTML = qaFormHtml()
    else $('#qaPrev').innerHTML = qaPrevHtml()
  }
  function qaSave() {
    var p = presetFromLine(S.qaLine), list = S.tpl.presets
    if (list.some(function (x) { return x.name === p.name && x.id !== S.qaEdit })) { toast('Already in quick add'); return }
    if (S.qaEdit === 'new') { p.id = 'p' + (S.seq++); list.push(p) }
    else list.forEach(function (x) { if (x.id === S.qaEdit) { x.name = p.name; x.med = p.med } })
    S.qaEdit = null; renderRx(); qaRender(); toast('Saved: ' + p.name)
  }
  function qaMove(id, d) {
    var list = S.tpl.presets, i = list.findIndex(function (x) { return x.id === id }), j = i + d
    if (j < 0 || j >= list.length) return
    var t = list[i]; list[i] = list[j]; list[j] = t
    renderRx(); qaRender()
  }
  function applyCondition(c) {
    var dr = S.draft
    c.meds.forEach(function (m) { addLine(lineFrom(m.id, m)) })
    ;(c.tests || []).forEach(function (t) { if (!hasTest(t)) dr.tests.push({ t: t }) })
    ;(c.orders || []).forEach(function (o) { dr.orders.push(ordNew(null, o)) })
    ;(c.advice || []).forEach(function (a) { if (dr.libAdvice.indexOf(a) < 0) dr.libAdvice.push(a) })
    if (c.dx && !dr.dx.some(function (x) { return x.t === c.dx })) dr.dx.push({ t: c.dx, type: dr.dxType })
    if (c.followN || c.followDays) { dr.fu.unit = c.followUnit || 'days'; dr.fu.n = String(c.followN || c.followDays); dr.fu.note = c.followNote || dr.fu.note }
    S.modal = null; $('#modalRoot').innerHTML = ''
    renderNotes(); renderRx(); renderBar(); drainPopups()
    toast('Applied "' + c.name + '" - review every line before completing')
  }

  /* ---------- Other orders (PHAR-1719), referral / admission advice / certificate (PHAR-1720) ---------- */
  // Not medicines: no quantity, never dispensed, not checked by the medicine warnings. They live on the draft beside the medicine lines.
  // Decision: orders (diet, exercise...) are kept by condition templates + issue; referral, admission and certificate are visit-specific, so templates and Continue from previous never copy them (D2).
  var OT = {}; D.orderTypes.forEach(function (t) { OT[t.id] = t })
  var URG = { routine: ['Routine', 'সাধারণ'], urgent: ['Urgent', 'জরুরি'], emergency: ['Emergency - today', 'অতি জরুরি'] }
  var ADM_URG = { immediate: ['Immediately', 'এখনই'], within24: ['Within 24 hours', '২৪ ঘণ্টার মধ্যে'], planned: ['Planned', 'পরিকল্পিত'] }
  var ADM_WHERE = ['General ward', 'Cabin', 'ICU', 'CCU', 'Emergency department', 'Day-care']
  var X_STRUCT = ['type', 'to', 'ctype', 'urgency', 'where', 'dx']
  function xId() { return 'X' + (S.seq++) }
  function ordNew(type, o) { o = o || {}; return { id: xId(), type: type || o.type || 'diet', en: o.en || '', bn: o.bn || '', d: o.d || '' } }
  function refNew() { return { id: xId(), to: 'speciality', spec: '', name: '', reason: '', urgency: 'routine', notes: '' } }
  function admNew() { return { id: xId(), where: 'General ward', facility: '', why: '', urgency: 'within24', when: '', notes: '' } }
  function certNew() { return { id: xId(), ctype: 'rest', from: D.today, days: '', purpose: '', remarks: '', dx: false } }
  function hasExtras(dr) { return dr.orders.length || dr.refs.length || dr.adm || dr.cert }
  function xFind(k, id) {
    var dr = S.draft
    if (k === 'ord') return dr.orders.filter(function (o) { return o.id === id })[0]
    if (k === 'ref') return dr.refs.filter(function (o) { return o.id === id })[0]
    return k === 'adm' ? dr.adm : dr.cert
  }
  function xAttr(k, o, f) { return 'data-xk="' + k + '" data-xid="' + o.id + '" data-xf="' + f + '" data-fk="x.' + k + '.' + o.id + '.' + f + '"' }
  function xMsg(k, o, f) {
    if (k === 'ord' && f === 'en' && !o.en.trim() && !o.bn.trim()) return 'Order text is required'
    if (k === 'ref') {
      if (f === 'spec' && o.to === 'speciality' && !o.spec.trim()) return 'Speciality is required'
      if (f === 'name' && o.to !== 'speciality' && !o.name.trim()) return (o.to === 'doctor' ? 'Doctor' : 'Hospital') + ' name is required'
      if (f === 'reason' && !o.reason.trim()) return 'Reason for referral is required'
    }
    if (k === 'adm') {
      if (f === 'why' && !o.why.trim()) return 'Reason for admission is required'
      if (f === 'when' && o.urgency === 'planned' && !o.when) return 'Planned date is required'
    }
    if (k === 'cert') {
      if (f === 'from' && !o.from) return o.ctype === 'rest' ? 'Start date is required' : 'Resume date is required'
      if (f === 'days' && o.ctype === 'rest' && !(num(o.days) >= 1)) return 'Enter 1 or more days of rest'
    }
    return ''
  }
  function xErr(k, o, f) { var m = S.showErr ? xMsg(k, o, f) : ''; return m ? '<span class="fld-err">' + esc(m) + '</span>' : '' }
  function xIn(label, k, o, f, ph, cls, type) {
    return '<label class="fld ' + (cls || '') + '"><span>' + label + '</span><input class="txt' + (S.showErr && xMsg(k, o, f) ? ' err' : '') + '" type="' + (type || 'text') + '" ' + xAttr(k, o, f) + ' value="' + esc(o[f]) + '" placeholder="' + esc(ph || '') + '"' + (f === 'spec' ? ' list="specList"' : '') + '>' + xErr(k, o, f) + '</label>'
  }
  function xSel(label, k, o, f, list, cls) { return '<label class="fld ' + (cls || '') + '"><span>' + label + '</span><select ' + xAttr(k, o, f) + '>' + opts(list, o[f]) + '</select></label>' }
  function certRange(c) {
    var n = num(c.days), from = c.from ? pd(c.from) : null
    if (!from) return null
    return { from: from, to: n >= 1 ? addDays(from, n - 1) : null, n: n }
  }
  function certInfo(c) {
    var r = certRange(c); if (!r) return ''
    if (c.ctype === 'fitness') return 'Fit to resume from ' + fmtY(r.from)
    return r.to ? 'Rest from ' + fmtY(r.from) + ' to ' + fmtY(r.to) + ' (' + r.n + (r.n === 1 ? ' day' : ' days') + ')' : ''
  }
  function ordSaved(o) { return S.ordMine.some(function (m) { return m.type === o.type && m.en.toLowerCase() === o.en.trim().toLowerCase() }) }
  function ordNeed(o) { return (o.en.trim() || o.bn.trim()) && !hasBangla(o.bn) ? '<small class="need">Bangla text needed for print</small>' : '' }
  function ordHtml(o) {
    return '<div class="ord" id="ord-' + o.id + '"><div class="ord-g">' + xSel('Type', 'ord', o, 'type', D.orderTypes.map(function (t) { return [t.id, t.en + ' / ' + t.bn] })) +
      xIn('English', 'ord', o, 'en', 'e.g. Low-salt diet', 'grow') + xIn('বাংলা (printed for the patient)', 'ord', o, 'bn', 'যেমন: কম লবণযুক্ত খাবার খাবেন', 'grow') +
      xIn('How often / how long (optional)', 'ord', o, 'd', 'e.g. daily, 30 min, 2 weeks') + '</div>' +
      '<div class="ord-a"><span class="ord-need">' + ordNeed(o) + '</span><button class="link" data-act="ordStar" data-id="' + o.id + '">' + (ordSaved(o) ? '&#9733; In my list' : '&#9734; Save to my list') + '</button><button class="link danger" data-act="xDel" data-k="ord" data-id="' + o.id + '">Remove</button></div></div>'
  }
  function refHtml(r) {
    return '<div class="ord xcard" id="ref-' + r.id + '"><div class="xt">Referral / রেফারেল</div><div class="ord-g">' + xSel('Refer to', 'ref', r, 'to', [['speciality', 'A speciality'], ['doctor', 'A named doctor'], ['hospital', 'A hospital']]) +
      (r.to === 'speciality' ? xIn('Speciality', 'ref', r, 'spec', 'e.g. Cardiology', 'grow') : xIn(r.to === 'doctor' ? 'Doctor name' : 'Hospital name', 'ref', r, 'name', r.to === 'doctor' ? 'e.g. Dr. A. Rahman, Cardiology' : 'e.g. NICVD', 'grow')) +
      xSel('Urgency', 'ref', r, 'urgency', Object.keys(URG).map(function (u) { return [u, URG[u][0] + ' / ' + URG[u][1]] })) + '</div>' +
      '<div class="ord-g">' + xIn('Reason for referral', 'ref', r, 'reason', 'e.g. BP not controlled on two medicines', 'grow') + xIn('Notes (optional)', 'ref', r, 'notes', '', 'grow') + '</div>' +
      '<div class="ord-a"><button class="link" data-act="xPrint" data-k="ref" data-id="' + r.id + '">Preview / print referral letter</button><button class="link danger" data-act="xDel" data-k="ref" data-id="' + r.id + '">Remove</button></div></div>'
  }
  function admHtml(a) {
    return '<div class="ord xcard" id="adm-' + a.id + '"><div class="xt">Admission advice / ভর্তির পরামর্শ</div><div class="ord-g">' + xSel('Admit to', 'adm', a, 'where', ADM_WHERE.map(function (w) { return [w, w] })) +
      xIn('Hospital / facility (optional)', 'adm', a, 'facility', 'e.g. Dhaka Medical College Hospital', 'grow') +
      xSel('Urgency', 'adm', a, 'urgency', Object.keys(ADM_URG).map(function (u) { return [u, ADM_URG[u][0] + ' / ' + ADM_URG[u][1]] })) +
      (a.urgency === 'planned' ? xIn('Planned date', 'adm', a, 'when', '', '', 'date') : '') + '</div>' +
      '<div class="ord-g">' + xIn('Reason for admission', 'adm', a, 'why', 'e.g. Severe dehydration - needs IV fluids', 'grow') + xIn('Notes (optional)', 'adm', a, 'notes', '', 'grow') + '</div>' +
      '<div class="ord-a"><button class="link" data-act="xPrint" data-k="adm" data-id="' + a.id + '">Preview / print admission advice</button><button class="link danger" data-act="xDel" data-k="adm" data-id="' + a.id + '">Remove</button></div></div>'
  }
  function certHtml(c) {
    var rest = c.ctype === 'rest'
    return '<div class="ord xcard" id="cert-' + c.id + '"><div class="xt">Medical certificate / মেডিকেল সার্টিফিকেট</div><div class="ord-g">' +
      xSel('Certificate type', 'cert', c, 'ctype', [['rest', 'Rest (medical leave)'], ['fitness', 'Fitness to resume']]) +
      xIn(rest ? 'Rest from' : 'Fit to resume from', 'cert', c, 'from', '', '', 'date') + (rest ? xIn('Number of days', 'cert', c, 'days', 'e.g. 3', '', 'number') : '') +
      xIn(rest ? 'For (optional)' : 'Resume (duties / school)', 'cert', c, 'purpose', rest ? 'e.g. office / school' : 'e.g. office duties', 'grow') + '</div>' +
      '<div class="ord-g">' + xIn(rest ? 'Remarks (optional)' : 'Restrictions (optional)', 'cert', c, 'remarks', rest ? 'e.g. avoid travel' : 'e.g. light duty for 1 week', 'grow') +
      '<label class="fld chk"><span>Diagnosis</span><span><input type="checkbox" ' + xAttr('cert', c, 'dx') + (c.dx ? ' checked' : '') + '> Show diagnosis on the certificate</span></label></div>' +
      '<div class="muted small" id="certInfo">' + esc(certInfo(c)) + '</div>' +
      '<div class="ord-a"><button class="link" data-act="xPrint" data-k="cert" data-id="' + c.id + '">Preview / print certificate</button><button class="link danger" data-act="xDel" data-k="cert" data-id="' + c.id + '">Remove</button></div></div>'
  }
  function ordersHtml() {
    var dr = S.draft
    return '<section class="ordb" id="orders"><div class="rx-h"><h2>Other orders <span class="cnt">' + dr.orders.length + '</span></h2><button class="btn sm ghost" data-act="ordOpen">+ Add order</button></div>' +
      '<p class="muted small">Diet, exercise, physiotherapy, procedures... Not medicines: no quantity, not dispensed, not checked by the medicine warnings.</p>' +
      (dr.orders.length ? dr.orders.map(ordHtml).join('') : '<div class="empty slim">No other orders. Use <b>+ Add order</b> for saved and suggested entries.</div>') +
      '<div class="rx-h xh"><h2>Referral, admission and certificate</h2></div>' +
      '<div class="rx-add"><button class="btn sm ghost" data-act="xAdd" data-k="ref">+ Referral</button>' +
      '<button class="btn sm ghost" data-act="xAdd" data-k="adm"' + (dr.adm ? ' disabled' : '') + '>+ Admission advice</button>' +
      '<button class="btn sm ghost" data-act="xAdd" data-k="cert"' + (dr.cert ? ' disabled' : '') + '>+ Medical certificate</button></div>' +
      dr.refs.map(refHtml).join('') + (dr.adm ? admHtml(dr.adm) : '') + (dr.cert ? certHtml(dr.cert) : '') +
      '<datalist id="specList">' + D.specialities.map(function (s) { return '<option value="' + esc(s) + '">' }).join('') + '</datalist></section>'
  }
  function ordsRefresh() { keepFocus(function () { var g = $('#orders'); if (g) g.outerHTML = ordersHtml() }); renderBar() }
  function ordOpen() {
    var T = S.ordTab || 'diet', all = S.ordMine.map(function (m, i) { return { m: m, src: 'mine', i: i } }).concat(D.orderSuggest.common.map(function (m, i) { return { m: m, src: 'common', i: i } }))
    var chips = all.filter(function (x) { return x.m.type === T }).map(function (x) {
      return '<div class="osug"><button class="chip sug" data-act="ordPick" data-src="' + x.src + '" data-i="' + x.i + '">' + (x.src === 'mine' ? '&#9733; ' : '') + esc(x.m.en) + (x.m.d ? ' <small>' + esc(x.m.d) + '</small>' : '') + '<small class="bnl">' + esc(x.m.bn) + '</small></button>' +
        (x.src === 'mine' ? '<button class="qdel" data-act="ordUnsave" data-i="' + x.i + '" aria-label="Remove from my list" title="Remove from my list">&times;</button>' : '') + '</div>'
    }).join('')
    openModal({ title: 'Add order', body: '<div class="tabs">' + D.orderTypes.map(function (t) { return '<button class="' + (T === t.id ? 'on' : '') + '" data-act="ordTab" data-t="' + t.id + '">' + t.en + '</button>' }).join('') + '</div>' +
      '<p class="muted small">&#9733; = your saved entries (suggested first), then common ones. Click to add; edit the text on the card afterwards.</p><div class="osugs">' + (chips || '<span class="muted small">Nothing saved for this type yet.</span>') + '</div>',
      foot: '<button class="btn ghost" data-act="ordBlank" data-t="' + T + '">+ Custom ' + OT[T].en.toLowerCase() + ' order</button><button class="btn ghost" data-act="closeModal">Done</button>' })
  }
  function ordAdd(o, type) {
    var x = ordNew(type, o); S.draft.orders.push(x); ordsRefresh()
    var e = $('#ord-' + x.id); if (e) { e.classList.add('flash'); e.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }
    return x
  }
  // live = typing (model only, no re-render); otherwise the field was committed (select / checkbox / blur).
  function xChange(el, live) {
    var k = el.getAttribute('data-xk'), o = xFind(k, el.getAttribute('data-xid')), f = el.getAttribute('data-xf'); if (!o) return
    o[f] = el.type === 'checkbox' ? el.checked : el.value
    if (k === 'cert') { var ci = $('#certInfo'); if (ci) ci.textContent = certInfo(o) }
    if (k === 'ord') { var nd = $('#ord-' + o.id + ' .ord-need'); if (nd) nd.innerHTML = ordNeed(o) }
    if (live) return
    if (X_STRUCT.indexOf(f) >= 0 || S.showErr) ordsRefresh()
  }
  function ordLis(orders) {
    return orders.map(function (o) {
      var t = OT[o.type] || OT.other
      return '<li><b>' + esc(t.bn) + ' / ' + esc(t.en) + ':</b> ' + esc(o.bn || o.en) + (o.bn && o.en ? ' <small>' + esc(o.en) + '</small>' : '') + (o.d ? ' <span class="xo-d">&middot; ' + esc(o.d) + '</span>' : '') + '</li>'
    }).join('')
  }
  function refTarget(r) { return r.to === 'speciality' ? r.spec : r.name }
  // Blocks for the printed sheet and the patient view. btn(kind, obj) returns an optional button (patient view).
  function ordBlock(orders) {
    return orders && orders.length ? '<div class="xo sh-adv"><b>অন্যান্য নির্দেশনা / Other orders</b><ul>' + ordLis(orders) + '</ul></div>' : ''
  }
  function refBlock(o, btn) {
    var li = '', b = btn || function () { return '' }
    ;(o.refs || []).forEach(function (r) {
      li += '<li><b>রেফারেল / Referral:</b> ' + esc(refTarget(r)) + ' &mdash; ' + esc(r.reason) + ' <span class="urg u-' + r.urgency + '">' + URG[r.urgency][1] + ' / ' + URG[r.urgency][0] + '</span>' + b('ref', r) + '</li>'
    })
    if (o.adm) li += '<li><b>ভর্তির পরামর্শ / Admission advice:</b> ' + esc(o.adm.where) + (o.adm.facility ? ', ' + esc(o.adm.facility) : '') + ' &mdash; ' + esc(o.adm.why) + ' <span class="urg u-' + (o.adm.urgency === 'immediate' ? 'emergency' : o.adm.urgency === 'within24' ? 'urgent' : 'routine') + '">' + ADM_URG[o.adm.urgency][1] + ' / ' + ADM_URG[o.adm.urgency][0] + (o.adm.urgency === 'planned' && o.adm.when ? ' ' + fmtY(o.adm.when) : '') + '</span>' + b('adm', o.adm) + '</li>'
    if (o.cert) li += '<li><b>মেডিকেল সার্টিফিকেট / Medical certificate:</b> ' + esc(certInfo(o.cert)) + ' <small>(printed separately)</small>' + b('cert', o.cert) + '</li>'
    return li ? '<div class="xo sh-adv"><b>রেফারেল, ভর্তি ও সার্টিফিকেট / Referral, admission, certificate</b><ul>' + li + '</ul></div>' : ''
  }
  function docHtml(k, o, c) {
    var d = doc(), p = c.p, title, body, suffix = { ref: 'R', adm: 'A', cert: 'C' }[k], no = c.no + '-' + suffix, code = codeFor(c.no)
    function row(l, v) { return v ? '<div class="doc-r"><b>' + l + '</b><span>' + v + '</span></div>' : '' }
    if (k === 'ref') {
      title = 'রেফারেল পত্র / Referral letter'
      body = '<p>Dear colleague,</p><p>Kindly see and advise <b>' + esc(p.name) + '</b> (' + esc(p.age) + ' / ' + esc(p.sex) + ').</p>' +
        row('Refer to', esc(refTarget(o)) + (o.to === 'doctor' && o.spec ? ' (' + esc(o.spec) + ')' : '')) + row('Reason', esc(o.reason)) + row('Urgency', URG[o.urgency][1] + ' / ' + URG[o.urgency][0]) + row('Notes', esc(o.notes)) + '<p>Thank you.</p>'
    } else if (k === 'adm') {
      title = 'ভর্তির পরামর্শ / Admission advice'
      body = '<p><b>' + esc(p.name) + '</b> (' + esc(p.age) + ' / ' + esc(p.sex) + ') is advised hospital admission.</p>' +
        row('Admit to', esc(o.where) + (o.facility ? ', ' + esc(o.facility) : '')) + row('Reason', esc(o.why)) +
        row('Urgency', ADM_URG[o.urgency][1] + ' / ' + ADM_URG[o.urgency][0] + (o.urgency === 'planned' && o.when ? ' - ' + fmtY(o.when) : '')) + row('Notes', esc(o.notes))
    } else {
      title = 'মেডিকেল সার্টিফিকেট / Medical certificate'
      var r = certRange(o), dx = o.dx && c.dx ? ' Diagnosis: ' + esc(c.dx) + '.' : ''
      body = o.ctype === 'rest'
        ? '<p>This is to certify that <b>' + esc(p.name) + '</b> (' + esc(p.age) + ' / ' + esc(p.sex) + ') was examined on ' + fmtY(c.date) + ' and is advised <b>rest for ' + (r ? r.n : '') + (r && r.n === 1 ? ' day' : ' days') + '</b>' + (r && r.to ? ' from <b>' + fmtY(r.from) + '</b> to <b>' + fmtY(r.to) + '</b>' : '') + (o.purpose ? ' (' + esc(o.purpose) + ')' : '') + '.' + dx + '</p>' +
          '<p class="bn-p">উপরোক্ত রোগীকে ' + bn(r ? r.n : '') + ' দিন বিশ্রামের পরামর্শ দেওয়া হলো।</p>'
        : '<p>This is to certify that <b>' + esc(p.name) + '</b> (' + esc(p.age) + ' / ' + esc(p.sex) + ') was examined on ' + fmtY(c.date) + ' and is <b>fit to resume ' + (o.purpose ? esc(o.purpose) + ' ' : '') + 'from ' + (r ? fmtY(r.from) : '') + '</b>.' + dx + '</p>' +
          '<p class="bn-p">উপরোক্ত রোগী ' + (r ? fmtY(r.from) : '') + ' থেকে স্বাভাবিক কাজে ফিরতে সক্ষম।</p>'
      body += row(o.ctype === 'rest' ? 'Remarks' : 'Restrictions', esc(o.remarks))
    }
    return '<div class="sheet doc"><div class="sh-head"><div><h2>' + esc(d.name) + '</h2><div>' + esc(d.degrees) + ' &middot; ' + esc(specLine(d)) + '</div><div>' + esc(regLine(d)) + '</div></div>' +
      '<div class="sh-r"><div>' + esc(d.chamber) + '</div><div>' + esc(d.chamberAddr) + '</div><div>Phone: ' + esc(d.phone) + '</div></div></div>' +
      '<div class="sh-pat"><span><b>' + esc(p.name) + '</b>, ' + esc(p.age) + ' / ' + esc(p.sex) + '</span><span>Date: ' + fmtY(c.date) + '</span><span>Ref: ' + esc(no) + '</span></div>' +
      '<h3 class="doc-t">' + title + '</h3><div class="doc-b">' + body + '</div>' +
      '<div class="sh-foot"><div class="sh-qr">' + qrHtml(no + code) + '<div><div class="chkcode">Check code: ' + code + '</div><small>Linked to prescription ' + esc(c.no) + '</small></div></div><div class="sig"><div class="sigline"></div>' + esc(d.name) + '<br>' + esc(regShort(d)) + '</div></div></div>'
  }
  function docModal(k, o, c) {
    openModal({ title: { ref: 'Referral letter', adm: 'Admission advice', cert: 'Medical certificate' }[k], cls: 'wide', body: '<div class="sheet-wrap">' + docHtml(k, o, c) + '</div>',
      foot: '<button class="btn ghost" data-act="printRx">Print</button><button class="btn ghost" data-act="closeModal">Close</button>' })
  }
  function xAllErrs() {
    var dr = S.draft, errs = []
    dr.orders.forEach(function (o, i) { if (xMsg('ord', o, 'en')) errs.push('Order ' + (i + 1) + ': text is required') })
    dr.refs.forEach(function (r, i) { ['spec', 'name', 'reason'].forEach(function (f) { var m = xMsg('ref', r, f); if (m) errs.push('Referral ' + (i + 1) + ': ' + m) }) })
    if (dr.adm) ['why', 'when'].forEach(function (f) { var m = xMsg('adm', dr.adm, f); if (m) errs.push('Admission advice: ' + m) })
    if (dr.cert) ['from', 'days'].forEach(function (f) { var m = xMsg('cert', dr.cert, f); if (m) errs.push('Certificate: ' + m) })
    return errs
  }
  function dxText() { return S.draft.dx.map(function (x) { return x.t }).join('; ') }
  function copyExtras(dr) {
    function cp(o) { return Object.assign({}, o) }
    return { orders: dr.orders.map(cp), refs: dr.refs.map(cp), adm: dr.adm ? cp(dr.adm) : null, cert: dr.cert ? Object.assign(cp(dr.cert), { dxText: dr.cert.dx ? dxText() : '' }) : null }
  }

  /* ---------- preview / complete ---------- */
  // s = the line or one of its steps; unit comes from the line.
  function doseBn(s, unit) {
    var t
    if (s.mode === 'pattern') t = s.slots.map(function (x) { return bn(x) }).join(' + ')
    else if (s.mode === 'interval') t = 'প্রতি ' + bn(s.intervalH) + ' ঘণ্টা পর পর'
    else t = 'প্রয়োজনে (সর্বোচ্চ দিনে ' + bn(s.prnMax) + ' বার)'
    if (num(s.amount) !== 1) t += ' (প্রতিবার ' + bn(s.amount) + ' ' + (UNITS_BN[unit] || unit) + ')'
    return t
  }
  function durBn(s) { return s.cont ? 'চলবে' : bn(s.durVal) + ' ' + ({ days: 'দিন', weeks: 'সপ্তাহ', months: 'মাস' }[s.durUnit]) }
  function startBn(l) {
    var n = startOffset(l)
    return n ? '<div class="pm-start">' + fmt(addDays(TODAY, n)) + ' থেকে শুরু করবেন' + (l.startMode === 'after' ? ' (' + bn(n) + ' দিন পর)' : '') + '</div>' : ''
  }
  // One drug, numbered steps: "১) ... ৫ দিন, তারপর / ২) ..." (PHAR-1716).
  function freqBn(l) {
    var food = FOOD_BN[l.food] ? ' &middot; ' + FOOD_BN[l.food] : ''
    if (!stepped(l)) return doseBn(l, l.unit) + srBn(l) + food + ' &middot; ' + durBn(l) + startBn(l)
    var rg = stepRanges(l), n = l.steps.length
    return '<div class="pm-steps">' + l.steps.map(function (s, k) {
      return '<div>' + bn(k + 1) + ') ' + doseBn(s, l.unit) + ' &middot; ' + durBn(s) + (k < n - 1 ? ', তারপর' : '') + ' <small>(' + esc(rg[k]) + ')</small></div>'
    }).join('') + '</div>' + (srBn(l) ? '<div>' + srBn(l).replace(' &middot; ', '') + '</div>' : '') + (food ? '<div>' + food.replace(' &middot; ', '') + '</div>' : '') + startBn(l)
  }
  // Side (eye/ear/nose) and SOS reason sit next to the dose (PHAR-1721).
  function srBn(o) {
    var t = ''
    if (sideBn(o)) t += ' &middot; <b>' + sideBn(o) + ' / ' + esc(sideEn(o)) + '</b>'
    if (o.asNeededReason) t += ' &middot; ' + esc(o.asNeededReason)
    return t
  }
  // Infusion line, sliding-scale table and weight formula under the direction (PHAR-1717, PHAR-1722).
  function extrasBn(o) {
    var h = ''
    if (infOn(o)) h += '<div class="pm-x">' + infBn(o) + ' <small>(' + esc(infEn(o)) + ')</small></div>'
    var rows = (o.cond || []).filter(function (r) { return r.c || r.d })
    if (rows.length) h += '<table class="pm-tbl"><thead><tr><th>অবস্থা / Condition</th><th>মাত্রা / Dose</th></tr></thead><tbody>' + rows.map(function (r) { return '<tr><td>' + esc(r.c) + '</td><td>' + esc(r.d) + '</td></tr>' }).join('') + '</tbody></table>'
    if (o.dpkOn && o.wkText) h += '<div class="pm-x"><small>Weight-based: ' + esc(o.wkText) + '</small></div>'
    return h
  }
  function sheetHtml(final) { return withDig(S.draft.bnd, function () { return sheetHtml0(final) }) }
  // Skipped from the print because long history is off by default (design 7); it stays in the digital record and the patient view.
  function histSkipped() { var dr = S.draft; return S.printHist ? [] : S.sections.filter(function (c) { return !c.hidden && (c.id === 'ph' || c.id === 'fh') && dr.notes[c.id] && dr.notes[c.id].length }).map(function (c) { return secDef(c.id).abbr }) }
  function fuSheet() {
    var f = S.draft.fu, h = ''
    if (num(f.n)) h = '<b>F/U / পুনরায় দেখা করবেন:</b> ' + bn(num(f.n)) + ' ' + ({ days: 'দিন', weeks: 'সপ্তাহ', months: 'মাস' }[f.unit]) + ' পরে (' + bnDate(followDue()) + ')' + (f.slot ? ' &middot; নির্ধারিত সময়: ' + bnDate(f.slot.date) + ', ' + bn(f.slot.time) : '') + ' <small>' + esc(followText()) + (f.slot ? '; booked ' + esc(fmt(f.slot.date)) + ' ' + esc(f.slot.time) : '') + '</small>'
    if (f.note) h += (h ? ' &middot; ' : '<b>F/U / পুনরায় দেখা করবেন:</b> ') + esc(f.note)
    return h
  }
  function sheetHtml0(final) {
    var d = doc(), p = pat(), dr = S.draft, left = ''
    S.sections.forEach(function (c) {
      if (c.hidden) return
      var def = secDef(c.id), t = ''
      if ((c.id === 'ph' || c.id === 'fh') && !S.printHist) return
      if (def.kind === 'chips') t = dr.notes[c.id].map(function (x) { return esc(x.t) }).join('; ')
      if (def.kind === 'tests') t = dr.tests.map(function (x) { return esc(x.t) }).join(', ')
      if (def.kind === 'dx') t = dr.dx.map(function (x) { return esc(x.t) + ' <i>(' + DX_TYPES[x.type].charAt(0) + ')</i>' }).join('; ')
      if (def.kind === 'block') t = blockPrintHtml(def.bid)
      if (c.id === 'oe') {
        var v = dr.vitals, vt = []
        if (v.bp) vt.push('BP ' + esc(v.bp)); if (v.pulse) vt.push('Pulse ' + esc(v.pulse)); if (v.temp) vt.push('Temp ' + esc(v.temp) + '&deg;F')
        if (v.rr) vt.push('Resp ' + esc(v.rr) + '/min'); if (v.weight) vt.push('Wt ' + esc(v.weight) + ' kg'); if (bmi() !== '-') vt.push('BMI ' + bmi()); if (v.spo2) vt.push('SpO2 ' + esc(v.spo2) + '%')
        t = (vt.join(' &middot; ') + (t ? '<br>' + t : ''))
      }
      if (c.id === 'oi' && dr.res.length) t += (t ? '<br>' : '') + dr.res.map(resPrint).join('<br>')
      if (t) left += '<div class="pl-sec"><b>' + (def.kind === 'tests' ? 'Exam / Inv' : def.abbr) + '</b> ' + t + '</div>'
    })
    var meds = dr.lines.map(function (l, i) {
      if (isStop(l)) return '<li class="pm-stop"><div class="pm-n">' + (i + 1) + '.</div><div><b>বন্ধ করুন / STOP: ' + esc(lineName(l)) + '</b>' + (l.stopReason ? '<div class="pm-i">' + esc(l.stopReason) + '</div>' : '') + '</div></li>'
      return '<li><div class="pm-n">' + (i + 1) + '.</div><div><b>' + esc(lineName(l)) + '</b> <span>' + esc(l.form) + '</span>' + (l.kind === 'CONT' ? ' <span class="pm-cont">চলবে / Continue</span>' : '') + (l.generic ? '<small>' + esc(l.generic) + '</small>' : '') +
        '<div class="pm-f">' + freqBn(l) + '</div>' + extrasBn(l) + l.instrs.map(function (t) { return '<div class="pm-i">' + esc(t) + '</div>' }).join('') + (l.caution ? '<div class="pm-i">&#9888; ' + esc(l.caution) + '</div>' : '') + '</div></li>'
    }).join('')
    var adv = !secOn('advice') ? '' : dr.libAdvice.map(function (id) { var a = D.adviceLibrary.filter(function (x) { return x.id === id })[0]; return '<li>' + esc(a.bn) + ' <small>' + esc(a.en) + '</small></li>' }).join('') +
      dr.notes.advice.map(function (x) { return '<li>' + esc(x.t) + '</li>' }).join('')
    var fu = !secOn('fu') ? '' : fuSheet()
    var code = final ? final.code : 'XXXX-XXXX'
    return '<div class="sheet"><div class="sh-head"><div><h2>' + esc(d.name) + '</h2><div>' + esc(d.degrees) + ' &middot; ' + esc(specLine(d)) + '</div><div>' + esc(regLine(d)) + '</div></div>' +
      '<div class="sh-r"><div>' + esc(d.chamber) + '</div><div>' + esc(d.chamberAddr) + '</div><div>Phone: ' + esc(d.phone) + '</div></div></div>' +
      sheetTitle() + '<div class="sh-pat">' + patSpan(p) + '<span>Date: ' + fmtY(D.today) + '</span><span>Rx No: ' + esc(dr.rxNo) + (dr.continued ? ' (v' + dr.continued.next + ')' : '') + '</span></div>' +
      '<div class="sh-cols"><div class="sh-l">' + (left || '<span class="muted">No notes</span>') + '</div><div class="sh-rx"><div class="rxs big">&#8478;</div>' + rxLabelHtml() + '<ol>' + (meds || (medOn() ? '<li class="muted">No medicines</li>' : planLis())) + '</ol></div></div>' +
      (medOn() ? ordBlock(dr.orders) : '') + refBlock(dr) + (adv ? '<div class="sh-adv"><b>Adv / পরামর্শ</b><ul>' + adv + '</ul></div>' : '') + (fu ? '<div class="sh-fu">' + fu + '</div>' : '') +
      '<div class="sh-foot"><div class="sh-qr">' + qrHtml(dr.rxNo + code) + '<div><div class="chkcode">Check code: ' + code + '</div><small>Verify at pharmaz247.example/verify</small></div></div><div class="sig"><div class="sigline"></div>' + esc(d.name) + '<br>' + esc(regShort(d)) + '</div></div></div>'
  }
  function previewModal() {
    var dr = S.draft, hs = histSkipped()
    var opt = '<div class="pv-opt"><div class="pv-o"><span><b>Digits on the patient part</b> (directions, duration, follow-up)</span><div class="seg" role="group" aria-label="Digits"><button class="' + (dr.bnd ? 'on' : '') + '" data-act="bndSet" data-v="1">বাংলা ১২৩</button><button class="' + (dr.bnd ? '' : 'on') + '" data-act="bndSet" data-v="0">English 123</button></div> ' + (S.bndDefault === dr.bnd ? '<span class="muted small">your default</span>' : '<button class="link" data-act="bndDefault">Make this my default</button>') + '</div>' +
      '<label class="chk-i"><input type="checkbox" data-act="printHist"' + (S.printHist ? ' checked' : '') + '> Also print long history (P/H, F/H)' + (hs.length ? ' <span class="muted small">- ' + esc(hs.join(', ')) + ' not printed now; kept in the record and the patient view</span>' : '') + '</label></div>'
    openModal({ title: 'Prescription preview (A4)', cls: 'wide', body: opt + '<div class="sheet-wrap">' + sheetHtml() + '</div><p class="muted small center">Preview only - the real QR and check code are generated when you complete.</p>',
      foot: '<button class="btn ghost" data-act="printRx">Print</button><button class="btn ghost" data-act="closeModal">Back to editing</button><button class="btn primary" data-act="complete">Complete</button>' })
  }
  function completeModal() {
    var dr = S.draft, wc = warnCounts(), own = ownRxs(), ac = allergyCounts()
    var chain
    if (dr.editing) chain = 'Edit of <b>' + esc(dr.rxNo) + '</b> in place (same number and version). The check code changes; copies printed earlier show &ldquo;Not valid &ndash; changed&rdquo;. The edit window does not restart.'
    else if (dr.continued) chain = own.slice().reverse().map(function (r) { return 'v' + r.version + ' ' + fmt(r.date) }).join(' &rarr; ') + ' &rarr; <b>v' + dr.continued.next + ' today</b>'
    else chain = 'New prescription - <b>v1 today</b>' + (own.length ? ' (not linked to your earlier prescriptions)' : '')
    var un = wc.w - wc.a, wb = recAdds()
    openModal({ title: 'Complete prescription', cls: 'sm', body: '<ul class="sum"><li><b>' + dr.lines.length + '</b> medicines, <b>' + dr.tests.length + '</b> advised tests</li>' +
      (hasExtras(dr) ? '<li>Other: <b>' + dr.orders.length + '</b> order(s) (not dispensed)' + (dr.refs.length ? ', <b>' + dr.refs.length + '</b> referral(s)' : '') + (dr.adm ? ', admission advice' : '') + (dr.cert ? ', medical certificate (printed separately)' : '') + '</li>' : '') +
      '<li>Dispensing: <b>' + dr.lines.filter(function (l) { return !isStop(l) }).length + '</b> medicine line(s)' + (dr.lines.some(isStop) ? ', <b>' + dr.lines.filter(isStop).length + '</b> stop line(s) not dispensed' : '') + '</li>' +
      (ac.w ? '<li>Allergy warnings: <b>' + ac.a + ' of ' + ac.w + '</b> have an override reason' + (ac.w - ac.a ? ' <span class="err-t">(' + (ac.w - ac.a) + ' without a reason - you can still complete)</span>' : '') + '</li>' : '') +
      '<li>Warnings: <b>' + wc.a + ' of ' + wc.w + '</b> acknowledged' + (un ? ' <span class="warn-t2">(' + un + ' not acknowledged - you can still complete)</span>' : '') + '</li>' +
      (dr.res.length ? '<li><b>' + dr.res.length + '</b> report result(s) printed under O/I</li>' : '') +
      (wb.n ? '<li>Patient record: will <b>add</b> ' + esc(recText(wb)) + ' <span class="muted small">(add-only; nothing is removed from the record)</span></li>' : '') +
      '<li>Version chain: ' + chain + '</li></ul><p class="note">Previous prescriptions stay unchanged and valid. ' + (dr.editing ? 'Saving replaces the issued content; the patient sees the latest version only.' : 'Completing makes this prescription final; later changes create a new version.') + '</p>',
      foot: '<button class="btn ghost" data-act="closeModal">Back</button><button class="btn primary" data-act="confirmComplete">Confirm and issue</button>' })
  }
  function advList() {
    return S.draft.libAdvice.map(function (id) { var a = D.adviceLibrary.filter(function (x) { return x.id === id })[0]; return a ? a.bn + (a.en ? ' / ' + a.en : '') : '' }).filter(Boolean).concat(S.draft.notes.advice.map(function (x) { return x.t }))
  }
  // Snapshot of the notes as issued: the patient view and later reads use it (D6: the patient sees the full submitted prescription).
  function snapOf(dr) {
    var secs = []
    S.sections.forEach(function (c) {
      if (c.hidden) return
      var def = secDef(c.id), items
      if (def.kind === 'chips') items = dr.notes[c.id].map(function (x) { return x.t })
      else if (def.kind === 'tests') items = dr.tests.map(function (t) { return t.t })
      else if (def.kind === 'dx') items = dr.dx.map(function (x) { return x.t + ' (' + DX_TYPES[x.type] + ')' })
      else if (def.kind === 'block') items = blockItems(def.bid)
      else return
      if (items.length || (c.id === 'oi' && dr.res.length)) secs.push({ abbr: def.kind === 'tests' ? 'Exam / Inv' : def.abbr, title: def.kind === 'tests' ? 'Tests advised' : def.title, items: items })
    })
    return { vitals: Object.assign({}, dr.vitals), secs: secs, res: dr.res.map(function (r) { return Object.assign({}, r) }) }
  }
  function fuRecOf(dr) {
    var f = dr.fu; if (!num(f.n) && !f.note) return null
    return { n: num(f.n), unit: f.unit, date: num(f.n) ? isoDate(followDue()) : '', time: f.slot ? f.slot.time : '', slotDate: f.slot ? f.slot.date : '', note: f.note, rem: !!(f.rem && num(f.n)), remDays: num(f.remDays) }
  }
  function confirmComplete() {
    var dr = S.draft, no = dr.rxNo, code = codeFor(no), own = ownRxs(), wb = recAdds()
    var ed = dr.editing ? rxById(dr.editing) : null
    if (ed && !editOpen(ed)) { closeModal(); return toast('Edit window closed - ' + closedText(ed)) }
    var version = ed ? ed.version : dr.continued ? dr.continued.next : 1
    var rec = { id: 'rx' + S.rxCounter, no: no, version: version, date: D.today, submittedAt: nowIso(), serial: S.serial, byMe: true, by: S.doc, animalId: pat().animalId || null,
      lines: dr.lines.map(function (l) {
        if (isStop(l)) return { stop: true, kind: 'STOP', medId: l.medId, name: lineName(l), reason: l.stopReason, pattern: '', days: 0, food: 'any' }
        var many = stepped(l), last = stepsOf(l)[stepsOf(l).length - 1], off = startOffset(l)
        return { kind: l.kind, x: extraOf(l), dose: { mode: l.mode, slots: l.slots.slice(), intervalH: l.intervalH, prnMax: l.prnMax, amount: l.amount, unit: l.unit }, medId: l.medId || 'napa500', pattern: many ? stepSummary(l) : l.mode === 'pattern' ? l.slots.join('+') : doseText(l), days: last.cont ? null : many ? courseDays(l) : num(l.durVal), food: l.food,
          steps: many ? l.steps.map(stepOf) : null, unit: l.unit, startDate: off ? isoDate(addDays(TODAY, off)) : null }
      }).filter(function (x, i) { return !dr.lines[i].free || isStop(dr.lines[i]) }),
      tests: dr.tests.map(function (t) { return t.t }), cc: dr.notes.cc.map(function (x) { return x.t }), dx: dr.dx, advice: [], follow: followDate() }
    rec.advice = advList(); rec.bnd = dr.bnd; rec.snap = snapOf(dr); rec.fuRec = fuRecOf(dr)
    rec.draftJson = JSON.stringify(dr) /* full draft (notes, blocks, vitals, free lines, extras...) so an edit round-trips losslessly */
    Object.assign(rec, copyExtras(dr))
    /* D8 write-back (simulated): add-only, same transaction as the issue. Next visit pre-fills from this Rx. */
    var pp = pat()
    pp.chronic = (pp.chronic || []).concat(wb.kco); pp.allergies = pp.allergies.concat(wb.al)
    function plain(k, nf) { return dr.notes[k].map(function (x) { return x.t }).filter(function (t) { return !nf || !allergyOf(t) }) }
    pp.last = { date: D.today, no: no, dh: plain('dh', true), ph: plain('ph'), fh: plain('fh') }
    if (ed) return finishEdit(ed, rec)
    ;(D.history[S.pid] = D.history[S.pid] || []).push(rec)
    D.verifyDb.push({ no: no, code: code, status: 'VALID', issued: fmtY(D.today), doctor: doc().name, bmdc: doc().bmdc, patient: pat().name.charAt(0) + '*** ' + (pat().name.split(' ')[1] || '').charAt(0) + '*****',
      meds: dr.lines.map(function (l) { return isStop(l) ? 'STOP: ' + lineName(l) : lineName(l) + ' - ' + doseText(l) + ' - ' + durText(l).toLowerCase() + (infOn(l) ? ' - ' + infEn(l) : '') }) })
    var old = own[0]
    if (old) D.verifyDb.forEach(function (r) { if (r.no === old.no) r.newer = fmtY(D.today) })
    appt().status = 'Done'
    S.lastIssued = { no: no, code: code, version: version }
    S.rxCounter++
    openModal({ title: 'Prescription issued', cls: 'sm', body: '<div class="success"><div class="tick">&#10003;</div><h3>' + esc(no) + ' &middot; v' + version + '</h3><p class="muted">Issued ' + fmtY(D.today) + ' for ' + esc(pat().name) + '</p>' +
      qrHtml(no + code) + '<div class="chkcode">Check code: ' + code + '</div></div>' + (wb.n ? '<div class="note">Added to the patient record: ' + esc(recText(wb)) + '</div>' : '') + '<div class="note">Patient SMS (simulated): the link opens the prescription only after the patient signs in with phone + OTP. Editable for ' + leftText(leftMin(rec)) + '.</div>' + '<div class="muted small">' + (dr.fu.rem && num(dr.fu.n) ? 'Reminder SMS scheduled for ' + esc(fmtY(fuSendOn())) + ' (simulated).' : '') + '</div>',
      foot: '<button class="btn ghost" data-act="verifyThis">Open in Verify page</button><button class="btn primary" data-act="backToAppts">Back to appointments</button>' })
  }

  /* ---------- verify (public) ---------- */
  function renderVerify() {
    var v = S.vf
    $('#view').innerHTML = '<div class="page"><div class="page-h"><div><h1>Verify a prescription</h1><p class="muted">Public page - no login. Shown in a phone-width frame.</p></div></div>' +
      '<div class="two-col"><div class="phone"><div class="ph-bar">pharmaz247.example/verify</div><div class="ph-b">' +
      '<h2>Check a prescription</h2><p class="muted">Enter the Rx number and the 8-character check code printed under the QR code.</p>' +
      '<label class="fld"><span>Rx number</span><input class="txt mono" id="vRx" value="' + esc(v.rx) + '" placeholder="RX-A12345-0001"></label>' +
      '<label class="fld"><span>Check code</span><input class="txt mono" id="vCode" value="' + esc(v.code) + '" placeholder="XXXX-XXXX"></label>' +
      '<div class="row"><button class="btn primary" data-act="vGo">Verify</button><button class="btn ghost" data-act="vScan">Scan QR</button></div>' +
      '<div id="vRes">' + verifyResult(v.result) + '</div></div></div>' +
      '<div class="demo"><h3>Demo results</h3><p class="muted">Each button fills the form with a sample record and verifies it.</p>' +
      '<button class="btn" data-act="vDemo" data-k="valid">Valid prescription</button><button class="btn" data-act="vDemo" data-k="notfound">Not valid - not found</button>' +
      '<button class="btn" data-act="vDemo" data-k="changed">Not valid - changed</button><button class="btn" data-act="vDemo" data-k="old">Old prescription (newer exists)</button>' +
      (S.lastIssued ? '<button class="btn" data-act="vDemo" data-k="latest">The one just issued (' + esc(S.lastIssued.no) + ')</button>' : '') + '</div></div></div>'
  }
  function verifyLookup(no, code) {
    no = no.trim().toUpperCase(); code = code.trim().toUpperCase()
    if (S.retired.some(function (x) { return x.no === no && x.code === code })) return { s: 'CHANGED', rec: { issued: fmtY(D.today) } } /* PHAR-1710: the code was retired by an edit */
    var rec = D.verifyDb.filter(function (r) { return r.no === no })[0]
    if (!rec || rec.code !== code) return { s: 'NOT_FOUND' } /* wrong code looks exactly like unknown Rx */
    return { s: rec.status, rec: rec }
  }
  function verifyResult(r) {
    if (!r) return ''
    if (r.s === 'NOT_FOUND') return '<div class="vr bad"><strong>Not valid &ndash; not found</strong><p>No prescription matches this number and check code. Check for typing mistakes. Do not dispense without confirming with the doctor.</p></div>'
    if (r.s === 'CHANGED') return '<div class="vr bad"><strong>Not valid &ndash; changed</strong><p>This prescription was changed after it was issued (' + esc(r.rec.issued) + '). Do not rely on this copy.</p></div>'
    var rec = r.rec
    return '<div class="vr good"><strong>&#10003; Valid prescription</strong><p>Issued ' + esc(rec.issued) + ' by ' + esc(rec.doctor) + ' (BMDC ' + esc(rec.bmdc) + ') for ' + esc(rec.patient) + '.</p>' +
      (rec.newer ? '<div class="amber-note">A newer prescription for this patient exists (issued ' + esc(rec.newer) + ').</div>' : '') +
      '<ul class="vmeds">' + rec.meds.map(function (m) { return '<li>' + esc(m) + '</li>' }).join('') + '</ul>' +
      '<div class="note">Compare these medicines with the paper prescription. They must match exactly.</div></div>'
  }
  function runVerify(no, code) {
    S.vf = { rx: no, code: code, result: verifyLookup(no, code) }
    renderVerify()
  }

  /* ---------- patient view ---------- */
  function pBtn(rx) { return function (k, o) { return ' <button class="link" data-act="pDoc" data-rx="' + rx.id + '" data-k="' + k + '" data-id="' + o.id + '">View / print</button>' } }
  function renderPatient() {
    var rx0 = S.pv && (D.history[S.pvPid || 'p1'] || []).filter(function (r) { return r.id === S.pv })[0]
    withDig(S.pvDig === null ? !rx0 || rx0.bnd !== false : S.pvDig, renderPatient0)
  }
  var FU_BN = { days: 'দিন', weeks: 'সপ্তাহ', months: 'মাস' }
  function fuPatient(rx) {
    var f = rx.fuRec; if (!f) return rx.follow ? '<p><b>Follow-up:</b> ' + esc(rx.follow) + '</p>' : ''
    var due = f.date ? pd(f.date) : null
    return '<div class="pn-fu"><b>পুনরায় দেখা করবেন / Follow-up</b>' + (due ? '<div>' + bn(f.n) + ' ' + FU_BN[f.unit] + ' পরে (' + bnDate(due) + ') <small>after ' + f.n + ' ' + f.unit + ', ' + esc(fmtY(due)) + '</small></div>' : '') +
      (f.slotDate ? '<div>নির্ধারিত সময়: ' + bnDate(f.slotDate) + ', ' + bn(f.time) + ' <small>booked ' + esc(fmtY(f.slotDate)) + ', ' + esc(f.time) + '</small></div>' : '') + (f.note ? '<div>' + esc(f.note) + '</div>' : '') +
      (f.rem && due ? '<div class="muted small">রিমাইন্ডার এসএমএস: ' + bnDate(addDays(due, -f.remDays)) + ' <small>(SMS reminder ' + f.remDays + ' day' + (f.remDays === 1 ? '' : 's') + ' before)</small></div>' : '') + '</div>'
  }
  // D6: the patient sees the full submitted notes, nothing filtered (history, O/E, O/I, Dx). Clinical values keep English digits.
  function pNotes(rx) {
    var sn = rx.snap, secs = [], v = sn ? sn.vitals : null, vt = []
    if (sn) secs = sn.secs.slice()
    else {
      if (rx.cc && rx.cc.length) secs.push({ abbr: 'C/C', title: 'Chief complaints', items: rx.cc })
      if (rx.tests && rx.tests.length) secs.push({ abbr: 'Exam / Inv', title: 'Tests advised', items: rx.tests })
      if (rx.dx && rx.dx.length) secs.push({ abbr: 'Dx', title: 'Diagnosis', items: rx.dx.map(function (x) { return x.t + ' (' + DX_TYPES[x.type] + ')' }) })
    }
    if (v) { if (v.bp) vt.push('BP ' + esc(v.bp)); if (v.pulse) vt.push('Pulse ' + esc(v.pulse)); if (v.temp) vt.push('Temp ' + esc(v.temp) + '&deg;F'); if (v.weight) vt.push('Wt ' + esc(v.weight) + ' kg'); if (v.spo2) vt.push('SpO2 ' + esc(v.spo2) + '%') }
    var hasOE = secs.some(function (c) { return c.abbr === 'O/E' }), hasOI = secs.some(function (c) { return c.abbr === 'O/I' }), res = sn && sn.res ? sn.res : []
    if (vt.length && !hasOE) secs.push({ abbr: 'O/E', title: 'On examination', items: [] })
    if (res.length && !hasOI) secs.push({ abbr: 'O/I', title: 'On investigation (results)', items: [] })
    var rows = secs.map(function (c) {
      var b = c.items.map(esc).join('; ')
      if (c.abbr === 'O/E' && vt.length) b = vt.join(' &middot; ') + (b ? '<br>' + b : '')
      if (c.abbr === 'O/I' && res.length) b += (b ? '<br>' : '') + resTable(res)
      return b ? '<div class="pn-r"><b>' + esc(c.abbr) + '</b><span>' + b + '</span></div>' : ''
    }).join('')
    return rows ? '<div class="pnotes"><h4>Clinical notes</h4><p class="muted small">Everything your doctor wrote for this visit.</p>' + rows + '</div>' : ''
  }
  function patientRxBody(pid) {
    var list = (D.history[pid] || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1 }), body
    if (S.pv) {
      var rx = list.filter(function (r) { return r.id === S.pv })[0], code = codeFor(rx.no)
      body = (S.smsRx ? '' : '<button class="link" data-act="pBack">&larr; All prescriptions</button>') + '<h3>' + esc(rx.no) + '</h3><p class="muted">' + fmtY(rx.date) + ' &middot; ' + esc(docNameOf(rx)) + '</p>' +
        pvInfo(rx) + '<div class="pv-tools"><div class="seg" role="group" aria-label="Digits"><button class="' + (DIG ? 'on' : '') + '" data-act="pvDig" data-v="1">বাংলা ১২৩</button><button class="' + (DIG ? '' : 'on') + '" data-act="pvDig" data-v="0">123</button></div> <button class="btn sm ghost" data-act="pPdf">Download PDF</button>' + (S.smsRx ? '' : ' <button class="btn sm primary" data-act="shareOpen" data-id="' + rx.id + '">Share&hellip;</button>') + '</div>' + pNotes(rx) +
        '<ul class="pmeds">' + rx.lines.map(function (l) {
          if (l.stop) return '<li class="pstop"><b>বন্ধ করুন / STOP: ' + esc(l.name) + '</b>' + (l.reason ? '<span>' + esc(l.reason) + '</span>' : '') + '</li>'
          var m = medById(l.medId), x = l.x || {}
          var how = l.steps ? freqBn(Object.assign({ steps: l.steps, unit: l.unit, food: l.food, startMode: l.startDate ? 'date' : 'now', startDate: l.startDate }, x))
            : bn(l.pattern.replace(/\+/g, ' + ')) + srBn(x) + ' &middot; ' + (FOOD_BN[l.food] || 'যে কোনো সময়') + ' &middot; ' + (l.days === null ? 'চলবে' : bn(l.days) + ' দিন')
          return '<li><b>' + esc(m.brand + ' ' + m.strength) + '</b>' + (l.kind === 'CONT' ? ' <em class="pm-cont">চলবে / Continue</em>' : '') + '<small>' + esc(m.generic) + '</small><span>' + how + extrasBn(x) + '</span></li>'
        }).join('') + '</ul>' + ordBlock(rx.orders) + refBlock(rx, pBtn(rx)) + (rx.advice.length ? '<h4>পরামর্শ / Advice</h4><ul>' + rx.advice.map(function (a) { return '<li>' + esc(a) + '</li>' }).join('') + '</ul>' : '') +
        fuPatient(rx) + '<div class="qr-box">' + qrHtml(rx.no + code) + '<div class="chkcode">Check code: ' + code + '</div></div>'
    } else {
      body = (pid === 'p1' ? '<h3>My prescriptions</h3><p class="muted small">Everything your doctors submitted for you. Drafts are never shown.</p>' : '<h3>Prescriptions for ' + esc(D.patients[pid].name) + '</h3><button class="link" data-act="pTab" data-t="rx">&larr; All my prescriptions</button><p class="muted small">Animal patient &middot; owner ' + esc(D.patients[D.patients[pid].owner].name) + '</p>') + (list.length ? '' : '<div class="empty slim">None yet.</div>') + list.map(function (r) {
        return '<button class="pcard" data-act="pOpen" data-id="' + r.id + '"><b>' + esc(r.no) + '</b><span>' + fmtY(r.date) + ' &middot; ' + r.lines.length + ' medicines</span><small>' + esc(docNameOf(r)) + pcardExtra(r) + '</small></button>'
      }).join('')
    }
    return body
  }
  function renderPatient0() {
    var tabs = [['rx', 'Prescriptions'], ['find', 'Find a doctor'], ['animals', 'My animals'], ['appts', 'Appointments'], ['sms', 'SMS (simulated)']], body
    if (S.smsRx) body = smsLinkBody()
    else if (S.pvTab === 'sms') body = smsHtml()
    else if (S.pv || S.pvTab === 'rx') body = patientRxBody(S.pvPid || 'p1')
    else if (S.pvTab === 'find') body = findHtml()
    else if (S.pvTab === 'animals') body = animalsHtml()
    else body = custApptsHtml()
    $('#view').innerHTML = '<div class="page"><div class="page-h"><div><h1>Patient view</h1><p class="muted">Customer portal - Rahima Begum (mobile frame).</p></div></div>' +
      '<div class="phone"><div class="ph-bar">portal.pharmaz247.example</div><div class="ph-b"><nav class="pnav" aria-label="Portal">' + tabs.map(function (t) { return '<button class="pn' + (S.pvTab === t[0] ? ' on' : '') + '" data-act="pTab" data-t="' + t[0] + '">' + t[1] + '</button>' }).join('') + '</nav>' + body + '</div></div></div>'
  }

  /* ---------- prototype panel ---------- */
  function renderProto() {
    var el = $('#proto')
    if (!S.protoOpen) { el.innerHTML = '<button class="p-toggle" data-act="ptoggle">Prototype controls</button>'; return }
    el.innerHTML = '<div class="p-h"><strong>Prototype controls</strong><button class="icon-btn" data-act="ptoggle" aria-label="Collapse">&minus;</button></div><p class="muted small">Not part of the product.</p>' + docFieldset() +
      '<fieldset' + (S.doc === 'd1' ? '' : ' class="hid"') + '><legend>Scenario (Dr. Farhana)</legend>' + [['returning', 'Returning patient'], ['first', 'First visit'], ['family', 'Family member']].map(function (s) {
        return '<label><input type="radio" name="scen" data-act="scen" value="' + s[0] + '"' + (S.scenario === s[0] ? ' checked' : '') + '> ' + s[1] + '</label>'
      }).join('') + '</fieldset>' +
      protoClock() + '<fieldset><legend>Warning style</legend>' + [['inline', 'A. Inline card'], ['panel', 'B. Side panel'], ['popup', 'C. Pop-up on add']].map(function (s) {
        return '<label><input type="radio" name="ws" data-act="wstyle" value="' + s[0] + '"' + (S.warnStyle === s[0] ? ' checked' : '') + '> ' + s[1] + '</label>'
      }).join('') + '</fieldset><button class="btn sm ghost" data-act="reset">Reset demo data</button>'
  }

  /* ---------- suggestions engine ---------- */
  function sgItems(kind, key, q) {
    q = q.trim().toLowerCase()
    var out = [], dr = S.draft
    if (kind === 'med') {
      if (!q) return []
      D.meds.filter(function (m) { return (m.brand + ' ' + m.generic + ' ' + m.company).toLowerCase().indexOf(q) >= 0 })
        .sort(function (a, b) { return (a.brand.toLowerCase().indexOf(q) === 0 ? 0 : 1) - (b.brand.toLowerCase().indexOf(q) === 0 ? 0 : 1) }).slice(0, 7)
        .forEach(function (m) { out.push({ v: m.id, html: '<b>' + esc(m.brand) + '</b> ' + esc(m.strength) + ' <span class="muted">' + esc(m.form) + '</span><small>' + esc(m.generic) + ' &middot; ' + esc(m.company) + '</small>' }) })
      out.push({ v: q, free: true, html: 'Add &ldquo;' + esc(q) + '&rdquo; as free text<small>Not checked against previous prescriptions</small>' })
      return out
    }
    if (kind === 'test') {
      D.labTests.filter(function (t) { return t.toLowerCase().indexOf(q) >= 0 && !hasTest(t) }).slice(0, 8).forEach(function (t) { out.push({ v: t, html: esc(t) }) })
      if (q && !out.some(function (o) { return o.v.toLowerCase() === q })) out.push({ v: q, html: 'Add &ldquo;' + esc(q) + '&rdquo; as custom test' })
      return out
    }
    var have = (key === 'dx' ? dr.dx : dr.notes[key]).map(function (c) { return c.t.toLowerCase() })
    ;(S.saved[key] || []).map(function (s) { return { s: s, score: s.n + Math.max(0, 30 - s.d) / 3 } })
      .sort(function (a, b) { return b.score - a.score }).forEach(function (o) {
        if (have.indexOf(o.s.t.toLowerCase()) >= 0 || o.s.t.toLowerCase().indexOf(q) < 0) return
        var tag = !o.s.n ? 'saved' : o.s.d <= 7 ? 'recent' : o.s.n >= 10 ? 'frequent' : 'used before'
        out.push({ v: o.s.t, html: esc(o.s.t) + '<em class="tg ' + (tag === 'used before' ? 'plain' : '') + '">' + tag + '</em>' })
      })
    out = out.slice(0, 6)
    ;seedPhrases(key).concat(D.commonPhrases[key] || []).forEach(function (t) { if (out.length < 8 && have.indexOf(t.toLowerCase()) < 0 && t.toLowerCase().indexOf(q) >= 0) out.push({ v: t, html: esc(t) + '<em class="tg plain">common</em>' }) })
    if (q && !out.some(function (o) { return o.v.toLowerCase() === q })) {
      var V = q.charAt(0).toUpperCase() + q.slice(1), sec = secDef(key)
      out.push({ v: V, html: 'Add &ldquo;' + esc(q) + '&rdquo;<small>this prescription only</small>' })
      out.push({ v: V, save: true, html: '&#9734; Add &ldquo;' + esc(q) + '&rdquo; and save to my notes<small>suggested next time in ' + esc(sec ? sec.title : key) + '</small>' })
    }
    return out
  }
  function sgOpen(input) {
    var parts = input.getAttribute('data-sugg').split(':'), items = sgItems(parts[0], parts[1], input.value)
    var box = input.parentNode.querySelector('.sugg')
    $$('.sugg.open').forEach(function (b) { if (b !== box) b.classList.remove('open') })
    S.sg = { input: input, box: box, items: items, idx: 0, kind: parts[0], key: parts[1] }
    if (!items.length) { box.classList.remove('open'); return }
    box.innerHTML = items.map(function (it, i) { return '<div class="sugg-item' + (i === 0 ? ' on' : '') + '" role="option" data-i="' + i + '">' + it.html + '</div>' }).join('')
    box.classList.add('open')
  }
  function sgClose() { if (S.sg) { S.sg.box.classList.remove('open'); S.sg = null } }
  function sgMove(d) {
    var g = S.sg; if (!g || !g.items.length) return
    g.idx = (g.idx + d + g.items.length) % g.items.length
    $$('.sugg-item', g.box).forEach(function (e, i) { e.classList.toggle('on', i === g.idx) })
  }
  function sgPick(item) {
    var g = S.sg, dr = S.draft; if (!g || !item) return
    var kind = g.kind, key = g.key
    sgClose()
    if (kind === 'med') {
      if (item.free) { addLine(freeLine(item.v), true); renderRx(); renderBar() } else addMedicine(item.v)
      var inp = $('[data-fk="in.med"]'); if (inp) { inp.value = ''; inp.focus() }
      return
    }
    if (kind === 'test') { if (!hasTest(item.v)) dr.tests.push({ t: item.v }) }
    else if (key === 'dx') dr.dx.push({ t: item.v, type: dr.dxType })
    else dr.notes[key].push({ t: item.v })
    if (item.save && saveNote(key, item.v)) toast('Saved to your notes for ' + secDef(key).title)
    renderNotes(); if (key === 'dh') renderRx(); renderBar()
    var i2 = $('[data-fk="in.' + key + '"]'); if (i2) i2.focus()
  }
  function sgEnterRaw(input) {
    var v = input.value.trim(); if (!v) return
    var parts = input.getAttribute('data-sugg').split(':')
    S.sg = { input: input, box: input.parentNode.querySelector('.sugg'), items: [], idx: 0, kind: parts[0], key: parts[1] }
    sgPick(parts[0] === 'med' ? { v: v, free: true } : { v: v })
  }

  /* ---------- events ---------- */
  var A = {
    goto: function (e) {
      var v = e.getAttribute('data-v')
      if (v === 'consult' && !S.draft) return openFirst()
      S.view = v; render()
    },
    openAppt: function (e) { var s = +e.getAttribute('data-serial'); var a = D.appointments.filter(function (x) { return x.serial === s })[0]; openConsult(a.patientId, s) },
    viewDone: function (e) {
      var sr = +e.getAttribute('data-serial'), a = D.appointments.filter(function (x) { return x.serial === sr })[0]
      var rx = a && (D.history[a.patientId] || []).filter(function (r) { return r.serial === sr && isMine(r) })[0]
      if (!rx) return nyi('Completed visit summary')
      rxDrawer(rx.id)
    },
    nyi: function (e) { nyi(e.getAttribute('data-w')) },
    backdrop: function (e, ev) { if (ev.target === e) closeModal() },
    closeModal: closeModal,
    continue: function (e) { continueFrom(e.getAttribute('data-id')) },
    viewPrev: function () { viewPrev() },
    selectRx: function (e) { viewPrev(e.getAttribute('data-id')) },
    startNew: function () { S.draft.bannerOff = true; renderBanner() },
    undoContinue: undoContinue, startFresh: startFresh,
    secCollapse: function (e) { var c = cfg(e.getAttribute('data-sec')); c.collapsed = !c.collapsed; renderNotes() },
    secHide: function (e) { secRemove(e.getAttribute('data-sec')) },
    secRestore: function (e) { var id = e.getAttribute('data-sec'); cfg(id).hidden = false; S.msSel = id; renderNotes(); renderBar(); customiseModal(); toast('Restored "' + secDef(id).title + '"') },
    noteStar: function (e) {
      var sec = e.getAttribute('data-sec'), t = e.getAttribute('data-v'), title = secDef(sec).title
      if (isSaved(sec, t)) { S.saved[sec] = S.saved[sec].filter(function (s) { return s.t.toLowerCase() !== t.toLowerCase() }); toast('Removed from your ' + title + ' list') }
      else if (saveNote(sec, t)) toast('Saved to your ' + title + ' list - type to search it or pick it next time')
      renderNotes()
    },
    noteSaveTyped: function (e) {
      var sec = e.getAttribute('data-sec'), inp = $('[data-fk="in.' + sec + '"]'), v = inp ? inp.value.trim() : ''
      if (!v) { toast('Type something in ' + secDef(sec).title + ' first'); if (inp) inp.focus(); return }
      S.sg = { input: inp, box: inp.parentNode.querySelector('.sugg'), items: [], idx: 0, kind: 'note', key: sec }
      sgPick({ v: v.charAt(0).toUpperCase() + v.slice(1), save: true })
    },
    msSel: function (e) { S.msSel = e.getAttribute('data-sec'); customiseModal() },
    noteAdd: function () { var i = $('#msNewNote'); if (saveNote(S.msSel, i ? i.value : '')) { customiseModal(); var j = $('#msNewNote'); if (j) j.focus() } },
    noteDel: function (e) { S.saved[e.getAttribute('data-sec')].splice(+e.getAttribute('data-k'), 1); customiseModal() },
    customise: customiseModal,
    secVis: function (e) { cfg(e.getAttribute('data-sec')).hidden = !e.checked; renderNotes() },
    secUp: function (e) { moveSec(+e.getAttribute('data-i'), -1) },
    secDown: function (e) { moveSec(+e.getAttribute('data-i'), 1) },
    secReset: function () {
      S.sections = tplSections(S.tplCode)
      var at = S.sections.findIndex(function (c) { return c.id === 'tests' })
      S.customSecs.forEach(function (d, k) { S.sections.splice(at + k, 0, { id: d.id, hidden: false, collapsed: false }) }) /* own sections are kept */
      S.secOverride = {}; renderNotes(); renderBar(); customiseModal(); toast('Default sections, names and order restored - your own sections are kept')
    },
    secAdd: secAdd,
    secDel: function (e) { secDel(e.getAttribute('data-sec')) },
    chipDel: function (e) { var sec = e.getAttribute('data-sec'); S.draft.notes[sec].splice(+e.getAttribute('data-i'), 1); renderNotes(); if (sec === 'dh') { renderRx(); renderBar() } },
    testDel: function (e) { S.draft.tests.splice(+e.getAttribute('data-i'), 1); renderNotes(); renderBar() },
    testTpl: function (e) {
      var t = D.testTemplates.filter(function (x) { return x.id === e.getAttribute('data-id') })[0]
      t.tests.forEach(function (n) { if (!hasTest(n)) S.draft.tests.push({ t: n }) }); renderNotes(); renderBar()
    },
    dxType: function (e) { S.draft.dxType = e.getAttribute('data-t'); renderNotes() },
    dxCycle: function (e) { var x = S.draft.dx[+e.getAttribute('data-i')], k = Object.keys(DX_TYPES); x.type = k[(k.indexOf(x.type) + 1) % k.length]; renderNotes() },
    dxDel: function (e) { S.draft.dx.splice(+e.getAttribute('data-i'), 1); renderNotes() },
    openLib: function () { S.lib.form = null; libModal() },
    libCat: function (e) { S.lib.cat = e.getAttribute('data-c'); libModal() },
    libNew: function () { S.lib.form = { id: null, title: '', cat: S.lib.cat === 'all' ? 'other' : S.lib.cat, bn: '', en: '', attach: false, err: {} }; libModal() },
    libEdit: function (e) { var a = D.adviceLibrary.filter(function (x) { return x.id === e.getAttribute('data-id') })[0]; S.lib.form = { id: a.id, title: a.title, cat: a.cat || 'other', bn: a.bn, en: a.en, err: {} }; libModal() },
    libCancel: function () { S.lib.form = null; libModal() },
    libSave: libSave,
    libRemove: function (e) {
      var id = e.getAttribute('data-id'), a = D.adviceLibrary.filter(function (x) { return x.id === id })[0], used = S.draft.libAdvice.indexOf(id) >= 0
      if (!window.confirm('Delete "' + a.title + '" from your advice library?' + (used ? ' It is on this prescription and will be removed from it.' : ''))) return
      D.adviceLibrary.splice(D.adviceLibrary.indexOf(a), 1); S.draft.libAdvice = S.draft.libAdvice.filter(function (x) { return x !== id })
      renderNotes(); libModal(); toast('Deleted from the advice library')
    },
    libMove: function (e) {
      var list = libVisible(), i = list.map(function (a) { return a.id }).indexOf(e.getAttribute('data-id')), j = i + +e.getAttribute('data-d'); if (i < 0 || j < 0 || j >= list.length) return
      var x = D.adviceLibrary.indexOf(list[i]), y = D.adviceLibrary.indexOf(list[j]), t = D.adviceLibrary[x]; D.adviceLibrary[x] = D.adviceLibrary[y]; D.adviceLibrary[y] = t; libModal()
    },
    libToggle: function (e) {
      var id = e.getAttribute('data-id'), a = S.draft.libAdvice, i = a.indexOf(id)
      if (i < 0) a.push(id); else a.splice(i, 1); renderNotes()
    },
    libDel: function (e) { var a = S.draft.libAdvice; a.splice(a.indexOf(e.getAttribute('data-id')), 1); renderNotes() },
    pfApply: function () { var n = applyPrefill(S.draft, pat()); renderNotes(); renderRx(); renderBar(); toast(n ? n + ' pre-filled entries added back' : 'Everything is already pre-filled') },
    pfClear: function () { Object.keys(S.draft.notes).forEach(function (k) { S.draft.notes[k] = S.draft.notes[k].filter(function (x) { return !x.src }) }); renderNotes(); renderRx(); renderBar(); toast('Pre-filled entries cleared from this draft - the patient record is unchanged') },
    resAdd: function () { var r = resRows('')[0]; S.draft.res.push(r); renderNotes(); var i = $('[data-fk="r.' + r.id + '.name"]'); if (i) i.focus() },
    resDel: function (e) { S.draft.res = S.draft.res.filter(function (r) { return r.id !== e.getAttribute('data-id') }); renderNotes(); renderBar() },
    resFromTest: function (e) {
      var t = e.getAttribute('data-t'), prev = ownRxs()[0]
      if (S.draft.res.some(function (r) { return r.src === t })) return toast('A result for ' + t + ' is already entered')
      var rows = resRows(t, t, prev ? prev.no : ''); rows.forEach(function (r) { S.draft.res.push(r) }); renderNotes()
      var i = $('[data-fk="r.' + rows[0].id + '.value"]'); if (i) { i.scrollIntoView({ block: 'center' }); i.focus() }
    },
    bndSet: function (e) { S.draft.bnd = e.getAttribute('data-v') === '1'; previewModal() },
    bndDefault: function () { S.bndDefault = S.draft.bnd; previewModal(); toast('Your default: ' + (S.bndDefault ? 'Bangla digits' : 'English digits') + ' on the patient part') },
    printHist: function (e) { S.printHist = e.checked; previewModal() },
    pvDig: function (e) { S.pvDig = e.getAttribute('data-v') === '1'; renderPatient() },
    pPdf: function () { toast('Prototype: PDF download simulated - it has the same layout as the printed prescription') },
    fuMode: function (e) { S.draft.fu.unit = e.getAttribute('data-m'); S.draft.fu.slot = null; renderNotes() },
    fuBook: function () { S.slotDay = S.draft.fu.slot ? S.draft.fu.slot.date : null; fuSlotModal() },
    fuDay: function (e) { S.slotDay = e.getAttribute('data-d'); fuSlotModal() },
    fuPick: function (e) { S.draft.fu.slot = { date: e.getAttribute('data-d'), time: e.getAttribute('data-t') }; closeModal(); renderNotes(); toast('Follow-up slot booked: ' + fmtY(S.draft.fu.slot.date) + ', ' + S.draft.fu.slot.time) },
    fuUnbook: function () { S.draft.fu.slot = null; renderNotes(); toast('Booking cancelled') },
    fuRem: function (e) { S.draft.fu.rem = e.checked; renderNotes() },
    fuRemDays: function (e) { S.draft.fu.remDays = e.getAttribute('data-m'); renderNotes() },
    fuSms: fuSmsModal,
    fuTestSms: function () { toast('Prototype: test SMS sent to the doctor phone (simulated)') },
    openTpl: tplModal, saveTpl: saveTplModal, saveTplGo: saveTplGo,
    tplTab: function (e) { S.tplTab = e.getAttribute('data-t'); tplModal() },
    applyCond: function (e) { applyCondition(S.tpl.condition.filter(function (c) { return c.id === e.getAttribute('data-id') })[0]) },
    applyCombo: function (e) {
      var c = S.tpl.combos.filter(function (x) { return x.id === e.getAttribute('data-id') })[0]
      c.meds.forEach(function (m) { addLine(lineFrom(m.id, m)) })
      S.modal = null; $('#modalRoot').innerHTML = ''; renderRx(); renderBar(); drainPopups(); toast('Added ' + c.meds.length + ' medicines')
    },
    addPreset: function (e) {
      var p = S.tpl.presets.filter(function (x) { return x.id === e.getAttribute('data-id') })[0]
      if (e.getAttribute('data-close')) { S.modal = null; $('#modalRoot').innerHTML = '' }
      addMedicine(p.med.id, p.med)
    },
    // Quick add = the doctor's single-medicine presets: the line's full dose settings, one click to re-add.
    presetSave: function (e) {
      var p = presetFromLine(lineById(e.getAttribute('data-id')))
      if (S.tpl.presets.some(function (x) { return x.name === p.name })) { toast('Already in quick add'); return }
      if (S.tpl.presets.length >= QA_MAX) { toast('Quick add is full (' + QA_MAX + ') - remove one under Manage'); return }
      p.id = 'p' + (S.seq++); S.tpl.presets.push(p)
      renderRx(); toast('Added to quick add: ' + p.name)
    },
    presetDel: function (e) {
      var id = e.getAttribute('data-id')
      S.tpl.presets = S.tpl.presets.filter(function (p) { return p.id !== id })
      if (S.qaEdit === id) S.qaEdit = null
      renderRx(); if (S.modal && S.modal.title === 'Manage quick add') qaRender()
      toast('Removed from quick add')
    },
    qaManage: function () { qaManage() },
    qaNew: function () { S.qaEdit = 'new'; S.qaLine = lineFrom(D.meds[0].id); qaRender() },
    qaEdit: function (e) {
      var p = S.tpl.presets.filter(function (x) { return x.id === e.getAttribute('data-id') })[0]
      S.qaEdit = p.id; S.qaLine = lineFrom(p.med.id, p.med); qaRender()
    },
    qaCancel: function () { S.qaEdit = null; qaRender() },
    qaSave: qaSave,
    qaDel: function (e) { A.presetDel(e) },
    qaMove: function (e) { qaMove(e.getAttribute('data-id'), +e.getAttribute('data-d')) },
    lineUp: function (e) { moveLine(e.getAttribute('data-id'), -1) },
    lineDown: function (e) { moveLine(e.getAttribute('data-id'), 1) },
    lineCollapse: function (e) { var l = lineById(e.getAttribute('data-id')); l.collapsed = !l.collapsed; replaceLine(l) },
    removeLine: function (e) {
      var id = e.getAttribute('data-id'); S.draft.lines.splice(lineIdx(id), 1)
      S.popupQ = S.popupQ.filter(function (x) { return x !== id })
      var inModal = S.modal; if (inModal) { S.modal = null; $('#modalRoot').innerHTML = '' }
      renderRx(); renderBar(); drainPopups()
    },
    ack: function (e) {
      lineById(e.getAttribute('data-id')).ack = true
      if (S.modal) { S.modal = null; $('#modalRoot').innerHTML = '' }
      renderRx(); renderBar(); drainPopups()
    },
    unack: function (e) { lineById(e.getAttribute('data-id')).ack = false; renderRx(); renderBar() },
    editDose: function (e) {
      var l = lineById(e.getAttribute('data-id')); l.collapsed = false
      if (S.modal) { S.modal = null; $('#modalRoot').innerHTML = '' }
      var s0 = stepsOf(l)[0]
      renderRx(); var t = $('[data-fk="' + l.id + (stepped(l) ? '.s0' : '') + '.' + (s0.mode === 'pattern' ? 'slot0' : s0.mode === 'interval' ? 'intervalH' : 'prnMax') + '"]')
      if (t) { t.focus(); flashLine(l.id) }
    },
    openPopup: function (e) { var l = lineById(e.getAttribute('data-id')); showWarnPopup(l) },
    focusWarn: function (e) {
      var id = e.getAttribute('data-id'), t = $(S.warnStyle === 'panel' ? '#mc-' + id : '#lw-' + id)
      if (t) { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); t.classList.add('flash') }
    },
    stopOpen: stopModal, stopAdd: stopAdd, cpOpen: cpModal,
    stopPick: function (e) { var i = $('#stopName'); i.value = e.getAttribute('data-v'); $('#stopErr').textContent = ''; i.focus() },
    cpAdd: function (e) {
      var rx = (D.history[S.pid] || []).filter(function (r) { return r.id === e.getAttribute('data-rx') })[0], l = lineFromHist(rx.lines[+e.getAttribute('data-k')], rx)
      l.kind = 'CONT'; l.collapsed = false; addLine(l, true); renderRx(); renderBar(); cpModal(); toast('Continued: ' + lineName(l) + ' - edit it on the line if needed')
    },
    allergyAck: function (e) {
      var l = lineById(e.getAttribute('data-id'))
      if (!l.allergyOvr.trim()) { toast('Enter an override reason to keep this medicine'); var i = $('[data-fk="' + l.id + '.allergyOvr"]'); if (i) i.focus(); return }
      l.allergyAck = true
      if (S.modal) { S.modal = null; $('#modalRoot').innerHTML = '' }
      renderRx(); renderBar(); drainPopups()
    },
    allergyUndo: function (e) { lineById(e.getAttribute('data-id')).allergyAck = false; renderRx(); renderBar() },
    condAdd: function (e) { var l = lineById(e.getAttribute('data-id')); l.cond.push({ c: '', d: '' }); replaceLine(l) },
    condDel: function (e) { var l = lineById(e.getAttribute('data-id')); l.cond.splice(+e.getAttribute('data-k'), 1); replaceLine(l) },
    condClear: function (e) { var l = lineById(e.getAttribute('data-id')); l.cond = []; replaceLine(l) },
    focusWeight: function () { var i = $('[data-bind="vitals.weight"]'); if (i) { i.scrollIntoView({ block: 'center', behavior: 'smooth' }); i.focus() } },
    stepAdd: function (e) { stepAdd(lineById(e.getAttribute('data-id'))) },
    stepDel: function (e) { stepDel(lineById(e.getAttribute('data-id')), +e.getAttribute('data-k')) },
    taper: function (e) { taperModal(e.getAttribute('data-id')) },
    taperApply: taperApply,
    instrPick: function (e) { instrPush(e.getAttribute('data-id'), e.getAttribute('data-v')) },
    instrAdd: function (e) { var id = e.getAttribute('data-id'), i = $('#ii-' + id); instrPush(id, i ? i.value : '') },
    instrDel: function (e) { var id = e.getAttribute('data-id'); instrOwner(id).instrs.splice(+e.getAttribute('data-k'), 1); instrRefresh(id) },
    instrSave: function (e) {
      var id = e.getAttribute('data-id'), i = $('#ii-' + id), t = i ? i.value.trim() : ''
      if (!t) return toast('Type an instruction in the box first')
      if (S.instr.indexOf(t) >= 0) return toast('Already in your saved formats')
      S.instr.unshift(t); instrPush(id, t)
      if (id !== 'qa') renderRx() /* refresh the saved-format suggestions on every line */
      toast('Saved - it will be suggested next time')
    },
    saveDraft: function () { var d = new Date(); S.savedAt = pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2); renderBar(); toast('Draft saved') },
    preview: previewModal, complete: function () {
      if (medOn() ? (!S.draft.lines.length && !hasExtras(S.draft)) : !hasContent()) return toast(medOn() ? 'Add at least one medicine or order to complete' : 'Add at least one note, order or advice to complete')
      var errs = validateRx()
      if (errs.length) { S.showErr = true; if (S.modal) { S.modal = null; $('#modalRoot').innerHTML = '' } renderRx(); renderNotes(); weightErrSync(); toast(errs[0] + (errs.length > 1 ? ' (+' + (errs.length - 1) + ' more)' : '')); var f1 = $('.fld-err, input.err'); if (f1) f1.scrollIntoView({ block: 'center', behavior: 'smooth' }); return }
      S.showErr = false; completeModal()
    },
    confirmComplete: confirmComplete,
    /* PHAR-1719 / PHAR-1720 */
    ordOpen: ordOpen,
    ordTab: function (e) { S.ordTab = e.getAttribute('data-t'); ordOpen() },
    ordPick: function (e) {
      var m = (e.getAttribute('data-src') === 'mine' ? S.ordMine : D.orderSuggest.common)[+e.getAttribute('data-i')]
      ordAdd(m); toast('Added ' + OT[m.type].en.toLowerCase() + ' order - edit the text on the card if needed')
    },
    ordBlank: function (e) { closeModal(); ordAdd(null, e.getAttribute('data-t')) },
    ordUnsave: function (e) { S.ordMine.splice(+e.getAttribute('data-i'), 1); ordOpen() },
    ordStar: function (e) {
      var o = xFind('ord', e.getAttribute('data-id')); if (!o.en.trim()) return toast('Type the English text first')
      var i = -1; S.ordMine.forEach(function (m, j) { if (m.type === o.type && m.en.toLowerCase() === o.en.trim().toLowerCase()) i = j })
      if (i >= 0) { S.ordMine.splice(i, 1); toast('Removed from your list') } else { S.ordMine.push({ type: o.type, en: o.en.trim(), bn: o.bn.trim(), d: o.d.trim() }); toast('Saved - it will be suggested next time') }
      ordsRefresh()
    },
    xAdd: function (e) {
      var k = e.getAttribute('data-k'), dr = S.draft, o
      if (k === 'ref') dr.refs.push(o = refNew()); else if (k === 'adm') dr.adm = o = admNew(); else dr.cert = o = certNew()
      ordsRefresh(); var c = $('#' + k + '-' + o.id); if (c) { c.classList.add('flash'); c.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }
    },
    xDel: function (e) {
      var k = e.getAttribute('data-k'), id = e.getAttribute('data-id'), dr = S.draft
      if (k === 'ord') dr.orders = dr.orders.filter(function (o) { return o.id !== id }); else if (k === 'ref') dr.refs = dr.refs.filter(function (o) { return o.id !== id }); else dr[k] = null
      ordsRefresh()
    },
    xPrint: function (e) { var k = e.getAttribute('data-k'), o = xFind(k, e.getAttribute('data-id')); docModal(k, o, { p: pat(), no: S.draft.rxNo, date: D.today, dx: dxText() }) },
    pDoc: function (e) {
      var rx = (D.history.p1 || []).filter(function (r) { return r.id === e.getAttribute('data-rx') })[0], k = e.getAttribute('data-k')
      var o = k === 'ref' ? rx.refs.filter(function (r) { return r.id === e.getAttribute('data-id') })[0] : rx[k]
      docModal(k, o, { p: D.patients.p1, no: rx.no, date: rx.date, dx: o.dxText })
    },
    printRx: function () { document.body.classList.add('printing'); window.print(); document.body.classList.remove('printing') },
    backToAppts: function () { closeModal(); S.view = 'appointments'; S.draft = null; render() },
    verifyThis: function () { closeModal(); S.vf = { rx: S.lastIssued.no, code: S.lastIssued.code, result: null }; S.view = 'verify'; render() },
    vGo: function () { runVerify($('#vRx').value, $('#vCode').value) },
    vScan: function () { toast('Prototype: camera scan simulated'); runVerify('RX-A12345-0036', 'ZP4M-8XQD') },
    vDemo: function (e) {
      var k = e.getAttribute('data-k')
      var m = { valid: ['RX-A12345-0036', 'ZP4M-8XQD'], notfound: ['RX-A12345-9999', 'AAAA-1111'], changed: ['RX-A12345-0029', 'H2D9-WLQ5'], old: ['RX-A12345-0042', 'K7QF-3MZA'] }
      var p = k === 'latest' ? [S.lastIssued.no, S.lastIssued.code] : m[k]
      var rec = D.verifyDb.filter(function (r) { return r.no === 'RX-A12345-0042' })[0]
      if (k === 'old' && !rec.newer) rec.newer = '21 Oct 2026' /* demo: pretend today's v3 exists */
      runVerify(p[0], p[1])
    },
    pOpen: function (e) { S.pv = e.getAttribute('data-id'); S.pvDig = null; renderPatient() },
    pBack: function () { S.pv = null; renderPatient() },
    ptoggle: function () { S.protoOpen = !S.protoOpen; renderProto() },
    scen: function (e) { openForScenario(e.value) },
    wstyle: function (e) {
      S.warnStyle = e.value; S.popupQ = []; document.body.setAttribute('data-ws', S.warnStyle)
      if (S.view === 'consult') { renderRx(); renderBar() }
      toast('Warning style: ' + e.value)
    },
    reset: function () { window.location.reload() }
  }
  /* ================= WAVE 4: doctor, speciality, practitioner type, block library, animals (PHAR-1701..1708) ================= */
  var BL = {}, SPEC = {}, DOCS = {}
  D.specCat.forEach(function (s) { SPEC[s.code] = s })
  D.doctors.forEach(function (d) { DOCS[d.id] = d })
  function parseField(s) {
    var m = /^([^:]+):([a-z]+)(?:\((.*)\))?$/.exec(s), label = m ? m[1] : s, t = m ? m[2] : 't', arg = m && m[3] ? m[3] : ''
    var pl = label.replace(/\s*\(.*?\)/g, '')
    var key = pl.toLowerCase().replace(/[^a-z0-9]+(.)?/g, function (x, c) { return c ? c.toUpperCase() : '' })
    return { k: key, l: label, pl: pl, t: t, u: t === 'n' ? arg : '', o: t === 's' || t === 'm' ? arg.split(',') : [], fn: t === 'x' ? arg : '' }
  }
  D.blockLib.forEach(function (b) {
    b.title = D.blockTitles[b.id] || b.id.charAt(0).toUpperCase() + b.id.slice(1).replace(/([A-Z])/g, ' $1').toLowerCase()
    b.fields = b.f.split(';').map(parseField); BL[b.id] = b
  })
  var BLOCK_DEFS = D.blockLib.map(function (b) { return { id: 'b:' + b.id, title: b.title, abbr: b.title, kind: 'block', bid: b.id } })

  function doc() { return DOCS[S.doc] }
  function specName(c) { return SPEC[c] ? SPEC[c].name : c }
  function typeOf(d) { return (SPEC[d.spec] || SPEC.OTHER).type }
  function ptype(d) { return D.practTypes[typeOf(d || doc())] }
  function specLine(d) { return [specName(d.spec)].concat((d.sec || []).map(specName)).join(', ') }
  function regShort(d) { return (d.regBody === 'BMDC' || d.regBody === 'BVC' ? d.regBody : D.regBodies[d.regBody] || 'Reg.') + ' ' + d.bmdc }
  function regLine(d) { return ptype(d).regLabel + ' ' + d.bmdc }
  function presOn() { return !!doc().presOn }
  function medOn() { return !!doc().presOn && !!doc().medOn }
  function isMine(r) { return (r.by || (r.byMe ? 'd1' : '')) === S.doc }
  function docOf(r) { return DOCS[r.by || (r.byMe ? 'd1' : '')] }
  function docNameOf(r) { var d = docOf(r); return d ? d.name : 'Dr. Imran Hossain' }
  function initials(n) { return n.replace(/^Dr\.\s*/, '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase() }).join('') }

  /* ---------- animals (PHAR-1707) ---------- */
  function animalOf(p) { p = p || pat(); return p && p.animalId ? D.animals.filter(function (a) { return a.id === p.animalId })[0] : null }
  function isAnimal(p) { return !!animalOf(p) }
  function ownerOf(p) { p = p || pat(); return p && p.owner ? D.patients[p.owner] : null }
  function animalAge(a) {
    var days = Math.floor((TODAY.getTime() - pd(a.ageOn).getTime()) / 864e5)
    var t = a.ageValue * ({ DAYS: 1, WEEKS: 7, MONTHS: 30.4, YEARS: 365.25 }[a.ageUnit]) + Math.max(0, days)
    return t < 28 ? Math.round(t) + ' days' : t < 120 ? Math.round(t / 7) + ' weeks' : t < 730 ? Math.round(t / 30.4) + ' months' : Math.floor(t / 365.25) + ' y'
  }
  function spName(a) { return a.species === 'OTHER' ? (a.speciesOther || 'Other') : D.species[a.species] }
  function animalDesc(a) { return spName(a) + (a.breed ? ' (' + a.breed + ')' : '') + ', ' + a.sex + ', ' + animalAge(a) }
  function animalLine(a, w) { return a.name + ' — ' + animalDesc(a) + (num(w) ? ', ' + num(w) + ' kg' : '') }
  function patientIdForAnimal(a) {
    var ids = Object.keys(D.patients), i
    for (i = 0; i < ids.length; i++) if (D.patients[ids[i]].animalId === a.id) return ids[i]
    var id = 'v_' + a.id
    D.patients[id] = { id: id, animalId: a.id, owner: a.owner, name: a.name, age: animalAge(a), sex: a.sex === 'F' ? 'Female' : 'Male', phone: '', relation: null, allergies: [], vitals: { bp: '', pulse: '', temp: '', weight: '', height: '', spo2: '', rr: '' }, returning: false, chronic: [], last: null }
    D.history[id] = D.history[id] || []
    return id
  }
  function myAnimals() { return D.animals.filter(function (a) { return a.owner === 'p1' && !a.deleted }) }
  function ownerTag(p) { var o = isAnimal(p) ? ownerOf(p) : null; return o ? ' &middot; Owner: ' + esc(o.name) : '' }

  /* ---------- derived block fields (never typed; mock formulas, NOT clinically verified) ---------- */
  var DX = {
    edd: function (v) { return v.lmp ? fmtY(addDays(pd(v.lmp), 280)) : '-' },
    ga: function (v) { if (!v.lmp) return '-'; var d = Math.floor((TODAY.getTime() - pd(v.lmp).getTime()) / 864e5); return d < 0 ? 'LMP is in the future' : Math.floor(d / 7) + ' w ' + (d % 7) + ' d' },
    bmi: function (v) { var w = num(S.draft.vitals.weight), h = (num(v.lengthHeight) || num(S.draft.vitals.height)) / 100; return w && h ? (w / (h * h)).toFixed(1) + ' kg/m2' : '-' },
    who: function () { return '' },
    egfr: function (v) {
      var cr = num(v.creatinine), p = pat(), a = /y/.test(p.age) ? parseInt(p.age, 10) : 0
      if (!cr || !a) return '-'
      var e = 175 * Math.pow(cr, -1.154) * Math.pow(a, -0.203) * (p.sex === 'Female' ? 0.742 : 1)
      return Math.round(e) + ' mL/min/1.73 m2, ' + (e >= 90 ? 'G1' : e >= 60 ? 'G2' : e >= 45 ? 'G3a' : e >= 30 ? 'G3b' : e >= 15 ? 'G4' : 'G5')
    },
    ratio: function (v) { return num(v.fev1) && num(v.fvc) ? Math.round(num(v.fev1) / num(v.fvc) * 100) + '%' : '-' },
    cp: function (v) {
      var b = num(v.bilirubin), al = num(v.albumin), inr = num(v.inr)
      if (!b || !al || !inr) return '-'
      var s = (b < 2 ? 1 : b <= 3 ? 2 : 3) + (al > 3.5 ? 1 : al >= 2.8 ? 2 : 3) + (inr < 1.7 ? 1 : inr <= 2.3 ? 2 : 3) + ({ No: 1, Mild: 2, Moderate: 3, Tense: 3 }[v.ascites] || 1) + 1
      return s + ' points, class ' + (s <= 6 ? 'A' : s <= 9 ? 'B' : 'C') + ' (encephalopathy assumed none)'
    },
    pod: function (v) { if (!v.procedureDate) return '-'; var d = Math.floor((TODAY.getTime() - pd(v.procedureDate).getTime()) / 864e5); return d < 0 ? 'planned' : 'POD ' + d },
    bsa: function () { var w = num(S.draft.vitals.weight), h = num(S.draft.vitals.height); return w && h ? Math.sqrt(w * h / 3600).toFixed(2) + ' m2' : '-' },
    das28: function (v) {
      if (!num(v.esr) || !num(v.patientGlobalHealth)) return '-'
      var x = 0.56 * Math.sqrt(num(v.tenderJoints)) + 0.28 * Math.sqrt(num(v.swollenJoints)) + 0.70 * Math.log(num(v.esr)) + 0.014 * num(v.patientGlobalHealth)
      return x.toFixed(1) + (x < 2.6 ? ' remission' : x < 3.2 ? ' low activity' : x <= 5.1 ? ' moderate activity' : ' high activity')
    },
    abi: function (v) { return num(v.anklePressure) && num(v.brachialPressure) ? (num(v.anklePressure) / num(v.brachialPressure)).toFixed(2) : '-' },
    poly: function () { var n = S.draft.lines.filter(function (l) { return !isStop(l) }).length; return n ? n + ' medicine' + (n > 1 ? 's' : '') + (n >= 5 ? ' - polypharmacy' : '') : '-' },
    vnorm: function () { var a = animalOf(), r = a && D.vetNorm[a.species]; return r ? 'Temp ' + r[0] + ' F, pulse ' + r[1] + '/min, resp ' + r[2] + '/min (' + spName(a).toLowerCase() + ')' : 'Not available for this species' },
    calving: function (v) { return v.aiServiceDate ? fmtY(addDays(pd(v.aiServiceDate), 283)) : '-' }
  }
  function derived(def, f) { return (DX[f.fn] || function () { return '-' })(bvals(def.id), def.id) }
  function bvals(bid) { var b = S.draft.blocks; return b[bid] = b[bid] || {} }

  /* ---------- tooth chart (dental block) ---------- */
  var TOOTH_C = [['caries', 'Caries'], ['missing', 'Missing'], ['filled', 'Filled'], ['rct', 'RCT'], ['crown', 'Crown']]
  var TOOTH_AB = { caries: 'C', missing: 'X', filled: 'F', rct: 'RCT', crown: 'Cr' }
  var UP = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28], LO = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
  function toothParts(t) {
    var p = (t.c || []).map(function (c) { return TOOTH_C.filter(function (x) { return x[0] === c })[0][1] })
    if (t.mob) p.push('mobility ' + t.mob)
    if (t.proc) p.push('procedure: ' + t.proc)
    return p
  }
  function toothText(v) { var T = v.teeth || {}; return Object.keys(T).sort().map(function (n) { var p = toothParts(T[n]); return p.length ? n + ' ' + p.join(', ') : '' }).filter(Boolean).join('; ') }
  function toothHtml(v) {
    var T = v.teeth || {}, sel = S.tooth
    function row(a) {
      return '<div class="trow">' + a.map(function (n) {
        var t = T[n], ab = t ? (t.c || []).map(function (c) { return TOOTH_AB[c] }).join('') : '', on = t && toothParts(t).length
        return '<button type="button" class="tooth' + (on ? ' has' : '') + (sel === n ? ' sel' : '') + '" data-act="toothSel" data-t="' + n + '" aria-label="Tooth ' + n + '">' + n + '<small>' + esc(ab) + '</small></button>'
      }).join('') + '</div>'
    }
    var st = sel ? (T[sel] || { c: [], mob: '', proc: '' }) : null
    var pan = sel ? '<div class="tpanel"><b>Tooth ' + sel + '</b>' + TOOTH_C.map(function (c) {
      return '<label class="mchk"><input type="checkbox" data-th="' + sel + '" data-thf="c" data-thv="' + c[0] + '" data-fk="th.' + sel + '.' + c[0] + '"' + (st.c.indexOf(c[0]) >= 0 ? ' checked' : '') + '> ' + c[1] + '</label>'
    }).join('') + '<label class="mchk">Mobility <select data-th="' + sel + '" data-thf="mob" data-fk="th.' + sel + '.mob">' + opts([['', '-'], ['I', 'I'], ['II', 'II'], ['III', 'III']], st.mob) + '</select></label>' +
      '<input class="txt" data-th="' + sel + '" data-thf="proc" data-fk="th.' + sel + '.proc" placeholder="Procedure on this tooth" value="' + esc(st.proc) + '"></div>'
      : '<p class="muted small">Click a tooth (FDI number) to record caries, missing, filled, RCT, crown, mobility and the procedure.</p>'
    return '<div class="chart"><div class="muted small">Upper right &middot; upper left</div>' + row(UP) + row(LO) + '<div class="muted small">Lower right &middot; lower left</div>' + pan + '</div>'
  }
  function toothChange(el, live) {
    var n = el.getAttribute('data-th'), f = el.getAttribute('data-thf'), v = bvals('dental'), T = v.teeth = v.teeth || {}, t = T[n] = T[n] || { c: [], mob: '', proc: '' }
    if (f === 'c') { var c = el.getAttribute('data-thv'), i = t.c.indexOf(c); if (el.checked && i < 0) t.c.push(c); if (!el.checked && i >= 0) t.c.splice(i, 1) }
    else t[f] = el.value
    if (!toothParts(t).length) delete T[n]
    blockCountSync('dental')
    if (!live) blockRefresh('dental')
  }

  /* ---------- food safety (withdrawal) table ---------- */
  function wdMap() { var v = bvals('foodSafety'); return v.wd = v.wd || {} }
  function wdDates() {
    var W = wdMap(), out = { meat: 0, milk: 0, eggs: 0 }
    S.draft.lines.forEach(function (l) {
      if (isStop(l) || !W[l.id]) return
      ;['meat', 'milk', 'eggs'].forEach(function (t) { if (num(W[l.id][t])) out[t] = Math.max(out[t], courseDays(l) + num(W[l.id][t])) })
    })
    return out
  }
  function wdText() {
    var m = wdDates(), p = []
    ;[['milk', 'Do not sell milk'], ['meat', 'Do not slaughter or sell meat'], ['eggs', 'Do not sell eggs']].forEach(function (x) { if (m[x[0]]) p.push(x[1] + ' before ' + fmtY(addDays(TODAY, m[x[0]]))) })
    return p.join('; ')
  }
  function wdItems() {
    var W = wdMap()
    return S.draft.lines.filter(function (l) { return !isStop(l) && W[l.id] && (num(W[l.id].meat) || num(W[l.id].milk) || num(W[l.id].eggs)) }).map(function (l) {
      var w = W[l.id]; return lineName(l) + ': ' + ['meat', 'milk', 'eggs'].filter(function (t) { return num(w[t]) }).map(function (t) { return t + ' ' + num(w[t]) + ' d' }).join(', ')
    }).join('; ')
  }
  function wdHtml() {
    var W = wdMap(), ls = S.draft.lines.filter(function (l) { return !isStop(l) })
    if (!ls.length) return '<p class="muted small">Add medicines first. Each medicine line needs its withdrawal period (days) for meat, milk and eggs; the safe-to-sell dates are derived.</p>'
    return '<table class="mini wd"><thead><tr><th>Medicine</th><th>Meat (d)</th><th>Milk (d)</th><th>Eggs (d)</th></tr></thead><tbody>' + ls.map(function (l) {
      return '<tr><td>' + esc(lineName(l)) + '</td>' + ['meat', 'milk', 'eggs'].map(function (t) {
        return '<td><input class="txt wd-in" inputmode="numeric" data-wd="' + l.id + '" data-wt="' + t + '" data-fk="wd.' + l.id + '.' + t + '" value="' + esc((W[l.id] || {})[t] || '') + '" aria-label="' + t + ' withdrawal days"></td>'
      }).join('') + '</tr>'
    }).join('') + '</tbody></table><div class="wd-out" id="wdOut">' + (esc(wdText()) || 'No withdrawal period entered yet') + '</div>'
  }
  function wdChange(el) {
    var W = wdMap(), id = el.getAttribute('data-wd'); (W[id] = W[id] || {})[el.getAttribute('data-wt')] = el.value
    var o = $('#wdOut'); if (o) o.textContent = wdText() || 'No withdrawal period entered yet'
    blockCountSync('foodSafety')
  }

  /* ---------- block form rendering, print text, counts ---------- */
  function bat(b, k) { return 'data-bk="' + b + '" data-bf="' + k + '" data-fk="b.' + b + '.' + k + '"' }
  function fieldHtml(def, f, v) {
    var b = def.id, k = f.k, lab = '<span>' + esc(f.l) + '</span>', t = f.t
    if (t === 'n') return '<label class="bf">' + lab + '<span class="vin"><input class="txt" inputmode="decimal" ' + bat(b, k) + ' value="' + esc(v[k]) + '">' + (f.u ? '<em>' + esc(f.u) + '</em>' : '') + '</span></label>'
    if (t === 'd') return '<label class="bf">' + lab + '<input class="txt" type="date" ' + bat(b, k) + ' value="' + esc(v[k]) + '"></label>'
    if (t === 's') return '<label class="bf">' + lab + '<select ' + bat(b, k) + '>' + opts([['', '-']].concat(f.o.map(function (o) { return [o, o] })), v[k] || '') + '</select></label>'
    if (t === 'a') return '<label class="bf wide">' + lab + '<textarea class="txt" rows="2" ' + bat(b, k) + '>' + esc(v[k]) + '</textarea></label>'
    if (t === 'm') return '<fieldset class="bf wide mm"><legend>' + esc(f.l) + '</legend>' + f.o.map(function (o) {
      return '<label class="mchk"><input type="checkbox" data-bk="' + b + '" data-bf="' + k + '" data-bv="' + esc(o) + '" data-fk="b.' + b + '.' + k + '.' + esc(o) + '"' + ((v[k] || []).indexOf(o) >= 0 ? ' checked' : '') + '> ' + esc(o) + '</label>'
    }).join('') + '</fieldset>'
    if (t === 'rl') return '<div class="bf">' + lab + '<span class="rl"><input class="txt" placeholder="R" aria-label="' + esc(f.pl) + ' right" ' + bat(b, k + 'R') + ' value="' + esc(v[k + 'R']) + '"><input class="txt" placeholder="L" aria-label="' + esc(f.pl) + ' left" ' + bat(b, k + 'L') + ' value="' + esc(v[k + 'L']) + '"></span></div>'
    if (t === 'x') return '<div class="bf bx' + (f.fn === 'who' || f.fn === 'cp' || f.fn === 'egfr' || f.fn === 'vnorm' || f.fn === 'das28' || f.fn === 'poly' ? ' wide' : '') + '">' + lab + '<b data-dv="' + b + '.' + k + '">' + (f.fn === 'who' ? 'Calculated by the server from WHO growth charts (not simulated here)' : esc(derived(def, f))) + '</b></div>'
    if (t === 'v') { var w = num(S.draft.vitals.weight); return '<div class="bf bx">' + lab + '<b data-bw="1">' + (w ? esc(S.draft.vitals.weight) + ' kg' : 'not entered') + '</b><small>set in the header</small></div>' }
    if (t === 'an') { var a = animalOf(); return '<div class="bf bx wide">' + lab + '<b>' + (a ? esc(animalLine(a)) : '-') + '</b>' + (a && a.features.length ? '<small>' + esc(a.features.join(', ')) + '</small>' : '') + '</div>' }
    if (t === 'tt') return '<div class="bf wide">' + lab + toothHtml(v) + '</div>'
    if (t === 'wd') return '<div class="bf wide">' + lab + wdHtml() + '</div>'
    return '<label class="bf">' + lab + '<input class="txt" ' + bat(b, k) + ' value="' + esc(v[k]) + '"></label>'
  }
  function blockHtml(bid) {
    var def = BL[bid], v = bvals(bid)
    return '<div class="blk">' + def.fields.map(function (f) { return fieldHtml(def, f, v) }).join('') + '</div>'
  }
  function fieldText(def, f, v) {
    var k = f.k, t = f.t, s
    if (t === 't' || t === 's' || t === 'a') return String(v[k] || '').trim()
    if (t === 'd') return v[k] ? fmtY(v[k]) : ''
    if (t === 'n') return String(v[k] || '').trim() ? String(v[k]).trim() + (f.u ? ' ' + f.u : '') : ''
    if (t === 'm') return (v[k] || []).join(', ')
    if (t === 'rl') return v[k + 'R'] || v[k + 'L'] ? 'R ' + (v[k + 'R'] || '-') + ' / L ' + (v[k + 'L'] || '-') : ''
    if (t === 'x') { s = derived(def, f); return s === '-' ? '' : s }
    if (t === 'tt') return toothText(v)
    if (t === 'wd') return wdItems()
    return ''
  }
  function blockItems(bid) {
    var def = BL[bid], v = bvals(bid), out = []
    def.fields.forEach(function (f) {
      if (bid === 'eye' && f.k === 'refraction') return
      var s = fieldText(def, f, v); if (s) out.push(f.pl + ': ' + s)
    })
    return out
  }
  function blockCount(bid) {
    var def = BL[bid], v = bvals(bid)
    return def.fields.filter(function (f) { return f.t !== 'x' && f.t !== 'v' && f.t !== 'an' && fieldText(def, f, v) }).length
  }
  function eyeGlasses() {
    var v = bvals('eye')
    if (!v.refractionR && !v.refractionL) return ''
    return '<table class="gl"><caption>Glasses prescription (sph / cyl / axis / add)</caption><tr><th>R</th><td>' + esc(v.refractionR || '-') + '</td></tr><tr><th>L</th><td>' + esc(v.refractionL || '-') + '</td></tr>' + (v.pd ? '<tr><th>PD</th><td>' + esc(v.pd) + ' mm</td></tr>' : '') + '</table>'
  }
  function blockPrintHtml(bid) {
    var items = blockItems(bid), h = items.map(esc).join('; ')
    if (bid === 'eye') h += eyeGlasses()
    if (bid === 'foodSafety' && items.length) h = '<b class="fs-p">' + esc(wdText()) + '</b><br>' + h
    return h
  }
  function blockCountSync(bid) {
    var sec = $('[data-sec="b:' + bid + '"] .sec-t'); if (!sec) return
    var c = sec.querySelector('.cnt'), n = blockCount(bid)
    if (c) c.parentNode.removeChild(c)
    if (n) { var s = document.createElement('span'); s.className = 'cnt'; s.textContent = n; sec.appendChild(s) }
  }
  function blockDerivedSync(bid) {
    BL[bid].fields.forEach(function (f) {
      if (f.t !== 'x' || f.fn === 'who') return
      var el = $('[data-dv="' + bid + '.' + f.k + '"]'); if (el) el.textContent = derived(BL[bid], f)
    })
  }
  function blocksSync() {
    if (!S.draft) return
    S.sections.forEach(function (c) { if (c.id.indexOf('b:') === 0 && !c.hidden) { blockDerivedSync(c.id.slice(2)); blockCountSync(c.id.slice(2)) } })
    $$('[data-bw]').forEach(function (e) { var w = num(S.draft.vitals.weight); e.textContent = w ? S.draft.vitals.weight + ' kg' : 'not entered' })
  }
  function blockChange(el) {
    var bid = el.getAttribute('data-bk'), f = el.getAttribute('data-bf'), v = bvals(bid)
    if (el.type === 'checkbox') { var a = v[f] = v[f] || [], o = el.getAttribute('data-bv'), i = a.indexOf(o); if (el.checked && i < 0) a.push(o); if (!el.checked && i >= 0) a.splice(i, 1) }
    else v[f] = el.value
    blockDerivedSync(bid); blockCountSync(bid)
  }
  function blockRefresh(bid) {
    keepFocus(function () { var el = $('[data-sec="b:' + bid + '"]'), c = cfg('b:' + bid); if (el && c) el.outerHTML = sectionHtml(secDef('b:' + bid), c) })
  }
  function hasContent() {
    var dr = S.draft
    return dr.lines.length || hasExtras(dr) || dr.tests.length || dr.dx.length || dr.libAdvice.length || Object.keys(dr.notes).some(function (k) { return dr.notes[k].length }) ||
      S.sections.some(function (c) { return c.id.indexOf('b:') === 0 && !c.hidden && blockCount(c.id.slice(2)) })
  }

  /* ---------- per-doctor form: speciality template default + the doctor's own preferences on top (PHAR-1703) ---------- */
  function tplSections(code) {
    var spec = SPEC[code] || SPEC.OTHER, hide = spec.type === 'VETERINARY' ? ['kco', 'fh'] : []
    var out = D.sections.map(function (s) { return { id: s.id, hidden: hide.indexOf(s.id) >= 0, collapsed: false } })
    var at = out.map(function (c) { return c.id }).indexOf('oi') + 1
    spec.blocks.forEach(function (b, i) { if (BL[b]) out.splice(at + i, 0, { id: 'b:' + b, hidden: false, collapsed: false }) })
    return out
  }
  function loadDoc(id) {
    if (S.doc) S.docPrefs[S.doc] = { sections: S.sections, customSecs: S.customSecs, secOverride: S.secOverride, tplCode: S.tplCode }
    S.doc = id
    var pr = S.docPrefs[id]
    if (pr) { S.sections = pr.sections; S.customSecs = pr.customSecs; S.secOverride = pr.secOverride; S.tplCode = pr.tplCode }
    else {
      S.tplCode = doc().spec; S.sections = tplSections(S.tplCode); S.customSecs = []; S.secOverride = {}
    }
    S.msSel = null
  }
  // Switching template swaps the speciality blocks only; the doctor's own core-section order / hidden / renamed state stays.
  function tplSwitch(code) {
    S.tplCode = code
    S.sections = S.sections.filter(function (c) { return c.id.indexOf('b:') !== 0 })
    var at = S.sections.map(function (c) { return c.id }).indexOf('oi') + 1
    SPEC[code].blocks.forEach(function (b, i) { if (BL[b]) S.sections.splice(at + i, 0, { id: 'b:' + b, hidden: false, collapsed: false }) })
  }
  function tplBar() {
    var d = doc(), own = [d.spec].concat(d.sec || []), kind = ptype(d).patient
    function op(c) { return '<option value="' + c + '"' + (c === S.tplCode ? ' selected' : '') + '>' + esc(specName(c)) + '</option>' }
    var others = D.specCat.filter(function (s) { return own.indexOf(s.code) < 0 && D.practTypes[s.type].patient === kind })
    var ad = S.sections.filter(function (c) { return c.adhoc && !c.hidden }).length
    return '<div class="tplbar"><label>Form template <select data-act="tplSwitch" aria-label="Form template">' + (own.indexOf(S.tplCode) < 0 ? op(S.tplCode) : '') + '<optgroup label="Your specialities">' + own.map(op).join('') + '</optgroup>' +
      '<optgroup label="Other specialities">' + others.map(function (x) { return op(x.code) }).join('') + '</optgroup></select></label><button class="btn ghost sm" data-act="blockPick">+ Add block</button></div>' +
      (ad ? '<p class="muted small tpl-ad">' + ad + ' block' + (ad > 1 ? 's' : '') + ' added for this prescription only &middot; <button class="link" data-act="blockKeep">Keep on my form</button></p>' : '')
  }
  function blockPickModal() {
    var kind = ptype().patient, byG = {}
    D.blockLib.forEach(function (b) {
      var vet = b.g === 'Veterinary', ok = kind === 'animal' ? (vet || b.id === 'localExam' || b.id === 'perioperative') : !vet
      var c = cfg('b:' + b.id)
      if (!ok || (c && !c.hidden)) return
      ;(byG[b.g] = byG[b.g] || []).push(b)
    })
    var html = Object.keys(byG).map(function (g) {
      return '<p class="muted small ms-sub">' + esc(g) + '</p><ol class="tpl-list ms-list">' + byG[g].map(function (b) {
        return '<li class="ms-row"><span class="ms-name">' + esc(b.title) + ' <em class="ctag">wave ' + b.w + '</em><small>' + b.fields.length + ' fields' + (cfg('b:' + b.id) ? ' &middot; hidden on your form (restores it)' : '') + '</small></span><span class="qa-act"><button class="btn sm ghost" data-act="blockAdd" data-id="' + b.id + '">Add</button></span></li>'
      }).join('') + '</ol>'
    }).join('')
    openModal({ title: 'Add a block to this prescription', cls: 'wide', body: '<p class="muted small">Any block from the library can be added ad hoc (for example a GP seeing an antenatal patient adds Obstetric). It applies to this prescription only unless you choose Keep on my form.</p>' + (html || '<div class="empty"><strong>All blocks are already on your form</strong></div>'),
      foot: '<button class="btn primary" data-act="closeModal">Close</button>' })
  }
  function blockAdd(id) {
    var c = cfg('b:' + id)
    if (c) { c.hidden = false }
    else {
      var idx = -1; S.sections.forEach(function (x, i) { if (x.id.indexOf('b:') === 0) idx = i })
      if (idx < 0) idx = S.sections.map(function (x) { return x.id }).indexOf('oi')
      S.sections.splice(idx + 1, 0, { id: 'b:' + id, hidden: false, collapsed: false, adhoc: true })
    }
    closeModal(); renderNotes(); toast('Added ' + BL[id].title + ' to this prescription')
  }

  /* ---------- non-physician / vet print pieces (PHAR-1708, PHAR-1707) ---------- */
  function sheetTitle() {
    var d = doc(), t = (D.specPrint[d.spec] || {}).title || ptype(d).printTitle
    return (t ? '<div class="sh-title">' + esc(t) + '</div>' : '') + (ptype(d).patient === 'animal' ? '<div class="sh-vet">For animal use only / শুধুমাত্র পশুর চিকিৎসার জন্য</div>' : '')
  }
  function rxLabelHtml() { var d = doc(), t = (D.specPrint[d.spec] || {}).rx || ptype(d).rxLabel; return t ? '<div class="sh-rxl">' + esc(t) + '</div>' : '' }
  function planLis() { var o = S.draft.orders.length ? ordLis(S.draft.orders) : ''; return o || '<li class="muted">No plan items</li>' }
  function patSpan(p) {
    var a = animalOf(p), o = ownerOf(p)
    if (a && o) return '<span><b>Patient:</b> ' + esc(animalLine(a, S.draft ? S.draft.vitals.weight : '')) + ' &middot; <b>Owner:</b> ' + esc(o.name) + '</span>'
    return '<span><b>' + esc(p.name) + '</b>, ' + esc(p.age) + ' / ' + esc(p.sex) + (p.relation ? ' (' + esc(p.relation) + ')' : '') + '</span>'
  }

  /* ---------- medicine prescribing switched off (PHAR-1702) ---------- */
  function renderRxOff() {
    keepFocus(function () {
      var d = doc(), pt = ptype(d), dr = S.draft
      $('#rx').innerHTML = '<div class="rx-h"><h2><span class="rxs">&#8478;</span> Medicines <span class="cnt">0</span></h2></div>' +
        '<div class="rx-off" id="rxOff"><b>Medicine prescribing is not enabled for this account</b><p>' + (d.presOn ? esc(pt.label) + ' accounts do not prescribe medicines by default (design 4.4). ' : 'Prescribing is disabled for this doctor. ') +
        'You can still write clinical notes, advised tests, diet / exercise / therapy orders, advice and follow-up. Only a platform admin can switch medicine prescribing on.</p></div>' +
        '<input class="txt" disabled placeholder="Medicine search is off for this account" aria-label="Medicine search (disabled)">' +
        (dr.lines.length ? '<div class="rx-off warn" id="rxOffLines"><b>' + dr.lines.length + ' medicine line(s) are still on this draft</b><p>Completing is blocked until they are removed.</p>' + dr.lines.map(function (l) {
          return '<div class="rx-offl">' + esc(lineName(l)) + ' <button class="link" data-act="removeLine" data-id="' + l.id + '">Remove</button></div>'
        }).join('') + '</div>' : '') + ordersHtml()
      $('#medcheck').innerHTML = ''
    })
  }
  function seedPhrases(key) { return (D.specSeed[S.tplCode] || D.specSeed[doc().spec] || {})[key] || [] }
  function openFirst() {
    if (S.doc === 'd1') return openForScenario('returning')
    var a = D.appointments.filter(function (x) { return x.doc === S.doc && x.status !== 'Done' })[0]
    if (!a) { S.view = 'appointments'; return render() }
    openConsult(a.patientId, a.serial)
  }

  /* ---------- doctor profile: specialities + prescribing status (PHAR-1701 / 1702) ---------- */
  function renderProfile() {
    var d = doc(), pt = ptype(d), kind = pt.patient, type = typeOf(d)
    function opt(s) { var same = s.type === type; return '<option value="' + s.code + '"' + (s.code === d.spec ? ' selected' : '') + (same ? '' : ' disabled') + '>' + esc(s.name) + (same ? '' : ' (other practitioner type)') + '</option>' }
    var primary = '<select data-act="specPrimary" aria-label="Primary speciality">' + D.specGroups.map(function (g) {
      return '<optgroup label="' + esc(g.name) + '">' + g.codes.map(function (c) { return opt(SPEC[c]) }).join('') + '</optgroup>'
    }).join('') + '</select>'
    var secs = D.specCat.filter(function (s) { return s.type === type && s.code !== d.spec }).map(function (s) {
      return '<label class="mchk"><input type="checkbox" data-act="specSec" data-code="' + s.code + '"' + (d.sec.indexOf(s.code) >= 0 ? ' checked' : '') + '> ' + esc(s.name) + '</label>'
    }).join('')
    var blocks = (SPEC[d.spec].blocks || []).map(function (b) { return '<span class="chip grey">' + esc(BL[b].title) + '</span>' }).join('') || '<span class="muted small">Core sections only (no speciality blocks)</span>'
    function pill(on) { return '<span class="pill ' + (on ? 'on' : 'off') + '">' + (on ? 'enabled' : 'disabled') + '</span>' }
    $('#view').innerHTML = '<div class="page narrow"><div class="page-h"><div><h1>My profile</h1><p class="muted">Specialities, practitioner type and prescribing status. Doctor settings screen (PHAR-1701 / 1702).</p></div></div>' +
      (S.profileMsg ? '<div class="note" role="status">' + esc(S.profileMsg) + '</div>' : '') +
      '<section class="pf-card"><h3>' + esc(d.name) + '</h3><div class="muted">' + esc(d.degrees) + '</div><div class="pf-g"><b>Registration</b><span>' + esc(D.regBodies[d.regBody]) + ' &middot; ' + esc(d.bmdc) + '</span>' +
      '<b>Practitioner type</b><span><span class="tag">' + esc(pt.label) + '</span> <span class="muted small">follows the primary speciality; patient is ' + (kind === 'animal' ? 'an animal (the customer is the owner)' : 'a person') + '</span></span></div></section>' +
      '<section class="pf-card"><h3>Specialities</h3><label class="fld"><span>Primary speciality (drives the default form template)</span>' + primary + '</label>' +
      '<div class="fld"><span>Secondary specialities (used by doctor search and the template switcher)</span><div class="pf-sec">' + (secs || '<span class="muted small">None available</span>') + '</div></div>' +
      '<p class="muted small">All of a doctor\'s specialities must share one practitioner type, so a vet cannot hold a human speciality and the patient type is never ambiguous. Specialities of another type are disabled here.</p>' +
      '<div class="pf-g"><b>Shown on</b><span>consultation header, printed prescription and doctor search: <b>' + esc(specLine(d)) + '</b></span></div></section>' +
      '<section class="pf-card"><h3>Prescribing permission</h3><div class="pf-g"><b>Prescription</b><span>' + pill(d.presOn) + '</span><b>Medicine prescribing</b><span>' + pill(d.medOn) + '</span></div>' +
      '<p class="muted small">Set by the platform admin only (D15); doctors cannot change it. Defaults come from the practitioner type when the doctor is created and do not reset if the speciality changes later. Use the platform-admin switches in Prototype controls to try both states.</p></section>' +
      '<section class="pf-card"><h3>Form template</h3><div class="pf-g"><b>Template</b><span>' + esc(specName(S.tplCode)) + '</span><b>Default blocks</b><span>' + blocks + '</span></div>' +
      '<p class="muted small">Open a consultation to adjust: hide, rename and reorder sections or add blocks with Manage sections. Your choices are kept on top of the speciality default.</p></section>' +
      '<section class="pf-card"><h3>Backfill note (migration)</h3><p class="small">Doctors used to type their speciality as free text. The migration matches it to a code (anything unmatched becomes <b>OTHER</b>) and keeps the old text for display.</p>' +
      '<div class="pf-g"><b>Old free text</b><span>' + (d.oldSpec ? esc(d.oldSpec) : '<span class="muted">none (onboarded after the change)</span>') + '</span><b>Matched to</b><span>' + esc(d.spec) + (d.sec.length ? ' + ' + esc(d.sec.join(', ')) : '') + '</span></div>' +
      '<details><summary class="small">Aliases recognised by the backfill</summary><p class="small muted">Medicine = INTERNAL_MEDICINE &middot; Neuromedicine = NEUROLOGY &middot; Chest Medicine / Chest Diseases = PULMONOLOGY &middot; Gynae &amp; Obs / Gynaecology = OBSTETRICS_GYNECOLOGY &middot; Child Specialist / Paediatrics = PEDIATRICS &middot; Skin &amp; VD = DERMATOLOGY &middot; Eye = OPHTHALMOLOGY &middot; Bone / Ortho = ORTHOPEDIC_SURGERY &middot; Kidney = NEPHROLOGY &middot; Liver = HEPATOLOGY &middot; Heart = CARDIOLOGY &middot; Diabetes = DIABETOLOGY &middot; Dental / BDS = DENTISTRY &middot; Vet / Veterinary / DVM = VETERINARY_GENERAL</p></details></section></div>'
  }

  /* ---------- customer portal: Find a doctor (PHAR-1706), animals + vet booking (PHAR-1707) ---------- */
  var FIND_TABS = [['default', 'Doctors & dentists'], ['PHYSICIAN', 'Doctors'], ['DENTAL', 'Dentists'], ['ALLIED_HEALTH', 'Therapy & Nutrition'], ['TRADITIONAL', 'Homeopathy / Unani / Ayurveda'], ['VETERINARY', 'Veterinary']]
  function findTypes(t) { return t === 'default' ? ['PHYSICIAN', 'DENTAL'] : [t] }
  function findPool() { var ty = findTypes(S.find.type); return D.doctors.filter(function (d) { return ty.indexOf(typeOf(d)) >= 0 }) }
  function findDocs() { var sp = S.find.spec; return findPool().filter(function (d) { return !sp || d.spec === sp || (d.sec || []).indexOf(sp) >= 0 }) }
  function findFacet() {
    var m = {}
    findPool().forEach(function (d) { [d.spec].concat(d.sec || []).forEach(function (c) { m[c] = (m[c] || 0) + 1 }) })
    return Object.keys(m).sort(function (a, b) { return specName(a) < specName(b) ? -1 : 1 }).map(function (c) { return [c, m[c]] })
  }
  function findHtml() {
    var f = S.find, list = findDocs()
    var tabs = FIND_TABS.map(function (t) {
      var n = D.doctors.filter(function (d) { return findTypes(t[0]).indexOf(typeOf(d)) >= 0 }).length
      return '<button class="fchip' + (f.type === t[0] ? ' on' : '') + '" data-act="findType" data-t="' + t[0] + '">' + esc(t[1]) + ' <em>' + n + '</em></button>'
    }).join('')
    var sel = '<select data-act="findSpec" aria-label="Speciality"><option value="">All specialities</option>' + findFacet().map(function (x) { return '<option value="' + x[0] + '"' + (f.spec === x[0] ? ' selected' : '') + '>' + esc(specName(x[0])) + ' (' + x[1] + ')</option>' }).join('') + '</select>'
    var cards = list.map(function (d) {
      var pt = ptype(d)
      return '<div class="dcard"><div><b>' + esc(d.name) + '</b> <span class="tag">' + esc(pt.tab === 'Doctors' ? 'Doctor' : pt.label) + '</span></div><div class="muted small">' + esc(d.degrees) + '</div><div class="small">' + esc(specLine(d)) + '</div>' +
        '<div class="muted small">' + esc(regShort(d)) + ' &middot; ' + esc(d.chamber) + '</div>' + (pt.patient === 'animal' ? '<div class="small"><span class="chip vet">Animal patients only</span></div>' : '') +
        '<div class="dact"><span class="small">&#2547; ' + d.fee + '</span><button class="btn sm primary" data-act="bookOpen" data-id="' + d.id + '">Book</button></div></div>'
    }).join('')
    return '<h3>Find a doctor</h3><div class="fchips" role="group" aria-label="Practitioner type">' + tabs + '</div><label class="fld"><span>Speciality</span>' + sel + '</label>' +
      (f.note ? '<div class="note small">' + esc(f.note) + '</div>' : '') + '<p class="muted small" id="findCount">' + list.length + ' result' + (list.length === 1 ? '' : 's') + (f.type === 'default' ? ' &middot; doctors and dentists only; other practitioner types appear when you pick their tab' : '') + '</p>' + (cards || '<div class="empty slim">No practitioners match.</div>')
  }
  function ferr(er, k) { return er && er[k] ? '<small class="need">' + esc(er[k]) + ' <i>(' + k + ')</i></small>' : '' }
  function animalsHtml() {
    var list = myAnimals()
    return '<h3>My animals</h3><p class="muted small">Animals are stored under your account as the owner. A vet can only be booked for one of these.</p>' + (list.length ? list.map(function (a) {
      var pid = patientIdForAnimal(a), n = (D.history[pid] || []).length
      return '<div class="acard"><div><b>' + esc(a.name) + '</b> <span class="tag">' + esc(D.animalTypes[a.animalType]) + '</span></div><div class="muted small">' + esc(animalDesc(a)) + '</div>' + (a.features.length ? '<div class="small">' + a.features.map(esc).join(' &middot; ') + '</div>' : '') +
        '<div class="aact"><button class="link" data-act="animalEdit" data-id="' + a.id + '">Edit</button><button class="link" data-act="animalRx" data-id="' + pid + '">Prescriptions (' + n + ')</button><button class="link danger-text" data-act="animalDel" data-id="' + a.id + '">Remove</button></div></div>'
    }).join('') : '<div class="empty slim">No animals yet.</div>') + '<button class="btn primary sm" data-act="animalNew">+ Add an animal</button>'
  }
  function animalForm(id, v, er) {
    var a = id ? D.animals.filter(function (x) { return x.id === id })[0] : null
    v = v || (a ? { name: a.name, animalType: a.animalType, species: a.species, speciesOther: a.speciesOther, breed: a.breed, sex: a.sex, ageValue: a.ageValue, ageUnit: a.ageUnit, feat: a.features.join('\n') } : { name: '', animalType: '', species: '', speciesOther: '', breed: '', sex: 'F', ageValue: '', ageUnit: 'YEARS', feat: '' })
    S.afId = id || null
    function sel(i, list, cur, blank) { return '<select id="af' + i + '">' + (blank ? '<option value="">- choose -</option>' : '') + opts(list, cur) + '</select>' }
    var body = '<div class="af-g"><label class="fld"><span>Name *</span><input class="txt" id="afName" value="' + esc(v.name) + '">' + ferr(er, 'name') + '</label>' +
      '<label class="fld"><span>Type of animal *</span>' + sel('Type', Object.keys(D.animalTypes).map(function (k) { return [k, D.animalTypes[k]] }), v.animalType, true) + ferr(er, 'animalType') + '</label>' +
      '<label class="fld"><span>Which animal *</span>' + sel('Species', Object.keys(D.species).map(function (k) { return [k, D.species[k]] }), v.species, true) + ferr(er, 'species') + '</label>' +
      '<label class="fld"><span>If other, which</span><input class="txt" id="afOther" value="' + esc(v.speciesOther) + '">' + ferr(er, 'speciesOther') + '</label>' +
      '<label class="fld"><span>Breed (optional)</span><input class="txt" id="afBreed" value="' + esc(v.breed) + '"></label>' +
      '<label class="fld"><span>Sex</span>' + sel('Sex', [['F', 'Female'], ['M', 'Male']], v.sex) + '</label>' +
      '<label class="fld"><span>Age (an estimate is fine) *</span><span class="row"><input class="txt" id="afAge" inputmode="numeric" value="' + esc(v.ageValue) + '">' + sel('Unit', [['DAYS', 'days'], ['WEEKS', 'weeks'], ['MONTHS', 'months'], ['YEARS', 'years']], v.ageUnit) + '</span>' + ferr(er, 'ageValue') + '</label>' +
      '<label class="fld wide"><span>Recognising features (one per line: colour, markings, ear tag, microchip)</span><textarea class="txt" id="afFeat" rows="3">' + esc(v.feat) + '</textarea>' + Object.keys(er || {}).filter(function (k) { return k.indexOf('identifyingFeatures') === 0 }).map(function (k) { return ferr(er, k) }).join('') + '</label></div>' +
      '<p class="muted small">Weight is not stored here - the vet records it on each prescription.</p>'
    openModal({ title: a ? 'Edit animal' : 'Add an animal', cls: 'sm', body: body, foot: '<button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn primary" data-act="animalSave">Save</button>' })
  }
  function animalRead() {
    var g = function (i) { var e = $('#af' + i); return e ? e.value : '' }
    return { name: g('Name').trim(), animalType: g('Type'), species: g('Species'), speciesOther: g('Other').trim(), breed: g('Breed').trim(), sex: g('Sex'), ageValue: g('Age').trim(), ageUnit: g('Unit'), feat: g('Feat') }
  }
  function animalCheck(v) {
    var er = {}
    if (!v.name) er.name = 'Name is required'
    else if (v.name.length > 100) er.name = 'Name must be 100 characters or fewer'
    if (!v.animalType) er.animalType = 'Type of animal is required'
    if (!v.species) er.species = 'Which animal is required'
    if (v.species === 'OTHER' && !v.speciesOther) er.speciesOther = 'Say which animal'
    if (!(num(v.ageValue) > 0)) er.ageValue = 'Age is required (an estimate is fine)'
    v.feat.split('\n').forEach(function (l, i) { if (l !== '' && !l.trim()) er['identifyingFeatures[' + i + ']'] = 'A feature cannot be blank' })
    return er
  }
  function animalSave() {
    var v = animalRead(), er = animalCheck(v)
    if (Object.keys(er).length) return animalForm(S.afId, v, er)
    var a = S.afId ? D.animals.filter(function (x) { return x.id === S.afId })[0] : null
    var o = { name: v.name, animalType: v.animalType, species: v.species, speciesOther: v.species === 'OTHER' ? v.speciesOther : '', breed: v.breed, sex: v.sex, ageValue: num(v.ageValue), ageUnit: v.ageUnit, ageOn: D.today, features: v.feat.split('\n').map(function (l) { return l.trim() }).filter(Boolean) }
    if (a) Object.assign(a, o)
    else { a = Object.assign({ id: 'an' + (S.seq++), owner: 'p1' }, o); D.animals.push(a) }
    var p = D.patients[patientIdForAnimal(a)]; p.name = a.name; p.age = animalAge(a); p.sex = a.sex === 'F' ? 'Female' : 'Male'
    closeModal(); renderPatient(); toast('Saved ' + a.name)
  }
  function custAppts() {
    return D.appointments.filter(function (a) { var p = D.patients[a.patientId]; return p && (p.id === 'p1' || p.owner === 'p1') })
  }
  function custApptsHtml() {
    var list = custAppts()
    return '<h3>My appointments</h3>' + (list.map(function (a) {
      var p = D.patients[a.patientId], d = DOCS[a.doc]
      return '<div class="acard"><div><b>' + esc(d.name) + '</b> <span class="tag">' + esc(ptype(d).label) + '</span></div><div class="small">' + (a.date ? fmtY(a.date) : 'Today') + ', ' + esc(a.time) + ' &middot; Serial #' + a.serial + ' &middot; ' + esc(a.status) + '</div>' +
        '<div class="muted small">' + (isAnimal(p) ? 'Animal: ' + esc(p.name) + ' (owner Rahima Begum)' : 'Patient: ' + esc(p.name)) + ' &middot; ' + esc(a.reason) + '</div></div>'
    }).join('') || '<div class="empty slim">No appointments.</div>')
  }
  function bookModal(id, er, keep) {
    var d = DOCS[id], vet = ptype(d).patient === 'animal', an = myAnimals(), k = keep || {}
    var body = '<div class="dcard"><b>' + esc(d.name) + '</b><div class="muted small">' + esc(specLine(d)) + ' &middot; ' + esc(d.chamber) + '</div></div>' +
      '<label class="fld"><span>Day</span><select id="bkDate">' + opts([[D.today, 'Today, ' + fmtY(D.today)], ['2026-10-22', 'Thu, 22 Oct 2026']], k.date || D.today) + '</select></label>' +
      '<label class="fld"><span>Time</span><select id="bkTime">' + opts(D.fuSlots.times.filter(function (t) { return D.fuSlots.taken.indexOf(t) < 0 }).map(function (t) { return [t, t] }), k.time || '') + '</select></label>' +
      '<label class="fld"><span>Reason</span><input class="txt" id="bkReason" value="' + esc(k.reason || '') + '" placeholder="e.g. fever, check-up"></label>'
    if (vet) body += '<label class="fld"><span>Which animal? *</span><select id="bkAnimal"><option value="">- choose -</option>' + opts(an.map(function (a) { return [a.id, a.name + ' - ' + spName(a)] }), k.animal || '') + '</select>' + ferr(er, 'animalId') + '</label>' + (an.length ? '' : '<p class="muted small">Add an animal in My animals first.</p>')
    else body += '<p class="muted small">This booking is for you. Animal selection is only offered for veterinary doctors (an <b>animalId</b> sent for a non-vet doctor is rejected).</p>'
    openModal({ title: 'Book an appointment', cls: 'sm', body: body, foot: '<button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn primary" data-act="bookConfirm" data-id="' + id + '">Confirm booking</button>' })
  }
  function bookConfirm(id) {
    var d = DOCS[id], vet = ptype(d).patient === 'animal', g = function (i) { var e = $('#bk' + i); return e ? e.value : '' }
    var k = { date: g('Date'), time: g('Time'), reason: g('Reason'), animal: g('Animal') }
    if (vet && !k.animal) return bookModal(id, { animalId: 'Choose which animal you are booking for' }, k)
    var a = vet ? D.animals.filter(function (x) { return x.id === k.animal })[0] : null
    var serial = Math.max.apply(null, D.appointments.map(function (x) { return x.serial })) + 1
    D.appointments.push({ serial: serial, doc: id, date: k.date === D.today ? undefined : k.date, time: k.time, patientId: vet ? patientIdForAnimal(a) : 'p1', reason: k.reason || (vet ? a.name + ' - check-up' : 'Consultation'), status: 'Waiting', tag: 'Booked from portal' })
    closeModal(); S.pvTab = 'appts'; renderPatient()
    toast('Booked ' + d.name + ' for ' + (vet ? a.name : 'you') + ', serial #' + serial + (id.charAt(0) === 'd' ? ' - visible on that doctor\'s list' : ''))
  }

  function blockInfo(d) {
    var b = BL[d.bid], u = D.specCat.filter(function (s) { return s.blocks.indexOf(b.id) >= 0 }).map(function (s) { return s.name })
    return 'Speciality block from the shared library (wave ' + b.w + ', ' + b.fields.length + ' fields). Default in: ' + (u.slice(0, 6).join(', ') || 'no template') + (u.length > 6 ? ' and ' + (u.length - 6) + ' more' : '') + '. You can rename, reorder or remove it from your form; values already typed are kept if you restore it.'
  }
  function docFieldset() {
    var d = doc()
    return '<fieldset><legend>Logged-in doctor</legend><select data-act="docSwitch" aria-label="Logged-in doctor">' + D.doctors.filter(function (x) { return x.login }).map(function (x) {
      return '<option value="' + x.id + '"' + (x.id === S.doc ? ' selected' : '') + '>' + esc(specName(x.spec) + ' (' + x.name.replace(/^Dr\. /, '') + ')') + '</option>'
    }).join('') + '</select><div class="muted small">' + esc(ptype(d).label) + ' &middot; ' + (ptype(d).patient === 'animal' ? 'animal patients' : 'human patients') + '</div></fieldset>' +
      '<fieldset><legend>Platform admin</legend><label><input type="checkbox" data-act="presSw" data-k="presOn"' + (d.presOn ? ' checked' : '') + '> Prescription enabled</label>' +
      '<label><input type="checkbox" data-act="presSw" data-k="medOn"' + (d.medOn ? ' checked' : '') + '> Medicine prescribing enabled</label></fieldset>'
  }

  Object.assign(A, {
    docSwitch: function (e) { S.draft = null; loadDoc(e.value); S.view = 'appointments'; S.profileMsg = ''; closeModal(); render(); toast('Logged in as ' + doc().name + ' (' + ptype().label + ')') },
    presSw: function (e) { doc()[e.getAttribute('data-k')] = e.checked; render(); toast((e.getAttribute('data-k') === 'presOn' ? 'Prescription ' : 'Medicine prescribing ') + (e.checked ? 'enabled' : 'disabled') + ' by the platform admin (simulated)') },
    tplSwitch: function (e) { tplSwitch(e.value); renderNotes(); toast('Form template: ' + specName(e.value) + ' - your own section order and names are kept') },
    blockPick: blockPickModal,
    blockAdd: function (e) { blockAdd(e.getAttribute('data-id')) },
    blockKeep: function () { S.sections.forEach(function (c) { delete c.adhoc }); renderNotes(); toast('Kept on your form for future prescriptions') },
    toothSel: function (e) { S.tooth = +e.getAttribute('data-t'); blockRefresh('dental') },
    pTab: function (e) { S.pvTab = e.getAttribute('data-t'); S.pv = null; S.pvPid = null; S.smsRx = null; renderPatient() },
    findType: function (e) {
      var t = e.getAttribute('data-t'); S.find.type = t; S.find.note = ''
      if (S.find.spec && !findFacet().some(function (x) { return x[0] === S.find.spec })) { S.find.note = 'The speciality "' + specName(S.find.spec) + '" does not belong to the selected practitioner type, so the filter was cleared.'; S.find.spec = '' }
      renderPatient()
    },
    findSpec: function (e) { S.find.spec = e.value; S.find.note = ''; renderPatient() },
    bookOpen: function (e) { bookModal(e.getAttribute('data-id')) },
    bookConfirm: function (e) { bookConfirm(e.getAttribute('data-id')) },
    animalNew: function () { animalForm(null) },
    animalEdit: function (e) { animalForm(e.getAttribute('data-id')) },
    animalSave: animalSave,
    animalDel: function (e) { var a = D.animals.filter(function (x) { return x.id === e.getAttribute('data-id') })[0]; if (window.confirm('Remove ' + a.name + '? Past prescriptions keep the record (soft delete).')) { a.deleted = true; renderPatient(); toast('Removed ' + a.name) } },
    animalRx: function (e) { S.pvPid = e.getAttribute('data-id'); S.pvTab = 'rx'; S.pv = null; renderPatient() },
    specPrimary: function (e) {
      var d = doc(), c = e.value
      if (!SPEC[c] || SPEC[c].type !== typeOf(d)) { render(); return toast('A doctor\'s specialities must share one practitioner type') }
      d.spec = c; d.sec = d.sec.filter(function (x) { return x !== c }); tplSwitch(c)
      S.profileMsg = 'Primary speciality is now ' + specName(c) + '. The form template switched to match; your prescribing switches did not change.'; render()
    },
    specSec: function (e) {
      var d = doc(), c = e.getAttribute('data-code'), i = d.sec.indexOf(c)
      if (e.checked && i < 0) d.sec.push(c); if (!e.checked && i >= 0) d.sec.splice(i, 1)
      S.profileMsg = 'Secondary specialities: ' + (d.sec.length ? d.sec.map(specName).join(', ') : 'none'); render()
    }
  })
  S.doc = null; S.docPrefs = {}; S.pvTab = 'rx'; S.pvPid = null; S.tooth = null; S.find = { type: 'default', spec: '', note: '' }; S.profileMsg = ''; S.afId = null
  loadDoc('d1')

  function cfg(id) { return S.sections.filter(function (c) { return c.id === id })[0] }
  function moveSec(i, d) {
    var j = i + d; while (j >= 0 && j < S.sections.length && S.sections[j].hidden) j += d
    if (j < 0 || j >= S.sections.length) return
    var t = S.sections[i]; S.sections[i] = S.sections[j]; S.sections[j] = t
    renderNotes(); customiseModal()
  }
  function moveLine(id, d) {
    var a = S.draft.lines, i = lineIdx(id), j = i + d; if (j < 0 || j >= a.length) return
    var t = a[i]; a[i] = a[j]; a[j] = t; renderRx()
  }

  /* ================= WAVE 5: prescription access rules R1-R7 (PHAR-1709..1714) ================= */
  // R1/R2: only the issuing doctor writes or edits (staff screens have no write control at all). R3/R4: a doctor reads own + patient-shared.
  // R5: staff read only what is shared to their branch. R6: the patient sees every submitted Rx. R7: edit window counted from submission.
  var CLOCK0 = new Date(D.today + 'T10:00:00').getTime()
  var PHONES = { '01712345678': 'p1', '01819000204': 'p2' }
  S.clockMin = 0; S.winMin = 1440; S.retired = []; S.prxPid = null; S.posBranch = 'b1'; S.posQ = ''; S.posNo = null; S.extTok = null; S.smsRx = null
  S.linkAuth = null; S.lg = { step: 'phone', phone: '', otp: '', err: '', errF: '' }; S.shq = ''
  function nowMs() { return CLOCK0 + S.clockMin * 60000 }
  function nowIso() { var d = new Date(nowMs()); return isoDate(d) + 'T' + pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) }
  function whenText(iso) { var d = new Date(iso.length === 10 ? iso + 'T10:00' : iso); return fmt(d) + ' ' + d.getFullYear() + ', ' + pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2) }
  function subIso(r) { return r.submittedAt || (r.date + 'T10:00') }
  function leftMin(r) { return Math.floor((new Date(subIso(r)).getTime() + S.winMin * 60000 - nowMs()) / 60000) }
  function leftText(m) { var h = Math.floor(m / 60); return (h ? h + 'h ' : '') + (m % 60) + 'm' }
  function winLabel() { return S.winMin >= 60 ? (S.winMin / 60) + ' h' : S.winMin + ' min' }
  function editOpen(r) { return isMine(r) && leftMin(r) > 0 }
  function closedText(r) { return 'Edit window closed (' + winLabel() + ' after submission on ' + whenText(subIso(r)) + '). To change it now, write a new version with Continue from previous.' }
  function rxById(id) { var k, i; for (k in D.history) for (i = 0; i < D.history[k].length; i++) if (D.history[k][i].id === id) return D.history[k][i]; return null }
  function pidOfRx(r) { var k; for (k in D.history) if (D.history[k].indexOf(r) >= 0) return k; return null }
  function rxByNo(no) { var k, i; for (k in D.history) for (i = 0; i < D.history[k].length; i++) if (D.history[k][i].no === no) return D.history[k][i]; return null }
  function shareOn(r, kind, target) { return D.shares.filter(function (s) { return s.active && s.rx === r.id && s.kind === kind && (target === undefined || s.target === target) }) }
  function branchName(id) { return D.branches.filter(function (b) { return b.id === id })[0].name }
  function canRead(r) { return isMine(r) || shareOn(r, 'doctor', S.doc).length > 0 }
  function visibleRxs(pid) {
    var ed = S.draft && S.draft.editing
    return (D.history[pid] || []).filter(function (r) { return canRead(r) && r.id !== ed }).sort(function (a, b) { return subIso(a) < subIso(b) ? 1 : -1 })
  }
  function maskName(n) { return n.charAt(0) + '*** ' + (n.split(' ')[1] || '').charAt(0) + '*****' }
  function linkUrl(tok) { return 'https://portal.pharmaz247.example/s/' + tok }
  function smsTok(r) { return hash(r.no).toString(36).slice(0, 6) }
  function tick() {
    if (S.view === 'consult') renderProto(); else render()
    if (S.modal && S.modal.rxd) rxDrawer(S.modal.rxd)
  }

  // Read-only prescription body shared by the doctor drawer, the POS screen and the external link page (o.notes = clinical notes, o.patient = name line).
  function rxReadHtml(rx, o) {
    var lines = rx.lines.map(function (l) {
      if (l.stop) return '<tr><td colspan="4"><b>STOP: ' + esc(l.name) + '</b>' + (l.reason ? '<small>' + esc(l.reason) + '</small>' : '') + '</td></tr>'
      var m = medById(l.medId)
      return '<tr><td><b>' + esc(m.brand + ' ' + m.strength) + '</b><small>' + esc(m.generic) + '</small></td><td>' + esc(l.steps ? l.steps.length + ' steps' : l.pattern) + '</td><td>' + esc(FOOD[l.food] || '') + '</td><td>' + daysText(l.days) + '</td></tr>'
    }).join('')
    return '<div class="ro"><h4>' + esc(rx.no) + ' &middot; v' + rx.version + ' &middot; ' + fmtY(rx.date) + '</h4>' +
      '<p class="muted small">Submitted ' + esc(whenText(subIso(rx))) + ' &middot; ' + esc(docNameOf(rx)) + (rx.editedAt ? ' &middot; edited ' + esc(whenText(rx.editedAt)) : '') + '</p>' +
      (o.patient ? '<p><b>Patient:</b> ' + esc(o.patient) + '</p>' : '') +
      (o.notes ? '<div class="ro-g"><b>C/C</b><span>' + esc(rx.cc.join('; ') || '-') + '</span><b>Dx</b><span>' + esc(rx.dx.map(function (x) { return x.t + ' (' + DX_TYPES[x.type] + ')' }).join('; ') || '-') + '</span></div>' : '') +
      '<table class="mini"><thead><tr><th>Medicine</th><th>Dose</th><th>Food</th><th>Duration</th></tr></thead><tbody>' + lines + '</tbody></table>' +
      '<div class="ro-g">' + (o.notes ? '<b>Tests</b><span>' + esc(rx.tests.join(', ') || '-') + '</span>' : '') + '<b>Advice</b><span>' + esc(rx.advice.join('; ') || '-') + '</span><b>Follow-up</b><span>' + esc(rx.follow || '-') + '</span></div></div>'
  }

  /* ---------- doctor: Patient prescriptions (PHAR-1709, 1710, 1712) ---------- */
  function prxPatients() {
    var seen = {}, out = []
    D.appointments.forEach(function (a) { if (a.doc === S.doc && !seen[a.patientId]) { seen[a.patientId] = 1; out.push(a.patientId) } })
    return out
  }
  function editBox(r) {
    if (!isMine(r)) return '<small>View only: written by another doctor and shared by the patient. Only the doctor who submitted a prescription can edit it (R2).</small>'
    var m = leftMin(r)
    return m > 0 ? '<span class="pill on">Editable for ' + leftText(m) + '</span> <small>Edit window: ' + winLabel() + ' from submission, then the prescription is final.</small>' : '<span class="pill off">Edit window closed</span> <small class="need">' + esc(closedText(r)) + '</small>'
  }
  function prxCard(r) {
    var mine = isMine(r), br = shareOn(r, 'branch')
    return '<li class="prx-c" data-rxid="' + r.id + '"><div class="prx-m"><b>' + esc(r.no) + '</b> <span class="muted">v' + r.version + ' &middot; ' + fmtY(r.date) + '</span> ' +
      (mine ? '<span class="tag">Written by you</span>' : '<span class="tag shared">Shared by patient</span>') + (r.editedAt ? ' <span class="tag">edited</span>' : '') +
      '<div class="muted small">' + esc(r.lines.length + ' medicine' + (r.lines.length === 1 ? '' : 's') + ' - ' + (r.dx.map(function (x) { return x.t }).join('; ') || 'no diagnosis')) + (mine ? '' : ' &middot; ' + esc(docNameOf(r))) + '</div>' +
      '<div class="prx-win">' + editBox(r) + '</div>' + (mine && br.length ? '<div class="muted small">Sent to: ' + br.map(function (s) { return esc(branchName(s.target)) }).join(', ') + '</div>' : '') + '</div>' +
      '<div class="prx-a"><button class="btn sm" data-act="rxOpen" data-id="' + r.id + '">Open</button>' +
      (mine ? '<button class="btn sm primary" data-act="rxEdit" data-id="' + r.id + '"' + (editOpen(r) ? '' : ' disabled title="' + esc(closedText(r)) + '"') + '>Edit</button><button class="btn sm ghost" data-act="routeOpen" data-id="' + r.id + '">Send to pharmacy branch</button>' : '') + '</div></li>'
  }
  function renderPrx() {
    var pids = prxPatients()
    if (pids.indexOf(S.prxPid) < 0) S.prxPid = pids[0] || null
    var list = S.prxPid ? visibleRxs(S.prxPid) : []
    $('#view').innerHTML = '<div class="page narrow"><div class="page-h"><div><h1>Patient prescriptions</h1><p class="muted">You see the prescriptions you wrote, plus any the patient has shared with you (read-only). Nothing else.</p></div>' +
      '<label class="fld"><span>Patient</span><select data-act="prxPat" aria-label="Patient">' + pids.map(function (p) { return '<option value="' + p + '"' + (p === S.prxPid ? ' selected' : '') + '>' + esc(D.patients[p].name) + '</option>' }).join('') + '</select></label></div>' +
      '<div class="note small">Prototype time: ' + esc(whenText(nowIso())) + ' &middot; edit window ' + winLabel() + ' (change both in Prototype controls).</div>' +
      (list.length ? '<ul class="prx-l">' + list.map(prxCard).join('') + '</ul>' : '<div class="empty"><strong>No prescriptions to show</strong><p>Prescriptions you wrote for this patient, and ones the patient shares with you, appear here.</p></div>') + '</div>'
  }
  function rxDrawer(id) {
    var rx = rxById(id)
    if (!rx || !canRead(rx)) return toast('Prescription not found or not shared with you')
    var mine = isMine(rx)
    openModal({ title: rx.no, drawer: true, cls: 'drawer', rxd: id,
      body: '<p class="muted">' + (mine ? 'Your prescription for ' + esc(D.patients[pidOfRx(rx)].name) : 'Shared by the patient - view only') + '</p>' + rxReadHtml(rx, { notes: true }) + '<div class="prx-win">' + editBox(rx) + '</div>',
      foot: (mine ? '<button class="btn primary" data-act="rxEdit" data-id="' + id + '"' + (editOpen(rx) ? '' : ' disabled') + '>Edit</button><button class="btn ghost" data-act="routeOpen" data-id="' + id + '">Send to pharmacy branch</button>' : '') + '<button class="btn ghost" data-act="closeModal">Close</button>' })
  }
  // Edit = in-place correction (same Rx number and version, new check code, copies printed earlier become "Not valid - changed"). A new version is a different thing: Continue from previous.
  function editStart(id) {
    var rx = rxById(id)
    if (!rx || !isMine(rx)) return toast('Only the doctor who submitted a prescription can edit it')
    if (leftMin(rx) <= 0) return toast('Edit window closed - ' + closedText(rx))
    var pid = pidOfRx(rx), sr = rx.serial || (D.appointments.filter(function (a) { return a.doc === S.doc && a.patientId === pid })[0] || {}).serial
    if (!sr) return toast('Prototype: no appointment to attach the edit to')
    S.pid = pid; S.serial = sr; S.popupQ = []; S.showErr = false; S.savedAt = null
    var dr = S.draft = newDraft(pat())
    dr.editing = rx.id; dr.rxNo = rx.no; dr.bannerOff = true; dr.bnd = rx.bnd !== false
    if (rx.draftJson) { dr = S.draft = JSON.parse(rx.draftJson); dr.editing = rx.id; dr.rxNo = rx.no; dr.bannerOff = true } else { /* seed records have no stored draft: rebuild the main parts */
    rx.lines.forEach(function (hl) {
      var l
      if (hl.stop) { l = hl.medId ? lineFrom(hl.medId) : freeLine(hl.name); l.kind = 'STOP'; l.stopReason = hl.reason || '' } else l = lineFromHist(hl, rx)
      l.cf = null; l.collapsed = false; addLine(l, true)
    })
    rx.tests.forEach(function (t) { dr.tests.push({ t: t }) })
    rx.cc.forEach(function (t) { dr.notes.cc.push({ t: t }) })
    rx.dx.forEach(function (x) { dr.dx.push({ t: x.t, type: x.type }) })
    rx.advice.forEach(function (t) { dr.notes.advice.push({ t: t }) })
    if (rx.fuRec && rx.fuRec.n) dr.fu = { unit: rx.fuRec.unit, n: String(rx.fuRec.n), note: rx.fuRec.note || '', rem: !!rx.fuRec.rem, remDays: String(rx.fuRec.remDays || 1), slot: null }
    }
    S.view = 'consult'; closeModal(); render()
    toast('Editing ' + rx.no + ' - editable for ' + leftText(leftMin(rx)) + '. The full prescription is loaded.')
  }
  function finishEdit(ed, rec) {
    var keep = ['id', 'no', 'version', 'date', 'byMe', 'by', 'serial', 'submittedAt', 'animalId'], dr = S.draft, oldCode = codeFor(ed.no)
    Object.keys(rec).forEach(function (k) { if (keep.indexOf(k) < 0) ed[k] = rec[k] })
    ed.edits = (ed.edits || 0) + 1; ed.editedAt = nowIso()
    var code = genCode(ed.no + '#' + ed.edits)
    S.retired.push({ no: ed.no, code: oldCode })
    D.verifyDb = D.verifyDb.filter(function (r) { return r.no !== ed.no })
    D.verifyDb.push({ no: ed.no, code: code, status: 'VALID', issued: fmtY(ed.date), doctor: doc().name, bmdc: doc().bmdc, patient: maskName(pat().name),
      meds: dr.lines.map(function (l) { return isStop(l) ? 'STOP: ' + lineName(l) : lineName(l) + ' - ' + doseText(l) + ' - ' + durText(l).toLowerCase() }) })
    S.lastIssued = { no: ed.no, code: code, version: ed.version }; dr.editing = null
    openModal({ title: 'Prescription updated', cls: 'sm', body: '<div class="success"><div class="tick">&#10003;</div><h3>' + esc(ed.no) + ' &middot; v' + ed.version + ' (edited)</h3><p class="muted">Edited ' + esc(whenText(ed.editedAt)) + '. Same number and version; the submission time and the window did not change.</p>' +
      qrHtml(ed.no + code) + '<div class="chkcode">New check code: ' + code + '</div></div>' +
      '<div class="amber-note">Copies printed before this edit now show &ldquo;Not valid &ndash; changed&rdquo; (old code ' + esc(oldCode) + ').</div>' +
      '<div class="note">The patient sees the latest version only. SMS (simulated): &ldquo;Your prescription ' + esc(ed.no) + ' was updated.&rdquo; The link requires patient login.</div>',
      foot: '<button class="btn ghost" data-act="verifyThis">Open in Verify page</button><button class="btn primary" data-act="backToAppts">Back to appointments</button>' })
  }

  /* ---------- doctor -> branch routing (PHAR-1711, decision B: any time, never changes the content) ---------- */
  function routeModal(id) {
    var rx = rxById(id)
    if (!rx || !isMine(rx)) return toast('Only the issuing doctor can send a prescription to a branch')
    openModal({ title: 'Send to pharmacy branch', cls: 'sm', body: '<p class="muted small">' + esc(rx.no) + '. Allowed at any time, also after the edit window. Sending does not change the prescription; the branch can only read it.</p><ul class="shr-l">' +
      D.branches.map(function (b) {
        var on = shareOn(rx, 'branch', b.id).length > 0
        return '<li><div><b>' + esc(b.name) + '</b><small>' + esc(b.addr) + '</small></div>' + (on ? '<span class="pill off">Sent</span>' : '<button class="btn sm primary" data-act="routeSend" data-id="' + id + '" data-b="' + b.id + '">Send</button>') + '</li>'
      }).join('') + '</ul>', foot: '<button class="btn ghost" data-act="closeModal">Done</button>' })
  }

  /* ---------- patient: Share sheet, revoke, external link (PHAR-1711) ---------- */
  function shRow(s) {
    var who = s.kind === 'doctor' ? D.doctors.filter(function (d) { return d.id === s.target })[0] : null
    var label = s.kind === 'doctor' ? esc(who.name) + ' <small>Doctor &middot; shared by you ' + esc(fmtY(s.at.slice(0, 10))) + '</small>'
      : s.kind === 'branch' ? esc(branchName(s.target)) + ' <small>Pharmacy branch &middot; ' + (s.by === 'doctor' ? 'sent by your doctor' : 'shared by you') + ' ' + esc(fmtY(s.at.slice(0, 10))) + '</small>'
      : '<span class="mono">' + esc(linkUrl(s.target)) + '</span> <small>View-only link &middot; created ' + esc(fmtY(s.at.slice(0, 10))) + '</small>'
    var acts = !s.active ? '<span class="pill off">Revoked</span>' + (s.kind === 'link' ? ' <button class="link" data-act="extOpen" data-t="' + s.target + '">Open as recipient</button>' : '')
      : (s.kind === 'link' ? '<button class="link" data-act="extOpen" data-t="' + s.target + '">Open as recipient</button>' : '') + (s.by === 'doctor' ? '' : '<button class="btn sm ghost" data-act="shRevoke" data-id="' + s.id + '">Revoke</button>')
    return '<li class="' + (s.active ? '' : 'rev') + '"><div>' + label + '</div><div class="shr-a">' + acts + '</div></li>'
  }
  function shResults() {
    var rx = rxById(S.shRx), q = S.shq.trim().toLowerCase(), issuer = rx.by || (rx.byMe ? 'd1' : '')
    if (!q) return '<div class="muted small">Type a doctor name or speciality.</div>'
    var res = D.doctors.filter(function (d) { return d.id !== issuer && !shareOn(rx, 'doctor', d.id).length && (d.name + ' ' + specName(d.spec) + ' ' + (d.chamber || '')).toLowerCase().indexOf(q) >= 0 }).slice(0, 6)
    return res.length ? '<ul class="shr-l">' + res.map(function (d) { return '<li><div><b>' + esc(d.name) + '</b><small>' + esc(specName(d.spec)) + ' &middot; ' + esc(d.chamber || '') + '</small></div><button class="btn sm primary" data-act="shDoc" data-d="' + d.id + '">Share</button></li>' }).join('') + '</ul>' : '<div class="muted small">No doctor found.</div>'
  }
  function shSearch(v) { S.shq = v; var el = $('#shRes'); if (el) el.innerHTML = shResults() }
  function shareModal(id) {
    var rx = rxById(id); S.shRx = id; S.shq = ''
    var all = D.shares.filter(function (s) { return s.rx === id }), act = all.filter(function (s) { return s.active }), rev = all.filter(function (s) { return !s.active })
    openModal({ title: 'Share prescription', body: '<p class="muted small">' + esc(rx.no) + ' &middot; ' + fmtY(rx.date) + '. Only you and the doctor who wrote it can see it unless you share it. Shares never expire on their own; revoke any time and access ends at once.</p>' +
      '<h4>Active shares</h4>' + (act.length ? '<ul class="shr-l" id="shAct">' + act.map(shRow).join('') + '</ul>' : '<div class="empty slim" id="shAct">Not shared with anyone.</div>') +
      '<h4>Share with a doctor</h4><input class="txt" data-shq="1" placeholder="Search doctor name or speciality" value="" aria-label="Search doctor"><div id="shRes">' + shResults() + '</div>' +
      '<h4>Share with a pharmacy branch</h4><ul class="shr-l">' + D.branches.map(function (b) {
        var on = shareOn(rx, 'branch', b.id).length > 0
        return '<li><div><b>' + esc(b.name) + '</b></div>' + (on ? '<span class="pill off">Shared</span>' : '<button class="btn sm" data-act="shBranch" data-b="' + b.id + '">Share</button>') + '</li>'
      }).join('') + '</ul>' +
      '<h4>Anyone outside the app</h4><p class="muted small">Creates a view-only link. Whoever has the link can read this prescription (no editing, no download) until you revoke it.</p><button class="btn sm" data-act="shLink">Create view-only link</button>' +
      (rev.length ? '<h4>Revoked</h4><ul class="shr-l">' + rev.map(shRow).join('') + '</ul>' : ''),
      foot: '<button class="btn primary" data-act="closeModal">Done</button>' })
  }
  function renderExt() {
    var s = D.shares.filter(function (x) { return x.kind === 'link' && x.target === S.extTok })[0], rx = s && s.active ? rxById(s.rx) : null
    $('#view').innerHTML = '<div class="page"><div class="page-h"><div><h1>External view-only link</h1><p class="muted">What a person outside the app sees when they open a link the patient created.</p></div><button class="btn ghost" data-act="goto" data-v="patient">&larr; Back to Patient view</button></div>' +
      '<div class="phone"><div class="ph-bar">' + esc(linkUrl(S.extTok || '')) + '</div><div class="ph-b">' +
      (rx ? '<h3>Shared prescription</h3><p class="muted small">View only. The patient shared this and can revoke the link at any time. No download, no editing.</p>' + rxReadHtml(rx, { notes: false, patient: maskName(D.patients[pidOfRx(rx)].name) })
        : '<div class="vr bad"><strong>Link revoked</strong><p>The patient has revoked this link, or it is not valid. Nothing is shown.</p></div>') + '</div></div></div>'
  }

  /* ---------- patient: SMS link needs login (PHAR-1714, decision D) ---------- */
  function smsHtml() {
    var list = (D.history.p1 || []).slice().sort(function (a, b) { return subIso(a) < subIso(b) ? 1 : -1 })
    return '<h3>SMS inbox (simulated)</h3><p class="muted small">What the patient receives. The link is the patient\'s own copy: it opens only after phone + OTP login.</p>' + list.map(function (r) {
      return '<div class="sms"><small>PharmaZ247 &middot; ' + esc(whenText(subIso(r))) + '</small><p>PharmaZ247: Your prescription ' + esc(r.no) + ' from ' + esc(docNameOf(r)) + (r.editedAt ? ' was updated' : ' is ready') + '. View it (login required): <span class="mono">portal.pharmaz247.example/rx/' + smsTok(r) + '</span></p>' +
        '<button class="btn sm" data-act="smsOpen" data-id="' + r.id + '">Open link</button></div>'
    }).join('')
  }
  function lgErr(f) { return S.lg.errF === f && S.lg.err ? '<span class="fld-err">' + esc(S.lg.err) + '</span>' : '' }
  function loginHtml() {
    var g = S.lg
    return '<div class="lgin"><button class="link" data-act="smsBack">&larr; Back to SMS</button><h3>Sign in to view your prescription</h3><p class="muted small">This link works only after you sign in. If it is forwarded to someone else, they see nothing.</p>' +
      (g.step === 'phone' ? '<label class="fld"><span>Mobile number</span><input class="txt" data-lg="phone" value="' + esc(g.phone) + '" placeholder="01XXXXXXXXX" inputmode="numeric"></label>' + lgErr('phone') +
        '<button class="btn primary" data-act="lgSend">Send OTP</button><div class="muted small">Demo numbers: 01712345678 (Rahima Begum), 01819000204 (Sabbir Hossain).</div>'
        : '<p class="muted small">A 6-digit code was sent to ' + esc(g.phone.slice(0, 5) + '***' + g.phone.slice(-3)) + '.</p><div class="amber-note">Simulated SMS: your code is <b>123456</b></div><label class="fld"><span>OTP</span><input class="txt mono" data-lg="otp" value="' + esc(g.otp) + '" maxlength="6" inputmode="numeric"></label>' + lgErr('otp') +
        '<div class="row"><button class="btn primary" data-act="lgVerify">Verify</button><button class="btn ghost" data-act="lgBack">Change number</button></div>') + '</div>'
  }
  function smsLinkBody() {
    var rx = rxById(S.smsRx), owner = pidOfRx(rx)
    if (!S.linkAuth) return loginHtml()
    var who = D.patients[S.linkAuth.pid].name, bar = '<div class="linkbar muted small">Signed in as ' + esc(who) + ' &middot; <button class="link" data-act="lgOut">Sign out</button></div>'
    if (S.linkAuth.pid !== owner) return bar + '<div class="vr bad"><strong>Not available</strong><p>This prescription was not issued to the signed-in account.</p></div>'
    S.pv = rx.id; S.pvPid = owner
    return bar + patientRxBody(owner)
  }
  function pvInfo(rx) {
    var sh = D.shares.filter(function (s) { return s.rx === rx.id && s.active }).length
    return '<p class="muted small">Submitted ' + esc(whenText(subIso(rx))) + (rx.editedAt ? ' &middot; <b>updated ' + esc(whenText(rx.editedAt)) + '</b> (this is the latest version)' : '') + (S.smsRx ? '' : ' &middot; shared with ' + sh + ' ' + (sh === 1 ? 'recipient' : 'recipients')) + '</p>'
  }
  function pcardExtra(r) { var n = D.shares.filter(function (s) { return s.rx === r.id && s.active }).length; return (r.editedAt ? ' &middot; edited' : '') + (n ? ' &middot; shared (' + n + ')' : '') }

  /* ---------- staff / POS (PHAR-1713; R1 = no write controls exist) ---------- */
  function sharedToBranch() {
    var out = []
    Object.keys(D.history).forEach(function (k) { D.history[k].forEach(function (r) { var s = shareOn(r, 'branch', S.posBranch)[0]; if (s) out.push({ rx: r, s: s, pid: k }) }) })
    return out.sort(function (a, b) { return a.s.at < b.s.at ? 1 : -1 })
  }
  function posResult() {
    if (S.posNo === null) return ''
    var rx = rxByNo(S.posNo), s = rx ? shareOn(rx, 'branch', S.posBranch)[0] : null
    if (!rx || !s) return '<div class="vr bad" id="posMsg"><strong>Not found or not shared with this branch</strong><p>Check the number. A prescription appears here only when the doctor or the patient has shared it with this branch.</p></div>'
    return '<div class="pos-res" id="posMsg">' + rxReadHtml(rx, { notes: false, patient: D.patients[pidOfRx(rx)].name }) +
      '<div class="note small">Shared to this branch by ' + (s.by === 'doctor' ? esc(docNameOf(rx)) + ' (issuing doctor)' : 'the patient') + ' on ' + esc(whenText(s.at)) + '. Read-only. Dispense from the POS sale screen.</div></div>'
  }
  function renderPos() {
    var list = sharedToBranch()
    $('#view').innerHTML = '<div class="page narrow"><div class="page-h"><div><h1>Pharmacy staff (POS)</h1><p class="muted">Prescription lookup for a pharmacy user. Prototype screen; the real POS sale screen is not shown.</p></div>' +
      '<label class="fld"><span>Signed in at branch</span><select data-act="posBranch" aria-label="Branch">' + D.branches.map(function (b) { return '<option value="' + b.id + '"' + (b.id === S.posBranch ? ' selected' : '') + '>' + esc(b.name) + '</option>' }).join('') + '</select></label></div>' +
      '<div class="amber-note"><b>Staff cannot create, draft or edit a prescription (R1).</b> This screen has no such control on purpose, and the server refuses a staff write with 403. Staff see only prescriptions shared to their own branch by the issuing doctor or the patient (R5).</div>' +
      '<div class="pos-f"><label class="fld grow"><span>Rx number</span><input class="txt mono" id="posRx" value="' + esc(S.posQ) + '" placeholder="RX-A12345-0042"></label><button class="btn primary" data-act="posGo">Look up</button></div>' +
      '<div id="posOut">' + posResult() + '</div>' +
      '<h3>Shared to this branch</h3>' + (list.length ? '<ul class="prx-l">' + list.map(function (x) {
        return '<li class="prx-c"><div class="prx-m"><b>' + esc(x.rx.no) + '</b> <span class="muted">' + fmtY(x.rx.date) + '</span><div class="muted small">' + esc(D.patients[x.pid].name) + ' &middot; ' + (x.s.by === 'doctor' ? 'sent by the doctor' : 'shared by the patient') + '</div></div><div class="prx-a"><button class="btn sm" data-act="posOpen" data-no="' + esc(x.rx.no) + '">Open</button></div></li>'
      }).join('') + '</ul>' : '<div class="empty slim">Nothing is shared to this branch yet.</div>') + '</div>'
  }
  function protoClock() {
    return '<fieldset><legend>Edit window / clock</legend><div class="muted small">Now: ' + esc(whenText(nowIso())) + '</div><select data-act="winSet" aria-label="Edit window">' +
      [[1440, '24 h (default)'], [720, '12 h'], [60, '1 h'], [1, '1 min (expires fast)']].map(function (o) { return '<option value="' + o[0] + '"' + (S.winMin === o[0] ? ' selected' : '') + '>' + o[1] + '</option>' }).join('') + '</select>' +
      '<div class="row"><button class="btn sm" data-act="clk" data-m="60">+1 h</button><button class="btn sm" data-act="clk" data-m="720">+12 h</button></div><div class="row"><button class="btn sm" data-act="clk" data-m="1440">+1 day</button><button class="btn sm" data-act="clk" data-m="0">Reset</button></div></fieldset>'
  }

  Object.assign(A, {
    winSet: function (e) { S.winMin = +e.value; tick(); toast('Edit window: ' + winLabel() + ' from submission') },
    clk: function (e) { var m = +e.getAttribute('data-m'); S.clockMin = m ? S.clockMin + m : 0; tick(); toast('Prototype time: ' + whenText(nowIso())) },
    prxPat: function (e) { S.prxPid = e.value; renderPrx() },
    rxOpen: function (e) { rxDrawer(e.getAttribute('data-id')) },
    rxEdit: function (e) { editStart(e.getAttribute('data-id')) },
    routeOpen: function (e) { routeModal(e.getAttribute('data-id')) },
    routeSend: function (e) {
      var rx = rxById(e.getAttribute('data-id')), b = e.getAttribute('data-b')
      if (!rx || !isMine(rx)) return
      D.shares.push({ id: 'shn' + (S.seq++), rx: rx.id, kind: 'branch', target: b, by: 'doctor', active: true, at: nowIso() })
      routeModal(rx.id); if (S.view === 'prx') renderPrx()
      toast('Sent to ' + branchName(b) + ' - the branch can now find ' + rx.no)
    },
    shareOpen: function (e) { shareModal(e.getAttribute('data-id')) },
    shDoc: function (e) {
      var rx = rxById(S.shRx), d = e.getAttribute('data-d')
      D.shares.push({ id: 'shn' + (S.seq++), rx: rx.id, kind: 'doctor', target: d, by: 'patient', active: true, at: nowIso() })
      shareModal(rx.id); renderPatient(); toast('Shared with ' + D.doctors.filter(function (x) { return x.id === d })[0].name + ' (view only)')
    },
    shBranch: function (e) {
      var rx = rxById(S.shRx), b = e.getAttribute('data-b')
      D.shares.push({ id: 'shn' + (S.seq++), rx: rx.id, kind: 'branch', target: b, by: 'patient', active: true, at: nowIso() })
      shareModal(rx.id); renderPatient(); toast('Shared with ' + branchName(b))
    },
    shLink: function () {
      var rx = rxById(S.shRx), tok = hash('t' + (S.seq++) + rx.no).toString(36).slice(0, 6)
      D.shares.push({ id: 'shn' + (S.seq++), rx: rx.id, kind: 'link', target: tok, by: 'patient', active: true, at: nowIso() })
      shareModal(rx.id); renderPatient(); toast('View-only link created: ' + linkUrl(tok))
    },
    shRevoke: function (e) {
      var s = D.shares.filter(function (x) { return x.id === e.getAttribute('data-id') })[0]
      s.active = false; s.revokedAt = nowIso(); shareModal(s.rx); renderPatient(); toast('Revoked - access ended immediately')
    },
    extOpen: function (e) { S.extTok = e.getAttribute('data-t'); closeModal(); S.view = 'ext'; render() },
    smsOpen: function (e) { S.smsRx = e.getAttribute('data-id'); if (!S.linkAuth) S.lg = { step: 'phone', phone: '', otp: '', err: '', errF: '' }; renderPatient() },
    smsBack: function () { S.smsRx = null; S.pv = null; S.pvPid = null; S.pvTab = 'sms'; renderPatient() },
    lgSend: function () {
      var p = S.lg.phone.replace(/\D/g, ''); S.lg.phone = p
      if (!/^01\d{9}$/.test(p)) { S.lg.err = 'Enter an 11-digit mobile number starting with 01'; S.lg.errF = 'phone' } else { S.lg.step = 'otp'; S.lg.err = ''; S.lg.errF = ''; S.lg.otp = '' }
      renderPatient()
    },
    lgBack: function () { S.lg.step = 'phone'; S.lg.err = ''; S.lg.errF = ''; renderPatient() },
    lgVerify: function () {
      if (S.lg.otp === '123456' && PHONES[S.lg.phone]) { S.linkAuth = { pid: PHONES[S.lg.phone] }; S.lg.err = ''; S.lg.errF = '' } else { S.lg.err = 'Incorrect code or number'; S.lg.errF = 'otp' }
      renderPatient()
    },
    lgOut: function () { S.linkAuth = null; S.lg = { step: 'phone', phone: '', otp: '', err: '', errF: '' }; S.pv = null; S.pvPid = null; renderPatient(); toast('Signed out') },
    posBranch: function (e) { S.posBranch = e.value; S.posNo = null; renderPos() },
    posGo: function () { var i = $('#posRx'); S.posQ = i ? i.value : S.posQ; S.posNo = S.posQ.trim().toUpperCase(); renderPos() },
    posOpen: function (e) { S.posQ = e.getAttribute('data-no'); S.posNo = S.posQ; renderPos() }
  })

  document.addEventListener('click', function (ev) {
    var it = ev.target.closest('.sugg-item')
    if (it) return
    var el = ev.target.closest('[data-act]')
    if (!el) { if (!ev.target.closest('.sg-wrap')) sgClose(); return }
    var fn = A[el.getAttribute('data-act')]
    if (el.tagName === 'INPUT' && el.type !== 'checkbox' && el.type !== 'radio') return
    if (el.tagName === 'SELECT') return /* selects act on change */
    if (el.type === 'radio' || el.type === 'checkbox') return /* handled on change */
    if (fn) fn(el, ev)
  })
  document.addEventListener('change', function (ev) {
    var el = ev.target
    if (el.tagName === 'SELECT' && el.getAttribute('data-act') && A[el.getAttribute('data-act')]) return A[el.getAttribute('data-act')](el, ev)
    if (el.hasAttribute('data-bk')) blockChange(el)
    if (el.hasAttribute('data-wd')) wdChange(el)
    if (el.hasAttribute('data-th')) toothChange(el, false)
    if (el.type === 'radio' || el.type === 'checkbox') {
      var act = el.getAttribute('data-act')
      if (act && A[act]) return A[act](el, ev)
    }
    if (el.hasAttribute('data-line')) { lineChange(el); if (S.showErr && S.draft) { var ln = lineById(el.getAttribute('data-line')); if (ln) replaceLine(ln) } }
    if (el.hasAttribute('data-qf')) qaChange(el)
    if (el.hasAttribute('data-xk')) xChange(el, false)
    if (el.hasAttribute('data-rk')) resChange(el, false)
    if (el.hasAttribute('data-lf')) libFormChange(el)
    if (el.hasAttribute('data-noteedit')) noteEdit(el)
    if (el.hasAttribute('data-secname')) secRename(el, 'title')
    if (el.hasAttribute('data-secabbr')) secRename(el, 'abbr')
  })
  document.addEventListener('mousedown', function (ev) {
    var it = ev.target.closest('.sugg-item')
    if (!it || !S.sg) return
    ev.preventDefault(); sgPick(S.sg.items[+it.getAttribute('data-i')])
  })
  document.addEventListener('input', function (ev) {
    var el = ev.target
    if (el.hasAttribute('data-gq')) return gFilter(el.value)
    if (el.hasAttribute('data-lg')) { S.lg[el.getAttribute('data-lg')] = el.value; return }
    if (el.hasAttribute('data-shq')) return shSearch(el.value)
    if (el.hasAttribute('data-bk')) return blockChange(el)
    if (el.hasAttribute('data-wd')) return wdChange(el)
    if (el.hasAttribute('data-th') && el.type !== 'checkbox' && el.tagName !== 'SELECT') return toothChange(el, true)
    if (el.hasAttribute('data-sugg')) return sgOpen(el)
    if (el.hasAttribute('data-bind')) return bindChange(el)
    if (el.hasAttribute('data-xk') && el.type !== 'checkbox' && el.tagName !== 'SELECT') return xChange(el, true)
    if (el.hasAttribute('data-rk')) return resChange(el, true)
    if (el.hasAttribute('data-lf')) return libFormChange(el)
    if (el.hasAttribute('data-tp')) { S.taper[el.getAttribute('data-tp')] = el.value; $('#tpPrev').innerHTML = taperPrevHtml(); return }
    if (el.hasAttribute('data-line') && el.type !== 'checkbox' && el.tagName !== 'SELECT') lineChange(el)
  })
  document.addEventListener('focusin', function (ev) {
    var el = ev.target
    if (el.hasAttribute && el.hasAttribute('data-sugg') && el.getAttribute('data-sugg').split(':')[0] !== 'med') sgOpen(el)
  })
  document.addEventListener('focusout', function (ev) {
    if (ev.target.hasAttribute && ev.target.hasAttribute('data-sugg')) setTimeout(function () { if (S.sg && S.sg.input === ev.target) sgClose() }, 120)
  })
  document.addEventListener('keydown', function (ev) {
    var el = ev.target
    if (ev.key === 'Escape') { if (S.sg) return sgClose(); if (S.modal) return closeModal() }
    if (el.hasAttribute && el.hasAttribute('data-sugg')) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); if (!S.sg) sgOpen(el); else sgMove(1) }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); sgMove(-1) }
      else if (ev.key === 'Enter') {
        ev.preventDefault()
        if (S.sg && S.sg.input === el && S.sg.items.length) sgPick(S.sg.items[S.sg.idx]); else sgEnterRaw(el)
      }
      return
    }
    if (ev.key === 'Enter' && (el.id === 'secNewName' || el.id === 'secNewAbbr')) { ev.preventDefault(); return secAdd() }
    if (ev.key === 'Enter' && el.id === 'secQuick') { ev.preventDefault(); return secAddQuick(el) }
    if (ev.key === 'Enter' && el.id === 'msNewNote') { ev.preventDefault(); return A.noteAdd() }
    if (ev.key === 'Enter' && el.hasAttribute && el.hasAttribute('data-instr')) { ev.preventDefault(); return instrPush(el.getAttribute('data-instr'), el.value) }
    if (ev.key === 'Enter' && (el.id === 'vRx' || el.id === 'vCode')) return A.vGo()
    if (ev.key === 'Enter' && el.id === 'posRx') return A.posGo()
    if (ev.key === '/' && S.view === 'consult' && !/INPUT|SELECT|TEXTAREA/.test(el.tagName) && !S.modal) {
      var m = $('[data-fk="in.med"]'); if (m) { ev.preventDefault(); m.focus() }
    }
  })
  function bindChange(el) {
    var path = el.getAttribute('data-bind').split('.'), o = path[0] === 'vitals' ? S.draft.vitals : S.draft.fu
    o[path[1]] = el.value
    if (path[0] === 'vitals') { var b = $('#bmi'); if (b) b.textContent = bmi(); blocksSync() }
    if (path[0] === 'vitals' && path[1] === 'weight') { S.draft.lines.forEach(function (l) { if (l.dpkOn) { syncWk(l); patchLine(l) } }); weightErrSync() }
    if (path[0] === 'fu' && path[1] === 'n') { if (S.draft.fu.slot) { S.draft.fu.slot = null; toast('Follow-up changed - the booked slot was cleared') } var fx = $('#fuX'); if (fx) fx.outerHTML = fuExtra(); var i0 = $('#fuInfo'); if (i0) i0.textContent = followDate() ? 'Follow-up on ' + followDate() : '' }
    else if (path[0] === 'fu') { var i = $('#fuInfo'); if (i) i.textContent = followDate() ? 'Follow-up on ' + followDate() : '' }
  }
  function lineChange(el) {
    var l = lineById(el.getAttribute('data-line')), fld = el.getAttribute('data-f'); if (!l) return
    var val = el.type === 'checkbox' ? el.checked : el.value, k = el.getAttribute('data-step')
    var t = k === null ? l : l.steps[+k] /* a dosage step's own field */, ci = el.getAttribute('data-ci'), man = manualQty(l)
    if (ci !== null) l.cond[+ci][el.getAttribute('data-cf')] = val /* sliding-scale row */
    else if (/^slot\d$/.test(fld)) t.slots[+fld.charAt(4)] = val
    else t[fld] = val
    if (fld === 'route' && l.side && !sideOn(l)) { l.side = ''; toast('Side cleared - it applies to eye, ear and nasal routes only') }
    if (fld === 'mode') syncReason(l)
    if (fld === 'dpkOn' && !val) { l.dpkOvr = ''; l.wkText = '' }
    syncWk(l); weightErrSync()
    if (fld === 'mode' || fld === 'cont' || fld === 'startMode' || fld === 'route' || fld === 'dpkOn' || man !== manualQty(l)) return replaceLine(l)
    patchLine(l)
  }

  /* ================= USER GUIDE: in-app help for non-developers (content in data.js D.guide) ================= */
  var GUIDE = D.guide || []
  var G_TAB = { appointments: 'Appointments', consult: 'Consultation', prx: 'Patient Rx', profile: 'My profile', verify: 'Verify (public)', patient: 'Patient view', pos: 'Pharmacy staff (POS)', ext: 'Patient view' }
  S.gSec = 'start'; S.gQ = ''; S.gFrom = null; S.welcomeOff = false
  function fake(o) { return { type: o.type || 'text', value: o.value || '', checked: !!o.checked, getAttribute: function (k) { return o[k] === undefined ? null : o[k] }, hasAttribute: function (k) { return o[k] !== undefined } } }
  function gMd(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }
  function gList(tag, items) { return '<' + tag + '>' + items.map(function (t) { return '<li>' + gMd(t) + '</li>' }).join('') + '</' + tag + '>' }
  function gTable(head, rows) {
    // cell text comes from mock data (it can contain ***), so it is escaped only; the first column is bold
    return '<div class="g-tw"><table class="g-t"><thead><tr>' + head.map(function (h) { return '<th>' + esc(h) + '</th>' }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td>' + (i ? esc(c) : '<b>' + esc(c) + '</b>') + '</td>' }).join('') + '</tr>' }).join('') + '</tbody></table></div>'
  }
  function gApptOf(pid, docId) { return D.appointments.filter(function (a) { return a.patientId === pid && (!docId || a.doc === docId) })[0] }
  // Cheat-sheet tables are built from the mock data, so they always match what is on screen.
  function gCheat(k) {
    var P = D.patients, ids
    if (k === 'scenarios') return gTable(['Scenario', 'Patient', 'Serial', 'Reason for visit'], [['returning', 'Returning patient'], ['first', 'First visit'], ['family', 'Family member']].map(function (s) {
      var p = P[SCEN[s[0]]], a = gApptOf(p.id, 'd1')
      return [s[1], p.name + ', ' + p.age + (p.relation ? ' (' + p.relation + ')' : ''), '#' + a.serial, a.reason]
    }))
    if (k === 'patients') {
      ids = Object.keys(P).filter(function (id) { return !P[id].animalId })
      return gTable(['Patient', 'Age / sex', 'Phone', 'Allergies', 'Other'], ids.map(function (id) {
        var p = P[id]
        return [p.name, p.age + ' / ' + p.sex, p.phone, p.allergies.length ? p.allergies.join(', ') : '-', (p.relation || '') + (p.chronic && p.chronic.length ? (p.relation ? '; ' : '') + 'Known: ' + p.chronic.join(', ') : '') || '-']
      }))
    }
    if (k === 'doctors') {
      return gTable(['Doctor', 'Speciality', 'Type', 'Appointments today'], D.doctors.filter(function (d) { return d.login }).map(function (d) {
        var ap = D.appointments.filter(function (a) { return a.doc === d.id }).map(function (a) { return '#' + a.serial + ' ' + P[a.patientId].name }).join('; ')
        return [d.name + (d.id === 'd1' ? ' (default)' : ''), specName(d.spec), ptype(d).label, ap || '-']
      }))
    }
    if (k === 'rx') {
      var meaning = { 'RX-A12345-0036': 'Valid (the Scan QR sample)', 'RX-A12345-0042': 'Valid, with a newer prescription note (Old prescription)', 'RX-A12345-0029': 'Not valid - changed', 'RX-A12345-0050': 'Issued today for Nasrin Akter. After you Edit it, this old code says "Not valid - changed"' }
      var t1 = gTable(['Rx number', 'Check code', 'Verify result'], D.verifyDb.map(function (r) {
        return [r.no, r.code, meaning[r.no] || (r.status === 'CHANGED' ? 'Not valid - changed' : 'Issued in this session')]
      }).concat([['RX-A12345-9999', 'AAAA-1111', 'Not valid - not found (the "not found" demo)']]))
      var rows = []
      Object.keys(D.history).forEach(function (pid) {
        D.history[pid].forEach(function (r) { rows.push([r.no, P[pid].name, 'v' + r.version + ', ' + fmtY(r.date), docNameOf(r), String(r.lines.length)]) })
      })
      return t1 + '<h3>Prescription history (Patient view and Patient Rx)</h3>' + gTable(['Rx number', 'Patient', 'Version and date', 'Written by', 'Medicines'], rows)
    }
    if (k === 'branches') return gTable(['Branch', 'Address'], D.branches.map(function (b) { return [b.name, b.addr] }))
    if (k === 'animals') return gTable(['Animal', 'Species and breed', 'Sex, age', 'Features', 'Vet appointment'], D.animals.map(function (an) {
      var pid = patientIdForAnimal(an), a = pid ? gApptOf(pid, 'd7') : null
      return [an.name, spName(an) + (an.breed ? ' (' + an.breed + ')' : ''), an.sex + ', ' + animalAge(an), an.features.join('; '), a ? '#' + a.serial + ' with Dr. Shamim Reza (DVM)' : '-']
    }))
    return ''
  }
  function gPart(p) {
    var h = '<h3>' + esc(p.h) + '</h3>'
    if (p.ol) return h + gList('ol', p.ol)
    if (p.ul) return h + gList('ul', p.ul)
    return p.cheat ? h + gCheat(p.cheat) : ''
  }
  function gSecHtml(s) {
    return '<section class="g-sec" id="g-' + s.id + '" data-gs="' + s.id + '"><h2>' + esc(s.title) + '</h2>' +
      (s.tags && s.tags.length ? '<div class="g-tags">' + s.tags.map(function (t) { return '<span class="tag g-tag">' + esc(t) + '</span>' }).join('') + '</div>' : '') +
      '<p class="g-lead">' + gMd(s.lead) + '</p>' + s.parts.map(gPart).join('') +
      '<div class="g-show">' + s.show.map(function (b, i) { return '<button class="btn ' + (i ? 'ghost' : 'primary') + '" data-act="gShow" data-k="' + b.k + '">' + esc(b.label) + '</button>' }).join('') + '</div></section>'
  }
  function renderGuide() {
    var from = S.gFrom && S.gFrom !== 'guide' ? S.gFrom : null
    $('#view').innerHTML = '<div class="page guide"><div class="page-h"><div><h1>User guide</h1><p class="muted">How to use this prototype. No developer knowledge needed. <b>Show me</b> buttons set up the screen for you.</p></div>' +
      '<div class="g-hb">' + (from ? '<button class="btn ghost" data-act="gBack">&larr; Back to ' + esc(G_TAB[from] || 'the prototype') + '</button>' : '') + '<button class="btn ghost" data-act="gPrint">Print the guide</button></div></div>' +
      '<div class="g-searchrow"><input type="search" class="txt" data-gq="1" placeholder="Search the guide (for example: taper, share, OTP)" aria-label="Search the guide" value="' + esc(S.gQ) + '"><span class="muted small" id="gCount"></span></div>' +
      '<div class="g-wrap"><details class="g-toc" id="gToc" open><summary>Contents</summary><ol class="g-toc-l">' + GUIDE.map(function (s) { return '<li data-gt="' + s.id + '"><button data-act="gGo" data-id="' + s.id + '">' + esc(s.title) + '</button></li>' }).join('') + '</ol></details>' +
      '<div class="g-main">' + GUIDE.map(gSecHtml).join('') + '<p class="g-none" id="gNone" hidden>No section matches. Try a shorter word.</p></div></div></div>'
    if (window.innerWidth <= 820) $('#gToc').removeAttribute('open')
    gFilter(S.gQ); gMark()
  }
  function gFilter(q) {
    S.gQ = q; var t = String(q).trim().toLowerCase(), n = 0
    $$('.g-sec').forEach(function (el) {
      var on = !t || el.textContent.toLowerCase().indexOf(t) >= 0, li = $('[data-gt="' + el.getAttribute('data-gs') + '"]')
      if (on) { el.removeAttribute('hidden'); n++ } else el.setAttribute('hidden', '')
      if (li) { if (on) li.removeAttribute('hidden'); else li.setAttribute('hidden', '') }
    })
    var none = $('#gNone'), c = $('#gCount')
    if (none) { if (n) none.setAttribute('hidden', ''); else none.removeAttribute('hidden') }
    if (c) c.textContent = t ? n + ' of ' + GUIDE.length + ' sections' : ''
  }
  function gMark() { $$('.g-toc-l li').forEach(function (li) { li.classList.toggle('on', li.getAttribute('data-gt') === S.gSec) }) }
  function gScroll(id) { var el = $('#g-' + id); if (el) el.scrollIntoView({ block: 'start' }) }
  function gOpen(id) {
    if (S.view !== 'guide') S.gFrom = S.view
    S.gSec = id || 'start'; S.view = 'guide'; closeModal(); render(); if (S.gSec !== 'start') gScroll(S.gSec)
  }
  window.addEventListener('scroll', function () {
    if (S.view !== 'guide') return
    var cur = null
    $$('.g-sec').forEach(function (s) { if (!s.hidden && s.getBoundingClientRect().top < 130) cur = s.getAttribute('data-gs') })
    if (cur && cur !== S.gSec) { S.gSec = cur; gMark() }
  })

  /* "Show me": set up the state, then call the same handlers a click would call. */
  function gDoc(id) { closeModal(); if (S.doc !== id) { S.draft = null; loadDoc(id) } S.profileMsg = '' }
  function gConsult(sc) { gDoc('d1'); openForScenario(sc) }
  function gPreset(id) {
    if (S.tpl.presets.some(function (p) { return p.id === id })) return A.addPreset(fake({ 'data-id': id }))
    var p = D.medTemplates.presets.filter(function (x) { return x.id === id })[0]
    if (p) addMedicine(p.med.id, p.med)
  }
  function gView(v) { gDoc('d1'); S.view = v; render() }
  function gPatient(tab, rx) {
    gDoc('d1'); S.view = 'patient'; S.pv = null; S.pvPid = null; S.smsRx = null; render()
    A.pTab(fake({ 'data-t': tab }))
    if (rx) A.pOpen(fake({ 'data-id': rx }))
  }
  function gVerify(k) {
    gDoc('d1'); S.view = 'verify'; S.vf = { rx: 'RX-A12345-0036', code: 'ZP4M-8XQD', result: null }; render()
    if (k) A.vDemo(fake({ 'data-k': k }))
  }
  function gPrx(p) { gDoc('d1'); S.winMin = p.win; S.clockMin = 0; S.view = 'prx'; S.prxPid = 'p4'; render() }
  var GSHOW = {
    start: function () { gDoc('d1'); S.protoOpen = true; S.view = 'appointments'; render(); var p = $('#proto'); if (p) { p.classList.add('g-flash'); setTimeout(function () { p.classList.remove('g-flash') }, 2500) }; toast('The Prototype controls box is bottom-left') },
    tour: function () { gConsult('returning'); toast('Tour: you are at step 2 (Rahima Begum, returning patient)') },
    notes: function () { gConsult('returning'); toast('Notes are on the left. Chips tagged "record" are pre-filled') },
    manage: function () { gConsult('returning'); customiseModal() },
    taper: function () { gConsult('first'); gPreset('s5'); toast('Cortan 5 taper added on the right: 4 steps, 100 tablets') },
    infusion: function () { gConsult('first'); gPreset('s6'); gPreset('s7'); toast('Added Normal Saline (infusion) and Humulin (sliding scale)') },
    weight: function () {
      gConsult('family'); var l = addMedicine('napasyp')
      lineChange(fake({ 'data-line': l.id, 'data-f': 'dpkOn', type: 'checkbox', checked: true }))
      lineChange(fake({ 'data-line': l.id, 'data-f': 'dpk', value: '15' }))
      toast('Arian (25 kg): Napa syrup at 15 mg/kg. Try changing the weight')
    },
    allergy: function () { gConsult('returning'); addMedicine('amox500'); addMedicine('clav625'); toast('Rahima is allergic to Penicillin: see the red cards') },
    tpl: function () { gConsult('first'); A.openTpl() },
    qa: function () { gConsult('first'); A.qaManage() },
    lib: function () { gConsult('first'); A.openLib() },
    orders: function () {
      gConsult('returning')
      var c = S.tpl.condition.filter(function (x) { return x.id === 'c2' })[0]
      if (c) A.applyCond(fake({ 'data-id': 'c2' }))
      toast('Hypertension follow-up applied. See Other orders under the medicines')
    },
    docs: function () {
      gConsult('returning'); A.xAdd(fake({ 'data-k': 'ref' })); A.xAdd(fake({ 'data-k': 'adm' })); A.xAdd(fake({ 'data-k': 'cert' }))
      toast('Three empty cards added. Press Complete to see the errors')
    },
    continue: function () {
      gConsult('returning'); A.continue(fake({ 'data-id': ownRxs()[0].id })); gPreset('s3')
      toast('Continued from your last prescription. Fexo is flagged against another doctor')
    },
    stop: function () { gConsult('returning'); stopModal() },
    preview: function () { gConsult('first'); gPreset('s1'); A.preview() },
    complete: function () { gConsult('first'); gPreset('s1'); A.complete() },
    verify: function () { gVerify() },
    verifyOld: function () { gVerify('old') },
    patient: function () { gPatient('rx', 'rx42') },
    share: function () { gPatient('rx', 'rx42'); A.shareOpen(fake({ 'data-id': 'rx42' })) },
    find: function () { gPatient('find') },
    animals: function () { gPatient('animals') },
    sms: function () { gPatient('sms') },
    profile: function () { gView('profile') },
    blocks: function () { gConsult('returning'); toast('Speciality blocks (Renal, Diabetes, Cardiac) are in the notes column') },
    physio: function () { gDoc('d5'); openFirst(); toast('Physiotherapist: medicine search is disabled') },
    vet: function () { gDoc('d7'); openConsult('v1', gApptOf('v1', 'd7').serial) },
    prx: function () { gPrx({ win: 1440 }); toast('Dr. Farhana, patient Nasrin Akter') },
    win: function () { gPrx({ win: 60 }); toast('Edit window set to 1 h. Click +1 h in Prototype controls to close it') },
    pos: function () { gDoc('d1'); S.view = 'pos'; S.posBranch = 'b1'; S.posQ = 'RX-A12345-0042'; render(); A.posGo() },
    cheat: function () { gView('appointments') }
  }
  var goto0 = A.goto
  A.goto = function (e) { var v = e.getAttribute('data-v'); if (v === 'guide' && S.view !== 'guide') S.gFrom = S.view; return goto0(e) }
  Object.assign(A, {
    gOpen: function (e) { gOpen(e && e.getAttribute('data-id')) },
    gHelp: function (e) { gOpen(e.getAttribute('data-id') || 'notes') },
    gGo: function (e) {
      S.gSec = e.getAttribute('data-id'); gMark(); gScroll(S.gSec)
      if (window.innerWidth <= 820) { var t = $('#gToc'); if (t) t.removeAttribute('open') }
    },
    gBack: function () {
      var v = S.gFrom && S.gFrom !== 'guide' ? S.gFrom : 'appointments'
      if (v === 'consult' && !S.draft) return openFirst()
      S.view = v; render()
    },
    gPrint: function () { window.print() },
    gWelcomeOff: function () { S.welcomeOff = true; var w = $('.g-welcome'); if (w) w.parentNode.removeChild(w) },
    gShow: function (e) {
      var f = GSHOW[e.getAttribute('data-k')]
      if (!f) return nyi('guide action')
      closeModal(); f()
    }
  })

  render()
})()
