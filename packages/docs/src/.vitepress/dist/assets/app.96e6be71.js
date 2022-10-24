const $i = 'modulepreload',
  io = {},
  Pi = '/',
  ki = function (t, n) {
    return !n || n.length === 0
      ? t()
      : Promise.all(
          n.map((s) => {
            if (((s = `${Pi}${s}`), s in io)) return
            io[s] = !0
            const o = s.endsWith('.css'),
              r = o ? '[rel="stylesheet"]' : ''
            if (document.querySelector(`link[href="${s}"]${r}`)) return
            const i = document.createElement('link')
            if (
              ((i.rel = o ? 'stylesheet' : $i),
              o || ((i.as = 'script'), (i.crossOrigin = '')),
              (i.href = s),
              document.head.appendChild(i),
              o)
            )
              return new Promise((l, c) => {
                i.addEventListener('load', l),
                  i.addEventListener('error', () =>
                    c(new Error(`Unable to preload CSS for ${s}`)),
                  )
              })
          }),
        ).then(() => t())
  }
function Ss(e, t) {
  const n = Object.create(null),
    s = e.split(',')
  for (let o = 0; o < s.length; o++) n[s[o]] = !0
  return t ? (o) => !!n[o.toLowerCase()] : (o) => !!n[o]
}
const Ci =
    'itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly',
  Si = Ss(Ci)
function nr(e) {
  return !!e || e === ''
}
function Vs(e) {
  if (z(e)) {
    const t = {}
    for (let n = 0; n < e.length; n++) {
      const s = e[n],
        o = be(s) ? Li(s) : Vs(s)
      if (o) for (const r in o) t[r] = o[r]
    }
    return t
  } else {
    if (be(e)) return e
    if (pe(e)) return e
  }
}
const Vi = /;(?![^(]*\))/g,
  Ei = /:(.+)/
function Li(e) {
  const t = {}
  return (
    e.split(Vi).forEach((n) => {
      if (n) {
        const s = n.split(Ei)
        s.length > 1 && (t[s[0].trim()] = s[1].trim())
      }
    }),
    t
  )
}
function me(e) {
  let t = ''
  if (be(e)) t = e
  else if (z(e))
    for (let n = 0; n < e.length; n++) {
      const s = me(e[n])
      s && (t += s + ' ')
    }
  else if (pe(e)) for (const n in e) e[n] && (t += n + ' ')
  return t.trim()
}
const le = (e) =>
    be(e)
      ? e
      : e == null
      ? ''
      : z(e) || (pe(e) && (e.toString === ir || !Y(e.toString)))
      ? JSON.stringify(e, sr, 2)
      : String(e),
  sr = (e, t) =>
    t && t.__v_isRef
      ? sr(e, t.value)
      : Mt(t)
      ? {
          [`Map(${t.size})`]: [...t.entries()].reduce(
            (n, [s, o]) => ((n[`${s} =>`] = o), n),
            {},
          ),
        }
      : or(t)
      ? { [`Set(${t.size})`]: [...t.values()] }
      : pe(t) && !z(t) && !lr(t)
      ? String(t)
      : t,
  de = {},
  Tt = [],
  Ke = () => {},
  Ti = () => !1,
  Mi = /^on[^a-z]/,
  rn = (e) => Mi.test(e),
  Es = (e) => e.startsWith('onUpdate:'),
  $e = Object.assign,
  Ls = (e, t) => {
    const n = e.indexOf(t)
    n > -1 && e.splice(n, 1)
  },
  Ai = Object.prototype.hasOwnProperty,
  se = (e, t) => Ai.call(e, t),
  z = Array.isArray,
  Mt = (e) => On(e) === '[object Map]',
  or = (e) => On(e) === '[object Set]',
  Y = (e) => typeof e == 'function',
  be = (e) => typeof e == 'string',
  Ts = (e) => typeof e == 'symbol',
  pe = (e) => e !== null && typeof e == 'object',
  rr = (e) => pe(e) && Y(e.then) && Y(e.catch),
  ir = Object.prototype.toString,
  On = (e) => ir.call(e),
  Ii = (e) => On(e).slice(8, -1),
  lr = (e) => On(e) === '[object Object]',
  Ms = (e) =>
    be(e) && e !== 'NaN' && e[0] !== '-' && '' + parseInt(e, 10) === e,
  Wt = Ss(
    ',key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted',
  ),
  Hn = (e) => {
    const t = Object.create(null)
    return (n) => t[n] || (t[n] = e(n))
  },
  Ni = /-(\w)/g,
  Xe = Hn((e) => e.replace(Ni, (t, n) => (n ? n.toUpperCase() : ''))),
  Bi = /\B([A-Z])/g,
  Ft = Hn((e) => e.replace(Bi, '-$1').toLowerCase()),
  Fn = Hn((e) => e.charAt(0).toUpperCase() + e.slice(1)),
  ns = Hn((e) => (e ? `on${Fn(e)}` : '')),
  Qt = (e, t) => !Object.is(e, t),
  ss = (e, t) => {
    for (let n = 0; n < e.length; n++) e[n](t)
  },
  $n = (e, t, n) => {
    Object.defineProperty(e, t, { configurable: !0, enumerable: !1, value: n })
  },
  cr = (e) => {
    const t = parseFloat(e)
    return isNaN(t) ? e : t
  }
let lo
const Oi = () =>
  lo ||
  (lo =
    typeof globalThis != 'undefined'
      ? globalThis
      : typeof self != 'undefined'
      ? self
      : typeof window != 'undefined'
      ? window
      : typeof global != 'undefined'
      ? global
      : {})
let Me
class Hi {
  constructor(t = !1) {
    ;(this.detached = t),
      (this.active = !0),
      (this.effects = []),
      (this.cleanups = []),
      (this.parent = Me),
      !t && Me && (this.index = (Me.scopes || (Me.scopes = [])).push(this) - 1)
  }
  run(t) {
    if (this.active) {
      const n = Me
      try {
        return (Me = this), t()
      } finally {
        Me = n
      }
    }
  }
  on() {
    Me = this
  }
  off() {
    Me = this.parent
  }
  stop(t) {
    if (this.active) {
      let n, s
      for (n = 0, s = this.effects.length; n < s; n++) this.effects[n].stop()
      for (n = 0, s = this.cleanups.length; n < s; n++) this.cleanups[n]()
      if (this.scopes)
        for (n = 0, s = this.scopes.length; n < s; n++) this.scopes[n].stop(!0)
      if (!this.detached && this.parent && !t) {
        const o = this.parent.scopes.pop()
        o &&
          o !== this &&
          ((this.parent.scopes[this.index] = o), (o.index = this.index))
      }
      ;(this.parent = void 0), (this.active = !1)
    }
  }
}
function Fi(e, t = Me) {
  t && t.active && t.effects.push(e)
}
function Ri() {
  return Me
}
function Di(e) {
  Me && Me.cleanups.push(e)
}
const As = (e) => {
    const t = new Set(e)
    return (t.w = 0), (t.n = 0), t
  },
  ar = (e) => (e.w & dt) > 0,
  ur = (e) => (e.n & dt) > 0,
  zi = ({ deps: e }) => {
    if (e.length) for (let t = 0; t < e.length; t++) e[t].w |= dt
  },
  ji = (e) => {
    const { deps: t } = e
    if (t.length) {
      let n = 0
      for (let s = 0; s < t.length; s++) {
        const o = t[s]
        ar(o) && !ur(o) ? o.delete(e) : (t[n++] = o), (o.w &= ~dt), (o.n &= ~dt)
      }
      t.length = n
    }
  },
  ds = new WeakMap()
let Kt = 0,
  dt = 1
const _s = 30
let je
const Ct = Symbol(''),
  hs = Symbol('')
class Is {
  constructor(t, n = null, s) {
    ;(this.fn = t),
      (this.scheduler = n),
      (this.active = !0),
      (this.deps = []),
      (this.parent = void 0),
      Fi(this, s)
  }
  run() {
    if (!this.active) return this.fn()
    let t = je,
      n = ct
    for (; t; ) {
      if (t === this) return
      t = t.parent
    }
    try {
      return (
        (this.parent = je),
        (je = this),
        (ct = !0),
        (dt = 1 << ++Kt),
        Kt <= _s ? zi(this) : co(this),
        this.fn()
      )
    } finally {
      Kt <= _s && ji(this),
        (dt = 1 << --Kt),
        (je = this.parent),
        (ct = n),
        (this.parent = void 0),
        this.deferStop && this.stop()
    }
  }
  stop() {
    je === this
      ? (this.deferStop = !0)
      : this.active &&
        (co(this), this.onStop && this.onStop(), (this.active = !1))
  }
}
function co(e) {
  const { deps: t } = e
  if (t.length) {
    for (let n = 0; n < t.length; n++) t[n].delete(e)
    t.length = 0
  }
}
let ct = !0
const fr = []
function Rt() {
  fr.push(ct), (ct = !1)
}
function Dt() {
  const e = fr.pop()
  ct = e === void 0 ? !0 : e
}
function Ie(e, t, n) {
  if (ct && je) {
    let s = ds.get(e)
    s || ds.set(e, (s = new Map()))
    let o = s.get(n)
    o || s.set(n, (o = As())), dr(o)
  }
}
function dr(e, t) {
  let n = !1
  Kt <= _s ? ur(e) || ((e.n |= dt), (n = !ar(e))) : (n = !e.has(je)),
    n && (e.add(je), je.deps.push(e))
}
function tt(e, t, n, s, o, r) {
  const i = ds.get(e)
  if (!i) return
  let l = []
  if (t === 'clear') l = [...i.values()]
  else if (n === 'length' && z(e))
    i.forEach((c, f) => {
      ;(f === 'length' || f >= s) && l.push(c)
    })
  else
    switch ((n !== void 0 && l.push(i.get(n)), t)) {
      case 'add':
        z(e)
          ? Ms(n) && l.push(i.get('length'))
          : (l.push(i.get(Ct)), Mt(e) && l.push(i.get(hs)))
        break
      case 'delete':
        z(e) || (l.push(i.get(Ct)), Mt(e) && l.push(i.get(hs)))
        break
      case 'set':
        Mt(e) && l.push(i.get(Ct))
        break
    }
  if (l.length === 1) l[0] && ps(l[0])
  else {
    const c = []
    for (const f of l) f && c.push(...f)
    ps(As(c))
  }
}
function ps(e, t) {
  const n = z(e) ? e : [...e]
  for (const s of n) s.computed && ao(s)
  for (const s of n) s.computed || ao(s)
}
function ao(e, t) {
  ;(e !== je || e.allowRecurse) && (e.scheduler ? e.scheduler() : e.run())
}
const Ui = Ss('__proto__,__v_isRef,__isVue'),
  _r = new Set(
    Object.getOwnPropertyNames(Symbol)
      .filter((e) => e !== 'arguments' && e !== 'caller')
      .map((e) => Symbol[e])
      .filter(Ts),
  ),
  Ki = Ns(),
  Wi = Ns(!1, !0),
  qi = Ns(!0),
  uo = Yi()
function Yi() {
  const e = {}
  return (
    ['includes', 'indexOf', 'lastIndexOf'].forEach((t) => {
      e[t] = function (...n) {
        const s = ie(this)
        for (let r = 0, i = this.length; r < i; r++) Ie(s, 'get', r + '')
        const o = s[t](...n)
        return o === -1 || o === !1 ? s[t](...n.map(ie)) : o
      }
    }),
    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach((t) => {
      e[t] = function (...n) {
        Rt()
        const s = ie(this)[t].apply(this, n)
        return Dt(), s
      }
    }),
    e
  )
}
function Ns(e = !1, t = !1) {
  return function (s, o, r) {
    if (o === '__v_isReactive') return !e
    if (o === '__v_isReadonly') return e
    if (o === '__v_isShallow') return t
    if (o === '__v_raw' && r === (e ? (t ? ul : gr) : t ? mr : vr).get(s))
      return s
    const i = z(s)
    if (!e && i && se(uo, o)) return Reflect.get(uo, o, r)
    const l = Reflect.get(s, o, r)
    return (Ts(o) ? _r.has(o) : Ui(o)) || (e || Ie(s, 'get', o), t)
      ? l
      : ke(l)
      ? i && Ms(o)
        ? l
        : l.value
      : pe(l)
      ? e
        ? Hs(l)
        : Dn(l)
      : l
  }
}
const Gi = hr(),
  Ji = hr(!0)
function hr(e = !1) {
  return function (n, s, o, r) {
    let i = n[s]
    if (Ot(i) && ke(i) && !ke(o)) return !1
    if (
      !e &&
      (!Pn(o) && !Ot(o) && ((i = ie(i)), (o = ie(o))), !z(n) && ke(i) && !ke(o))
    )
      return (i.value = o), !0
    const l = z(n) && Ms(s) ? Number(s) < n.length : se(n, s),
      c = Reflect.set(n, s, o, r)
    return (
      n === ie(r) && (l ? Qt(o, i) && tt(n, 'set', s, o) : tt(n, 'add', s, o)),
      c
    )
  }
}
function Xi(e, t) {
  const n = se(e, t)
  e[t]
  const s = Reflect.deleteProperty(e, t)
  return s && n && tt(e, 'delete', t, void 0), s
}
function Qi(e, t) {
  const n = Reflect.has(e, t)
  return (!Ts(t) || !_r.has(t)) && Ie(e, 'has', t), n
}
function Zi(e) {
  return Ie(e, 'iterate', z(e) ? 'length' : Ct), Reflect.ownKeys(e)
}
const pr = { get: Ki, set: Gi, deleteProperty: Xi, has: Qi, ownKeys: Zi },
  el = {
    get: qi,
    set(e, t) {
      return !0
    },
    deleteProperty(e, t) {
      return !0
    },
  },
  tl = $e({}, pr, { get: Wi, set: Ji }),
  Bs = (e) => e,
  Rn = (e) => Reflect.getPrototypeOf(e)
function hn(e, t, n = !1, s = !1) {
  e = e.__v_raw
  const o = ie(e),
    r = ie(t)
  n || (t !== r && Ie(o, 'get', t), Ie(o, 'get', r))
  const { has: i } = Rn(o),
    l = s ? Bs : n ? Rs : Zt
  if (i.call(o, t)) return l(e.get(t))
  if (i.call(o, r)) return l(e.get(r))
  e !== o && e.get(t)
}
function pn(e, t = !1) {
  const n = this.__v_raw,
    s = ie(n),
    o = ie(e)
  return (
    t || (e !== o && Ie(s, 'has', e), Ie(s, 'has', o)),
    e === o ? n.has(e) : n.has(e) || n.has(o)
  )
}
function vn(e, t = !1) {
  return (
    (e = e.__v_raw), !t && Ie(ie(e), 'iterate', Ct), Reflect.get(e, 'size', e)
  )
}
function fo(e) {
  e = ie(e)
  const t = ie(this)
  return Rn(t).has.call(t, e) || (t.add(e), tt(t, 'add', e, e)), this
}
function _o(e, t) {
  t = ie(t)
  const n = ie(this),
    { has: s, get: o } = Rn(n)
  let r = s.call(n, e)
  r || ((e = ie(e)), (r = s.call(n, e)))
  const i = o.call(n, e)
  return (
    n.set(e, t), r ? Qt(t, i) && tt(n, 'set', e, t) : tt(n, 'add', e, t), this
  )
}
function ho(e) {
  const t = ie(this),
    { has: n, get: s } = Rn(t)
  let o = n.call(t, e)
  o || ((e = ie(e)), (o = n.call(t, e))), s && s.call(t, e)
  const r = t.delete(e)
  return o && tt(t, 'delete', e, void 0), r
}
function po() {
  const e = ie(this),
    t = e.size !== 0,
    n = e.clear()
  return t && tt(e, 'clear', void 0, void 0), n
}
function mn(e, t) {
  return function (s, o) {
    const r = this,
      i = r.__v_raw,
      l = ie(i),
      c = t ? Bs : e ? Rs : Zt
    return (
      !e && Ie(l, 'iterate', Ct), i.forEach((f, _) => s.call(o, c(f), c(_), r))
    )
  }
}
function gn(e, t, n) {
  return function (...s) {
    const o = this.__v_raw,
      r = ie(o),
      i = Mt(r),
      l = e === 'entries' || (e === Symbol.iterator && i),
      c = e === 'keys' && i,
      f = o[e](...s),
      _ = n ? Bs : t ? Rs : Zt
    return (
      !t && Ie(r, 'iterate', c ? hs : Ct),
      {
        next() {
          const { value: v, done: b } = f.next()
          return b
            ? { value: v, done: b }
            : { value: l ? [_(v[0]), _(v[1])] : _(v), done: b }
        },
        [Symbol.iterator]() {
          return this
        },
      }
    )
  }
}
function st(e) {
  return function (...t) {
    return e === 'delete' ? !1 : this
  }
}
function nl() {
  const e = {
      get(r) {
        return hn(this, r)
      },
      get size() {
        return vn(this)
      },
      has: pn,
      add: fo,
      set: _o,
      delete: ho,
      clear: po,
      forEach: mn(!1, !1),
    },
    t = {
      get(r) {
        return hn(this, r, !1, !0)
      },
      get size() {
        return vn(this)
      },
      has: pn,
      add: fo,
      set: _o,
      delete: ho,
      clear: po,
      forEach: mn(!1, !0),
    },
    n = {
      get(r) {
        return hn(this, r, !0)
      },
      get size() {
        return vn(this, !0)
      },
      has(r) {
        return pn.call(this, r, !0)
      },
      add: st('add'),
      set: st('set'),
      delete: st('delete'),
      clear: st('clear'),
      forEach: mn(!0, !1),
    },
    s = {
      get(r) {
        return hn(this, r, !0, !0)
      },
      get size() {
        return vn(this, !0)
      },
      has(r) {
        return pn.call(this, r, !0)
      },
      add: st('add'),
      set: st('set'),
      delete: st('delete'),
      clear: st('clear'),
      forEach: mn(!0, !0),
    }
  return (
    ['keys', 'values', 'entries', Symbol.iterator].forEach((r) => {
      ;(e[r] = gn(r, !1, !1)),
        (n[r] = gn(r, !0, !1)),
        (t[r] = gn(r, !1, !0)),
        (s[r] = gn(r, !0, !0))
    }),
    [e, n, t, s]
  )
}
const [sl, ol, rl, il] = nl()
function Os(e, t) {
  const n = t ? (e ? il : rl) : e ? ol : sl
  return (s, o, r) =>
    o === '__v_isReactive'
      ? !e
      : o === '__v_isReadonly'
      ? e
      : o === '__v_raw'
      ? s
      : Reflect.get(se(n, o) && o in s ? n : s, o, r)
}
const ll = { get: Os(!1, !1) },
  cl = { get: Os(!1, !0) },
  al = { get: Os(!0, !1) },
  vr = new WeakMap(),
  mr = new WeakMap(),
  gr = new WeakMap(),
  ul = new WeakMap()
function fl(e) {
  switch (e) {
    case 'Object':
    case 'Array':
      return 1
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return 2
    default:
      return 0
  }
}
function dl(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : fl(Ii(e))
}
function Dn(e) {
  return Ot(e) ? e : Fs(e, !1, pr, ll, vr)
}
function _l(e) {
  return Fs(e, !1, tl, cl, mr)
}
function Hs(e) {
  return Fs(e, !0, el, al, gr)
}
function Fs(e, t, n, s, o) {
  if (!pe(e) || (e.__v_raw && !(t && e.__v_isReactive))) return e
  const r = o.get(e)
  if (r) return r
  const i = dl(e)
  if (i === 0) return e
  const l = new Proxy(e, i === 2 ? s : n)
  return o.set(e, l), l
}
function At(e) {
  return Ot(e) ? At(e.__v_raw) : !!(e && e.__v_isReactive)
}
function Ot(e) {
  return !!(e && e.__v_isReadonly)
}
function Pn(e) {
  return !!(e && e.__v_isShallow)
}
function yr(e) {
  return At(e) || Ot(e)
}
function ie(e) {
  const t = e && e.__v_raw
  return t ? ie(t) : e
}
function qt(e) {
  return $n(e, '__v_skip', !0), e
}
const Zt = (e) => (pe(e) ? Dn(e) : e),
  Rs = (e) => (pe(e) ? Hs(e) : e)
function br(e) {
  ct && je && ((e = ie(e)), dr(e.dep || (e.dep = As())))
}
function xr(e, t) {
  ;(e = ie(e)), e.dep && ps(e.dep)
}
function ke(e) {
  return !!(e && e.__v_isRef === !0)
}
function xe(e) {
  return wr(e, !1)
}
function hl(e) {
  return wr(e, !0)
}
function wr(e, t) {
  return ke(e) ? e : new pl(e, t)
}
class pl {
  constructor(t, n) {
    ;(this.__v_isShallow = n),
      (this.dep = void 0),
      (this.__v_isRef = !0),
      (this._rawValue = n ? t : ie(t)),
      (this._value = n ? t : Zt(t))
  }
  get value() {
    return br(this), this._value
  }
  set value(t) {
    const n = this.__v_isShallow || Pn(t) || Ot(t)
    ;(t = n ? t : ie(t)),
      Qt(t, this._rawValue) &&
        ((this._rawValue = t), (this._value = n ? t : Zt(t)), xr(this))
  }
}
function y(e) {
  return ke(e) ? e.value : e
}
const vl = {
  get: (e, t, n) => y(Reflect.get(e, t, n)),
  set: (e, t, n, s) => {
    const o = e[t]
    return ke(o) && !ke(n) ? ((o.value = n), !0) : Reflect.set(e, t, n, s)
  },
}
function $r(e) {
  return At(e) ? e : new Proxy(e, vl)
}
var Pr
class ml {
  constructor(t, n, s, o) {
    ;(this._setter = n),
      (this.dep = void 0),
      (this.__v_isRef = !0),
      (this[Pr] = !1),
      (this._dirty = !0),
      (this.effect = new Is(t, () => {
        this._dirty || ((this._dirty = !0), xr(this))
      })),
      (this.effect.computed = this),
      (this.effect.active = this._cacheable = !o),
      (this.__v_isReadonly = s)
  }
  get value() {
    const t = ie(this)
    return (
      br(t),
      (t._dirty || !t._cacheable) &&
        ((t._dirty = !1), (t._value = t.effect.run())),
      t._value
    )
  }
  set value(t) {
    this._setter(t)
  }
}
Pr = '__v_isReadonly'
function gl(e, t, n = !1) {
  let s, o
  const r = Y(e)
  return (
    r ? ((s = e), (o = Ke)) : ((s = e.get), (o = e.set)),
    new ml(s, o, r || !o, n)
  )
}
function at(e, t, n, s) {
  let o
  try {
    o = s ? e(...s) : e()
  } catch (r) {
    zn(r, t, n)
  }
  return o
}
function He(e, t, n, s) {
  if (Y(e)) {
    const r = at(e, t, n, s)
    return (
      r &&
        rr(r) &&
        r.catch((i) => {
          zn(i, t, n)
        }),
      r
    )
  }
  const o = []
  for (let r = 0; r < e.length; r++) o.push(He(e[r], t, n, s))
  return o
}
function zn(e, t, n, s = !0) {
  const o = t ? t.vnode : null
  if (t) {
    let r = t.parent
    const i = t.proxy,
      l = n
    for (; r; ) {
      const f = r.ec
      if (f) {
        for (let _ = 0; _ < f.length; _++) if (f[_](e, i, l) === !1) return
      }
      r = r.parent
    }
    const c = t.appContext.config.errorHandler
    if (c) {
      at(c, null, 10, [e, i, l])
      return
    }
  }
  yl(e, n, o, s)
}
function yl(e, t, n, s = !0) {
  console.error(e)
}
let en = !1,
  vs = !1
const Pe = []
let Je = 0
const It = []
let et = null,
  xt = 0
const kr = Promise.resolve()
let Ds = null
function ln(e) {
  const t = Ds || kr
  return e ? t.then(this ? e.bind(this) : e) : t
}
function bl(e) {
  let t = Je + 1,
    n = Pe.length
  for (; t < n; ) {
    const s = (t + n) >>> 1
    tn(Pe[s]) < e ? (t = s + 1) : (n = s)
  }
  return t
}
function zs(e) {
  ;(!Pe.length || !Pe.includes(e, en && e.allowRecurse ? Je + 1 : Je)) &&
    (e.id == null ? Pe.push(e) : Pe.splice(bl(e.id), 0, e), Cr())
}
function Cr() {
  !en && !vs && ((vs = !0), (Ds = kr.then(Sr)))
}
function xl(e) {
  const t = Pe.indexOf(e)
  t > Je && Pe.splice(t, 1)
}
function wl(e) {
  z(e)
    ? It.push(...e)
    : (!et || !et.includes(e, e.allowRecurse ? xt + 1 : xt)) && It.push(e),
    Cr()
}
function vo(e, t = en ? Je + 1 : 0) {
  for (; t < Pe.length; t++) {
    const n = Pe[t]
    n && n.pre && (Pe.splice(t, 1), t--, n())
  }
}
function kn(e) {
  if (It.length) {
    const t = [...new Set(It)]
    if (((It.length = 0), et)) {
      et.push(...t)
      return
    }
    for (et = t, et.sort((n, s) => tn(n) - tn(s)), xt = 0; xt < et.length; xt++)
      et[xt]()
    ;(et = null), (xt = 0)
  }
}
const tn = (e) => (e.id == null ? 1 / 0 : e.id),
  $l = (e, t) => {
    const n = tn(e) - tn(t)
    if (n === 0) {
      if (e.pre && !t.pre) return -1
      if (t.pre && !e.pre) return 1
    }
    return n
  }
