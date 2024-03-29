// bucket: { target -> depsMap }
// depsMap: { key -> fn }
const bucket = new WeakMap()
let activeEffect

const data = {
  text: 'hello world.'
}

function effect(fn) {
  activeEffect = fn
  fn()
}

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key)

    return target[key]
  },

  set(target, key, newVal) {
    target[key] = newVal

    trigger(target, key)

    return true
  }
})

function track(target, key) {
  if (!activeEffect) return

  let depsMap = bucket.get[target]
  if (!depsMap) bucket.set(target, (depsMap = new Map()))

  let deps = depsMap.get(key)
  if (!deps) depsMap.set(key, (deps = new Set()))

  deps.add(activeEffect)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return

  const effects = depsMap.get(key)
  effects?.forEach(fn => fn())
}
