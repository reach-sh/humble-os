const makePromise = <A>(): [Promise<A>, (a: A) => any] => {
  let r = (a: A): any => {
    void a
    throw new Error('promise never initialized')
  }
  const p: Promise<A> = new Promise((resolve) => {
    r = resolve
  })
  return [p, r]
}

export default class Signal {
  p: Promise<boolean>

  r: (a: boolean) => void

  constructor() {
    ;[this.p, this.r] = makePromise()
  }

  wait() {
    return this.p
  }

  notify() {
    this.r(true)
  }
}