function Sr(e) {
  ;(vs = !1), (en = !0), Pe.sort($l)
  const t = Ke
  try {
    for (Je = 0; Je < Pe.length; Je++) {
      const n = Pe[Je]
      n && n.active !== !1 && at(n, null, 14)
    }
  } finally {
    ;(Je = 0),
      (Pe.length = 0),
      kn(),
      (en = !1),
      (Ds = null),
      (Pe.length || It.length) && Sr()
  }
}
function Pl(e, t, ...n) {
  if (e.isUnmounted) return
  const s = e.vnode.props || de
  let o = n
  const r = t.startsWith('update:'),
    i = r && t.slice(7)
  if (i && i in s) {
    const _ = `${i === 'modelValue' ? 'model' : i}Modifiers`,
      { number: v, trim: b } = s[_] || de
    b && (o = n.map((C) => C.trim())), v && (o = n.map(cr))
  }
  let l,
    c = s[(l = ns(t))] || s[(l = ns(Xe(t)))]
  !c && r && (c = s[(l = ns(Ft(t)))]), c && He(c, e, 6, o)
  const f = s[l + 'Once']
  if (f) {
    if (!e.emitted) e.emitted = {}
    else if (e.emitted[l]) return
    ;(e.emitted[l] = !0), He(f, e, 6, o)
  }
}
function Vr(e, t, n = !1) {
  const s = t.emitsCache,
    o = s.get(e)
  if (o !== void 0) return o
  const r = e.emits
  let i = {},
    l = !1
  if (!Y(e)) {
    const c = (f) => {
      const _ = Vr(f, t, !0)
      _ && ((l = !0), $e(i, _))
    }
    !n && t.mixins.length && t.mixins.forEach(c),
      e.extends && c(e.extends),
      e.mixins && e.mixins.forEach(c)
  }
  return !r && !l
    ? (pe(e) && s.set(e, null), null)
    : (z(r) ? r.forEach((c) => (i[c] = null)) : $e(i, r),
      pe(e) && s.set(e, i),
      i)
}
function jn(e, t) {
  return !e || !rn(t)
    ? !1
    : ((t = t.slice(2).replace(/Once$/, '')),
      se(e, t[0].toLowerCase() + t.slice(1)) || se(e, Ft(t)) || se(e, t))
}
let Ce = null,
  Un = null
function Cn(e) {
  const t = Ce
  return (Ce = e), (Un = (e && e.type.__scopeId) || null), t
}
function Fe(e) {
  Un = e
}
function Re() {
  Un = null
}
function W(e, t = Ce, n) {
  if (!t || e._n) return e
  const s = (...o) => {
    s._d && Vo(-1)
    const r = Cn(t)
    let i
    try {
      i = e(...o)
    } finally {
      Cn(r), s._d && Vo(1)
    }
    return i
  }
  return (s._n = !0), (s._c = !0), (s._d = !0), s
}
function os(e) {
  const {
    type: t,
    vnode: n,
    proxy: s,
    withProxy: o,
    props: r,
    propsOptions: [i],
    slots: l,
    attrs: c,
    emit: f,
    render: _,
    renderCache: v,
    data: b,
    setupState: C,
    ctx: N,
    inheritAttrs: B,
  } = e
  let te, g
  const V = Cn(e)
  try {
    if (n.shapeFlag & 4) {
      const U = o || s
      ;(te = ze(_.call(U, U, v, r, C, b, N))), (g = c)
    } else {
      const U = t
      ;(te = ze(
        U.length > 1 ? U(r, { attrs: c, slots: l, emit: f }) : U(r, null),
      )),
        (g = t.props ? c : kl(c))
    }
  } catch (U) {
    ;(Gt.length = 0), zn(U, e, 1), (te = T(Ae))
  }
  let D = te
  if (g && B !== !1) {
    const U = Object.keys(g),
      { shapeFlag: ne } = D
    U.length && ne & 7 && (i && U.some(Es) && (g = Cl(g, i)), (D = _t(D, g)))
  }
  return (
    n.dirs && ((D = _t(D)), (D.dirs = D.dirs ? D.dirs.concat(n.dirs) : n.dirs)),
    n.transition && (D.transition = n.transition),
    (te = D),
    Cn(V),
    te
  )
}
const kl = (e) => {
    let t
    for (const n in e)
      (n === 'class' || n === 'style' || rn(n)) && ((t || (t = {}))[n] = e[n])
    return t
  },
  Cl = (e, t) => {
    const n = {}
    for (const s in e) (!Es(s) || !(s.slice(9) in t)) && (n[s] = e[s])
    return n
  }
function Sl(e, t, n) {
  const { props: s, children: o, component: r } = e,
    { props: i, children: l, patchFlag: c } = t,
    f = r.emitsOptions
  if (t.dirs || t.transition) return !0
  if (n && c >= 0) {
    if (c & 1024) return !0
    if (c & 16) return s ? mo(s, i, f) : !!i
    if (c & 8) {
      const _ = t.dynamicProps
      for (let v = 0; v < _.length; v++) {
        const b = _[v]
        if (i[b] !== s[b] && !jn(f, b)) return !0
      }
    }
  } else
    return (o || l) && (!l || !l.$stable)
      ? !0
      : s === i
      ? !1
      : s
      ? i
        ? mo(s, i, f)
        : !0
      : !!i
  return !1
}
function mo(e, t, n) {
  const s = Object.keys(t)
  if (s.length !== Object.keys(e).length) return !0
  for (let o = 0; o < s.length; o++) {
    const r = s[o]
    if (t[r] !== e[r] && !jn(n, r)) return !0
  }
  return !1
}
function Vl({ vnode: e, parent: t }, n) {
  for (; t && t.subTree === e; ) ((e = t.vnode).el = n), (t = t.parent)
}
const El = (e) => e.__isSuspense
function Er(e, t) {
  t && t.pendingBranch
    ? z(e)
      ? t.effects.push(...e)
      : t.effects.push(e)
    : wl(e)
}
function js(e, t) {
  if (we) {
    let n = we.provides
    const s = we.parent && we.parent.provides
    s === n && (n = we.provides = Object.create(s)), (n[e] = t)
  }
}
function ut(e, t, n = !1) {
  const s = we || Ce
  if (s) {
    const o =
      s.parent == null
        ? s.vnode.appContext && s.vnode.appContext.provides
        : s.parent.provides
    if (o && e in o) return o[e]
    if (arguments.length > 1) return n && Y(t) ? t.call(s.proxy) : t
  }
}
function Lr(e, t) {
  return Kn(e, null, t)
}
function Ll(e, t) {
  return Kn(e, null, { flush: 'post' })
}
const go = {}
function ft(e, t, n) {
  return Kn(e, t, n)
}
function Kn(
  e,
  t,
  { immediate: n, deep: s, flush: o, onTrack: r, onTrigger: i } = de,
) {
  const l = we
  let c,
    f = !1,
    _ = !1
  if (
    (ke(e)
      ? ((c = () => e.value), (f = Pn(e)))
      : At(e)
      ? ((c = () => e), (s = !0))
      : z(e)
      ? ((_ = !0),
        (f = e.some((g) => At(g) || Pn(g))),
        (c = () =>
          e.map((g) => {
            if (ke(g)) return g.value
            if (At(g)) return kt(g)
            if (Y(g)) return at(g, l, 2)
          })))
      : Y(e)
      ? t
        ? (c = () => at(e, l, 2))
        : (c = () => {
            if (!(l && l.isUnmounted)) return v && v(), He(e, l, 3, [b])
          })
      : (c = Ke),
    t && s)
  ) {
    const g = c
    c = () => kt(g())
  }
  let v,
    b = (g) => {
      v = te.onStop = () => {
        at(g, l, 4)
      }
    }
  if (on)
    return (b = Ke), t ? n && He(t, l, 3, [c(), _ ? [] : void 0, b]) : c(), Ke
  let C = _ ? [] : go
  const N = () => {
    if (!!te.active)
      if (t) {
        const g = te.run()
        ;(s || f || (_ ? g.some((V, D) => Qt(V, C[D])) : Qt(g, C))) &&
          (v && v(), He(t, l, 3, [g, C === go ? void 0 : C, b]), (C = g))
      } else te.run()
  }
  N.allowRecurse = !!t
  let B
  o === 'sync'
    ? (B = N)
    : o === 'post'
    ? (B = () => Ee(N, l && l.suspense))
    : ((N.pre = !0), l && (N.id = l.uid), (B = () => zs(N)))
  const te = new Is(c, B)
  return (
    t
      ? n
        ? N()
        : (C = te.run())
      : o === 'post'
      ? Ee(te.run.bind(te), l && l.suspense)
      : te.run(),
    () => {
      te.stop(), l && l.scope && Ls(l.scope.effects, te)
    }
  )
}
function Tl(e, t, n) {
  const s = this.proxy,
    o = be(e) ? (e.includes('.') ? Tr(s, e) : () => s[e]) : e.bind(s, s)
  let r
  Y(t) ? (r = t) : ((r = t.handler), (n = t))
  const i = we
  Ht(this)
  const l = Kn(o, r.bind(s), n)
  return i ? Ht(i) : St(), l
}
function Tr(e, t) {
  const n = t.split('.')
  return () => {
    let s = e
    for (let o = 0; o < n.length && s; o++) s = s[n[o]]
    return s
  }
}
function kt(e, t) {
  if (!pe(e) || e.__v_skip || ((t = t || new Set()), t.has(e))) return e
  if ((t.add(e), ke(e))) kt(e.value, t)
  else if (z(e)) for (let n = 0; n < e.length; n++) kt(e[n], t)
  else if (or(e) || Mt(e))
    e.forEach((n) => {
      kt(n, t)
    })
  else if (lr(e)) for (const n in e) kt(e[n], t)
  return e
}
function Ml() {
  const e = {
    isMounted: !1,
    isLeaving: !1,
    isUnmounting: !1,
    leavingVNodes: new Map(),
  }
  return (
    ht(() => {
      e.isMounted = !0
    }),
    Hr(() => {
      e.isUnmounting = !0
    }),
    e
  )
}
const Ne = [Function, Array],
  Al = {
    name: 'BaseTransition',
    props: {
      mode: String,
      appear: Boolean,
      persisted: Boolean,
      onBeforeEnter: Ne,
      onEnter: Ne,
      onAfterEnter: Ne,
      onEnterCancelled: Ne,
      onBeforeLeave: Ne,
      onLeave: Ne,
      onAfterLeave: Ne,
      onLeaveCancelled: Ne,
      onBeforeAppear: Ne,
      onAppear: Ne,
      onAfterAppear: Ne,
      onAppearCancelled: Ne,
    },
    setup(e, { slots: t }) {
      const n = Zr(),
        s = Ml()
      let o
      return () => {
        const r = t.default && Ir(t.default(), !0)
        if (!r || !r.length) return
        let i = r[0]
        if (r.length > 1) {
          for (const B of r)
            if (B.type !== Ae) {
              i = B
              break
            }
        }
        const l = ie(e),
          { mode: c } = l
        if (s.isLeaving) return rs(i)
        const f = yo(i)
        if (!f) return rs(i)
        const _ = ms(f, l, s, n)
        gs(f, _)
        const v = n.subTree,
          b = v && yo(v)
        let C = !1
        const { getTransitionKey: N } = f.type
        if (N) {
          const B = N()
          o === void 0 ? (o = B) : B !== o && ((o = B), (C = !0))
        }
        if (b && b.type !== Ae && (!wt(f, b) || C)) {
          const B = ms(b, l, s, n)
          if ((gs(b, B), c === 'out-in'))
            return (
              (s.isLeaving = !0),
              (B.afterLeave = () => {
                ;(s.isLeaving = !1), n.update()
              }),
              rs(i)
            )
          c === 'in-out' &&
            f.type !== Ae &&
            (B.delayLeave = (te, g, V) => {
              const D = Ar(s, b)
              ;(D[String(b.key)] = b),
                (te._leaveCb = () => {
                  g(), (te._leaveCb = void 0), delete _.delayedLeave
                }),
                (_.delayedLeave = V)
            })
        }
        return i
      }
    },
  },
  Mr = Al
function Ar(e, t) {
  const { leavingVNodes: n } = e
  let s = n.get(t.type)
  return s || ((s = Object.create(null)), n.set(t.type, s)), s
}
function ms(e, t, n, s) {
  const {
      appear: o,
      mode: r,
      persisted: i = !1,
      onBeforeEnter: l,
      onEnter: c,
      onAfterEnter: f,
      onEnterCancelled: _,
      onBeforeLeave: v,
      onLeave: b,
      onAfterLeave: C,
      onLeaveCancelled: N,
      onBeforeAppear: B,
      onAppear: te,
      onAfterAppear: g,
      onAppearCancelled: V,
    } = t,
    D = String(e.key),
    U = Ar(n, e),
    ne = (L, X) => {
      L && He(L, s, 9, X)
    },
    fe = (L, X) => {
      const K = X[1]
      ne(L, X),
        z(L) ? L.every((re) => re.length <= 1) && K() : L.length <= 1 && K()
    },
    oe = {
      mode: r,
      persisted: i,
      beforeEnter(L) {
        let X = l
        if (!n.isMounted)
          if (o) X = B || l
          else return
        L._leaveCb && L._leaveCb(!0)
        const K = U[D]
        K && wt(e, K) && K.el._leaveCb && K.el._leaveCb(), ne(X, [L])
      },
      enter(L) {
        let X = c,
          K = f,
          re = _
        if (!n.isMounted)
          if (o) (X = te || c), (K = g || f), (re = V || _)
          else return
        let A = !1
        const Q = (L._enterCb = (O) => {
          A ||
            ((A = !0),
            O ? ne(re, [L]) : ne(K, [L]),
            oe.delayedLeave && oe.delayedLeave(),
            (L._enterCb = void 0))
        })
        X ? fe(X, [L, Q]) : Q()
      },
      leave(L, X) {
        const K = String(e.key)
        if ((L._enterCb && L._enterCb(!0), n.isUnmounting)) return X()
        ne(v, [L])
        let re = !1
        const A = (L._leaveCb = (Q) => {
          re ||
            ((re = !0),
            X(),
            Q ? ne(N, [L]) : ne(C, [L]),
            (L._leaveCb = void 0),
            U[K] === e && delete U[K])
        })
        ;(U[K] = e), b ? fe(b, [L, A]) : A()
      },
      clone(L) {
        return ms(L, t, n, s)
      },
    }
  return oe
}
function rs(e) {
  if (Wn(e)) return (e = _t(e)), (e.children = null), e
}
function yo(e) {
  return Wn(e) ? (e.children ? e.children[0] : void 0) : e
}
function gs(e, t) {
  e.shapeFlag & 6 && e.component
    ? gs(e.component.subTree, t)
    : e.shapeFlag & 128
    ? ((e.ssContent.transition = t.clone(e.ssContent)),
      (e.ssFallback.transition = t.clone(e.ssFallback)))
    : (e.transition = t)
}
function Ir(e, t = !1, n) {
  let s = [],
    o = 0
  for (let r = 0; r < e.length; r++) {
    let i = e[r]
    const l = n == null ? i.key : String(n) + String(i.key != null ? i.key : r)
    i.type === ee
      ? (i.patchFlag & 128 && o++, (s = s.concat(Ir(i.children, t, l))))
      : (t || i.type !== Ae) && s.push(l != null ? _t(i, { key: l }) : i)
  }
  if (o > 1) for (let r = 0; r < s.length; r++) s[r].patchFlag = -2
  return s
}
function R(e) {
  return Y(e) ? { setup: e, name: e.name } : e
}
const Nt = (e) => !!e.type.__asyncLoader,
  Wn = (e) => e.type.__isKeepAlive
function Il(e, t) {
  Nr(e, 'a', t)
}
function Nl(e, t) {
  Nr(e, 'da', t)
}
function Nr(e, t, n = we) {
  const s =
    e.__wdc ||
    (e.__wdc = () => {
      let o = n
      for (; o; ) {
        if (o.isDeactivated) return
        o = o.parent
      }
      return e()
    })
  if ((qn(t, s, n), n)) {
    let o = n.parent
    for (; o && o.parent; ) Wn(o.parent.vnode) && Bl(s, t, n, o), (o = o.parent)
  }
}
function Bl(e, t, n, s) {
  const o = qn(t, e, s, !0)
  Vt(() => {
    Ls(s[t], o)
  }, n)
}
function qn(e, t, n = we, s = !1) {
  if (n) {
    const o = n[e] || (n[e] = []),
      r =
        t.__weh ||
        (t.__weh = (...i) => {
          if (n.isUnmounted) return
          Rt(), Ht(n)
          const l = He(t, n, e, i)
          return St(), Dt(), l
        })
    return s ? o.unshift(r) : o.push(r), r
  }
}
const nt =
    (e) =>
    (t, n = we) =>
      (!on || e === 'sp') && qn(e, (...s) => t(...s), n),
  Br = nt('bm'),
  ht = nt('m'),
  Ol = nt('bu'),
  Or = nt('u'),
  Hr = nt('bum'),
  Vt = nt('um'),
  Hl = nt('sp'),
  Fl = nt('rtg'),
  Rl = nt('rtc')
function Dl(e, t = we) {
  qn('ec', e, t)
}
function bo(e, t) {
  const n = Ce
  if (n === null) return e
  const s = Jn(n) || n.proxy,
    o = e.dirs || (e.dirs = [])
  for (let r = 0; r < t.length; r++) {
    let [i, l, c, f = de] = t[r]
    Y(i) && (i = { mounted: i, updated: i }),
      i.deep && kt(l),
      o.push({
        dir: i,
        instance: s,
        value: l,
        oldValue: void 0,
        arg: c,
        modifiers: f,
      })
  }
  return e
}
function Ge(e, t, n, s) {
  const o = e.dirs,
    r = t && t.dirs
  for (let i = 0; i < o.length; i++) {
    const l = o[i]
    r && (l.oldValue = r[i].value)
    let c = l.dir[s]
    c && (Rt(), He(c, n, 8, [e.el, l, e, t]), Dt())
  }
}
const Us = 'components'
function Fr(e, t) {
  return Dr(Us, e, !0, t) || e
}
const Rr = Symbol()
function Yn(e) {
  return be(e) ? Dr(Us, e, !1) || e : e || Rr
}
function Dr(e, t, n = !0, s = !1) {
  const o = Ce || we
  if (o) {
    const r = o.type
    if (e === Us) {
      const l = gc(r, !1)
      if (l && (l === t || l === Xe(t) || l === Fn(Xe(t)))) return r
    }
    const i = xo(o[e] || r[e], t) || xo(o.appContext[e], t)
    return !i && s ? r : i
  }
}
function xo(e, t) {
  return e && (e[t] || e[Xe(t)] || e[Fn(Xe(t))])
}
function Se(e, t, n, s) {
  let o
  const r = n && n[s]
  if (z(e) || be(e)) {
    o = new Array(e.length)
    for (let i = 0, l = e.length; i < l; i++)
      o[i] = t(e[i], i, void 0, r && r[i])
  } else if (typeof e == 'number') {
    o = new Array(e)
    for (let i = 0; i < e; i++) o[i] = t(i + 1, i, void 0, r && r[i])
  } else if (pe(e))
    if (e[Symbol.iterator])
      o = Array.from(e, (i, l) => t(i, l, void 0, r && r[l]))
    else {
      const i = Object.keys(e)
      o = new Array(i.length)
      for (let l = 0, c = i.length; l < c; l++) {
        const f = i[l]
        o[l] = t(e[f], f, l, r && r[l])
      }
    }
  else o = []
  return n && (n[s] = o), o
}
function q(e, t, n = {}, s, o) {
  if (Ce.isCE || (Ce.parent && Nt(Ce.parent) && Ce.parent.isCE))
    return T('slot', t === 'default' ? null : { name: t }, s && s())
  let r = e[t]
  r && r._c && (r._d = !1), d()
  const i = r && zr(r(n)),
    l = J(
      ee,
      { key: n.key || (i && i.key) || `_${t}` },
      i || (s ? s() : []),
      i && e._ === 1 ? 64 : -2,
    )
  return (
    !o && l.scopeId && (l.slotScopeIds = [l.scopeId + '-s']),
    r && r._c && (r._d = !0),
    l
  )
}
function zr(e) {
  return e.some((t) =>
    Ln(t) ? !(t.type === Ae || (t.type === ee && !zr(t.children))) : !0,
  )
    ? e
    : null
}
const ys = (e) => (e ? (ei(e) ? Jn(e) || e.proxy : ys(e.parent)) : null),
  Sn = $e(Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => ys(e.parent),
    $root: (e) => ys(e.root),
    $emit: (e) => e.emit,
    $options: (e) => Ks(e),
    $forceUpdate: (e) => e.f || (e.f = () => zs(e.update)),
    $nextTick: (e) => e.n || (e.n = ln.bind(e.proxy)),
    $watch: (e) => Tl.bind(e),
  }),
  zl = {
    get({ _: e }, t) {
      const {
        ctx: n,
        setupState: s,
        data: o,
        props: r,
        accessCache: i,
        type: l,
        appContext: c,
      } = e
      let f
      if (t[0] !== '$') {
        const C = i[t]
        if (C !== void 0)
          switch (C) {
            case 1:
              return s[t]
            case 2:
              return o[t]
            case 4:
              return n[t]
            case 3:
              return r[t]
          }
        else {
          if (s !== de && se(s, t)) return (i[t] = 1), s[t]
          if (o !== de && se(o, t)) return (i[t] = 2), o[t]
          if ((f = e.propsOptions[0]) && se(f, t)) return (i[t] = 3), r[t]
          if (n !== de && se(n, t)) return (i[t] = 4), n[t]
          bs && (i[t] = 0)
        }
      }
      const _ = Sn[t]
      let v, b
      if (_) return t === '$attrs' && Ie(e, 'get', t), _(e)
      if ((v = l.__cssModules) && (v = v[t])) return v
      if (n !== de && se(n, t)) return (i[t] = 4), n[t]
      if (((b = c.config.globalProperties), se(b, t))) return b[t]
    },
    set({ _: e }, t, n) {
      const { data: s, setupState: o, ctx: r } = e
      return o !== de && se(o, t)
        ? ((o[t] = n), !0)
        : s !== de && se(s, t)
        ? ((s[t] = n), !0)
        : se(e.props, t) || (t[0] === '$' && t.slice(1) in e)
        ? !1
        : ((r[t] = n), !0)
    },
    has(
      {
        _: {
          data: e,
          setupState: t,
          accessCache: n,
          ctx: s,
          appContext: o,
          propsOptions: r,
        },
      },
      i,
    ) {
      let l
      return (
        !!n[i] ||
        (e !== de && se(e, i)) ||
        (t !== de && se(t, i)) ||
        ((l = r[0]) && se(l, i)) ||
        se(s, i) ||
        se(Sn, i) ||
        se(o.config.globalProperties, i)
      )
    },
    defineProperty(e, t, n) {
      return (
        n.get != null
          ? (e._.accessCache[t] = 0)
          : se(n, 'value') && this.set(e, t, n.value, null),
        Reflect.defineProperty(e, t, n)
      )
    },
  }
