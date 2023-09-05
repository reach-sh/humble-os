import { DeflyWalletConnect } from '@blockshake/defly-connect'
import algosdk from 'algosdk'

export default function HSMakeWalletConnect(options?: {
  shouldShowSignTxnToast: boolean
}) {
  return class PeraConnect {
    pc: any
    accounts: any[]

    constructor(pc: any = false) {
      this.pc = pc
      this.accounts = []
    }

    ensurePC = async () => {
      if (this.pc) {
        return
      }
      this.pc = new DeflyWalletConnect(options)
      this.pc.reconnectSession().then((accts: any) => {
        this.accounts = accts
      })
    }

    disconnect = async () => {
      this.pc.disconnect()
      this.accounts = []
    }

    ensureSession = async () => {
      await this.ensurePC()
      if (this.accounts.length === 0) {
        return new Promise<any>(async (resolve) => {
          const resolveAccounts = (accounts: any[]) => {
            this.accounts = accounts
            resolve(this.accounts[0])
          }

          this.pc
            .connect()
            .then(resolveAccounts)
            .catch((error: any) => {
              console.log('PeraConnect.Error', error)
              resolveAccounts([])
            })
        })
      }
    }

    getAddr = async (): Promise<string> => {
      await this.ensureSession()
      return this.accounts[0]
    }

    signTxns = async (txns: string[]): Promise<string[]> => {
      let userWallet = await this.ensureSession()
      let ntxns: any[] = txns.map((x: any) => {
        let txn = algosdk.decodeUnsignedTransaction(Buffer.from(x, 'base64'))
        return { txn, signers: [userWallet] }
      })
      let stxns = await this.pc.signTransaction([ntxns])
      const result: any[] = []
      stxns.forEach((txn: any) => {
        result.push(Buffer.from(txn, 'base64'))
      })
      return result
    }
  }
}
