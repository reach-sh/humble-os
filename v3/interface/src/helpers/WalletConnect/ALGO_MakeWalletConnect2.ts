import { useWallet } from '@txnlab/use-wallet'
import algosdk from 'algosdk'
import CLIENT_OPTIONS from 'constants/wc2'

export default function ALGO_MakeWalletConnect2(
  WalletConnect: any,
  QRCodeModal: any,
) {
  return class WalletConnect_ {
    wc: any
    connected: any

    constructor(wc: any = false) {
      console.log(`AWC2 ctor`)
      this.wc = wc
      this.connected = null
    }

    async ensureWC() {
      console.log(`AWC2 ensureWC`)
      if (this.wc) {
        return
      }
      this.wc = await WalletConnect.init({ ...CLIENT_OPTIONS })
      const me = this
      const onConnect = (err: any, payload: any) => {
        console.log(`AWC2 onConnect`, { err, payload })
        if (err) {
          throw err
        }
        me.connected.notify()
      }
      this.wc.on('session_update', onConnect)
      this.wc.on('connect', onConnect)
      console.log(`AWC2 ensureWC`, { me })
    }

    async disconnect() {
      console.log(`AWC2 killSession`)
      //  await this.wc.killSession()
      await this.wc.disconnect()
    }

    async ensureSession() {
      await this.ensureWC()
      /*
      if (!this.wc.connected) {
        console.log(`AWC createSession`)
        await this.wc.createSession()
      } else {
        console.log(`AWC session exists`)
        this.connected.notify()
      }
      */
    }

    async getAddr(): Promise<string> {
      await this.ensureSession()
      await this.connected.wait()
      const accts = this.wc.accounts
      console.log(`AWC getAddr`, accts)
      return accts[0]
    }

    async signTxns(txns: string[]): Promise<string[]> {
      await this.ensureSession()
      const req = {
        method: 'algo_signTxn',
        params: [txns.map((txn) => ({ txn }))],
      }

      console.log(`AWC signTxns ->`, req)
      try {
        //const res = await this.wc.sendCustomRequest(req)
        const sessions = this.wc.session.getAll()
        const lastKeyIndex = sessions.length - 1
        const lastSession = sessions[lastKeyIndex]
        const stxns = await this.wc
          .request({
            chainId: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDe',
            topic: lastSession.topic,
            request: req,
          })
          .catch((e: any) => {
            console.log(e)
          })
        //const stxn = signTransactions(req)
        //console.log({ stxn })
        console.log(`AWC signTxns <-`, stxns)
        return stxns
      } catch (e: any) {
        console.log(`AWC signTxns err`, e)
        throw e
      }
    }
  }
}