let bs = !0
function jl(e) {
  const t = Ks(e),
    n = e.proxy,
    s = e.ctx
  ;(bs = !1), t.beforeCreate && wo(t.beforeCreate, e, 'bc')
  const {
    data: o,
    computed: r,
    methods: i,
    watch: l,
    provide: c,
    inject: f,
    created: _,
    beforeMount: v,
    mounted: b,
    beforeUpdate: C,
    updated: N,
    activated: B,
    deactivated: te,
    beforeDestroy: g,
    beforeUnmount: V,
    destroyed: D,
    unmounted: U,
    render: ne,
    renderTracked: fe,
    renderTriggered: oe,
    errorCaptured: L,
    serverPrefetch: X,
    expose: K,
    inheritAttrs: re,
    components: A,
    directives: Q,
    filters: O,
  } = t
  if ((f && Ul(f, s, null, e.appContext.config.unwrapInjectedRef), i))
    for (const ge in i) {
      const _e = i[ge]
      Y(_e) && (s[ge] = _e.bind(n))
    }
  if (o) {
    const ge = o.call(n, n)
    pe(ge) && (e.data = Dn(ge))
  }
  if (((bs = !0), r))
    for (const ge in r) {
      const _e = r[ge],
        pt = Y(_e) ? _e.bind(n, n) : Y(_e.get) ? _e.get.bind(n, n) : Ke,
        dn = !Y(_e) && Y(_e.set) ? _e.set.bind(n) : Ke,
        vt = ve({ get: pt, set: dn })
      Object.defineProperty(s, ge, {
        enumerable: !0,
        configurable: !0,
        get: () => vt.value,
        set: (qe) => (vt.value = qe),
      })
    }
  if (l) for (const ge in l) jr(l[ge], s, n, ge)
  if (c) {
    const ge = Y(c) ? c.call(n) : c
    Reflect.ownKeys(ge).forEach((_e) => {
      js(_e, ge[_e])
    })
  }
  _ && wo(_, e, 'c')
  function ce(ge, _e) {
    z(_e) ? _e.forEach((pt) => ge(pt.bind(n))) : _e && ge(_e.bind(n))
  }
  if (
    (ce(Br, v),
    ce(ht, b),
    ce(Ol, C),
    ce(Or, N),
    ce(Il, B),
    ce(Nl, te),
    ce(Dl, L),
    ce(Rl, fe),
    ce(Fl, oe),
    ce(Hr, V),
    ce(Vt, U),
    ce(Hl, X),
    z(K))
  )
    if (K.length) {
      const ge = e.exposed || (e.exposed = {})
      K.forEach((_e) => {
        Object.defineProperty(ge, _e, {
          get: () => n[_e],
          set: (pt) => (n[_e] = pt),
        })
      })
    } else e.exposed || (e.exposed = {})
  ne && e.render === Ke && (e.render = ne),
    re != null && (e.inheritAttrs = re),
    A && (e.components = A),
    Q && (e.directives = Q)
}
function Ul(e, t, n = Ke, s = !1) {
  z(e) && (e = xs(e))
  for (const o in e) {
    const r = e[o]
    let i
    pe(r)
      ? 'default' in r
        ? (i = ut(r.from || o, r.default, !0))
        : (i = ut(r.from || o))
      : (i = ut(r)),
      ke(i) && s
        ? Object.defineProperty(t, o, {
            enumerable: !0,
            configurable: !0,
            get: () => i.value,
            set: (l) => (i.value = l),
          })
        : (t[o] = i)
  }
}
function wo(e, t, n) {
  He(z(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy), t, n)
}
function jr(e, t, n, s) {
  const o = s.includes('.') ? Tr(n, s) : () => n[s]
  if (be(e)) {
    const r = t[e]
    Y(r) && ft(o, r)
  } else if (Y(e)) ft(o, e.bind(n))
  else if (pe(e))
    if (z(e)) e.forEach((r) => jr(r, t, n, s))
    else {
      const r = Y(e.handler) ? e.handler.bind(n) : t[e.handler]
      Y(r) && ft(o, r, e)
    }
}
function Ks(e) {
  const t = e.type,
    { mixins: n, extends: s } = t,
    {
      mixins: o,
      optionsCache: r,
      config: { optionMergeStrategies: i },
    } = e.appContext,
    l = r.get(t)
  let c
  return (
    l
      ? (c = l)
      : !o.length && !n && !s
      ? (c = t)
      : ((c = {}), o.length && o.forEach((f) => Vn(c, f, i, !0)), Vn(c, t, i)),
    pe(t) && r.set(t, c),
    c
  )
}
function Vn(e, t, n, s = !1) {
  const { mixins: o, extends: r } = t
  r && Vn(e, r, n, !0), o && o.forEach((i) => Vn(e, i, n, !0))
  for (const i in t)
    if (!(s && i === 'expose')) {
      const l = Kl[i] || (n && n[i])
      e[i] = l ? l(e[i], t[i]) : t[i]
    }
  return e
}
const Kl = {
  data: $o,
  props: bt,
  emits: bt,
  methods: bt,
  computed: bt,
  beforeCreate: Ve,
  created: Ve,
  beforeMount: Ve,
  mounted: Ve,
  beforeUpdate: Ve,
  updated: Ve,
  beforeDestroy: Ve,
  beforeUnmount: Ve,
  destroyed: Ve,
  unmounted: Ve,
  activated: Ve,
  deactivated: Ve,
  errorCaptured: Ve,
  serverPrefetch: Ve,
  components: bt,
  directives: bt,
  watch: ql,
  provide: $o,
  inject: Wl,
}
function $o(e, t) {
  return t
    ? e
      ? function () {
          return $e(
            Y(e) ? e.call(this, this) : e,
            Y(t) ? t.call(this, this) : t,
          )
        }
      : t
    : e
}
function Wl(e, t) {
  return bt(xs(e), xs(t))
}
function xs(e) {
  if (z(e)) {
    const t = {}
    for (let n = 0; n < e.length; n++) t[e[n]] = e[n]
    return t
  }
  return e
}
function Ve(e, t) {
  return e ? [...new Set([].concat(e, t))] : t
}
function bt(e, t) {
  return e ? $e($e(Object.create(null), e), t) : t
}
function ql(e, t) {
  if (!e) return t
  if (!t) return e
  const n = $e(Object.create(null), e)
  for (const s in t) n[s] = Ve(e[s], t[s])
  return n
}
function Yl(e, t, n, s = !1) {
  const o = {},
    r = {}
  $n(r, Gn, 1), (e.propsDefaults = Object.create(null)), Ur(e, t, o, r)
  for (const i in e.propsOptions[0]) i in o || (o[i] = void 0)
  n ? (e.props = s ? o : _l(o)) : e.type.props ? (e.props = o) : (e.props = r),
    (e.attrs = r)
}
function Gl(e, t, n, s) {
  const {
      props: o,
      attrs: r,
      vnode: { patchFlag: i },
    } = e,
    l = ie(o),
    [c] = e.propsOptions
  let f = !1
  if ((s || i > 0) && !(i & 16)) {
    if (i & 8) {
      const _ = e.vnode.dynamicProps
      for (let v = 0; v < _.length; v++) {
        let b = _[v]
        if (jn(e.emitsOptions, b)) continue
        const C = t[b]
        if (c)
          if (se(r, b)) C !== r[b] && ((r[b] = C), (f = !0))
          else {
            const N = Xe(b)
            o[N] = ws(c, l, N, C, e, !1)
          }
        else C !== r[b] && ((r[b] = C), (f = !0))
      }
    }
  } else {
    Ur(e, t, o, r) && (f = !0)
    let _
    for (const v in l)
      (!t || (!se(t, v) && ((_ = Ft(v)) === v || !se(t, _)))) &&
        (c
          ? n &&
            (n[v] !== void 0 || n[_] !== void 0) &&
            (o[v] = ws(c, l, v, void 0, e, !0))
          : delete o[v])
    if (r !== l)
      for (const v in r) (!t || (!se(t, v) && !0)) && (delete r[v], (f = !0))
  }
  f && tt(e, 'set', '$attrs')
}
function Ur(e, t, n, s) {
  const [o, r] = e.propsOptions
  let i = !1,
    l
  if (t)
    for (let c in t) {
      if (Wt(c)) continue
      const f = t[c]
      let _
      o && se(o, (_ = Xe(c)))
        ? !r || !r.includes(_)
          ? (n[_] = f)
          : ((l || (l = {}))[_] = f)
        : jn(e.emitsOptions, c) ||
          ((!(c in s) || f !== s[c]) && ((s[c] = f), (i = !0)))
    }
  if (r) {
    const c = ie(n),
      f = l || de
    for (let _ = 0; _ < r.length; _++) {
      const v = r[_]
      n[v] = ws(o, c, v, f[v], e, !se(f, v))
    }
  }
  return i
}
function ws(e, t, n, s, o, r) {
  const i = e[n]
  if (i != null) {
    const l = se(i, 'default')
    if (l && s === void 0) {
      const c = i.default
      if (i.type !== Function && Y(c)) {
        const { propsDefaults: f } = o
        n in f ? (s = f[n]) : (Ht(o), (s = f[n] = c.call(null, t)), St())
      } else s = c
    }
    i[0] && (r && !l ? (s = !1) : i[1] && (s === '' || s === Ft(n)) && (s = !0))
  }
  return s
}
function Kr(e, t, n = !1) {
  const s = t.propsCache,
    o = s.get(e)
  if (o) return o
  const r = e.props,
    i = {},
    l = []
  let c = !1
  if (!Y(e)) {
    const _ = (v) => {
      c = !0
      const [b, C] = Kr(v, t, !0)
      $e(i, b), C && l.push(...C)
    }
    !n && t.mixins.length && t.mixins.forEach(_),
      e.extends && _(e.extends),
      e.mixins && e.mixins.forEach(_)
  }
  if (!r && !c) return pe(e) && s.set(e, Tt), Tt
  if (z(r))
    for (let _ = 0; _ < r.length; _++) {
      const v = Xe(r[_])
      Po(v) && (i[v] = de)
    }
  else if (r)
    for (const _ in r) {
      const v = Xe(_)
      if (Po(v)) {
        const b = r[_],
          C = (i[v] = z(b) || Y(b) ? { type: b } : b)
        if (C) {
          const N = So(Boolean, C.type),
            B = So(String, C.type)
          ;(C[0] = N > -1),
            (C[1] = B < 0 || N < B),
            (N > -1 || se(C, 'default')) && l.push(v)
        }
      }
    }
  const f = [i, l]
  return pe(e) && s.set(e, f), f
}
function Po(e) {
  return e[0] !== '$'
}
function ko(e) {
  const t = e && e.toString().match(/^\s*function (\w+)/)
  return t ? t[1] : e === null ? 'null' : ''
}
function Co(e, t) {
  return ko(e) === ko(t)
}
function So(e, t) {
  return z(t) ? t.findIndex((n) => Co(n, e)) : Y(t) && Co(t, e) ? 0 : -1
}
const Wr = (e) => e[0] === '_' || e === '$stable',
  Ws = (e) => (z(e) ? e.map(ze) : [ze(e)]),
  Jl = (e, t, n) => {
    if (t._n) return t
    const s = W((...o) => Ws(t(...o)), n)
    return (s._c = !1), s
  },
  qr = (e, t, n) => {
    const s = e._ctx
    for (const o in e) {
      if (Wr(o)) continue
      const r = e[o]
      if (Y(r)) t[o] = Jl(o, r, s)
      else if (r != null) {
        const i = Ws(r)
        t[o] = () => i
      }
    }
  },
  Yr = (e, t) => {
    const n = Ws(t)
    e.slots.default = () => n
  },
  Xl = (e, t) => {
    if (e.vnode.shapeFlag & 32) {
      const n = t._
      n ? ((e.slots = ie(t)), $n(t, '_', n)) : qr(t, (e.slots = {}))
    } else (e.slots = {}), t && Yr(e, t)
    $n(e.slots, Gn, 1)
  },
  Ql = (e, t, n) => {
    const { vnode: s, slots: o } = e
    let r = !0,
      i = de
    if (s.shapeFlag & 32) {
      const l = t._
      l
        ? n && l === 1
          ? (r = !1)
          : ($e(o, t), !n && l === 1 && delete o._)
        : ((r = !t.$stable), qr(t, o)),
        (i = t)
    } else t && (Yr(e, t), (i = { default: 1 }))
    if (r) for (const l in o) !Wr(l) && !(l in i) && delete o[l]
  }
function Gr() {
  return {
    app: null,
    config: {
      isNativeTag: Ti,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {},
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null),
    optionsCache: new WeakMap(),
    propsCache: new WeakMap(),
    emitsCache: new WeakMap(),
  }
}
let Zl = 0
function ec(e, t) {
  return function (s, o = null) {
    Y(s) || (s = Object.assign({}, s)), o != null && !pe(o) && (o = null)
    const r = Gr(),
      i = new Set()
    let l = !1
    const c = (r.app = {
      _uid: Zl++,
      _component: s,
      _props: o,
      _container: null,
      _context: r,
      _instance: null,
      version: bc,
      get config() {
        return r.config
      },
      set config(f) {},
      use(f, ..._) {
        return (
          i.has(f) ||
            (f && Y(f.install)
              ? (i.add(f), f.install(c, ..._))
              : Y(f) && (i.add(f), f(c, ..._))),
          c
        )
      },
      mixin(f) {
        return r.mixins.includes(f) || r.mixins.push(f), c
      },
      component(f, _) {
        return _ ? ((r.components[f] = _), c) : r.components[f]
      },
      directive(f, _) {
        return _ ? ((r.directives[f] = _), c) : r.directives[f]
      },
      mount(f, _, v) {
        if (!l) {
          const b = T(s, o)
          return (
            (b.appContext = r),
            _ && t ? t(b, f) : e(b, f, v),
            (l = !0),
            (c._container = f),
            (f.__vue_app__ = c),
            Jn(b.component) || b.component.proxy
          )
        }
      },
      unmount() {
        l && (e(null, c._container), delete c._container.__vue_app__)
      },
      provide(f, _) {
        return (r.provides[f] = _), c
      },
    })
    return c
  }
}
function En(e, t, n, s, o = !1) {
  if (z(e)) {
    e.forEach((b, C) => En(b, t && (z(t) ? t[C] : t), n, s, o))
    return
  }
  if (Nt(s) && !o) return
  const r = s.shapeFlag & 4 ? Jn(s.component) || s.component.proxy : s.el,
    i = o ? null : r,
    { i: l, r: c } = e,
    f = t && t.r,
    _ = l.refs === de ? (l.refs = {}) : l.refs,
    v = l.setupState
  if (
    (f != null &&
      f !== c &&
      (be(f)
        ? ((_[f] = null), se(v, f) && (v[f] = null))
        : ke(f) && (f.value = null)),
    Y(c))
  )
    at(c, l, 12, [i, _])
  else {
    const b = be(c),
      C = ke(c)
    if (b || C) {
      const N = () => {
        if (e.f) {
          const B = b ? (se(v, c) ? v[c] : _[c]) : c.value
          o
            ? z(B) && Ls(B, r)
            : z(B)
            ? B.includes(r) || B.push(r)
            : b
            ? ((_[c] = [r]), se(v, c) && (v[c] = _[c]))
            : ((c.value = [r]), e.k && (_[e.k] = c.value))
        } else
          b
            ? ((_[c] = i), se(v, c) && (v[c] = i))
            : C && ((c.value = i), e.k && (_[e.k] = i))
      }
      i ? ((N.id = -1), Ee(N, n)) : N()
    }
  }
}
let ot = !1
const yn = (e) => /svg/.test(e.namespaceURI) && e.tagName !== 'foreignObject',
  bn = (e) => e.nodeType === 8
function tc(e) {
  const {
      mt: t,
      p: n,
      o: {
        patchProp: s,
        createText: o,
        nextSibling: r,
        parentNode: i,
        remove: l,
        insert: c,
        createComment: f,
      },
    } = e,
    _ = (g, V) => {
      if (!V.hasChildNodes()) {
        n(null, g, V), kn(), (V._vnode = g)
        return
      }
      ;(ot = !1),
        v(V.firstChild, g, null, null, null),
        kn(),
        (V._vnode = g),
        ot && console.error('Hydration completed but contains mismatches.')
    },
    v = (g, V, D, U, ne, fe = !1) => {
      const oe = bn(g) && g.data === '[',
        L = () => B(g, V, D, U, ne, oe),
        { type: X, ref: K, shapeFlag: re, patchFlag: A } = V
      let Q = g.nodeType
      ;(V.el = g), A === -2 && ((fe = !1), (V.dynamicChildren = null))
      let O = null
      switch (X) {
        case nn:
          Q !== 3
            ? V.children === ''
              ? (c((V.el = o('')), i(g), g), (O = g))
              : (O = L())
            : (g.data !== V.children && ((ot = !0), (g.data = V.children)),
              (O = r(g)))
          break
        case Ae:
          Q !== 8 || oe ? (O = L()) : (O = r(g))
          break
        case Yt:
          if ((oe && ((g = r(g)), (Q = g.nodeType)), Q === 1 || Q === 3)) {
            O = g
            const Le = !V.children.length
            for (let ce = 0; ce < V.staticCount; ce++)
              Le && (V.children += O.nodeType === 1 ? O.outerHTML : O.data),
                ce === V.staticCount - 1 && (V.anchor = O),
                (O = r(O))
            return oe ? r(O) : O
          } else L()
          break
        case ee:
          oe ? (O = N(g, V, D, U, ne, fe)) : (O = L())
          break
        default:
          if (re & 1)
            Q !== 1 || V.type.toLowerCase() !== g.tagName.toLowerCase()
              ? (O = L())
              : (O = b(g, V, D, U, ne, fe))
          else if (re & 6) {
            V.slotScopeIds = ne
            const Le = i(g)
            if (
              (t(V, Le, null, D, U, yn(Le), fe),
              (O = oe ? te(g) : r(g)),
              O && bn(O) && O.data === 'teleport end' && (O = r(O)),
              Nt(V))
            ) {
              let ce
              oe
                ? ((ce = T(ee)),
                  (ce.anchor = O ? O.previousSibling : Le.lastChild))
                : (ce = g.nodeType === 3 ? We('') : T('div')),
                (ce.el = g),
                (V.component.subTree = ce)
            }
          } else
            re & 64
              ? Q !== 8
                ? (O = L())
                : (O = V.type.hydrate(g, V, D, U, ne, fe, e, C))
              : re & 128 &&
                (O = V.type.hydrate(g, V, D, U, yn(i(g)), ne, fe, e, v))
      }
      return K != null && En(K, null, U, V), O
    },
    b = (g, V, D, U, ne, fe) => {
      fe = fe || !!V.dynamicChildren
      const { type: oe, props: L, patchFlag: X, shapeFlag: K, dirs: re } = V,
        A = (oe === 'input' && re) || oe === 'option'
      if (A || X !== -1) {
        if ((re && Ge(V, null, D, 'created'), L))
          if (A || !fe || X & 48)
            for (const O in L)
              ((A && O.endsWith('value')) || (rn(O) && !Wt(O))) &&
                s(g, O, null, L[O], !1, void 0, D)
          else L.onClick && s(g, 'onClick', null, L.onClick, !1, void 0, D)
        let Q
        if (
          ((Q = L && L.onVnodeBeforeMount) && Be(Q, D, V),
          re && Ge(V, null, D, 'beforeMount'),
          ((Q = L && L.onVnodeMounted) || re) &&
            Er(() => {
              Q && Be(Q, D, V), re && Ge(V, null, D, 'mounted')
            }, U),
          K & 16 && !(L && (L.innerHTML || L.textContent)))
        ) {
          let O = C(g.firstChild, V, g, D, U, ne, fe)
          for (; O; ) {
            ot = !0
            const Le = O
            ;(O = O.nextSibling), l(Le)
          }
        } else
          K & 8 &&
            g.textContent !== V.children &&
            ((ot = !0), (g.textContent = V.children))
      }
      return g.nextSibling
    },
    C = (g, V, D, U, ne, fe, oe) => {
      oe = oe || !!V.dynamicChildren
      const L = V.children,
        X = L.length
      for (let K = 0; K < X; K++) {
        const re = oe ? L[K] : (L[K] = ze(L[K]))
        if (g) g = v(g, re, U, ne, fe, oe)
        else {
          if (re.type === nn && !re.children) continue
          ;(ot = !0), n(null, re, D, null, U, ne, yn(D), fe)
        }
      }
      return g
    },
    N = (g, V, D, U, ne, fe) => {
      const { slotScopeIds: oe } = V
      oe && (ne = ne ? ne.concat(oe) : oe)
      const L = i(g),
        X = C(r(g), V, L, D, U, ne, fe)
      return X && bn(X) && X.data === ']'
        ? r((V.anchor = X))
        : ((ot = !0), c((V.anchor = f(']')), L, X), X)
    },
    B = (g, V, D, U, ne, fe) => {
      if (((ot = !0), (V.el = null), fe)) {
        const X = te(g)
        for (;;) {
          const K = r(g)
          if (K && K !== X) l(K)
          else break
        }
      }
      const oe = r(g),
        L = i(g)
      return l(g), n(null, V, L, oe, D, U, yn(L), ne), oe
    },
    te = (g) => {
      let V = 0
      for (; g; )
        if (
          ((g = r(g)), g && bn(g) && (g.data === '[' && V++, g.data === ']'))
        ) {
          if (V === 0) return r(g)
          V--
        }
      return g
    }
  return [_, v]
}
const Ee = Er
function nc(e) {
  return sc(e, tc)
}
function sc(e, t) {
  const n = Oi()
  n.__VUE__ = !0
  const {
      insert: s,
      remove: o,
      patchProp: r,
      createElement: i,
      createText: l,
      createComment: c,
      setText: f,
      setElementText: _,
      parentNode: v,
      nextSibling: b,
      setScopeId: C = Ke,
      insertStaticContent: N,
    } = e,
    B = (
      a,
      u,
      h,
      w = null,
      x = null,
      k = null,
      E = !1,
      P = null,
      S = !!u.dynamicChildren,
    ) => {
      if (a === u) return
      a && !wt(a, u) && ((w = _n(a)), qe(a, x, k, !0), (a = null)),
        u.patchFlag === -2 && ((S = !1), (u.dynamicChildren = null))
      const { type: $, ref: H, shapeFlag: I } = u
      switch ($) {
        case nn:
          te(a, u, h, w)
          break
        case Ae:
          g(a, u, h, w)
          break
        case Yt:
          a == null && V(u, h, w, E)
          break
        case ee:
          A(a, u, h, w, x, k, E, P, S)
          break
        default:
          I & 1
            ? ne(a, u, h, w, x, k, E, P, S)
            : I & 6
            ? Q(a, u, h, w, x, k, E, P, S)
            : (I & 64 || I & 128) && $.process(a, u, h, w, x, k, E, P, S, Et)
      }
      H != null && x && En(H, a && a.ref, k, u || a, !u)
    },
    te = (a, u, h, w) => {
      if (a == null) s((u.el = l(u.children)), h, w)
      else {
        const x = (u.el = a.el)
        u.children !== a.children && f(x, u.children)
      }
    },
    g = (a, u, h, w) => {
      a == null ? s((u.el = c(u.children || '')), h, w) : (u.el = a.el)
    },
    V = (a, u, h, w) => {
      ;[a.el, a.anchor] = N(a.children, u, h, w, a.el, a.anchor)
    },
    D = ({ el: a, anchor: u }, h, w) => {
      let x
      for (; a && a !== u; ) (x = b(a)), s(a, h, w), (a = x)
      s(u, h, w)
    },
    U = ({ el: a, anchor: u }) => {
      let h
      for (; a && a !== u; ) (h = b(a)), o(a), (a = h)
      o(u)
    },
    ne = (a, u, h, w, x, k, E, P, S) => {
      ;(E = E || u.type === 'svg'),
        a == null ? fe(u, h, w, x, k, E, P, S) : X(a, u, x, k, E, P, S)
    },
    fe = (a, u, h, w, x, k, E, P) => {
      let S, $
      const { type: H, props: I, shapeFlag: F, transition: j, dirs: Z } = a
      if (
        ((S = a.el = i(a.type, k, I && I.is, I)),
        F & 8
          ? _(S, a.children)
          : F & 16 &&
            L(a.children, S, null, w, x, k && H !== 'foreignObject', E, P),
        Z && Ge(a, null, w, 'created'),
        I)
      ) {
        for (const ae in I)
          ae !== 'value' &&
            !Wt(ae) &&
            r(S, ae, null, I[ae], k, a.children, w, x, Ze)
        'value' in I && r(S, 'value', null, I.value),
          ($ = I.onVnodeBeforeMount) && Be($, w, a)
      }
      oe(S, a, a.scopeId, E, w), Z && Ge(a, null, w, 'beforeMount')
      const he = (!x || (x && !x.pendingBranch)) && j && !j.persisted
      he && j.beforeEnter(S),
        s(S, u, h),
        (($ = I && I.onVnodeMounted) || he || Z) &&
          Ee(() => {
            $ && Be($, w, a), he && j.enter(S), Z && Ge(a, null, w, 'mounted')
          }, x)
    },
    oe = (a, u, h, w, x) => {
      if ((h && C(a, h), w)) for (let k = 0; k < w.length; k++) C(a, w[k])
      if (x) {
        let k = x.subTree
        if (u === k) {
          const E = x.vnode
          oe(a, E, E.scopeId, E.slotScopeIds, x.parent)
        }
      }
    },
    L = (a, u, h, w, x, k, E, P, S = 0) => {
      for (let $ = S; $ < a.length; $++) {
        const H = (a[$] = P ? lt(a[$]) : ze(a[$]))
        B(null, H, u, h, w, x, k, E, P)
      }
    },
    X = (a, u, h, w, x, k, E) => {
      const P = (u.el = a.el)
      let { patchFlag: S, dynamicChildren: $, dirs: H } = u
      S |= a.patchFlag & 16
      const I = a.props || de,
        F = u.props || de
      let j
      h && mt(h, !1),
        (j = F.onVnodeBeforeUpdate) && Be(j, h, u, a),
        H && Ge(u, a, h, 'beforeUpdate'),
        h && mt(h, !0)
      const Z = x && u.type !== 'foreignObject'
      if (
        ($
          ? K(a.dynamicChildren, $, P, h, w, Z, k)
          : E || _e(a, u, P, null, h, w, Z, k, !1),
        S > 0)
      ) {
        if (S & 16) re(P, u, I, F, h, w, x)
        else if (
          (S & 2 && I.class !== F.class && r(P, 'class', null, F.class, x),
          S & 4 && r(P, 'style', I.style, F.style, x),
          S & 8)
        ) {
          const he = u.dynamicProps
          for (let ae = 0; ae < he.length; ae++) {
            const ye = he[ae],
              De = I[ye],
              Lt = F[ye]
            ;(Lt !== De || ye === 'value') &&
              r(P, ye, De, Lt, x, a.children, h, w, Ze)
          }
        }
        S & 1 && a.children !== u.children && _(P, u.children)
      } else !E && $ == null && re(P, u, I, F, h, w, x)
      ;((j = F.onVnodeUpdated) || H) &&
        Ee(() => {
          j && Be(j, h, u, a), H && Ge(u, a, h, 'updated')
        }, w)
    },
    K = (a, u, h, w, x, k, E) => {
      for (let P = 0; P < u.length; P++) {
        const S = a[P],
          $ = u[P],
          H =
            S.el && (S.type === ee || !wt(S, $) || S.shapeFlag & 70)
              ? v(S.el)
              : h
        B(S, $, H, null, w, x, k, E, !0)
      }
    },
    re = (a, u, h, w, x, k, E) => {
      if (h !== w) {
        if (h !== de)
          for (const P in h)
            !Wt(P) && !(P in w) && r(a, P, h[P], null, E, u.children, x, k, Ze)
        for (const P in w) {
          if (Wt(P)) continue
          const S = w[P],
            $ = h[P]
          S !== $ && P !== 'value' && r(a, P, $, S, E, u.children, x, k, Ze)
        }
        'value' in w && r(a, 'value', h.value, w.value)
      }
    },
    A = (a, u, h, w, x, k, E, P, S) => {
      const $ = (u.el = a ? a.el : l('')),
        H = (u.anchor = a ? a.anchor : l(''))
      let { patchFlag: I, dynamicChildren: F, slotScopeIds: j } = u
      j && (P = P ? P.concat(j) : j),
        a == null
          ? (s($, h, w), s(H, h, w), L(u.children, h, H, x, k, E, P, S))
          : I > 0 && I & 64 && F && a.dynamicChildren
          ? (K(a.dynamicChildren, F, h, x, k, E, P),
            (u.key != null || (x && u === x.subTree)) && Jr(a, u, !0))
          : _e(a, u, h, H, x, k, E, P, S)
    },
    Q = (a, u, h, w, x, k, E, P, S) => {
      ;(u.slotScopeIds = P),
        a == null
          ? u.shapeFlag & 512
            ? x.ctx.activate(u, h, w, E, S)
            : O(u, h, w, x, k, E, S)
          : Le(a, u, S)
    },
    O = (a, u, h, w, x, k, E) => {
      const P = (a.component = _c(a, w, x))
      if ((Wn(a) && (P.ctx.renderer = Et), hc(P), P.asyncDep)) {
        if ((x && x.registerDep(P, ce), !a.el)) {
          const S = (P.subTree = T(Ae))
          g(null, S, u, h)
        }
        return
      }
      ce(P, a, u, h, x, k, E)
    },
    Le = (a, u, h) => {
      const w = (u.component = a.component)
      if (Sl(a, u, h))
        if (w.asyncDep && !w.asyncResolved) {
          ge(w, u, h)
          return
        } else (w.next = u), xl(w.update), w.update()
      else (u.el = a.el), (w.vnode = u)
    },
    ce = (a, u, h, w, x, k, E) => {
      const P = () => {
          if (a.isMounted) {
            let { next: H, bu: I, u: F, parent: j, vnode: Z } = a,
              he = H,
              ae
            mt(a, !1),
              H ? ((H.el = Z.el), ge(a, H, E)) : (H = Z),
              I && ss(I),
              (ae = H.props && H.props.onVnodeBeforeUpdate) && Be(ae, j, H, Z),
              mt(a, !0)
            const ye = os(a),
              De = a.subTree
            ;(a.subTree = ye),
              B(De, ye, v(De.el), _n(De), a, x, k),
              (H.el = ye.el),
              he === null && Vl(a, ye.el),
              F && Ee(F, x),
              (ae = H.props && H.props.onVnodeUpdated) &&
                Ee(() => Be(ae, j, H, Z), x)
          } else {
            let H
            const { el: I, props: F } = u,
              { bm: j, m: Z, parent: he } = a,
              ae = Nt(u)
            if (
              (mt(a, !1),
              j && ss(j),
              !ae && (H = F && F.onVnodeBeforeMount) && Be(H, he, u),
              mt(a, !0),
              I && ts)
            ) {
              const ye = () => {
                ;(a.subTree = os(a)), ts(I, a.subTree, a, x, null)
              }
              ae
                ? u.type.__asyncLoader().then(() => !a.isUnmounted && ye())
                : ye()
            } else {
              const ye = (a.subTree = os(a))
              B(null, ye, h, w, a, x, k), (u.el = ye.el)
            }
            if ((Z && Ee(Z, x), !ae && (H = F && F.onVnodeMounted))) {
              const ye = u
              Ee(() => Be(H, he, ye), x)
            }
            ;(u.shapeFlag & 256 ||
              (he && Nt(he.vnode) && he.vnode.shapeFlag & 256)) &&
              a.a &&
              Ee(a.a, x),
              (a.isMounted = !0),
              (u = h = w = null)
          }
        },
        S = (a.effect = new Is(P, () => zs($), a.scope)),
        $ = (a.update = () => S.run())
      ;($.id = a.uid), mt(a, !0), $()
    },
    ge = (a, u, h) => {
      u.component = a
      const w = a.vnode.props
      ;(a.vnode = u),
        (a.next = null),
        Gl(a, u.props, w, h),
        Ql(a, u.children, h),
        Rt(),
        vo(),
        Dt()
    },
    _e = (a, u, h, w, x, k, E, P, S = !1) => {
      const $ = a && a.children,
        H = a ? a.shapeFlag : 0,
        I = u.children,
        { patchFlag: F, shapeFlag: j } = u
      if (F > 0) {
        if (F & 128) {
          dn($, I, h, w, x, k, E, P, S)
          return
        } else if (F & 256) {
          pt($, I, h, w, x, k, E, P, S)
          return
        }
      }
      j & 8
        ? (H & 16 && Ze($, x, k), I !== $ && _(h, I))
        : H & 16
        ? j & 16
          ? dn($, I, h, w, x, k, E, P, S)
          : Ze($, x, k, !0)
        : (H & 8 && _(h, ''), j & 16 && L(I, h, w, x, k, E, P, S))
    },
    pt = (a, u, h, w, x, k, E, P, S) => {
      ;(a = a || Tt), (u = u || Tt)
      const $ = a.length,
        H = u.length,
        I = Math.min($, H)
      let F
      for (F = 0; F < I; F++) {
        const j = (u[F] = S ? lt(u[F]) : ze(u[F]))
        B(a[F], j, h, null, x, k, E, P, S)
      }
      $ > H ? Ze(a, x, k, !0, !1, I) : L(u, h, w, x, k, E, P, S, I)
    },
    dn = (a, u, h, w, x, k, E, P, S) => {
      let $ = 0
      const H = u.length
      let I = a.length - 1,
        F = H - 1
      for (; $ <= I && $ <= F; ) {
        const j = a[$],
          Z = (u[$] = S ? lt(u[$]) : ze(u[$]))
        if (wt(j, Z)) B(j, Z, h, null, x, k, E, P, S)
        else break
        $++
      }
      for (; $ <= I && $ <= F; ) {
        const j = a[I],
          Z = (u[F] = S ? lt(u[F]) : ze(u[F]))
        if (wt(j, Z)) B(j, Z, h, null, x, k, E, P, S)
        else break
        I--, F--
      }
      if ($ > I) {
        if ($ <= F) {
          const j = F + 1,
            Z = j < H ? u[j].el : w
          for (; $ <= F; )
            B(null, (u[$] = S ? lt(u[$]) : ze(u[$])), h, Z, x, k, E, P, S), $++
        }
      } else if ($ > F) for (; $ <= I; ) qe(a[$], x, k, !0), $++
      else {
        const j = $,
          Z = $,
          he = new Map()
        for ($ = Z; $ <= F; $++) {
          const Te = (u[$] = S ? lt(u[$]) : ze(u[$]))
          Te.key != null && he.set(Te.key, $)
        }
        let ae,
          ye = 0
        const De = F - Z + 1
        let Lt = !1,
          so = 0
        const zt = new Array(De)
        for ($ = 0; $ < De; $++) zt[$] = 0
        for ($ = j; $ <= I; $++) {
          const Te = a[$]
          if (ye >= De) {
            qe(Te, x, k, !0)
            continue
          }
          let Ye
          if (Te.key != null) Ye = he.get(Te.key)
          else
            for (ae = Z; ae <= F; ae++)
              if (zt[ae - Z] === 0 && wt(Te, u[ae])) {
                Ye = ae
                break
              }
          Ye === void 0
            ? qe(Te, x, k, !0)
            : ((zt[Ye - Z] = $ + 1),
              Ye >= so ? (so = Ye) : (Lt = !0),
              B(Te, u[Ye], h, null, x, k, E, P, S),
              ye++)
        }
        const oo = Lt ? oc(zt) : Tt
        for (ae = oo.length - 1, $ = De - 1; $ >= 0; $--) {
          const Te = Z + $,
            Ye = u[Te],
            ro = Te + 1 < H ? u[Te + 1].el : w
          zt[$] === 0
            ? B(null, Ye, h, ro, x, k, E, P, S)
            : Lt && (ae < 0 || $ !== oo[ae] ? vt(Ye, h, ro, 2) : ae--)
        }
      }
    },
    vt = (a, u, h, w, x = null) => {
      const { el: k, type: E, transition: P, children: S, shapeFlag: $ } = a
      if ($ & 6) {
        vt(a.component.subTree, u, h, w)
        return
      }
      if ($ & 128) {
        a.suspense.move(u, h, w)
        return
      }
      if ($ & 64) {
        E.move(a, u, h, Et)
        return
      }
      if (E === ee) {
        s(k, u, h)
        for (let I = 0; I < S.length; I++) vt(S[I], u, h, w)
        s(a.anchor, u, h)
        return
      }
      if (E === Yt) {
        D(a, u, h)
        return
      }
      if (w !== 2 && $ & 1 && P)
        if (w === 0) P.beforeEnter(k), s(k, u, h), Ee(() => P.enter(k), x)
        else {
          const { leave: I, delayLeave: F, afterLeave: j } = P,
            Z = () => s(k, u, h),
            he = () => {
              I(k, () => {
                Z(), j && j()
              })
            }
          F ? F(k, Z, he) : he()
        }
      else s(k, u, h)
    },
    qe = (a, u, h, w = !1, x = !1) => {
      const {
        type: k,
        props: E,
        ref: P,
        children: S,
        dynamicChildren: $,
        shapeFlag: H,
        patchFlag: I,
        dirs: F,
      } = a
      if ((P != null && En(P, null, h, a, !0), H & 256)) {
        u.ctx.deactivate(a)
        return
      }
      const j = H & 1 && F,
        Z = !Nt(a)
      let he
      if ((Z && (he = E && E.onVnodeBeforeUnmount) && Be(he, u, a), H & 6))
        wi(a.component, h, w)
      else {
        if (H & 128) {
          a.suspense.unmount(h, w)
          return
        }
        j && Ge(a, null, u, 'beforeUnmount'),
          H & 64
            ? a.type.remove(a, u, h, x, Et, w)
            : $ && (k !== ee || (I > 0 && I & 64))
            ? Ze($, u, h, !1, !0)
            : ((k === ee && I & 384) || (!x && H & 16)) && Ze(S, u, h),
          w && to(a)
      }
      ;((Z && (he = E && E.onVnodeUnmounted)) || j) &&
        Ee(() => {
          he && Be(he, u, a), j && Ge(a, null, u, 'unmounted')
        }, h)
    },
    to = (a) => {
      const { type: u, el: h, anchor: w, transition: x } = a
      if (u === ee) {
        xi(h, w)
        return
      }
      if (u === Yt) {
        U(a)
        return
      }
      const k = () => {
        o(h), x && !x.persisted && x.afterLeave && x.afterLeave()
      }
      if (a.shapeFlag & 1 && x && !x.persisted) {
        const { leave: E, delayLeave: P } = x,
          S = () => E(h, k)
        P ? P(a.el, k, S) : S()
      } else k()
    },
    xi = (a, u) => {
      let h
      for (; a !== u; ) (h = b(a)), o(a), (a = h)
      o(u)
    },
    wi = (a, u, h) => {
      const { bum: w, scope: x, update: k, subTree: E, um: P } = a
      w && ss(w),
        x.stop(),
        k && ((k.active = !1), qe(E, a, u, h)),
        P && Ee(P, u),
        Ee(() => {
          a.isUnmounted = !0
        }, u),
        u &&
          u.pendingBranch &&
          !u.isUnmounted &&
          a.asyncDep &&
          !a.asyncResolved &&
          a.suspenseId === u.pendingId &&
          (u.deps--, u.deps === 0 && u.resolve())
    },
    Ze = (a, u, h, w = !1, x = !1, k = 0) => {
      for (let E = k; E < a.length; E++) qe(a[E], u, h, w, x)
    },
    _n = (a) =>
      a.shapeFlag & 6
        ? _n(a.component.subTree)
        : a.shapeFlag & 128
        ? a.suspense.next()
        : b(a.anchor || a.el),
    no = (a, u, h) => {
      a == null
        ? u._vnode && qe(u._vnode, null, null, !0)
        : B(u._vnode || null, a, u, null, null, null, h),
        vo(),
        kn(),
        (u._vnode = a)
    },
    Et = {
      p: B,
      um: qe,
      m: vt,
      r: to,
      mt: O,
      mc: L,
      pc: _e,
      pbc: K,
      n: _n,
      o: e,
    }
  let es, ts
  return (
    t && ([es, ts] = t(Et)), { render: no, hydrate: es, createApp: ec(no, es) }
  )
}
function mt({ effect: e, update: t }, n) {
  e.allowRecurse = t.allowRecurse = n
}
function Jr(e, t, n = !1) {
  const s = e.children,
    o = t.children
  if (z(s) && z(o))
    for (let r = 0; r < s.length; r++) {
      const i = s[r]
      let l = o[r]
      l.shapeFlag & 1 &&
        !l.dynamicChildren &&
        ((l.patchFlag <= 0 || l.patchFlag === 32) &&
          ((l = o[r] = lt(o[r])), (l.el = i.el)),
        n || Jr(i, l))
    }
}
function oc(e) {
  const t = e.slice(),
    n = [0]
  let s, o, r, i, l
  const c = e.length
  for (s = 0; s < c; s++) {
    const f = e[s]
    if (f !== 0) {
      if (((o = n[n.length - 1]), e[o] < f)) {
        ;(t[s] = o), n.push(s)
        continue
      }
      for (r = 0, i = n.length - 1; r < i; )
        (l = (r + i) >> 1), e[n[l]] < f ? (r = l + 1) : (i = l)
      f < e[n[r]] && (r > 0 && (t[s] = n[r - 1]), (n[r] = s))
    }
  }
  for (r = n.length, i = n[r - 1]; r-- > 0; ) (n[r] = i), (i = t[i])
  return n
}
const rc = (e) => e.__isTeleport,
  ee = Symbol(void 0),
  nn = Symbol(void 0),
  Ae = Symbol(void 0),
  Yt = Symbol(void 0),
  Gt = []
