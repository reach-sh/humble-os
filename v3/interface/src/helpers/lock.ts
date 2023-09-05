// this is the piece of the standard library that

import Timeout from 'await-timeout'

// I had to replicate as it isn't exported
class Lock {
  locked: boolean

  constructor() {
    this.locked = false
  }

  async acquire(): Promise<void> {
    let x = 1
    while (this.locked) {
      // eslint-disable-next-line no-await-in-loop
      await Timeout.set(Math.min(512, x))
      x *= 2
    }
    this.locked = true
  }

  release() {
    this.locked = false
  }

  async runWith<X>(f: () => Promise<X>): Promise<X> {
    await this.acquire()
    try {
      const r = await f()
      this.release()
      return r
    } catch (e: any) {
      this.release()
      throw e
    }
  }
}

export default Lock
