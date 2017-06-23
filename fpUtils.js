const R = require('ramda')

/* ===== DEFINE CURRY ===== */

const curry = fn => {
  let args = []
  return arg => {
    args.push(arg)
    if (args.length === fn.length) {
      try {
        return fn(...args)
      }
      finally {
        args = []
      }
    }
  }
}
/* ===== DEFINE GLOBAL COMPOSE ===== */

const compose = (...fns) => {
  return arg => {
    fns.reverse().reduce((acc, fn) => fn(acc), arg)
  }
}

/* ===== DEFINE GLOBAL MAP ===== */

const map = R.curry((n, f) => {
  return f.map(n)
})

/* ===== DEFINE GLOBAL JOIN ===== */

const join = mma => {
  return mma.join()
}

/* ===== DEFINE GLOBAL CHAIN ===== */

const chain = R.curry((f, m) => {
  return m.map(f).join()
})

/* ===== DEFINE LIFTA2 LIFTA3 ===== */

const LiftA2 = R.curry((f, fn1, fn2) => {
  fn1.map(f).ap(fn2)
})

const LiftA3 = R.curry((f, fn1, fn2, fn3) => {
  fn1.map(f).ap(fn2).ap(fn3)
})

/* ===== DEFINE IDENTITY ===== */

const Identity = function(x) {
  this._value = x
}

Identity.of = function(x) {
  return new Identity(x)
}

Identity.prototype.map = function(f) {
  return Identity.of(f(this._value))
}

Identity.prototype.join = function() {
  return this._value
}

Identity.prototype.ap = function(other_container) {
  return other_container.map(this._value)
}


/* ===== DEFINE MAYBE ===== */

const Maybe = function(x) {
  this._value = x
}

Maybe.of = function(x) {
  return new Maybe(x)
}

Maybe.prototype.isNothing = function() {
  return this._value === 'null' || this._value === 'undefined'
}

Maybe.prototype.map = function(f) {
  return this.isNothing() ? Maybe.of(null) : Maybe.of(f(this._value))
}

Maybe.prototype.join = function() {
  return this.isNothing() ? Maybe.of(null) : this._value
}

Maybe.prototype.ap = function(other_container) {
  return other_container.map(this._value)
}

/* ===== DEFINE IO ===== */

const IO = function(f) {
  this.unsafePerformIO = f
}

IO.of = function(x) {
  return new IO(() => x)
}

IO.prototype.map = function(f) {
  return new IO(R.compose(f, this.unsafePerformIO))
}

IO.prototype.join = function() {
  return new IO(() => {
    return this.unsafePerformIO().unsafePerformIO();
  })
}

IO.prototype.ap = function(other_container) {
  return other_container.map(this.unsafePerformIO)
}

/* ===== DEFINE RIGHT LEFT EITHER ===== */

const Right = function(x) {
 this._value = x
}

Right.of = function(x) {
  return new Right(x)
}

Right.prototype.map = function(f) {
  return Right.of(f(this._value))
}

const Left = function(x) {
  this._value = x
}

Left.of = function(x) {
  return new Left(x)
}

Left.prototype.map = function(f) {
  return this
}

const either = R.curry(function(err, res, e) {
  if (e instanceof Right) {
    return res(e._value)
  }
  else if (e instanceof Left) {
    return err(e._value)
  }
})

module.exports = {
  curry,
  compose,
  map,
  join,
  chain,
  LiftA2,
  LiftA3,
  Identity,
  Maybe,
  IO,
  Right,
  Left,
  either
}