let Ue = null
function d(e = !1) {
  Gt.push((Ue = e ? null : []))
}
function ic() {
  Gt.pop(), (Ue = Gt[Gt.length - 1] || null)
}
let sn = 1
function Vo(e) {
  sn += e
}
function Xr(e) {
  return (
    (e.dynamicChildren = sn > 0 ? Ue || Tt : null),
    ic(),
    sn > 0 && Ue && Ue.push(e),
    e
  )
}
function m(e, t, n, s, o, r) {
  return Xr(p(e, t, n, s, o, r, !0))
}
function J(e, t, n, s, o) {
  return Xr(T(e, t, n, s, o, !0))
}
function Ln(e) {
  return e ? e.__v_isVNode === !0 : !1
}
function wt(e, t) {
  return e.type === t.type && e.key === t.key
}
const Gn = '__vInternal',
  Qr = ({ key: e }) => (e != null ? e : null),
  wn = ({ ref: e, ref_key: t, ref_for: n }) =>
    e != null
      ? be(e) || ke(e) || Y(e)
        ? { i: Ce, r: e, k: t, f: !!n }
        : e
      : null
function p(
  e,
  t = null,
  n = null,
  s = 0,
  o = null,
  r = e === ee ? 0 : 1,
  i = !1,
  l = !1,
) {
  const c = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Qr(t),
    ref: t && wn(t),
    scopeId: Un,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: r,
    patchFlag: s,
    dynamicProps: o,
    dynamicChildren: null,
    appContext: null,
  }
  return (
    l
      ? (qs(c, n), r & 128 && e.normalize(c))
      : n && (c.shapeFlag |= be(n) ? 8 : 16),
    sn > 0 &&
      !i &&
      Ue &&
      (c.patchFlag > 0 || r & 6) &&
      c.patchFlag !== 32 &&
      Ue.push(c),
    c
  )
}
const T = lc
function lc(e, t = null, n = null, s = 0, o = null, r = !1) {
  if (((!e || e === Rr) && (e = Ae), Ln(e))) {
    const l = _t(e, t, !0)
    return (
      n && qs(l, n),
      sn > 0 &&
        !r &&
        Ue &&
        (l.shapeFlag & 6 ? (Ue[Ue.indexOf(e)] = l) : Ue.push(l)),
      (l.patchFlag |= -2),
      l
    )
  }
  if ((yc(e) && (e = e.__vccOpts), t)) {
    t = cc(t)
    let { class: l, style: c } = t
    l && !be(l) && (t.class = me(l)),
      pe(c) && (yr(c) && !z(c) && (c = $e({}, c)), (t.style = Vs(c)))
  }
  const i = be(e) ? 1 : El(e) ? 128 : rc(e) ? 64 : pe(e) ? 4 : Y(e) ? 2 : 0
  return p(e, t, n, s, o, i, r, !0)
}
function cc(e) {
  return e ? (yr(e) || Gn in e ? $e({}, e) : e) : null
}
function _t(e, t, n = !1) {
  const { props: s, ref: o, patchFlag: r, children: i } = e,
    l = t ? uc(s || {}, t) : s
  return {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: l,
    key: l && Qr(l),
    ref:
      t && t.ref ? (n && o ? (z(o) ? o.concat(wn(t)) : [o, wn(t)]) : wn(t)) : o,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: i,
    target: e.target,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    patchFlag: t && e.type !== ee ? (r === -1 ? 16 : r | 16) : r,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: e.transition,
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && _t(e.ssContent),
    ssFallback: e.ssFallback && _t(e.ssFallback),
    el: e.el,
    anchor: e.anchor,
  }
}
function We(e = ' ', t = 0) {
  return T(nn, null, e, t)
}
function ac(e, t) {
  const n = T(Yt, null, e)
  return (n.staticCount = t), n
}
function G(e = '', t = !1) {
  return t ? (d(), J(Ae, null, e)) : T(Ae, null, e)
}
function ze(e) {
  return e == null || typeof e == 'boolean'
    ? T(Ae)
    : z(e)
    ? T(ee, null, e.slice())
    : typeof e == 'object'
    ? lt(e)
    : T(nn, null, String(e))
}
function lt(e) {
  return (e.el === null && e.patchFlag !== -1) || e.memo ? e : _t(e)
}
function qs(e, t) {
  let n = 0
  const { shapeFlag: s } = e
  if (t == null) t = null
  else if (z(t)) n = 16
  else if (typeof t == 'object')
    if (s & 65) {
      const o = t.default
      o && (o._c && (o._d = !1), qs(e, o()), o._c && (o._d = !0))
      return
    } else {
      n = 32
      const o = t._
      !o && !(Gn in t)
        ? (t._ctx = Ce)
        : o === 3 &&
          Ce &&
          (Ce.slots._ === 1 ? (t._ = 1) : ((t._ = 2), (e.patchFlag |= 1024)))
    }
  else
    Y(t)
      ? ((t = { default: t, _ctx: Ce }), (n = 32))
      : ((t = String(t)), s & 64 ? ((n = 16), (t = [We(t)])) : (n = 8))
  ;(e.children = t), (e.shapeFlag |= n)
}
function uc(...e) {
  const t = {}
  for (let n = 0; n < e.length; n++) {
    const s = e[n]
    for (const o in s)
      if (o === 'class')
        t.class !== s.class && (t.class = me([t.class, s.class]))
      else if (o === 'style') t.style = Vs([t.style, s.style])
      else if (rn(o)) {
        const r = t[o],
          i = s[o]
        i &&
          r !== i &&
          !(z(r) && r.includes(i)) &&
          (t[o] = r ? [].concat(r, i) : i)
      } else o !== '' && (t[o] = s[o])
  }
  return t
}
function Be(e, t, n, s = null) {
  He(e, t, 7, [n, s])
}
const fc = Gr()
let dc = 0
function _c(e, t, n) {
  const s = e.type,
    o = (t ? t.appContext : e.appContext) || fc,
    r = {
      uid: dc++,
      vnode: e,
      type: s,
      parent: t,
      appContext: o,
      root: null,
      next: null,
      subTree: null,
      effect: null,
      update: null,
      scope: new Hi(!0),
      render: null,
      proxy: null,
      exposed: null,
      exposeProxy: null,
      withProxy: null,
      provides: t ? t.provides : Object.create(o.provides),
      accessCache: null,
      renderCache: [],
      components: null,
      directives: null,
      propsOptions: Kr(s, o),
      emitsOptions: Vr(s, o),
      emit: null,
      emitted: null,
      propsDefaults: de,
      inheritAttrs: s.inheritAttrs,
      ctx: de,
      data: de,
      props: de,
      attrs: de,
      slots: de,
      refs: de,
      setupState: de,
      setupContext: null,
      suspense: n,
      suspenseId: n ? n.pendingId : 0,
      asyncDep: null,
      asyncResolved: !1,
      isMounted: !1,
      isUnmounted: !1,
      isDeactivated: !1,
      bc: null,
      c: null,
      bm: null,
      m: null,
      bu: null,
      u: null,
      um: null,
      bum: null,
      da: null,
      a: null,
      rtg: null,
      rtc: null,
      ec: null,
      sp: null,
    }
  return (
    (r.ctx = { _: r }),
    (r.root = t ? t.root : r),
    (r.emit = Pl.bind(null, r)),
    e.ce && e.ce(r),
    r
  )
}
let we = null
const Zr = () => we || Ce,
  Ht = (e) => {
    ;(we = e), e.scope.on()
  },
  St = () => {
    we && we.scope.off(), (we = null)
  }
function ei(e) {
  return e.vnode.shapeFlag & 4
}
let on = !1
function hc(e, t = !1) {
  on = t
  const { props: n, children: s } = e.vnode,
    o = ei(e)
  Yl(e, n, o, t), Xl(e, s)
  const r = o ? pc(e, t) : void 0
  return (on = !1), r
}
function pc(e, t) {
  const n = e.type
  ;(e.accessCache = Object.create(null)), (e.proxy = qt(new Proxy(e.ctx, zl)))
  const { setup: s } = n
  if (s) {
    const o = (e.setupContext = s.length > 1 ? mc(e) : null)
    Ht(e), Rt()
    const r = at(s, e, 0, [e.props, o])
    if ((Dt(), St(), rr(r))) {
      if ((r.then(St, St), t))
        return r
          .then((i) => {
            Eo(e, i, t)
          })
          .catch((i) => {
            zn(i, e, 0)
          })
      e.asyncDep = r
    } else Eo(e, r, t)
  } else ti(e, t)
}
function Eo(e, t, n) {
  Y(t)
    ? e.type.__ssrInlineRender
      ? (e.ssrRender = t)
      : (e.render = t)
    : pe(t) && (e.setupState = $r(t)),
    ti(e, n)
}
let Lo
function ti(e, t, n) {
  const s = e.type
  if (!e.render) {
    if (!t && Lo && !s.render) {
      const o = s.template || Ks(e).template
      if (o) {
        const { isCustomElement: r, compilerOptions: i } = e.appContext.config,
          { delimiters: l, compilerOptions: c } = s,
          f = $e($e({ isCustomElement: r, delimiters: l }, i), c)
        s.render = Lo(o, f)
      }
    }
    e.render = s.render || Ke
  }
  Ht(e), Rt(), jl(e), Dt(), St()
}
function vc(e) {
  return new Proxy(e.attrs, {
    get(t, n) {
      return Ie(e, 'get', '$attrs'), t[n]
    },
  })
}
function mc(e) {
  const t = (s) => {
    e.exposed = s || {}
  }
  let n
  return {
    get attrs() {
      return n || (n = vc(e))
    },
    slots: e.slots,
    emit: e.emit,
    expose: t,
  }
}
function Jn(e) {
  if (e.exposed)
    return (
      e.exposeProxy ||
      (e.exposeProxy = new Proxy($r(qt(e.exposed)), {
        get(t, n) {
          if (n in t) return t[n]
          if (n in Sn) return Sn[n](e)
        },
      }))
    )
}
function gc(e, t = !0) {
  return Y(e) ? e.displayName || e.name : e.name || (t && e.__name)
}
function yc(e) {
  return Y(e) && '__vccOpts' in e
}
const ve = (e, t) => gl(e, t, on)
function Tn(e, t, n) {
  const s = arguments.length
  return s === 2
    ? pe(t) && !z(t)
      ? Ln(t)
        ? T(e, null, [t])
        : T(e, t)
      : T(e, null, t)
    : (s > 3
        ? (n = Array.prototype.slice.call(arguments, 2))
        : s === 3 && Ln(n) && (n = [n]),
      T(e, t, n))
}
const bc = '3.2.41',
  xc = 'http://www.w3.org/2000/svg',
  $t = typeof document != 'undefined' ? document : null,
  To = $t && $t.createElement('template'),
  wc = {
    insert: (e, t, n) => {
      t.insertBefore(e, n || null)
    },
    remove: (e) => {
      const t = e.parentNode
      t && t.removeChild(e)
    },
    createElement: (e, t, n, s) => {
      const o = t
        ? $t.createElementNS(xc, e)
        : $t.createElement(e, n ? { is: n } : void 0)
      return (
        e === 'select' &&
          s &&
          s.multiple != null &&
          o.setAttribute('multiple', s.multiple),
        o
      )
    },
    createText: (e) => $t.createTextNode(e),
    createComment: (e) => $t.createComment(e),
    setText: (e, t) => {
      e.nodeValue = t
    },
    setElementText: (e, t) => {
      e.textContent = t
    },
    parentNode: (e) => e.parentNode,
    nextSibling: (e) => e.nextSibling,
    querySelector: (e) => $t.querySelector(e),
    setScopeId(e, t) {
      e.setAttribute(t, '')
    },
    insertStaticContent(e, t, n, s, o, r) {
      const i = n ? n.previousSibling : t.lastChild
      if (o && (o === r || o.nextSibling))
        for (
          ;
          t.insertBefore(o.cloneNode(!0), n),
            !(o === r || !(o = o.nextSibling));

        );
      else {
        To.innerHTML = s ? `<svg>${e}</svg>` : e
        const l = To.content
        if (s) {
          const c = l.firstChild
          for (; c.firstChild; ) l.appendChild(c.firstChild)
          l.removeChild(c)
        }
        t.insertBefore(l, n)
      }
      return [
        i ? i.nextSibling : t.firstChild,
        n ? n.previousSibling : t.lastChild,
      ]
    },
  }
function $c(e, t, n) {
  const s = e._vtc
  s && (t = (t ? [t, ...s] : [...s]).join(' ')),
    t == null
      ? e.removeAttribute('class')
      : n
      ? e.setAttribute('class', t)
      : (e.className = t)
}
function Pc(e, t, n) {
  const s = e.style,
    o = be(n)
  if (n && !o) {
    for (const r in n) $s(s, r, n[r])
    if (t && !be(t)) for (const r in t) n[r] == null && $s(s, r, '')
  } else {
    const r = s.display
    o ? t !== n && (s.cssText = n) : t && e.removeAttribute('style'),
      '_vod' in e && (s.display = r)
  }
}
const Mo = /\s*!important$/
function $s(e, t, n) {
  if (z(n)) n.forEach((s) => $s(e, t, s))
  else if ((n == null && (n = ''), t.startsWith('--'))) e.setProperty(t, n)
  else {
    const s = kc(e, t)
    Mo.test(n)
      ? e.setProperty(Ft(s), n.replace(Mo, ''), 'important')
      : (e[s] = n)
  }
}
const Ao = ['Webkit', 'Moz', 'ms'],
  is = {}
function kc(e, t) {
  const n = is[t]
  if (n) return n
  let s = Xe(t)
  if (s !== 'filter' && s in e) return (is[t] = s)
  s = Fn(s)
  for (let o = 0; o < Ao.length; o++) {
    const r = Ao[o] + s
    if (r in e) return (is[t] = r)
  }
  return t
}
const Io = 'http://www.w3.org/1999/xlink'
function Cc(e, t, n, s, o) {
  if (s && t.startsWith('xlink:'))
    n == null
      ? e.removeAttributeNS(Io, t.slice(6, t.length))
      : e.setAttributeNS(Io, t, n)
  else {
    const r = Si(t)
    n == null || (r && !nr(n))
      ? e.removeAttribute(t)
      : e.setAttribute(t, r ? '' : n)
  }
}
function Sc(e, t, n, s, o, r, i) {
  if (t === 'innerHTML' || t === 'textContent') {
    s && i(s, o, r), (e[t] = n == null ? '' : n)
    return
  }
  if (t === 'value' && e.tagName !== 'PROGRESS' && !e.tagName.includes('-')) {
    e._value = n
    const c = n == null ? '' : n
    ;(e.value !== c || e.tagName === 'OPTION') && (e.value = c),
      n == null && e.removeAttribute(t)
    return
  }
  let l = !1
  if (n === '' || n == null) {
    const c = typeof e[t]
    c === 'boolean'
      ? (n = nr(n))
      : n == null && c === 'string'
      ? ((n = ''), (l = !0))
      : c === 'number' && ((n = 0), (l = !0))
  }
  try {
    e[t] = n
  } catch {}
  l && e.removeAttribute(t)
}
function Vc(e, t, n, s) {
  e.addEventListener(t, n, s)
}
function Ec(e, t, n, s) {
  e.removeEventListener(t, n, s)
}
function Lc(e, t, n, s, o = null) {
  const r = e._vei || (e._vei = {}),
    i = r[t]
  if (s && i) i.value = s
  else {
    const [l, c] = Tc(t)
    if (s) {
      const f = (r[t] = Ic(s, o))
      Vc(e, l, f, c)
    } else i && (Ec(e, l, i, c), (r[t] = void 0))
  }
}
const No = /(?:Once|Passive|Capture)$/
function Tc(e) {
  let t
  if (No.test(e)) {
    t = {}
    let s
    for (; (s = e.match(No)); )
      (e = e.slice(0, e.length - s[0].length)), (t[s[0].toLowerCase()] = !0)
  }
  return [e[2] === ':' ? e.slice(3) : Ft(e.slice(2)), t]
}
let ls = 0
const Mc = Promise.resolve(),
  Ac = () => ls || (Mc.then(() => (ls = 0)), (ls = Date.now()))
function Ic(e, t) {
  const n = (s) => {
    if (!s._vts) s._vts = Date.now()
    else if (s._vts <= n.attached) return
    He(Nc(s, n.value), t, 5, [s])
  }
  return (n.value = e), (n.attached = Ac()), n
}
function Nc(e, t) {
  if (z(t)) {
    const n = e.stopImmediatePropagation
    return (
      (e.stopImmediatePropagation = () => {
        n.call(e), (e._stopped = !0)
      }),
      t.map((s) => (o) => !o._stopped && s && s(o))
    )
  } else return t
}
const Bo = /^on[a-z]/,
  Bc = (e, t, n, s, o = !1, r, i, l, c) => {
    t === 'class'
      ? $c(e, s, o)
      : t === 'style'
      ? Pc(e, n, s)
      : rn(t)
      ? Es(t) || Lc(e, t, n, s, i)
      : (
          t[0] === '.'
            ? ((t = t.slice(1)), !0)
            : t[0] === '^'
            ? ((t = t.slice(1)), !1)
            : Oc(e, t, s, o)
        )
      ? Sc(e, t, s, r, i, l, c)
      : (t === 'true-value'
          ? (e._trueValue = s)
          : t === 'false-value' && (e._falseValue = s),
        Cc(e, t, s, o))
  }
function Oc(e, t, n, s) {
  return s
    ? !!(
        t === 'innerHTML' ||
        t === 'textContent' ||
        (t in e && Bo.test(t) && Y(n))
      )
    : t === 'spellcheck' ||
      t === 'draggable' ||
      t === 'translate' ||
      t === 'form' ||
      (t === 'list' && e.tagName === 'INPUT') ||
      (t === 'type' && e.tagName === 'TEXTAREA') ||
      (Bo.test(t) && be(n))
    ? !1
    : t in e
}
const rt = 'transition',
  jt = 'animation',
  Xn = (e, { slots: t }) => Tn(Mr, Hc(e), t)
Xn.displayName = 'Transition'
const ni = {
  name: String,
  type: String,
  css: { type: Boolean, default: !0 },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String,
}
Xn.props = $e({}, Mr.props, ni)
const gt = (e, t = []) => {
    z(e) ? e.forEach((n) => n(...t)) : e && e(...t)
  },
  Oo = (e) => (e ? (z(e) ? e.some((t) => t.length > 1) : e.length > 1) : !1)
function Hc(e) {
  const t = {}
  for (const A in e) A in ni || (t[A] = e[A])
  if (e.css === !1) return t
  const {
      name: n = 'v',
      type: s,
      duration: o,
      enterFromClass: r = `${n}-enter-from`,
      enterActiveClass: i = `${n}-enter-active`,
      enterToClass: l = `${n}-enter-to`,
      appearFromClass: c = r,
      appearActiveClass: f = i,
      appearToClass: _ = l,
      leaveFromClass: v = `${n}-leave-from`,
      leaveActiveClass: b = `${n}-leave-active`,
      leaveToClass: C = `${n}-leave-to`,
    } = e,
    N = Fc(o),
    B = N && N[0],
    te = N && N[1],
    {
      onBeforeEnter: g,
      onEnter: V,
      onEnterCancelled: D,
      onLeave: U,
      onLeaveCancelled: ne,
      onBeforeAppear: fe = g,
      onAppear: oe = V,
      onAppearCancelled: L = D,
    } = t,
    X = (A, Q, O) => {
      yt(A, Q ? _ : l), yt(A, Q ? f : i), O && O()
    },
    K = (A, Q) => {
      ;(A._isLeaving = !1), yt(A, v), yt(A, C), yt(A, b), Q && Q()
    },
    re = (A) => (Q, O) => {
      const Le = A ? oe : V,
        ce = () => X(Q, A, O)
      gt(Le, [Q, ce]),
        Ho(() => {
          yt(Q, A ? c : r), it(Q, A ? _ : l), Oo(Le) || Fo(Q, s, B, ce)
        })
    }
  return $e(t, {
    onBeforeEnter(A) {
      gt(g, [A]), it(A, r), it(A, i)
    },
    onBeforeAppear(A) {
      gt(fe, [A]), it(A, c), it(A, f)
    },
    onEnter: re(!1),
    onAppear: re(!0),
    onLeave(A, Q) {
      A._isLeaving = !0
      const O = () => K(A, Q)
      it(A, v),
        zc(),
        it(A, b),
        Ho(() => {
          !A._isLeaving || (yt(A, v), it(A, C), Oo(U) || Fo(A, s, te, O))
        }),
        gt(U, [A, O])
    },
    onEnterCancelled(A) {
      X(A, !1), gt(D, [A])
    },
    onAppearCancelled(A) {
      X(A, !0), gt(L, [A])
    },
    onLeaveCancelled(A) {
      K(A), gt(ne, [A])
    },
  })
}
function Fc(e) {
  if (e == null) return null
  if (pe(e)) return [cs(e.enter), cs(e.leave)]
  {
    const t = cs(e)
    return [t, t]
  }
}
function cs(e) {
  return cr(e)
}
function it(e, t) {
  t.split(/\s+/).forEach((n) => n && e.classList.add(n)),
    (e._vtc || (e._vtc = new Set())).add(t)
}
function yt(e, t) {
  t.split(/\s+/).forEach((s) => s && e.classList.remove(s))
  const { _vtc: n } = e
  n && (n.delete(t), n.size || (e._vtc = void 0))
}
function Ho(e) {
  requestAnimationFrame(() => {
    requestAnimationFrame(e)
  })
}
let Rc = 0
function Fo(e, t, n, s) {
  const o = (e._endId = ++Rc),
    r = () => {
      o === e._endId && s()
    }
  if (n) return setTimeout(r, n)
  const { type: i, timeout: l, propCount: c } = Dc(e, t)
  if (!i) return s()
  const f = i + 'end'
  let _ = 0
  const v = () => {
      e.removeEventListener(f, b), r()
    },
    b = (C) => {
      C.target === e && ++_ >= c && v()
    }
  setTimeout(() => {
    _ < c && v()
  }, l + 1),
    e.addEventListener(f, b)
}
function Dc(e, t) {
  const n = window.getComputedStyle(e),
    s = (N) => (n[N] || '').split(', '),
    o = s(rt + 'Delay'),
    r = s(rt + 'Duration'),
    i = Ro(o, r),
    l = s(jt + 'Delay'),
    c = s(jt + 'Duration'),
    f = Ro(l, c)
  let _ = null,
    v = 0,
    b = 0
  t === rt
    ? i > 0 && ((_ = rt), (v = i), (b = r.length))
    : t === jt
    ? f > 0 && ((_ = jt), (v = f), (b = c.length))
    : ((v = Math.max(i, f)),
      (_ = v > 0 ? (i > f ? rt : jt) : null),
      (b = _ ? (_ === rt ? r.length : c.length) : 0))
  const C = _ === rt && /\b(transform|all)(,|$)/.test(n[rt + 'Property'])
  return { type: _, timeout: v, propCount: b, hasTransform: C }
}
function Ro(e, t) {
  for (; e.length < t.length; ) e = e.concat(e)
  return Math.max(...t.map((n, s) => Do(n) + Do(e[s])))
}
function Do(e) {
  return Number(e.slice(0, -1).replace(',', '.')) * 1e3
}
function zc() {
  return document.body.offsetHeight
}
const jc = ['ctrl', 'shift', 'alt', 'meta'],
  Uc = {
    stop: (e) => e.stopPropagation(),
    prevent: (e) => e.preventDefault(),
    self: (e) => e.target !== e.currentTarget,
    ctrl: (e) => !e.ctrlKey,
    shift: (e) => !e.shiftKey,
    alt: (e) => !e.altKey,
    meta: (e) => !e.metaKey,
    left: (e) => 'button' in e && e.button !== 0,
    middle: (e) => 'button' in e && e.button !== 1,
    right: (e) => 'button' in e && e.button !== 2,
    exact: (e, t) => jc.some((n) => e[`${n}Key`] && !t.includes(n)),
  },
  Kc =
    (e, t) =>
    (n, ...s) => {
      for (let o = 0; o < t.length; o++) {
        const r = Uc[t[o]]
        if (r && r(n, t)) return
      }
      return e(n, ...s)
    },
  zo = {
    beforeMount(e, { value: t }, { transition: n }) {
      ;(e._vod = e.style.display === 'none' ? '' : e.style.display),
        n && t ? n.beforeEnter(e) : Ut(e, t)
    },
    mounted(e, { value: t }, { transition: n }) {
      n && t && n.enter(e)
    },
    updated(e, { value: t, oldValue: n }, { transition: s }) {
      !t != !n &&
        (s
          ? t
            ? (s.beforeEnter(e), Ut(e, !0), s.enter(e))
            : s.leave(e, () => {
                Ut(e, !1)
              })
          : Ut(e, t))
    },
    beforeUnmount(e, { value: t }) {
      Ut(e, t)
    },
  }
function Ut(e, t) {
  e.style.display = t ? e._vod : 'none'
}
const Wc = $e({ patchProp: Bc }, wc)
let as,
  jo = !1
function qc() {
  return (as = jo ? as : nc(Wc)), (jo = !0), as
}
const Yc = (...e) => {
  const t = qc().createApp(...e),
    { mount: n } = t
  return (
    (t.mount = (s) => {
      const o = Gc(s)
      if (o) return n(o, !0, o instanceof SVGElement)
    }),
    t
  )
}
function Gc(e) {
  return be(e) ? document.querySelector(e) : e
}
var Jc =
  '{"lang":"en-US","title":"VitePress","description":"A VitePress site","base":"/","head":[],"appearance":true,"themeConfig":{},"locales":{},"langs":{},"scrollOffset":90}'
const Xc = /^https?:/i,
  Uo = 'vitepress-theme-appearance',
  Oe = typeof window != 'undefined'
function Qc(e, t) {
  t.sort((n, s) => {
    const o = s.split('/').length - n.split('/').length
    return o !== 0 ? o : s.length - n.length
  })
  for (const n of t) if (e.startsWith(n)) return n
}
function Ko(e, t) {
  const n = Qc(t, Object.keys(e))
  return n ? e[n] : void 0
}
function Zc(e) {
  const { locales: t } = e.themeConfig || {},
    n = e.locales
  return t && n
    ? Object.keys(t).reduce(
        (s, o) => ((s[o] = { label: t[o].label, lang: n[o].lang }), s),
        {},
      )
    : {}
}
function ea(e, t) {
  t = na(e, t)
  const n = Ko(e.locales || {}, t),
    s = Ko(e.themeConfig.locales || {}, t)
  return Object.assign({}, e, n, {
    themeConfig: Object.assign({}, e.themeConfig, s, { locales: {} }),
    lang: (n || e).lang,
    locales: {},
    langs: Zc(e),
  })
}
function si(e, t) {
  var r
  const n = t.title || e.title,
    s = (r = t.titleTemplate) != null ? r : e.titleTemplate,
    o = ta(e.title, s)
  return `${n}${o}`
}
function ta(e, t) {
  return t === !1
    ? ''
    : t === !0 || t === void 0
    ? ` | ${e}`
    : e === t
    ? ''
    : ` | ${t}`
}
function na(e, t) {
  if (!Oe) return t
  const n = e.base,
    s = n.endsWith('/') ? n.slice(0, -1) : n
  return t.slice(s.length)
}
function sa(e, t) {
  return `${e}${t}`.replace(/\/+/g, '/')
}
function oi(e) {
  return Xc.test(e) ? e : sa(cn.value.base, e)
}
function ri(e) {
  let t = e.replace(/\.html$/, '')
  if (((t = decodeURIComponent(t)), t.endsWith('/') && (t += 'index'), Oe)) {
    const n = '/'
    t = t.slice(n.length).replace(/\//g, '_') + '.md'
    const s = __VP_HASH_MAP__[t.toLowerCase()]
    t = `${n}assets/${t}.${s}.js`
  } else t = `./${t.slice(1).replace(/\//g, '_')}.md.js`
  return t
}
const ii = Symbol(),
  cn = hl(oa(Jc))
function oa(e) {
  return JSON.parse(e)
}
function ra(e) {
  const t = ve(() => ea(cn.value, e.path))
  return {
    site: t,
    theme: ve(() => t.value.themeConfig),
    page: ve(() => e.data),
    frontmatter: ve(() => e.data.frontmatter),
    lang: ve(() => t.value.lang),
    localePath: ve(() => {
      const { langs: n, lang: s } = t.value,
        o = Object.keys(n).find((r) => n[r].lang === s)
      return oi(o || '/')
    }),
    title: ve(() => si(t.value, e.data)),
    description: ve(() => e.data.description || t.value.description),
  }
}
function ue() {
  const e = ut(ii)
  if (!e) throw new Error('vitepress data not properly injected in app')
  return e
}
const li = Symbol(),
  Wo = 'http://a.com',
  ci = {
    relativePath: '',
    title: '404',
    description: 'Not Found',
    headers: [],
    frontmatter: {},
    lastUpdated: 0,
  },
  ia = () => ({ path: '/', component: null, data: ci })
function la(e, t) {
  const n = Dn(ia())
  function s(i = Oe ? location.href : '/') {
    const l = new URL(i, Wo)
    return (
      !l.pathname.endsWith('/') &&
        !l.pathname.endsWith('.html') &&
        ((l.pathname += '.html'), (i = l.pathname + l.search + l.hash)),
      Oe &&
        (history.replaceState(
          { scrollPosition: window.scrollY },
          document.title,
        ),
        history.pushState(null, '', i)),
      r(i)
    )
  }
  let o = null
  async function r(i, l = 0, c = !1) {
    const f = new URL(i, Wo),
      _ = (o = f.pathname)
    try {
      let v = e(_)
      if (
        ('then' in v && typeof v.then == 'function' && (v = await v), o === _)
      ) {
        o = null
        const { default: b, __pageData: C } = v
        if (!b) throw new Error(`Invalid route component: ${b}`)
        ;(n.path = _),
          (n.component = qt(b)),
          (n.data = qt(JSON.parse(C))),
          Oe &&
            ln(() => {
              if (f.hash && !l) {
                let N = null
                try {
                  N = document.querySelector(decodeURIComponent(f.hash))
                } catch (B) {
                  console.warn(B)
                }
                if (N) {
                  qo(N, f.hash)
                  return
                }
              }
              window.scrollTo(0, l)
            })
      }
    } catch (v) {
      if ((v.message.match(/fetch/) || console.error(v), !c))
        try {
          const b = await fetch(cn.value.base + 'hashmap.json')
          ;(window.__VP_HASH_MAP__ = await b.json()), await r(i, l, !0)
          return
        } catch {}
      o === _ &&
        ((o = null),
        (n.path = _),
        (n.component = t ? qt(t) : null),
        (n.data = ci))
    }
  }
  return (
    Oe &&
      (window.addEventListener(
        'click',
        (i) => {
          const l = i.target.closest('a')
          if (l) {
            const {
                href: c,
                protocol: f,
                hostname: _,
                pathname: v,
                hash: b,
                target: C,
              } = l,
              N = window.location,
              B = v.match(/\.\w+$/)
            !i.ctrlKey &&
              !i.shiftKey &&
              !i.altKey &&
              !i.metaKey &&
              C !== '_blank' &&
              f === N.protocol &&
              _ === N.hostname &&
              !(B && B[0] !== '.html') &&
              (i.preventDefault(),
              v === N.pathname
                ? b &&
                  b !== N.hash &&
                  (history.pushState(null, '', b),
                  window.dispatchEvent(new Event('hashchange')),
                  qo(l, b, l.classList.contains('header-anchor')))
                : s(c))
          }
        },
        { capture: !0 },
      ),
      window.addEventListener('popstate', (i) => {
        r(location.href, (i.state && i.state.scrollPosition) || 0)
      }),
      window.addEventListener('hashchange', (i) => {
        i.preventDefault()
      })),
    { route: n, go: s }
  )
}
function ca() {
  const e = ut(li)
  if (!e) throw new Error('useRouter() is called without provider.')
  return e
}
function an() {
  return ca().route
}
function qo(e, t, n = !1) {
  let s = null
  try {
    s = e.classList.contains('header-anchor')
      ? e
      : document.querySelector(decodeURIComponent(t))
  } catch (o) {
    console.warn(o)
  }
  if (s) {
    let o = cn.value.scrollOffset
    typeof o == 'string' &&
      (o = document.querySelector(o).getBoundingClientRect().bottom + 24)
    const r = parseInt(window.getComputedStyle(s).paddingTop, 10),
      i = window.scrollY + s.getBoundingClientRect().top - o + r
    !n || Math.abs(i - window.scrollY) > window.innerHeight
      ? window.scrollTo(0, i)
      : window.scrollTo({ left: 0, top: i, behavior: 'smooth' })
  }
}
const aa = R({
  name: 'VitePressContent',
  setup() {
    const e = an()
    return () =>
      Tn('div', { style: { position: 'relative' } }, [
        e.component ? Tn(e.component) : null,
      ])
  },
})
var M = (e, t) => {
  const n = e.__vccOpts || e
  for (const [s, o] of t) n[s] = o
  return n
}
const ai = /#.*$/,
  ua = /(index)?\.(md|html)$/,
  fa = /^[a-z]+:/i,
  da = typeof window != 'undefined',
  _a = xe(da ? location.hash : '')
function ha(e) {
  return fa.test(e)
}
function pa(e, t) {
  let n,
    s = !1
  return () => {
    n && clearTimeout(n),
      s
        ? (n = setTimeout(e, t))
        : (e(),
          (s = !0),
          setTimeout(() => {
            s = !1
          }, t))
  }
}
function Ys(e, t, n = !1) {
  if (t === void 0) return !1
  if (((e = Go(`/${e}`)), n)) return new RegExp(t).test(e)
  if (Go(t) !== e) return !1
  const s = t.match(ai)
  return s ? _a.value === s[0] : !0
}
function Yo(e) {
  return /^\//.test(e) ? e : `/${e}`
}
function Go(e) {
  return decodeURI(e).replace(ai, '').replace(ua, '')
}
function Mn(e) {
  if (ha(e)) return e
  const { pathname: t, search: n, hash: s } = new URL(e, 'http://example.com'),
    o =
      t.endsWith('/') || t.endsWith('.html')
        ? e
        : `${t.replace(/(\.md)?$/, '.html')}${n}${s}`
  return oi(o)
}
function ui(e, t) {
  if (Array.isArray(e)) return e
  t = Yo(t)
  for (const n in e) if (t.startsWith(Yo(n))) return e[n]
  return []
}
function va(e) {
  const t = []
  for (const n of e) for (const s of n.items) t.push(s)
  return t
}
function Qe() {
  const e = an(),
    { theme: t, frontmatter: n } = ue(),
    s = xe(!1),
    o = ve(() => {
      const f = t.value.sidebar,
        _ = e.data.relativePath
      return f ? ui(f, _) : []
    }),
    r = ve(() => n.value.sidebar !== !1 && o.value.length > 0)
  function i() {
    s.value = !0
  }
  function l() {
    s.value = !1
  }
  function c() {
    s.value ? l() : i()
  }
  return { isOpen: s, sidebar: o, hasSidebar: r, open: i, close: l, toggle: c }
}
function ma(e, t) {
  let n
  Lr(() => {
    n = e.value ? document.activeElement : void 0
  }),
    ht(() => {
      window.addEventListener('keyup', s)
    }),
    Vt(() => {
      window.removeEventListener('keyup', s)
    })
  function s(o) {
    o.key === 'Escape' && e.value && (t(), n == null || n.focus())
  }
}
const ga = R({
  __name: 'VPSkipLink',
  setup(e) {
    const t = an(),
      n = xe()
    ft(
      () => t.path,
      () => n.value.focus(),
    )
    function s({ target: o }) {
      const r = document.querySelector(o.hash)
      if (r) {
        const i = () => {
          r.removeAttribute('tabindex'), r.removeEventListener('blur', i)
        }
        r.setAttribute('tabindex', '-1'),
          r.addEventListener('blur', i),
          r.focus(),
          window.scrollTo(0, 0)
      }
    }
    return (o, r) => (
      d(),
      m(
        ee,
        null,
        [
          p(
            'span',
            { ref_key: 'backToTop', ref: n, tabindex: '-1' },
            null,
            512,
          ),
          p(
            'a',
            {
              href: '#VPContent',
              class: 'VPSkipLink visually-hidden',
              onClick: s,
            },
            ' Skip to content ',
          ),
        ],
        64,
      )
    )
  },
})
var ya = M(ga, [['__scopeId', 'data-v-5babe530']])
const ba = { key: 0, class: 'VPBackdrop' },
  xa = R({
    __name: 'VPBackdrop',
    props: { show: { type: Boolean } },
    setup(e) {
      return (t, n) => (
        d(),
        J(
          Xn,
          { name: 'fade' },
          {
            default: W(() => [e.show ? (d(), m('div', ba)) : G('', !0)]),
            _: 1,
          },
        )
      )
    },
  })
var wa = M(xa, [['__scopeId', 'data-v-3384333c']])
function $a() {
  const e = xe(!1)
  function t() {
    ;(e.value = !0), window.addEventListener('resize', o)
  }
  function n() {
    ;(e.value = !1), window.removeEventListener('resize', o)
  }
  function s() {
    e.value ? n() : t()
  }
  function o() {
    window.outerWidth >= 768 && n()
  }
  return { isScreenOpen: e, openScreen: t, closeScreen: n, toggleScreen: s }
}
const Pa = { class: 'title', href: '/' },
  ka = ['src', 'alt'],
  Ca = R({
    __name: 'VPNavBarTitle',
    setup(e) {
      const { site: t, theme: n } = ue(),
        { hasSidebar: s } = Qe()
      return (o, r) => (
        d(),
        m(
          'div',
          { class: me(['VPNavBarTitle', { 'has-sidebar': y(s) }]) },
          [
            p('a', Pa, [
              y(n).logo
                ? (d(),
                  m(
                    'img',
                    { key: 0, class: 'logo', src: y(n).logo, alt: y(t).title },
                    null,
                    8,
                    ka,
                  ))
                : G('', !0),
              We(' ' + le(y(t).title), 1),
            ]),
          ],
          2,
        )
      )
    },
  })
var Sa = M(Ca, [['__scopeId', 'data-v-1a7e2dc4']])
const Va = { key: 0, class: 'VPNavBarSearch' },
  Ea = {
    type: 'button',
    class: 'DocSearch DocSearch-Button',
    'aria-label': 'Search',
  },
  La = p(
    'span',
    { class: 'DocSearch-Button-Container' },
    [
      p(
        'svg',
        {
          class: 'DocSearch-Search-Icon',
          width: '20',
          height: '20',
          viewBox: '0 0 20 20',
        },
        [
          p('path', {
            d: 'M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z',
            stroke: 'currentColor',
            fill: 'none',
            'fill-rule': 'evenodd',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }),
        ],
      ),
      p('span', { class: 'DocSearch-Button-Placeholder' }, 'Search'),
    ],
    -1,
  ),
  Ta = { class: 'DocSearch-Button-Keys' },
  Ma = p('span', { class: 'DocSearch-Button-Key' }, 'K', -1),
  Aa = R({
    __name: 'VPNavBarSearch',
    setup(e) {
      const t = () => null,
        { theme: n } = ue(),
        s = xe(!1),
        o = xe()
      ht(() => {
        if (!n.value.algolia) return
        o.value.textContent = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
          ? '\u2318'
          : 'Ctrl'
        const i = (c) => {
            c.key === 'k' &&
              (c.ctrlKey || c.metaKey) &&
              (c.preventDefault(), r(), l())
          },
          l = () => {
            window.removeEventListener('keydown', i)
          }
        window.addEventListener('keydown', i), Vt(l)
      })
      function r() {
        s.value || (s.value = !0)
      }
      return (i, l) =>
        y(n).algolia
          ? (d(),
            m('div', Va, [
              s.value
                ? (d(), J(y(t), { key: 0 }))
                : (d(),
                  m('div', { key: 1, id: 'docsearch', onClick: r }, [
                    p('button', Ea, [
                      La,
                      p('span', Ta, [
                        p(
                          'span',
                          {
                            class: 'DocSearch-Button-Key',
                            ref_key: 'metaKey',
                            ref: o,
                          },
                          'Meta',
                          512,
                        ),
                        Ma,
                      ]),
                    ]),
                  ])),
            ]))
          : G('', !0)
    },
  }),
  Ia = {},
  Na = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    height: '24px',
    viewBox: '0 0 24 24',
    width: '24px',
  },
  Ba = p('path', { d: 'M0 0h24v24H0V0z', fill: 'none' }, null, -1),
  Oa = p(
    'path',
    { d: 'M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5H9z' },
    null,
    -1,
  ),
  Ha = [Ba, Oa]
function Fa(e, t) {
  return d(), m('svg', Na, Ha)
}
var Ra = M(Ia, [['render', Fa]])
const Da = R({
  __name: 'VPLink',
  props: { href: null, noIcon: { type: Boolean } },
  setup(e) {
    const t = e,
      n = ve(() => t.href && /^[a-z]+:/i.test(t.href))
    return (s, o) => (
      d(),
      J(
        Yn(e.href ? 'a' : 'span'),
        {
          class: me(['VPLink', { link: e.href }]),
          href: e.href ? y(Mn)(e.href) : void 0,
          target: y(n) ? '_blank' : void 0,
          rel: y(n) ? 'noopener noreferrer' : void 0,
        },
        {
          default: W(() => [
            q(s.$slots, 'default', {}, void 0, !0),
            y(n) && !e.noIcon
              ? (d(), J(Ra, { key: 0, class: 'icon' }))
              : G('', !0),
          ]),
          _: 3,
        },
        8,
        ['class', 'href', 'target', 'rel'],
      )
    )
  },
})
var un = M(Da, [['__scopeId', 'data-v-a3b61552']])
const za = R({
  __name: 'VPNavBarMenuLink',
  props: { item: null },
  setup(e) {
    const { page: t } = ue()
    return (n, s) => (
      d(),
      J(
        un,
        {
          class: me({
            VPNavBarMenuLink: !0,
            active: y(Ys)(
              y(t).relativePath,
              e.item.activeMatch || e.item.link,
              !!e.item.activeMatch,
            ),
          }),
          href: e.item.link,
          noIcon: !0,
        },
        { default: W(() => [We(le(e.item.text), 1)]), _: 1 },
        8,
        ['class', 'href'],
      )
    )
  },
})
var ja = M(za, [['__scopeId', 'data-v-72d6301e']])
const Gs = xe()
let fi = !1,
  us = 0
function Ua(e) {
  const t = xe(!1)
  if (typeof window != 'undefined') {
    !fi && Ka(), us++
    const n = ft(Gs, (s) => {
      var o, r, i
      s === e.el.value || ((o = e.el.value) == null ? void 0 : o.contains(s))
        ? ((t.value = !0), (r = e.onFocus) == null || r.call(e))
        : ((t.value = !1), (i = e.onBlur) == null || i.call(e))
    })
    Vt(() => {
      n(), us--, us || Wa()
    })
  }
  return Hs(t)
}
function Ka() {
  document.addEventListener('focusin', di),
    (fi = !0),
    (Gs.value = document.activeElement)
}
function Wa() {
  document.removeEventListener('focusin', di)
}
function di() {
  Gs.value = document.activeElement
}
const qa = {},
  Ya = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  Ga = p(
    'path',
    {
      d: 'M12,16c-0.3,0-0.5-0.1-0.7-0.3l-6-6c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l5.3,5.3l5.3-5.3c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-6,6C12.5,15.9,12.3,16,12,16z',
    },
    null,
    -1,
  ),
  Ja = [Ga]
function Xa(e, t) {
  return d(), m('svg', Ya, Ja)
}
var _i = M(qa, [['render', Xa]])
const Qa = {},
  Za = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  eu = p('circle', { cx: '12', cy: '12', r: '2' }, null, -1),
  tu = p('circle', { cx: '19', cy: '12', r: '2' }, null, -1),
  nu = p('circle', { cx: '5', cy: '12', r: '2' }, null, -1),
  su = [eu, tu, nu]
function ou(e, t) {
  return d(), m('svg', Za, su)
}
var ru = M(Qa, [['render', ou]])
const iu = R({
  __name: 'VPMenuLink',
  props: { item: null },
  setup(e) {
    return (t, n) => (
      d(),
      J(
        un,
        { class: 'VPMenuLink', href: e.item.link },
        { default: W(() => [We(le(e.item.text), 1)]), _: 1 },
        8,
        ['href'],
      )
    )
  },
})
var Qn = M(iu, [['__scopeId', 'data-v-7e155007']])
const lu = { class: 'VPMenuGroup' },
  cu = { key: 0, class: 'title' },
  au = R({
    __name: 'VPMenuGroup',
    props: { text: null, items: null },
    setup(e) {
      return (t, n) => (
        d(),
        m('div', lu, [
          e.text ? (d(), m('p', cu, le(e.text), 1)) : G('', !0),
          (d(!0),
          m(
            ee,
            null,
            Se(
              e.items,
              (s) => (
                d(),
                m(
                  ee,
                  null,
                  [
                    'link' in s
                      ? (d(), J(Qn, { key: 0, item: s }, null, 8, ['item']))
                      : G('', !0),
                  ],
                  64,
                )
              ),
            ),
            256,
          )),
        ])
      )
    },
  })
var uu = M(au, [['__scopeId', 'data-v-5bb8d7e1']])
const fu = { class: 'VPMenu' },
  du = { key: 0, class: 'items' },
  _u = R({
    __name: 'VPMenu',
    props: { items: null },
    setup(e) {
      return (t, n) => (
        d(),
        m('div', fu, [
          e.items
            ? (d(),
              m('div', du, [
                (d(!0),
                m(
                  ee,
                  null,
                  Se(
                    e.items,
                    (s) => (
                      d(),
                      m(
                        ee,
                        { key: s.text },
                        [
                          'link' in s
                            ? (d(),
                              J(Qn, { key: 0, item: s }, null, 8, ['item']))
                            : (d(),
                              J(
                                uu,
                                { key: 1, text: s.text, items: s.items },
                                null,
                                8,
                                ['text', 'items'],
                              )),
                        ],
                        64,
                      )
                    ),
                  ),
                  128,
                )),
              ]))
            : G('', !0),
          q(t.$slots, 'default', {}, void 0, !0),
        ])
      )
    },
  })
var hu = M(_u, [['__scopeId', 'data-v-1e1e1e0f']])
const pu = ['aria-expanded', 'aria-label'],
  vu = { key: 0, class: 'text' },
  mu = { class: 'menu' },
  gu = R({
    __name: 'VPFlyout',
    props: { icon: null, button: null, label: null, items: null },
    setup(e) {
      const t = xe(!1),
        n = xe()
      Ua({ el: n, onBlur: s })
      function s() {
        t.value = !1
      }
      return (o, r) => (
        d(),
        m(
          'div',
          {
            class: 'VPFlyout',
            ref_key: 'el',
            ref: n,
            onMouseenter: r[1] || (r[1] = (i) => (t.value = !0)),
            onMouseleave: r[2] || (r[2] = (i) => (t.value = !1)),
          },
          [
            p(
              'button',
              {
                type: 'button',
                class: 'button',
                'aria-haspopup': 'true',
                'aria-expanded': t.value,
                'aria-label': e.label,
                onClick: r[0] || (r[0] = (i) => (t.value = !t.value)),
              },
              [
                e.button || e.icon
                  ? (d(),
                    m('span', vu, [
                      e.icon
                        ? (d(), J(Yn(e.icon), { key: 0, class: 'option-icon' }))
                        : G('', !0),
                      We(' ' + le(e.button) + ' ', 1),
                      T(_i, { class: 'text-icon' }),
                    ]))
                  : (d(), J(ru, { key: 1, class: 'icon' })),
              ],
              8,
              pu,
            ),
            p('div', mu, [
              T(
                hu,
                { items: e.items },
                {
                  default: W(() => [q(o.$slots, 'default', {}, void 0, !0)]),
                  _: 3,
                },
                8,
                ['items'],
              ),
            ]),
          ],
          544,
        )
      )
    },
  })
var Js = M(gu, [['__scopeId', 'data-v-38d009cc']])
const yu = R({
  __name: 'VPNavBarMenuGroup',
  props: { item: null },
  setup(e) {
    return (t, n) => (
      d(),
      J(Js, { button: e.item.text, items: e.item.items }, null, 8, [
        'button',
        'items',
      ])
    )
  },
})
const bu = (e) => (Fe('data-v-3a8228a9'), (e = e()), Re(), e),
  xu = {
    key: 0,
    'aria-labelledby': 'main-nav-aria-label',
    class: 'VPNavBarMenu',
  },
  wu = bu(() =>
    p(
      'span',
      { id: 'main-nav-aria-label', class: 'visually-hidden' },
      'Main Navigation',
      -1,
    ),
  ),
  $u = R({
    __name: 'VPNavBarMenu',
    setup(e) {
      const { theme: t } = ue()
      return (n, s) =>
        y(t).nav
          ? (d(),
            m('nav', xu, [
              wu,
              (d(!0),
              m(
                ee,
                null,
                Se(
                  y(t).nav,
                  (o) => (
                    d(),
                    m(
                      ee,
                      { key: o.text },
                      [
                        'link' in o
                          ? (d(), J(ja, { key: 0, item: o }, null, 8, ['item']))
                          : (d(),
                            J(yu, { key: 1, item: o }, null, 8, ['item'])),
                      ],
                      64,
                    )
                  ),
                ),
                128,
              )),
            ]))
          : G('', !0)
    },
  })
var Pu = M($u, [['__scopeId', 'data-v-3a8228a9']])
const ku = {},
  Cu = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  Su = p('path', { d: 'M0 0h24v24H0z', fill: 'none' }, null, -1),
  Vu = p(
    'path',
    {
      d: ' M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z ',
      class: 'css-c4d79v',
    },
    null,
    -1,
  ),
  Eu = [Su, Vu]
function Lu(e, t) {
  return d(), m('svg', Cu, Eu)
}
var hi = M(ku, [['render', Lu]])
const Tu = { class: 'items' },
  Mu = { class: 'title' },
  Au = R({
    __name: 'VPNavBarTranslations',
    setup(e) {
      const { theme: t } = ue()
      return (n, s) =>
        y(t).localeLinks
          ? (d(),
            J(
              Js,
              { key: 0, class: 'VPNavBarTranslations', icon: hi },
              {
                default: W(() => [
                  p('div', Tu, [
                    p('p', Mu, le(y(t).localeLinks.text), 1),
                    (d(!0),
                    m(
                      ee,
                      null,
                      Se(
                        y(t).localeLinks.items,
                        (o) => (
                          d(),
                          J(Qn, { key: o.link, item: o }, null, 8, ['item'])
                        ),
                      ),
                      128,
                    )),
                  ]),
                ]),
                _: 1,
              },
            ))
          : G('', !0)
    },
  })
var Iu = M(Au, [['__scopeId', 'data-v-68f7633e']])
const Nu = {},
  Bu = { class: 'VPSwitch', type: 'button', role: 'switch' },
  Ou = { class: 'check' },
  Hu = { key: 0, class: 'icon' }
function Fu(e, t) {
  return (
    d(),
    m('button', Bu, [
      p('span', Ou, [
        e.$slots.default
          ? (d(), m('span', Hu, [q(e.$slots, 'default', {}, void 0, !0)]))
          : G('', !0),
      ]),
    ])
  )
}
var Ru = M(Nu, [
  ['render', Fu],
  ['__scopeId', 'data-v-99bd8c88'],
])
const Du = {},
  zu = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  ju = ac(
    '<path d="M12,18c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S15.3,18,12,18zM12,8c-2.2,0-4,1.8-4,4c0,2.2,1.8,4,4,4c2.2,0,4-1.8,4-4C16,9.8,14.2,8,12,8z"></path><path d="M12,4c-0.6,0-1-0.4-1-1V1c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,3.6,12.6,4,12,4z"></path><path d="M12,24c-0.6,0-1-0.4-1-1v-2c0-0.6,0.4-1,1-1s1,0.4,1,1v2C13,23.6,12.6,24,12,24z"></path><path d="M5.6,6.6c-0.3,0-0.5-0.1-0.7-0.3L3.5,4.9c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C6.2,6.5,5.9,6.6,5.6,6.6z"></path><path d="M19.8,20.8c-0.3,0-0.5-0.1-0.7-0.3l-1.4-1.4c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l1.4,1.4c0.4,0.4,0.4,1,0,1.4C20.3,20.7,20,20.8,19.8,20.8z"></path><path d="M3,13H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S3.6,13,3,13z"></path><path d="M23,13h-2c-0.6,0-1-0.4-1-1s0.4-1,1-1h2c0.6,0,1,0.4,1,1S23.6,13,23,13z"></path><path d="M4.2,20.8c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C4.7,20.7,4.5,20.8,4.2,20.8z"></path><path d="M18.4,6.6c-0.3,0-0.5-0.1-0.7-0.3c-0.4-0.4-0.4-1,0-1.4l1.4-1.4c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4l-1.4,1.4C18.9,6.5,18.6,6.6,18.4,6.6z"></path>',
    9,
  ),
  Uu = [ju]
function Ku(e, t) {
  return d(), m('svg', zu, Uu)
}
var Wu = M(Du, [['render', Ku]])
const qu = {},
  Yu = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  Gu = p(
    'path',
    {
      d: 'M12.1,22c-0.3,0-0.6,0-0.9,0c-5.5-0.5-9.5-5.4-9-10.9c0.4-4.8,4.2-8.6,9-9c0.4,0,0.8,0.2,1,0.5c0.2,0.3,0.2,0.8-0.1,1.1c-2,2.7-1.4,6.4,1.3,8.4c2.1,1.6,5,1.6,7.1,0c0.3-0.2,0.7-0.3,1.1-0.1c0.3,0.2,0.5,0.6,0.5,1c-0.2,2.7-1.5,5.1-3.6,6.8C16.6,21.2,14.4,22,12.1,22zM9.3,4.4c-2.9,1-5,3.6-5.2,6.8c-0.4,4.4,2.8,8.3,7.2,8.7c2.1,0.2,4.2-0.4,5.8-1.8c1.1-0.9,1.9-2.1,2.4-3.4c-2.5,0.9-5.3,0.5-7.5-1.1C9.2,11.4,8.1,7.7,9.3,4.4z',
    },
    null,
    -1,
  ),
  Ju = [Gu]
function Xu(e, t) {
  return d(), m('svg', Yu, Ju)
}
var Qu = M(qu, [['render', Xu]])
const Zu = R({
  __name: 'VPSwitchAppearance',
  setup(e) {
    const t = typeof localStorage != 'undefined' ? n() : () => {}
    function n() {
      const s = window.matchMedia('(prefers-color-scheme: dark)'),
        o = document.documentElement.classList
      let r = localStorage.getItem(Uo) || 'auto',
        i = r === 'auto' ? s.matches : r === 'dark'
      s.onchange = (f) => {
        r === 'auto' && c((i = f.matches))
      }
      function l() {
        c((i = !i)),
          (r = i
            ? s.matches
              ? 'auto'
              : 'dark'
            : s.matches
            ? 'light'
            : 'auto'),
          localStorage.setItem(Uo, r)
      }
      function c(f) {
        o[f ? 'add' : 'remove']('dark')
      }
      return l
    }
    return (s, o) => (
      d(),
      J(
        Ru,
        {
          class: 'VPSwitchAppearance',
          'aria-label': 'toggle dark mode',
          onClick: y(t),
        },
        {
          default: W(() => [T(Wu, { class: 'sun' }), T(Qu, { class: 'moon' })]),
          _: 1,
        },
        8,
        ['onClick'],
      )
    )
  },
})
var Xs = M(Zu, [['__scopeId', 'data-v-c05c180a']])
const ef = { key: 0, class: 'VPNavBarAppearance' },
  tf = R({
    __name: 'VPNavBarAppearance',
    setup(e) {
      const { site: t } = ue()
      return (n, s) =>
        y(t).appearance ? (d(), m('div', ef, [T(Xs)])) : G('', !0)
    },
  })
var nf = M(tf, [['__scopeId', 'data-v-919a9bb2']])
const sf = {},
  of = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  rf = p(
    'path',
    {
      d: 'M20.222 0c1.406 0 2.54 1.137 2.607 2.475V24l-2.677-2.273-1.47-1.338-1.604-1.398.67 2.205H3.71c-1.402 0-2.54-1.065-2.54-2.476V2.48C1.17 1.142 2.31.003 3.715.003h16.5L20.222 0zm-6.118 5.683h-.03l-.202.2c2.073.6 3.076 1.537 3.076 1.537-1.336-.668-2.54-1.002-3.744-1.137-.87-.135-1.74-.064-2.475 0h-.2c-.47 0-1.47.2-2.81.735-.467.203-.735.336-.735.336s1.002-1.002 3.21-1.537l-.135-.135s-1.672-.064-3.477 1.27c0 0-1.805 3.144-1.805 7.02 0 0 1 1.74 3.743 1.806 0 0 .4-.533.805-1.002-1.54-.468-2.14-1.404-2.14-1.404s.134.066.335.2h.06c.03 0 .044.015.06.03v.006c.016.016.03.03.06.03.33.136.66.27.93.4.466.202 1.065.403 1.8.536.93.135 1.996.2 3.21 0 .6-.135 1.2-.267 1.8-.535.39-.2.87-.4 1.397-.737 0 0-.6.936-2.205 1.404.33.466.795 1 .795 1 2.744-.06 3.81-1.8 3.87-1.726 0-3.87-1.815-7.02-1.815-7.02-1.635-1.214-3.165-1.26-3.435-1.26l.056-.02zm.168 4.413c.703 0 1.27.6 1.27 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.334.002-.74.573-1.338 1.27-1.338zm-4.543 0c.7 0 1.266.6 1.266 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.334 0-.74.57-1.338 1.27-1.338z',
    },
    null,
    -1,
  ),
  lf = [rf]
function cf(e, t) {
  return d(), m('svg', of, lf)
}
var af = M(sf, [['render', cf]])
const uf = {},
  ff = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  df = p(
    'path',
    {
      d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    },
    null,
    -1,
  ),
  _f = [df]
function hf(e, t) {
  return d(), m('svg', ff, _f)
}
var pf = M(uf, [['render', hf]])
const vf = {},
  mf = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  gf = p(
    'path',
    {
      d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    },
    null,
    -1,
  ),
  yf = [gf]
function bf(e, t) {
  return d(), m('svg', mf, yf)
}
var xf = M(vf, [['render', bf]])
const wf = {},
  $f = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  Pf = p(
    'path',
    {
      d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    },
    null,
    -1,
  ),
  kf = [Pf]
function Cf(e, t) {
  return d(), m('svg', $f, kf)
}
var Sf = M(wf, [['render', Cf]])
const Vf = {},
  Ef = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  Lf = p(
    'path',
    {
      d: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z',
    },
    null,
    -1,
  ),
  Tf = [Lf]
function Mf(e, t) {
  return d(), m('svg', Ef, Tf)
}
var Af = M(Vf, [['render', Mf]])
const If = {},
  Nf = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  Bf = p(
    'path',
    {
      d: 'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z',
    },
    null,
    -1,
  ),
  Of = [Bf]
function Hf(e, t) {
  return d(), m('svg', Nf, Of)
}
var Ff = M(If, [['render', Hf]])
const Rf = {},
  Df = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  zf = p(
    'path',
    {
      d: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
    },
    null,
    -1,
  ),
  jf = [zf]
function Uf(e, t) {
  return d(), m('svg', Df, jf)
}
var Kf = M(Rf, [['render', Uf]])
const Wf = {},
  qf = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  Yf = p(
    'path',
    {
      d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    },
    null,
    -1,
  ),
  Gf = [Yf]
function Jf(e, t) {
  return d(), m('svg', qf, Gf)
}
var Xf = M(Wf, [['render', Jf]])
const Qf = ['href', 'title'],
  Zf = { class: 'visually-hidden' },
  ed = R({
    __name: 'VPSocialLink',
    props: { icon: null, link: null },
    setup(e) {
      const t = {
        discord: af,
        facebook: pf,
        github: xf,
        instagram: Af,
        linkedin: Sf,
        slack: Ff,
        twitter: Kf,
        youtube: Xf,
      }
      return (n, s) => (
        d(),
        m(
          'a',
          {
            class: 'VPSocialLink',
            href: e.link,
            title: e.icon,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          [
            (d(), J(Yn(t[e.icon]), { class: 'icon' })),
            p('span', Zf, le(e.icon), 1),
          ],
          8,
          Qf,
        )
      )
    },
  })
var td = M(ed, [['__scopeId', 'data-v-ac3f2dc8']])
const nd = { class: 'VPSocialLinks' },
  sd = R({
    __name: 'VPSocialLinks',
    props: { links: null },
    setup(e) {
      return (t, n) => (
        d(),
        m('div', nd, [
          (d(!0),
          m(
            ee,
            null,
            Se(
              e.links,
              ({ link: s, icon: o }) => (
                d(),
                J(td, { key: s, icon: o, link: s }, null, 8, ['icon', 'link'])
              ),
            ),
            128,
          )),
        ])
      )
    },
  })
var Qs = M(sd, [['__scopeId', 'data-v-753e243f']])
const od = R({
  __name: 'VPNavBarSocialLinks',
  setup(e) {
    const { theme: t } = ue()
    return (n, s) =>
      y(t).socialLinks
        ? (d(),
          J(
            Qs,
            { key: 0, class: 'VPNavBarSocialLinks', links: y(t).socialLinks },
            null,
            8,
            ['links'],
          ))
        : G('', !0)
  },
})
var rd = M(od, [['__scopeId', 'data-v-7349f617']])
const id = (e) => (Fe('data-v-58a614a0'), (e = e()), Re(), e),
  ld = { key: 0, class: 'group' },
  cd = { class: 'trans-title' },
  ad = { key: 1, class: 'group' },
  ud = { class: 'item appearance' },
  fd = id(() => p('p', { class: 'label' }, 'Appearance', -1)),
  dd = { class: 'appearance-action' },
  _d = { key: 2, class: 'group' },
  hd = { class: 'item social-links' },
  pd = R({
    __name: 'VPNavBarExtra',
    setup(e) {
      const { site: t, theme: n } = ue()
      return (s, o) => (
        d(),
        J(
          Js,
          { class: 'VPNavBarExtra', label: 'extra navigation' },
          {
            default: W(() => [
              y(n).localeLinks
                ? (d(),
                  m('div', ld, [
                    p('p', cd, le(y(n).localeLinks.text), 1),
                    (d(!0),
                    m(
                      ee,
                      null,
                      Se(
                        y(n).localeLinks.items,
                        (r) => (
                          d(),
                          J(Qn, { key: r.link, item: r }, null, 8, ['item'])
                        ),
                      ),
                      128,
                    )),
                  ]))
                : G('', !0),
              y(t).appearance
                ? (d(),
                  m('div', ad, [p('div', ud, [fd, p('div', dd, [T(Xs)])])]))
                : G('', !0),
              y(n).socialLinks
                ? (d(),
                  m('div', _d, [
                    p('div', hd, [
                      T(
                        Qs,
                        { class: 'social-links-list', links: y(n).socialLinks },
                        null,
                        8,
                        ['links'],
                      ),
                    ]),
                  ]))
                : G('', !0),
            ]),
            _: 1,
          },
        )
      )
    },
  })
var vd = M(pd, [['__scopeId', 'data-v-58a614a0']])
const md = (e) => (Fe('data-v-00a8d3ca'), (e = e()), Re(), e),
  gd = ['aria-expanded'],
  yd = md(() =>
    p(
      'span',
      { class: 'container' },
      [
        p('span', { class: 'top' }),
        p('span', { class: 'middle' }),
        p('span', { class: 'bottom' }),
      ],
      -1,
    ),
  ),
  bd = [yd],
  xd = R({
    __name: 'VPNavBarHamburger',
    props: { active: { type: Boolean } },
    emits: ['click'],
    setup(e) {
      return (t, n) => (
        d(),
        m(
          'button',
          {
            type: 'button',
            class: me(['VPNavBarHamburger', { active: e.active }]),
            'aria-label': 'mobile navigation',
            'aria-expanded': e.active,
            'aria-controls': 'VPNavScreen',
            onClick: n[0] || (n[0] = (s) => t.$emit('click')),
          },
          bd,
          10,
          gd,
        )
      )
    },
  })
var wd = M(xd, [['__scopeId', 'data-v-00a8d3ca']])
const $d = { class: 'container' },
  Pd = { class: 'content' },
  kd = R({
    __name: 'VPNavBar',
    props: { isScreenOpen: { type: Boolean } },
    emits: ['toggle-screen'],
    setup(e) {
      const { hasSidebar: t } = Qe()
      return (n, s) => (
        d(),
        m(
          'div',
          { class: me(['VPNavBar', { 'has-sidebar': y(t) }]) },
          [
            p('div', $d, [
              T(Sa),
              p('div', Pd, [
                T(Aa, { class: 'search' }),
                T(Pu, { class: 'menu' }),
                T(Iu, { class: 'translations' }),
                T(nf, { class: 'appearance' }),
                T(rd, { class: 'social-links' }),
                T(vd, { class: 'extra' }),
                T(
                  wd,
                  {
                    class: 'hamburger',
                    active: e.isScreenOpen,
                    onClick: s[0] || (s[0] = (o) => n.$emit('toggle-screen')),
                  },
                  null,
                  8,
                  ['active'],
                ),
              ]),
            ]),
          ],
          2,
        )
      )
    },
  })
var Cd = M(kd, [['__scopeId', 'data-v-fff46a9a']])
function Sd(e) {
  if (Array.isArray(e)) {
    for (var t = 0, n = Array(e.length); t < e.length; t++) n[t] = e[t]
    return n
  } else return Array.from(e)
}
var Zs = !1
if (typeof window != 'undefined') {
  var Jo = {
    get passive() {
      Zs = !0
    },
  }
  window.addEventListener('testPassive', null, Jo),
    window.removeEventListener('testPassive', null, Jo)
}
var An =
    typeof window != 'undefined' &&
    window.navigator &&
    window.navigator.platform &&
    (/iP(ad|hone|od)/.test(window.navigator.platform) ||
      (window.navigator.platform === 'MacIntel' &&
        window.navigator.maxTouchPoints > 1)),
  Bt = [],
  In = !1,
  eo = -1,
  Jt = void 0,
  Pt = void 0,
  Xt = void 0,
  pi = function (t) {
    return Bt.some(function (n) {
      return !!(n.options.allowTouchMove && n.options.allowTouchMove(t))
    })
  },
  Nn = function (t) {
    var n = t || window.event
    return pi(n.target) || n.touches.length > 1
      ? !0
      : (n.preventDefault && n.preventDefault(), !1)
  },
  Vd = function (t) {
    if (Xt === void 0) {
      var n = !!t && t.reserveScrollBarGap === !0,
        s = window.innerWidth - document.documentElement.clientWidth
      if (n && s > 0) {
        var o = parseInt(
          window
            .getComputedStyle(document.body)
            .getPropertyValue('padding-right'),
          10,
        )
        ;(Xt = document.body.style.paddingRight),
          (document.body.style.paddingRight = o + s + 'px')
      }
    }
    Jt === void 0 &&
      ((Jt = document.body.style.overflow),
      (document.body.style.overflow = 'hidden'))
  },
  Ed = function () {
    Xt !== void 0 && ((document.body.style.paddingRight = Xt), (Xt = void 0)),
      Jt !== void 0 && ((document.body.style.overflow = Jt), (Jt = void 0))
  },
  Ld = function () {
    return window.requestAnimationFrame(function () {
      if (Pt === void 0) {
        Pt = {
          position: document.body.style.position,
          top: document.body.style.top,
          left: document.body.style.left,
        }
        var t = window,
          n = t.scrollY,
          s = t.scrollX,
          o = t.innerHeight
        ;(document.body.style.position = 'fixed'),
          (document.body.style.top = -n),
          (document.body.style.left = -s),
          setTimeout(function () {
            return window.requestAnimationFrame(function () {
              var r = o - window.innerHeight
              r && n >= o && (document.body.style.top = -(n + r))
            })
          }, 300)
      }
    })
  },
  Td = function () {
    if (Pt !== void 0) {
      var t = -parseInt(document.body.style.top, 10),
        n = -parseInt(document.body.style.left, 10)
      ;(document.body.style.position = Pt.position),
        (document.body.style.top = Pt.top),
        (document.body.style.left = Pt.left),
        window.scrollTo(n, t),
        (Pt = void 0)
    }
  },
  Md = function (t) {
    return t ? t.scrollHeight - t.scrollTop <= t.clientHeight : !1
  },
  Ad = function (t, n) {
    var s = t.targetTouches[0].clientY - eo
    return pi(t.target)
      ? !1
      : (n && n.scrollTop === 0 && s > 0) || (Md(n) && s < 0)
      ? Nn(t)
      : (t.stopPropagation(), !0)
  },
  Id = function (t, n) {
    if (!t) {
      console.error(
        'disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.',
      )
      return
    }
    if (
      !Bt.some(function (o) {
        return o.targetElement === t
      })
    ) {
      var s = { targetElement: t, options: n || {} }
      ;(Bt = [].concat(Sd(Bt), [s])),
        An ? Ld() : Vd(n),
        An &&
          ((t.ontouchstart = function (o) {
            o.targetTouches.length === 1 && (eo = o.targetTouches[0].clientY)
          }),
          (t.ontouchmove = function (o) {
            o.targetTouches.length === 1 && Ad(o, t)
          }),
          In ||
            (document.addEventListener(
              'touchmove',
              Nn,
              Zs ? { passive: !1 } : void 0,
            ),
            (In = !0)))
    }
  },
  Nd = function () {
    An &&
      (Bt.forEach(function (t) {
        ;(t.targetElement.ontouchstart = null),
          (t.targetElement.ontouchmove = null)
      }),
      In &&
        (document.removeEventListener(
          'touchmove',
          Nn,
          Zs ? { passive: !1 } : void 0,
        ),
        (In = !1)),
      (eo = -1)),
      An ? Td() : Ed(),
      (Bt = [])
  }
const Bd = R({
  __name: 'VPNavScreenMenuLink',
  props: { text: null, link: null },
  setup(e) {
    const t = ut('close-screen')
    return (n, s) => (
      d(),
      J(
        un,
        { class: 'VPNavScreenMenuLink', href: e.link, onClick: y(t) },
        { default: W(() => [We(le(e.text), 1)]), _: 1 },
        8,
        ['href', 'onClick'],
      )
    )
  },
})
var Od = M(Bd, [['__scopeId', 'data-v-7daea660']])
const Hd = {},
  Fd = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  Rd = p(
    'path',
    {
      d: 'M18.9,10.9h-6v-6c0-0.6-0.4-1-1-1s-1,0.4-1,1v6h-6c-0.6,0-1,0.4-1,1s0.4,1,1,1h6v6c0,0.6,0.4,1,1,1s1-0.4,1-1v-6h6c0.6,0,1-0.4,1-1S19.5,10.9,18.9,10.9z',
    },
    null,
    -1,
  ),
  Dd = [Rd]
function zd(e, t) {
  return d(), m('svg', Fd, Dd)
}
var jd = M(Hd, [['render', zd]])
const Ud = R({
  __name: 'VPNavScreenMenuGroupLink',
  props: { text: null, link: null },
  setup(e) {
    const t = ut('close-screen')
    return (n, s) => (
      d(),
      J(
        un,
        { class: 'VPNavScreenMenuGroupLink', href: e.link, onClick: y(t) },
        { default: W(() => [We(le(e.text), 1)]), _: 1 },
        8,
        ['href', 'onClick'],
      )
    )
  },
})
var vi = M(Ud, [['__scopeId', 'data-v-3fe1ad8c']])
const Kd = { class: 'VPNavScreenMenuGroupSection' },
  Wd = { key: 0, class: 'title' },
  qd = R({
    __name: 'VPNavScreenMenuGroupSection',
    props: { text: null, items: null },
    setup(e) {
      return (t, n) => (
        d(),
        m('div', Kd, [
          e.text ? (d(), m('p', Wd, le(e.text), 1)) : G('', !0),
          (d(!0),
          m(
            ee,
            null,
            Se(
              e.items,
              (s) => (
                d(),
                J(vi, { key: s.text, text: s.text, link: s.link }, null, 8, [
                  'text',
                  'link',
                ])
              ),
            ),
            128,
          )),
        ])
      )
    },
  })
var Yd = M(qd, [['__scopeId', 'data-v-6dc7484a']])
const Gd = ['aria-controls', 'aria-expanded'],
  Jd = { class: 'button-text' },
  Xd = ['id'],
  Qd = { key: 1, class: 'group' },
  Zd = R({
    __name: 'VPNavScreenMenuGroup',
    props: { text: null, items: null },
    setup(e) {
      const t = e,
        n = xe(!1),
        s = ve(() => `NavScreenGroup-${t.text.replace(' ', '-').toLowerCase()}`)
      function o() {
        n.value = !n.value
      }
      return (r, i) => (
        d(),
        m(
          'div',
          { class: me(['VPNavScreenMenuGroup', { open: n.value }]) },
          [
            p(
              'button',
              {
                class: 'button',
                'aria-controls': y(s),
                'aria-expanded': n.value,
                onClick: o,
              },
              [p('span', Jd, le(e.text), 1), T(jd, { class: 'button-icon' })],
              8,
              Gd,
            ),
            p(
              'div',
              { id: y(s), class: 'items' },
              [
                (d(!0),
                m(
                  ee,
                  null,
                  Se(
                    e.items,
                    (l) => (
                      d(),
                      m(
                        ee,
                        { key: l.text },
                        [
                          'link' in l
                            ? (d(),
                              m('div', { key: l.text, class: 'item' }, [
                                T(vi, { text: l.text, link: l.link }, null, 8, [
                                  'text',
                                  'link',
                                ]),
                              ]))
                            : (d(),
                              m('div', Qd, [
                                T(
                                  Yd,
                                  { text: l.text, items: l.items },
                                  null,
                                  8,
                                  ['text', 'items'],
                                ),
                              ])),
                        ],
                        64,
                      )
                    ),
                  ),
                  128,
                )),
              ],
              8,
              Xd,
            ),
          ],
          2,
        )
      )
    },
  })
var e_ = M(Zd, [['__scopeId', 'data-v-38cac277']])
const t_ = { key: 0, class: 'VPNavScreenMenu' },
  n_ = R({
    __name: 'VPNavScreenMenu',
    setup(e) {
      const { theme: t } = ue()
      return (n, s) =>
        y(t).nav
          ? (d(),
            m('nav', t_, [
              (d(!0),
              m(
                ee,
                null,
                Se(
                  y(t).nav,
                  (o) => (
                    d(),
                    m(
                      ee,
                      { key: o.text },
                      [
                        'link' in o
                          ? (d(),
                            J(
                              Od,
                              { key: 0, text: o.text, link: o.link },
                              null,
                              8,
                              ['text', 'link'],
                            ))
                          : (d(),
                            J(
                              e_,
                              { key: 1, text: o.text || '', items: o.items },
                              null,
                              8,
                              ['text', 'items'],
                            )),
                      ],
                      64,
                    )
                  ),
                ),
                128,
              )),
            ]))
          : G('', !0)
    },
  })
const s_ = (e) => (Fe('data-v-b9824ac0'), (e = e()), Re(), e),
  o_ = { key: 0, class: 'VPNavScreenAppearance' },
  r_ = s_(() => p('p', { class: 'text' }, 'Appearance', -1)),
  i_ = R({
    __name: 'VPNavScreenAppearance',
    setup(e) {
      const { site: t } = ue()
      return (n, s) =>
        y(t).appearance ? (d(), m('div', o_, [r_, T(Xs)])) : G('', !0)
    },
  })
var l_ = M(i_, [['__scopeId', 'data-v-b9824ac0']])
const c_ = { class: 'list' },
  a_ = ['href'],
  u_ = R({
    __name: 'VPNavScreenTranslations',
    setup(e) {
      const { theme: t } = ue(),
        n = xe(!1)
      function s() {
        n.value = !n.value
      }
      return (o, r) =>
        y(t).localeLinks
          ? (d(),
            m(
              'div',
              {
                key: 0,
                class: me(['VPNavScreenTranslations', { open: n.value }]),
              },
              [
                p('button', { class: 'title', onClick: s }, [
                  T(hi, { class: 'icon lang' }),
                  We(' ' + le(y(t).localeLinks.text) + ' ', 1),
                  T(_i, { class: 'icon chevron' }),
                ]),
                p('ul', c_, [
                  (d(!0),
                  m(
                    ee,
                    null,
                    Se(
                      y(t).localeLinks.items,
                      (i) => (
                        d(),
                        m('li', { key: i.link, class: 'item' }, [
                          p(
                            'a',
                            { class: 'link', href: i.link },
                            le(i.text),
                            9,
                            a_,
                          ),
                        ])
                      ),
                    ),
                    128,
                  )),
                ]),
              ],
              2,
            ))
          : G('', !0)
    },
  })
var f_ = M(u_, [['__scopeId', 'data-v-c567eb24']])
const d_ = R({
  __name: 'VPNavScreenSocialLinks',
  setup(e) {
    const { theme: t } = ue()
    return (n, s) =>
      y(t).socialLinks
        ? (d(),
          J(
            Qs,
            {
              key: 0,
              class: 'VPNavScreenSocialLinks',
              links: y(t).socialLinks,
            },
            null,
            8,
            ['links'],
          ))
        : G('', !0)
  },
})
const __ = { class: 'container' },
  h_ = R({
    __name: 'VPNavScreen',
    props: { open: { type: Boolean } },
    setup(e) {
      const t = xe(null)
      function n() {
        Id(t.value, { reserveScrollBarGap: !0 })
      }
      function s() {
        Nd()
      }
      return (o, r) => (
        d(),
        J(
          Xn,
          { name: 'fade', onEnter: n, onAfterLeave: s },
          {
            default: W(() => [
              e.open
                ? (d(),
                  m(
                    'div',
                    { key: 0, class: 'VPNavScreen', ref_key: 'screen', ref: t },
                    [
                      p('div', __, [
                        T(n_, { class: 'menu' }),
                        T(f_, { class: 'translations' }),
                        T(l_, { class: 'appearance' }),
                        T(d_, { class: 'social-links' }),
                      ]),
                    ],
                    512,
                  ))
                : G('', !0),
            ]),
            _: 1,
          },
        )
      )
    },
  })
var p_ = M(h_, [['__scopeId', 'data-v-5dea853f']])
const v_ = R({
  __name: 'VPNav',
  setup(e) {
    const { isScreenOpen: t, closeScreen: n, toggleScreen: s } = $a(),
      { hasSidebar: o } = Qe()
    return (
      js('close-screen', n),
      (r, i) => (
        d(),
        m(
          'header',
          { class: me(['VPNav', { 'no-sidebar': !y(o) }]) },
          [
            T(Cd, { 'is-screen-open': y(t), onToggleScreen: y(s) }, null, 8, [
              'is-screen-open',
              'onToggleScreen',
            ]),
            T(p_, { open: y(t) }, null, 8, ['open']),
          ],
          2,
        )
      )
    )
  },
})
var m_ = M(v_, [['__scopeId', 'data-v-50286af0']])
const g_ = {},
  y_ = {
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
    focusable: 'false',
    viewBox: '0 0 24 24',
  },
  b_ = p(
    'path',
    {
      d: 'M17,11H3c-0.6,0-1-0.4-1-1s0.4-1,1-1h14c0.6,0,1,0.4,1,1S17.6,11,17,11z',
    },
    null,
    -1,
  ),
  x_ = p(
    'path',
    { d: 'M21,7H3C2.4,7,2,6.6,2,6s0.4-1,1-1h18c0.6,0,1,0.4,1,1S21.6,7,21,7z' },
    null,
    -1,
  ),
  w_ = p(
    'path',
    {
      d: 'M21,15H3c-0.6,0-1-0.4-1-1s0.4-1,1-1h18c0.6,0,1,0.4,1,1S21.6,15,21,15z',
    },
    null,
    -1,
  ),
  $_ = p(
    'path',
    {
      d: 'M17,19H3c-0.6,0-1-0.4-1-1s0.4-1,1-1h14c0.6,0,1,0.4,1,1S17.6,19,17,19z',
    },
    null,
    -1,
  ),
  P_ = [b_, x_, w_, $_]
function k_(e, t) {
  return d(), m('svg', y_, P_)
}
var C_ = M(g_, [['render', k_]])
const S_ = (e) => (Fe('data-v-061b13f0'), (e = e()), Re(), e),
  V_ = { key: 0, class: 'VPLocalNav' },
  E_ = ['aria-expanded'],
  L_ = S_(() => p('span', { class: 'menu-text' }, 'Menu', -1)),
  T_ = R({
    __name: 'VPLocalNav',
    props: { open: { type: Boolean } },
    emits: ['open-menu'],
    setup(e) {
      const { hasSidebar: t } = Qe()
      function n() {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      }
      return (s, o) =>
        y(t)
          ? (d(),
            m('div', V_, [
              p(
                'button',
                {
                  class: 'menu',
                  'aria-expanded': e.open,
                  'aria-controls': 'VPSidebarNav',
                  onClick: o[0] || (o[0] = (r) => s.$emit('open-menu')),
                },
                [T(C_, { class: 'menu-icon' }), L_],
                8,
                E_,
              ),
              p(
                'a',
                { class: 'top-link', href: '#', onClick: n },
                ' Return to top ',
              ),
            ]))
          : G('', !0)
    },
  })
var M_ = M(T_, [['__scopeId', 'data-v-061b13f0']])
const A_ = {},
  I_ = {
    version: '1.1',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
  },
  N_ = p(
    'path',
    {
      d: 'M19,2H5C3.3,2,2,3.3,2,5v14c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3V5C22,3.3,20.7,2,19,2z M20,19c0,0.6-0.4,1-1,1H5c-0.6,0-1-0.4-1-1V5c0-0.6,0.4-1,1-1h14c0.6,0,1,0.4,1,1V19z',
    },
    null,
    -1,
  ),
  B_ = p(
    'path',
    {
      d: 'M16,11h-3V8c0-0.6-0.4-1-1-1s-1,0.4-1,1v3H8c-0.6,0-1,0.4-1,1s0.4,1,1,1h3v3c0,0.6,0.4,1,1,1s1-0.4,1-1v-3h3c0.6,0,1-0.4,1-1S16.6,11,16,11z',
    },
    null,
    -1,
  ),
  O_ = [N_, B_]
function H_(e, t) {
  return d(), m('svg', I_, O_)
}
var F_ = M(A_, [['render', H_]])
const R_ = {},
  D_ = {
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    viewBox: '0 0 24 24',
  },
  z_ = p(
    'path',
    {
      d: 'M19,2H5C3.3,2,2,3.3,2,5v14c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3V5C22,3.3,20.7,2,19,2zM20,19c0,0.6-0.4,1-1,1H5c-0.6,0-1-0.4-1-1V5c0-0.6,0.4-1,1-1h14c0.6,0,1,0.4,1,1V19z',
    },
    null,
    -1,
  ),
  j_ = p(
    'path',
    {
      d: 'M16,11H8c-0.6,0-1,0.4-1,1s0.4,1,1,1h8c0.6,0,1-0.4,1-1S16.6,11,16,11z',
    },
    null,
    -1,
  ),
  U_ = [z_, j_]
function K_(e, t) {
  return d(), m('svg', D_, U_)
}
var W_ = M(R_, [['render', K_]])
const q_ = ['href'],
  Y_ = { class: 'link-text' },
  G_ = R({
    __name: 'VPSidebarLink',
    props: { item: null },
    setup(e) {
      const { page: t } = ue(),
        n = ut('close-sidebar')
      return (s, o) => (
        d(),
        m(
          'a',
          {
            class: me([
              'link',
              { active: y(Ys)(y(t).relativePath, e.item.link) },
            ]),
            href: y(Mn)(e.item.link),
            onClick: o[0] || (o[0] = (...r) => y(n) && y(n)(...r)),
          },
          [p('p', Y_, le(e.item.text), 1)],
          10,
          q_,
        )
      )
    },
  })
var J_ = M(G_, [['__scopeId', 'data-v-358aac4a']])
const X_ = ['role'],
  Q_ = { class: 'title-text' },
  Z_ = { class: 'action' },
  eh = { class: 'items' },
  th = R({
    __name: 'VPSidebarGroup',
    props: {
      text: null,
      items: null,
      collapsible: { type: Boolean },
      collapsed: { type: Boolean },
    },
    setup(e) {
      const t = e,
        n = xe(t.collapsible && t.collapsed)
      function s() {
        t.collapsible && (n.value = !n.value)
      }
      return (o, r) => (
        d(),
        m(
          'section',
          {
            class: me([
              'VPSidebarGroup',
              { collapsible: e.collapsible, collapsed: n.value },
            ]),
          },
          [
            p(
              'div',
              {
                class: 'title',
                role: e.collapsible ? 'button' : void 0,
                onClick: s,
              },
              [
                p('h2', Q_, le(e.text), 1),
                p('div', Z_, [
                  T(W_, { class: 'icon minus' }),
                  T(F_, { class: 'icon plus' }),
                ]),
              ],
              8,
              X_,
            ),
            p('div', eh, [
              (d(!0),
              m(
                ee,
                null,
                Se(
                  e.items,
                  (i) => (
                    d(), J(J_, { key: i.link, item: i }, null, 8, ['item'])
                  ),
                ),
                128,
              )),
            ]),
          ],
          2,
        )
      )
    },
  })
var nh = M(th, [['__scopeId', 'data-v-9d526704']])
const sh = (e) => (Fe('data-v-52ea1e6f'), (e = e()), Re(), e),
  oh = {
    class: 'nav',
    id: 'VPSidebarNav',
    'aria-labelledby': 'sidebar-aria-label',
    tabindex: '-1',
  },
  rh = sh(() =>
    p(
      'span',
      { class: 'visually-hidden', id: 'sidebar-aria-label' },
      ' Sidebar Navigation ',
      -1,
    ),
  ),
  ih = R({
    __name: 'VPSidebar',
    props: { open: { type: Boolean } },
    setup(e) {
      const t = e,
        { sidebar: n, hasSidebar: s } = Qe()
      let o = xe(null)
      return (
        Ll(async () => {
          var r
          t.open && (await ln(), (r = o.value) == null || r.focus())
        }),
        (r, i) =>
          y(s)
            ? (d(),
              m(
                'aside',
                {
                  key: 0,
                  class: me(['VPSidebar', { open: e.open }]),
                  ref_key: 'navEl',
                  ref: o,
                  onClick: i[0] || (i[0] = Kc(() => {}, ['stop'])),
                },
                [
                  p('nav', oh, [
                    rh,
                    (d(!0),
                    m(
                      ee,
                      null,
                      Se(
                        y(n),
                        (l) => (
                          d(),
                          m('div', { key: l.text, class: 'group' }, [
                            T(
                              nh,
                              {
                                text: l.text,
                                items: l.items,
                                collapsible: l.collapsible,
                                collapsed: l.collapsed,
                              },
                              null,
                              8,
                              ['text', 'items', 'collapsible', 'collapsed'],
                            ),
                          ])
                        ),
                      ),
                      128,
                    )),
                  ]),
                ],
                2,
              ))
            : G('', !0)
      )
    },
  })
var lh = M(ih, [['__scopeId', 'data-v-52ea1e6f']])
function ch() {
  const { page: e } = ue()
  Oe &&
    ft(
      () => e.value.relativePath,
      () => {
        ln(() => {
          document
            .querySelectorAll('.vp-doc div[class*="language-"]>span.copy')
            .forEach(ah)
        })
      },
      { immediate: !0, flush: 'post' },
    )
}
function ah(e) {
  e.onclick = () => {
    const t = e.parentElement
    if (!t) return
    const n =
      t.classList.contains('language-sh') ||
      t.classList.contains('language-bash')
    let { innerText: s = '' } = t
    n && (s = s.replace(/^ *\$ /gm, '')),
      navigator.clipboard.writeText(s).then(() => {
        e.classList.add('copied'),
          setTimeout(() => {
            e.classList.remove('copied')
          }, 3e3)
      })
  }
}
const Zn = (e) => (Fe('data-v-398b63ba'), (e = e()), Re(), e),
  uh = { class: 'NotFound' },
  fh = Zn(() => p('p', { class: 'code' }, '404', -1)),
  dh = Zn(() => p('h1', { class: 'title' }, 'PAGE NOT FOUND', -1)),
  _h = Zn(() => p('div', { class: 'divider' }, null, -1)),
  hh = Zn(() =>
    p(
      'blockquote',
      { class: 'quote' },
      " But if you don't change your direction, and if you keep looking, you may end up where you are heading. ",
      -1,
    ),
  ),
  ph = { class: 'action' },
  vh = ['href'],
  mh = R({
    __name: 'NotFound',
    setup(e) {
      const { site: t } = ue()
      return (n, s) => (
        d(),
        m('div', uh, [
          fh,
          dh,
          _h,
          hh,
          p('div', ph, [
            p(
              'a',
              { class: 'link', href: y(t).base, 'aria-label': 'go to home' },
              ' Take me home ',
              8,
              vh,
            ),
          ]),
        ])
      )
    },
  })
var Ps = M(mh, [['__scopeId', 'data-v-398b63ba']])
const gh = {},
  yh = { class: 'VPPage' }
function bh(e, t) {
  const n = Fr('Content')
  return d(), m('div', yh, [T(n)])
}
var xh = M(gh, [['render', bh]])
const wh = R({
  __name: 'VPButton',
  props: { tag: null, size: null, theme: null, text: null, href: null },
  setup(e) {
    const t = e,
      n = ve(() => {
        var r, i
        return [
          (r = t.size) != null ? r : 'medium',
          (i = t.theme) != null ? i : 'brand',
        ]
      }),
      s = ve(() => t.href && /^[a-z]+:/i.test(t.href)),
      o = ve(() => (t.tag ? t.tag : t.href ? 'a' : 'button'))
    return (r, i) => (
      d(),
      J(
        Yn(y(o)),
        {
          class: me(['VPButton', y(n)]),
          href: e.href,
          target: y(s) ? '_blank' : void 0,
          rel: y(s) ? 'noopener noreferrer' : void 0,
        },
        { default: W(() => [We(le(e.text), 1)]), _: 1 },
        8,
        ['class', 'href', 'target', 'rel'],
      )
    )
  },
})
var $h = M(wh, [['__scopeId', 'data-v-51a7b97a']])
const Ph = (e) => (Fe('data-v-17556154'), (e = e()), Re(), e),
  kh = { class: 'container' },
  Ch = { class: 'main' },
  Sh = { key: 0, class: 'name' },
  Vh = { class: 'clip' },
  Eh = { key: 1, class: 'text' },
  Lh = { key: 2, class: 'tagline' },
  Th = { key: 3, class: 'actions' },
  Mh = { key: 0, class: 'image' },
  Ah = { class: 'image-container' },
  Ih = Ph(() => p('div', { class: 'image-bg' }, null, -1)),
  Nh = ['src', 'alt'],
  Bh = R({
    __name: 'VPHero',
    props: {
      name: null,
      text: null,
      tagline: null,
      image: null,
      actions: null,
    },
    setup(e) {
      return (t, n) => (
        d(),
        m(
          'div',
          { class: me(['VPHero', { 'has-image': e.image }]) },
          [
            p('div', kh, [
              p('div', Ch, [
                e.name
                  ? (d(), m('p', Sh, [p('span', Vh, le(e.name), 1)]))
                  : G('', !0),
                e.text ? (d(), m('h1', Eh, le(e.text), 1)) : G('', !0),
                e.tagline ? (d(), m('p', Lh, le(e.tagline), 1)) : G('', !0),
                e.actions
                  ? (d(),
                    m('div', Th, [
                      (d(!0),
                      m(
                        ee,
                        null,
                        Se(
                          e.actions,
                          (s) => (
                            d(),
                            m('div', { key: s.link, class: 'action' }, [
                              T(
                                $h,
                                {
                                  tag: 'a',
                                  size: 'medium',
                                  theme: s.theme,
                                  text: s.text,
                                  href: s.link,
                                },
                                null,
                                8,
                                ['theme', 'text', 'href'],
                              ),
                            ])
                          ),
                        ),
                        128,
                      )),
                    ]))
                  : G('', !0),
              ]),
              e.image
                ? (d(),
                  m('div', Mh, [
                    p('div', Ah, [
                      Ih,
                      p(
                        'img',
                        {
                          class: 'image-src',
                          src: e.image.src,
                          alt: e.image.alt,
                        },
                        null,
                        8,
                        Nh,
                      ),
                    ]),
                  ]))
                : G('', !0),
            ]),
          ],
          2,
        )
      )
    },
  })
var Oh = M(Bh, [['__scopeId', 'data-v-17556154']])
const Hh = { key: 0, class: 'VPHomeHero' },
  Fh = R({
    __name: 'VPHomeHero',
    setup(e) {
      const { frontmatter: t } = ue()
      return (n, s) =>
        y(t).hero
          ? (d(),
            m('div', Hh, [
              T(
                Oh,
                {
                  name: y(t).hero.name,
                  text: y(t).hero.text,
                  tagline: y(t).hero.tagline,
                  image: y(t).hero.image,
                  actions: y(t).hero.actions,
                },
                null,
                8,
                ['name', 'text', 'tagline', 'image', 'actions'],
              ),
            ]))
          : G('', !0)
    },
  })
const Rh = { class: 'VPBox' },
  Dh = { key: 0, class: 'icon' },
  zh = { class: 'title' },
  jh = { class: 'details' },
  Uh = R({
    __name: 'VPBox',
    props: { icon: null, title: null, details: null },
    setup(e) {
      return (t, n) => (
        d(),
        m('article', Rh, [
          e.icon ? (d(), m('div', Dh, le(e.icon), 1)) : G('', !0),
          p('h1', zh, le(e.title), 1),
          p('p', jh, le(e.details), 1),
        ])
      )
    },
  })
var Kh = M(Uh, [['__scopeId', 'data-v-3cb750aa']])
const Wh = { key: 0, class: 'VPHomeFeatures' },
  qh = { class: 'container' },
  Yh = { class: 'items' },
  Gh = R({
    __name: 'VPHomeFeatures',
    setup(e) {
      const { frontmatter: t } = ue(),
        n = ve(() => {
          var o
          const s = (o = t.value.features) == null ? void 0 : o.length
          if (!!s) {
            if (s === 2) return 'grid-2'
            if (s === 3) return 'grid-3'
            if (s % 3 === 0) return 'grid-6'
            if (s % 2 === 0) return 'grid-4'
          }
        })
      return (s, o) =>
        y(t).features
          ? (d(),
            m('div', Wh, [
              p('div', qh, [
                p('div', Yh, [
                  (d(!0),
                  m(
                    ee,
                    null,
                    Se(
                      y(t).features,
                      (r) => (
                        d(),
                        m(
                          'div',
                          { key: r.title, class: me(['item', [y(n)]]) },
                          [
                            T(
                              Kh,
                              {
                                icon: r.icon,
                                title: r.title,
                                details: r.details,
                              },
                              null,
                              8,
                              ['icon', 'title', 'details'],
                            ),
                          ],
                          2,
                        )
                      ),
                    ),
                    128,
                  )),
                ]),
              ]),
            ]))
          : G('', !0)
    },
  })
var Jh = M(Gh, [['__scopeId', 'data-v-44cb0193']])
const Xh = { class: 'VPHome' },
  Qh = R({
    __name: 'VPHome',
    setup(e) {
      return (t, n) => (
        d(),
        m('div', Xh, [
          q(t.$slots, 'home-hero-before', {}, void 0, !0),
          T(Fh),
          q(t.$slots, 'home-hero-after', {}, void 0, !0),
          q(t.$slots, 'home-features-before', {}, void 0, !0),
          T(Jh),
          q(t.$slots, 'home-features-after', {}, void 0, !0),
        ])
      )
    },
  })
var Zh = M(Qh, [['__scopeId', 'data-v-4dec03f8']]),
  Xo
const fn = typeof window != 'undefined'
fn &&
  ((Xo = window == null ? void 0 : window.navigator) == null
    ? void 0
    : Xo.userAgent) &&
  /iP(ad|hone|od)/.test(window.navigator.userAgent)
function e1(e) {
  return Ri() ? (Di(e), !0) : !1
}
function t1(e, t = !0) {
  Zr() ? Br(e) : t ? e() : ln(e)
}
const n1 = fn ? window : void 0
fn && window.document
fn && window.navigator
fn && window.location
function Qo(e, t = {}) {
  const { window: n = n1 } = t,
    s = Boolean(n && 'matchMedia' in n && typeof n.matchMedia == 'function')
  let o
  const r = xe(!1),
    i = () => {
      !s || (o || (o = n.matchMedia(e)), (r.value = o.matches))
    }
  return (
    t1(() => {
      i(),
        o &&
          ('addEventListener' in o
            ? o.addEventListener('change', i)
            : o.addListener(i),
          e1(() => {
            'removeEventListener' in o
              ? o.removeEventListener('change', i)
              : o.removeListener(i)
          }))
    }),
    r
  )
}
const ks =
    typeof globalThis != 'undefined'
      ? globalThis
      : typeof window != 'undefined'
      ? window
      : typeof global != 'undefined'
      ? global
      : typeof self != 'undefined'
      ? self
      : {},
  Cs = '__vueuse_ssr_handlers__'
ks[Cs] = ks[Cs] || {}
ks[Cs]
var Zo
;(function (e) {
  ;(e.UP = 'UP'),
    (e.RIGHT = 'RIGHT'),
    (e.DOWN = 'DOWN'),
    (e.LEFT = 'LEFT'),
    (e.NONE = 'NONE')
})(Zo || (Zo = {}))
function s1() {
  const { hasSidebar: e } = Qe(),
    t = Qo('(min-width: 960px)'),
    n = Qo('(min-width: 1280px)')
  return {
    isAsideEnabled: ve(() =>
      !n.value && !t.value ? !1 : e.value ? n.value : t.value,
    ),
  }
}
const o1 = 56
function r1() {
  const { page: e } = ue()
  return { hasOutline: ve(() => e.value.headers.length > 0) }
}
function i1(e) {
  return mi(l1(e))
}
function l1(e) {
  e = e.map((n) => Object.assign({}, n))
  let t
  for (const n of e)
    n.level === 2
      ? (t = n)
      : t && n.level <= 3 && (t.children || (t.children = [])).push(n)
  return e.filter((n) => n.level === 2)
}
function mi(e) {
  return e.map((t) => ({
    text: t.title,
    link: `#${t.slug}`,
    children: t.children ? mi(t.children) : void 0,
    hidden: t.hidden,
  }))
}
function c1(e, t) {
  const { isAsideEnabled: n } = s1(),
    s = pa(r, 100)
  let o = null
  ht(() => {
    requestAnimationFrame(r), window.addEventListener('scroll', s)
  }),
    Or(() => {
      i(location.hash)
    }),
    Vt(() => {
      window.removeEventListener('scroll', s)
    })
  function r() {
    if (!n.value) return
    const l = [].slice.call(e.value.querySelectorAll('.outline-link')),
      c = [].slice
        .call(document.querySelectorAll('.content .header-anchor'))
        .filter((C) =>
          l.some((N) => N.hash === C.hash && C.offsetParent !== null),
        ),
      f = window.scrollY,
      _ = window.innerHeight,
      v = document.body.offsetHeight,
      b = f + _ === v
    if (c.length && b) {
      i(c[c.length - 1].hash)
      return
    }
    for (let C = 0; C < c.length; C++) {
      const N = c[C],
        B = c[C + 1],
        [te, g] = a1(C, N, B)
      if (te) {
        history.replaceState(null, document.title, g || ' '), i(g)
        return
      }
    }
  }
  function i(l) {
    o && o.classList.remove('active'),
      l !== null &&
        (o = e.value.querySelector(`a[href="${decodeURIComponent(l)}"]`))
    const c = o
    c
      ? (c.classList.add('active'),
        (t.value.style.top = c.offsetTop + 33 + 'px'),
        (t.value.style.opacity = '1'))
      : ((t.value.style.top = '33px'), (t.value.style.opacity = '0'))
  }
}
function er(e) {
  return e.parentElement.offsetTop - o1 - 15
}
function a1(e, t, n) {
  const s = window.scrollY
  return e === 0 && s === 0
    ? [!0, null]
    : s < er(t)
    ? [!1, null]
    : !n || s < er(n)
    ? [!0, t.hash]
    : [!1, null]
}
const gi = (e) => (Fe('data-v-b4b2ef0c'), (e = e()), Re(), e),
  u1 = { class: 'content' },
  f1 = gi(() => p('div', { class: 'outline-title' }, 'On this page', -1)),
  d1 = { 'aria-labelledby': 'doc-outline-aria-label' },
  _1 = gi(() =>
    p(
      'span',
      { class: 'visually-hidden', id: 'doc-outline-aria-label' },
      ' Table of Contents for current page ',
      -1,
    ),
  ),
  h1 = { class: 'root' },
  p1 = ['href'],
  v1 = { key: 0 },
  m1 = ['href'],
  g1 = R({
    __name: 'VPDocAsideOutline',
    setup(e) {
      const { page: t, frontmatter: n } = ue(),
        { hasOutline: s } = r1(),
        o = xe(),
        r = xe()
      c1(o, r)
      const i = ve(() => i1(t.value.headers))
      function l({ target: c }) {
        const f = '#' + c.href.split('#')[1],
          _ = document.querySelector(f)
        _ == null || _.focus()
      }
      return (c, f) => (
        d(),
        m(
          'div',
          {
            class: me(['VPDocAsideOutline', { 'has-outline': y(s) }]),
            ref_key: 'container',
            ref: o,
          },
          [
            p('div', u1, [
              p(
                'div',
                { class: 'outline-marker', ref_key: 'marker', ref: r },
                null,
                512,
              ),
              f1,
              p('nav', d1, [
                _1,
                p('ul', h1, [
                  (d(!0),
                  m(
                    ee,
                    null,
                    Se(y(i), ({ text: _, link: v, children: b, hidden: C }) =>
                      bo(
                        (d(),
                        m(
                          'li',
                          null,
                          [
                            p(
                              'a',
                              { class: 'outline-link', href: v, onClick: l },
                              le(_),
                              9,
                              p1,
                            ),
                            b && y(n).outline === 'deep'
                              ? (d(),
                                m('ul', v1, [
                                  (d(!0),
                                  m(
                                    ee,
                                    null,
                                    Se(b, ({ text: N, link: B, hidden: te }) =>
                                      bo(
                                        (d(),
                                        m(
                                          'li',
                                          null,
                                          [
                                            p(
                                              'a',
                                              {
                                                class: 'outline-link nested',
                                                href: B,
                                                onClick: l,
                                              },
                                              le(N),
                                              9,
                                              m1,
                                            ),
                                          ],
                                          512,
                                        )),
                                        [[zo, !te]],
                                      ),
                                    ),
                                    256,
                                  )),
                                ]))
                              : G('', !0),
                          ],
                          512,
                        )),
                        [[zo, !C]],
                      ),
                    ),
                    256,
                  )),
                ]),
              ]),
            ]),
          ],
          2,
        )
      )
    },
  })
var y1 = M(g1, [['__scopeId', 'data-v-b4b2ef0c']])
const b1 = { class: 'VPDocAsideCarbonAds' },
  x1 = R({
    __name: 'VPDocAsideCarbonAds',
    setup(e) {
      const t = () => null
      return (n, s) => (d(), m('div', b1, [T(y(t))]))
    },
  })
const w1 = (e) => (Fe('data-v-00130f26'), (e = e()), Re(), e),
  $1 = { class: 'VPDocAside' },
  P1 = w1(() => p('div', { class: 'spacer' }, null, -1)),
  k1 = R({
    __name: 'VPDocAside',
    setup(e) {
      const { page: t, theme: n } = ue()
      return (s, o) => (
        d(),
        m('div', $1, [
          q(s.$slots, 'aside-top', {}, void 0, !0),
          q(s.$slots, 'aside-outline-before', {}, void 0, !0),
          y(t).headers.length ? (d(), J(y1, { key: 0 })) : G('', !0),
          q(s.$slots, 'aside-outline-after', {}, void 0, !0),
          P1,
          q(s.$slots, 'aside-ads-before', {}, void 0, !0),
          y(n).carbonAds ? (d(), J(x1, { key: 1 })) : G('', !0),
          q(s.$slots, 'aside-ads-after', {}, void 0, !0),
          q(s.$slots, 'aside-bottom', {}, void 0, !0),
        ])
      )
    },
  })
var C1 = M(k1, [['__scopeId', 'data-v-00130f26']])
function S1() {
  const { theme: e, page: t } = ue()
  return ve(() => {
    var o, r, i, l, c
    const n = [
        'https://github.com',
        ((o = e.value.editLink) == null ? void 0 : o.repo) || '???',
        'edit',
        ((r = e.value.editLink) == null ? void 0 : r.branch) || 'main',
        ((i = e.value.editLink) == null ? void 0 : i.dir) || null,
        t.value.relativePath,
      ]
        .filter((f) => f)
        .join('/'),
      s =
        (c = (l = e.value.editLink) == null ? void 0 : l.text) != null
          ? c
          : 'Edit this page'
    return { url: n, text: s }
  })
}
function V1() {
  const { page: e, theme: t } = ue()
  return ve(() => {
    const n = ui(t.value.sidebar, e.value.relativePath),
      s = va(n),
      o = s.findIndex((r) => Ys(e.value.relativePath, r.link))
    return { prev: s[o - 1], next: s[o + 1] }
  })
}
const E1 = {},
  L1 = { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24' },
  T1 = p(
    'path',
    {
      d: 'M18,23H4c-1.7,0-3-1.3-3-3V6c0-1.7,1.3-3,3-3h7c0.6,0,1,0.4,1,1s-0.4,1-1,1H4C3.4,5,3,5.4,3,6v14c0,0.6,0.4,1,1,1h14c0.6,0,1-0.4,1-1v-7c0-0.6,0.4-1,1-1s1,0.4,1,1v7C21,21.7,19.7,23,18,23z',
    },
    null,
    -1,
  ),
  M1 = p(
    'path',
    {
      d: 'M8,17c-0.3,0-0.5-0.1-0.7-0.3C7,16.5,6.9,16.1,7,15.8l1-4c0-0.2,0.1-0.3,0.3-0.5l9.5-9.5c1.2-1.2,3.2-1.2,4.4,0c1.2,1.2,1.2,3.2,0,4.4l-9.5,9.5c-0.1,0.1-0.3,0.2-0.5,0.3l-4,1C8.2,17,8.1,17,8,17zM9.9,12.5l-0.5,2.1l2.1-0.5l9.3-9.3c0.4-0.4,0.4-1.1,0-1.6c-0.4-0.4-1.2-0.4-1.6,0l0,0L9.9,12.5z M18.5,2.5L18.5,2.5L18.5,2.5z',
    },
    null,
    -1,
  ),
  A1 = [T1, M1]
function I1(e, t) {
  return d(), m('svg', L1, A1)
}
var N1 = M(E1, [['render', I1]])
const yi = (e) => (Fe('data-v-fe34bb7e'), (e = e()), Re(), e),
  B1 = { key: 0, class: 'VPDocFooter' },
  O1 = { key: 0, class: 'edit-link' },
  H1 = { class: 'prev-next' },
  F1 = { class: 'pager' },
  R1 = ['href'],
  D1 = yi(() => p('span', { class: 'desc' }, 'Previous page', -1)),
  z1 = { class: 'title' },
  j1 = ['href'],
  U1 = yi(() => p('span', { class: 'desc' }, 'Next page', -1)),
  K1 = { class: 'title' },
  W1 = R({
    __name: 'VPDocFooter',
    setup(e) {
      const { theme: t, frontmatter: n } = ue(),
        s = S1(),
        o = V1()
      return (r, i) =>
        y(o).prev || y(o).next
          ? (d(),
            m('footer', B1, [
              y(t).editLink && y(n).editLink !== !1
                ? (d(),
                  m('div', O1, [
                    T(
                      un,
                      {
                        class: 'edit-link-button',
                        href: y(s).url,
                        'no-icon': !0,
                      },
                      {
                        default: W(() => [
                          T(N1, { class: 'edit-link-icon' }),
                          We(' ' + le(y(s).text), 1),
                        ]),
                        _: 1,
                      },
                      8,
                      ['href'],
                    ),
                  ]))
                : G('', !0),
              p('div', H1, [
                p('div', F1, [
                  y(o).prev
                    ? (d(),
                      m(
                        'a',
                        {
                          key: 0,
                          class: 'pager-link prev',
                          href: y(Mn)(y(o).prev.link),
                        },
                        [D1, p('span', z1, le(y(o).prev.text), 1)],
                        8,
                        R1,
                      ))
                    : G('', !0),
                ]),
                p(
                  'div',
                  { class: me(['pager', { 'has-prev': y(o).prev }]) },
                  [
                    y(o).next
                      ? (d(),
                        m(
                          'a',
                          {
                            key: 0,
                            class: 'pager-link next',
                            href: y(Mn)(y(o).next.link),
                          },
                          [U1, p('span', K1, le(y(o).next.text), 1)],
                          8,
                          j1,
                        ))
                      : G('', !0),
                  ],
                  2,
                ),
              ]),
            ]))
          : G('', !0)
    },
  })
var q1 = M(W1, [['__scopeId', 'data-v-fe34bb7e']])
const Y1 = (e) => (Fe('data-v-5978566a'), (e = e()), Re(), e),
  G1 = { class: 'container' },
  J1 = { class: 'aside' },
  X1 = Y1(() => p('div', { class: 'aside-curtain' }, null, -1)),
  Q1 = { class: 'aside-container' },
  Z1 = { class: 'aside-content' },
  ep = { class: 'content' },
  tp = { class: 'content-container' },
  np = { class: 'main' },
  sp = R({
    __name: 'VPDoc',
    setup(e) {
      const { page: t } = ue(),
        { hasSidebar: n } = Qe(),
        s = ve(() =>
          t.value.relativePath.slice(0, t.value.relativePath.indexOf('/')),
        )
      return (o, r) => {
        const i = Fr('Content')
        return (
          d(),
          m(
            'div',
            { class: me(['VPDoc', { 'has-sidebar': y(n) }]) },
            [
              p('div', G1, [
                p('div', J1, [
                  X1,
                  p('div', Q1, [
                    p('div', Z1, [
                      T(C1, null, {
                        'aside-top': W(() => [
                          q(o.$slots, 'aside-top', {}, void 0, !0),
                        ]),
                        'aside-bottom': W(() => [
                          q(o.$slots, 'aside-bottom', {}, void 0, !0),
                        ]),
                        'aside-outline-before': W(() => [
                          q(o.$slots, 'aside-outline-before', {}, void 0, !0),
                        ]),
                        'aside-outline-after': W(() => [
                          q(o.$slots, 'aside-outline-after', {}, void 0, !0),
                        ]),
                        'aside-ads-before': W(() => [
                          q(o.$slots, 'aside-ads-before', {}, void 0, !0),
                        ]),
                        'aside-ads-after': W(() => [
                          q(o.$slots, 'aside-ads-after', {}, void 0, !0),
                        ]),
                        _: 3,
                      }),
                    ]),
                  ]),
                ]),
                p('div', ep, [
                  p('div', tp, [
                    p('main', np, [
                      T(i, { class: me(['vp-doc', y(s)]) }, null, 8, ['class']),
                    ]),
                    T(q1),
                  ]),
                ]),
              ]),
            ],
            2,
          )
        )
      }
    },
  })
var op = M(sp, [['__scopeId', 'data-v-5978566a']])
const rp = R({
  __name: 'VPContent',
  setup(e) {
    const t = an(),
      { frontmatter: n } = ue(),
      { hasSidebar: s } = Qe()
    return (
      ch(),
      (o, r) => (
        d(),
        m(
          'div',
          {
            class: me([
              'VPContent',
              { 'has-sidebar': y(s), 'is-home': y(n).layout === 'home' },
            ]),
            id: 'VPContent',
          },
          [
            y(t).component === Ps
              ? (d(), J(Ps, { key: 0 }))
              : y(n).layout === 'page'
              ? (d(), J(xh, { key: 1 }))
              : y(n).layout === 'home'
              ? (d(),
                J(
                  Zh,
                  { key: 2 },
                  {
                    'home-hero-before': W(() => [
                      q(o.$slots, 'home-hero-before', {}, void 0, !0),
                    ]),
                    'home-hero-after': W(() => [
                      q(o.$slots, 'home-hero-after', {}, void 0, !0),
                    ]),
                    'home-features-before': W(() => [
                      q(o.$slots, 'home-features-before', {}, void 0, !0),
                    ]),
                    'home-features-after': W(() => [
                      q(o.$slots, 'home-features-after', {}, void 0, !0),
                    ]),
                    _: 3,
                  },
                ))
              : (d(),
                J(
                  op,
                  { key: 3 },
                  {
                    'aside-top': W(() => [
                      q(o.$slots, 'aside-top', {}, void 0, !0),
                    ]),
                    'aside-outline-before': W(() => [
                      q(o.$slots, 'aside-outline-before', {}, void 0, !0),
                    ]),
                    'aside-outline-after': W(() => [
                      q(o.$slots, 'aside-outline-after', {}, void 0, !0),
                    ]),
                    'aside-ads-before': W(() => [
                      q(o.$slots, 'aside-ads-before', {}, void 0, !0),
                    ]),
                    'aside-ads-after': W(() => [
                      q(o.$slots, 'aside-ads-after', {}, void 0, !0),
                    ]),
                    'aside-bottom': W(() => [
                      q(o.$slots, 'aside-bottom', {}, void 0, !0),
                    ]),
                    _: 3,
                  },
                )),
          ],
          2,
        )
      )
    )
  },
})
var ip = M(rp, [['__scopeId', 'data-v-c0a775ae']])
const lp = { class: 'container' },
  cp = { class: 'message' },
  ap = { class: 'copyright' },
  up = R({
    __name: 'VPFooter',
    setup(e) {
      const { theme: t } = ue(),
        { hasSidebar: n } = Qe()
      return (s, o) =>
        y(t).footer
          ? (d(),
            m(
              'footer',
              { key: 0, class: me(['VPFooter', { 'has-sidebar': y(n) }]) },
              [
                p('div', lp, [
                  p('p', cp, le(y(t).footer.message), 1),
                  p('p', ap, le(y(t).footer.copyright), 1),
                ]),
              ],
              2,
            ))
          : G('', !0)
    },
  })
var fp = M(up, [['__scopeId', 'data-v-6f69c3fc']])
const dp = { class: 'Layout' },
  _p = R({
    __name: 'Layout',
    setup(e) {
      const { isOpen: t, open: n, close: s } = Qe()
      return (
        ma(t, s),
        js('close-sidebar', s),
        (o, r) => (
          d(),
          m('div', dp, [
            T(ya),
            T(wa, { class: 'backdrop', show: y(t), onClick: y(s) }, null, 8, [
              'show',
              'onClick',
            ]),
            T(m_),
            T(M_, { open: y(t), onOpenMenu: y(n) }, null, 8, [
              'open',
              'onOpenMenu',
            ]),
            T(lh, { open: y(t) }, null, 8, ['open']),
            T(ip, null, {
              'home-hero-before': W(() => [
                q(o.$slots, 'home-hero-before', {}, void 0, !0),
              ]),
              'home-hero-after': W(() => [
                q(o.$slots, 'home-hero-after', {}, void 0, !0),
              ]),
              'home-features-before': W(() => [
                q(o.$slots, 'home-features-before', {}, void 0, !0),
              ]),
              'home-features-after': W(() => [
                q(o.$slots, 'home-features-after', {}, void 0, !0),
              ]),
              'aside-top': W(() => [q(o.$slots, 'aside-top', {}, void 0, !0)]),
              'aside-bottom': W(() => [
                q(o.$slots, 'aside-bottom', {}, void 0, !0),
              ]),
              'aside-outline-before': W(() => [
                q(o.$slots, 'aside-outline-before', {}, void 0, !0),
              ]),
              'aside-outline-after': W(() => [
                q(o.$slots, 'aside-outline-after', {}, void 0, !0),
              ]),
              'aside-ads-before': W(() => [
                q(o.$slots, 'aside-ads-before', {}, void 0, !0),
              ]),
              'aside-ads-after': W(() => [
                q(o.$slots, 'aside-ads-after', {}, void 0, !0),
              ]),
              _: 3,
            }),
            T(fp),
          ])
        )
      )
    },
  })
var hp = M(_p, [['__scopeId', 'data-v-05583b75']])
const Bn = { Layout: hp, NotFound: Ps }
function pp(e, t) {
  let n = [],
    s = !0
  const o = (r) => {
    if (s) {
      s = !1
      return
    }
    const i = [],
      l = Math.min(n.length, r.length)
    for (let c = 0; c < l; c++) {
      let f = n[c]
      const [_, v, b = ''] = r[c]
      if (f.tagName.toLocaleLowerCase() === _) {
        for (const C in v) f.getAttribute(C) !== v[C] && f.setAttribute(C, v[C])
        for (let C = 0; C < f.attributes.length; C++) {
          const N = f.attributes[C].name
          N in v || f.removeAttribute(N)
        }
        f.innerHTML !== b && (f.innerHTML = b)
      } else
        document.head.removeChild(f), (f = tr(r[c])), document.head.append(f)
      i.push(f)
    }
    n.slice(l).forEach((c) => document.head.removeChild(c)),
      r.slice(l).forEach((c) => {
        const f = tr(c)
        document.head.appendChild(f), i.push(f)
      }),
      (n = i)
  }
  Lr(() => {
    const r = e.data,
      i = t.value,
      l = r && r.description,
      c = r && r.frontmatter.head
    ;(document.title = si(i, r)),
      document
        .querySelector('meta[name=description]')
        .setAttribute('content', l || i.description),
      o([...(c ? mp(c) : [])])
  })
}
function tr([e, t, n]) {
  const s = document.createElement(e)
  for (const o in t) s.setAttribute(o, t[o])
  return n && (s.innerHTML = n), s
}
function vp(e) {
  return e[0] === 'meta' && e[1] && e[1].name === 'description'
}
function mp(e) {
  return e.filter((t) => !vp(t))
}
const fs = new Set(),
  bi = () => document.createElement('link'),
  gp = (e) => {
    const t = bi()
    ;(t.rel = 'prefetch'), (t.href = e), document.head.appendChild(t)
  },
  yp = (e) => {
    const t = new XMLHttpRequest()
    t.open('GET', e, (t.withCredentials = !0)), t.send()
  }
let xn
const bp =
  Oe &&
  (xn = bi()) &&
  xn.relList &&
  xn.relList.supports &&
  xn.relList.supports('prefetch')
    ? gp
    : yp
function xp() {
  if (!Oe || !window.IntersectionObserver) return
  let e
  if ((e = navigator.connection) && (e.saveData || /2g/.test(e.effectiveType)))
    return
  const t = window.requestIdleCallback || setTimeout
  let n = null
  const s = () => {
    n && n.disconnect(),
      (n = new IntersectionObserver((r) => {
        r.forEach((i) => {
          if (i.isIntersecting) {
            const l = i.target
            n.unobserve(l)
            const { pathname: c } = l
            if (!fs.has(c)) {
              fs.add(c)
              const f = ri(c)
              bp(f)
            }
          }
        })
      })),
      t(() => {
        document.querySelectorAll('#app a').forEach((r) => {
          const { target: i, hostname: l, pathname: c } = r,
            f = c.match(/\.\w+$/)
          ;(f && f[0] !== '.html') ||
            (i !== '_blank' &&
              l === location.hostname &&
              (c !== location.pathname ? n.observe(r) : fs.add(c)))
        })
      })
  }
  ht(s)
  const o = an()
  ft(() => o.path, s),
    Vt(() => {
      n && n.disconnect()
    })
}
const wp = R({
    setup(e, { slots: t }) {
      const n = xe(!1)
      return (
        ht(() => {
          n.value = !0
        }),
        () => (n.value && t.default ? t.default() : null)
      )
    },
  }),
  $p = Bn.NotFound || (() => '404 Not Found'),
  Pp = {
    name: 'VitePressApp',
    setup() {
      const { site: e } = ue()
      return (
        ht(() => {
          ft(
            () => e.value.lang,
            (t) => {
              document.documentElement.lang = t
            },
            { immediate: !0 },
          )
        }),
        xp(),
        () => Tn(Bn.Layout)
      )
    },
  }
function kp() {
  const e = Sp(),
    t = Cp()
  t.provide(li, e)
  const n = ra(e.route)
  return (
    t.provide(ii, n),
    t.component('Content', aa),
    t.component('ClientOnly', wp),
    t.component('Debug', () => null),
    Object.defineProperty(t.config.globalProperties, '$frontmatter', {
      get() {
        return n.frontmatter.value
      },
    }),
    Bn.enhanceApp && Bn.enhanceApp({ app: t, router: e, siteData: cn }),
    { app: t, router: e, data: n }
  )
}
function Cp() {
  return Yc(Pp)
}
function Sp() {
  let e = Oe,
    t
  return la((n) => {
    let s = ri(n)
    return (
      e && (t = s),
      (e || t === s) && (s = s.replace(/\.js$/, '.lean.js')),
      Oe && (e = !1),
      ki(() => import(s), [])
    )
  }, $p)
}
if (Oe) {
  const { app: e, router: t, data: n } = kp()
  t.go().then(() => {
    pp(t.route, n.site), e.mount('#app')
  })
}
export { M as _, m as c, kp as createApp, d as o }
