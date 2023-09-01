import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
// redux state management
import { COLORS } from 'theme'
import Button from 'components/Common/Button'
import ModalComponent from 'components/Modals/ModalComponent'
import { Input, commonInputStyles, Label, Select } from 'components/Common/Form'
import { getBlockchain } from '@reach-sh/humble-sdk'
import { sendwyreAPI, SENDWYRE_CURRENCIES } from 'constants/sendwyre-currencies'
import { clearGlobalModal } from 'state/reducers/modals'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import { captureException } from 'helpers/error'
import useToast from 'hooks/useToast'
import useGlobalUser from 'hooks/useGlobalUser'
import WyreLogo from 'components/Common/Icons/wyre-logo'
import MoonPayLogo from 'components/Common/Icons/moon-pay-logo'
import { getMoonpaySignedUrl } from 'utils/getServerResource'
import { PaymentOptions } from 'components/Modals/SelectPaymentMethodModal'
import { BUY_TOKENS, ERRORS, PROMPTS } from 'constants/messages'

const ColLabel = styled(Label).attrs({ column: true })`
  padding: 1rem 0;

  > * {
    width: 100%;
  }

  .label::after {
    content: '*';
    display: inline-block;
    color: ${COLORS.errorRed};
  }
`
const BuyButton = styled(Button).attrs({ size: 'lg' })`
  font-size: 1.3rem;
  font-weight: bold;
  margin-top: 1rem;
`
const ModalInput = styled(Input)`
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text};
  height: 2.6rem;
  line-height: 2.6rem;
`
const ModalSelect = styled(Select)`
  ${commonInputStyles}
  height: 2.6rem;
  color: ${({ theme }) => theme.colors.text};
`
const ModalTitle = styled.h1`
  align-items: center;
  display: flex;
  margin-bottom: 1rem;
  place-content: center;
  width: 100%;
  gap: 9px;
  img {
    border-radius: 4px;
    margin-right: 0.5rem;
    padding: 0.08rem 0.5rem;
    background-color: ${COLORS.black};
  }
`

type AWSResponse = {
  // unused props: isBase64Encoded: boolean; statusCode: number
  body?: string
  error?: string
}

type ReservationData = {
  widgetUrl: string
  reservation: string
}

type BuyAlgoModalProps = {
  open: boolean
  variant?: PaymentOptions
}

const getPurchaseRange = (amt: number) => {
  if (amt < 10) return '1-9'
  if (amt < 25) return '10-24'
  if (amt < 50) return '25-49'
  return '50_plus'
}

/**
 * Button for triggering SendWyre popup (purchase Crypto with fiat funds)
 */
const BuyAlgoModal = styled(({ open, variant = 'Wyre' }: BuyAlgoModalProps) => {
  const { launchToast } = useToast()
  const connector = getBlockchain()
  const { search } = useLocation()
  const [country, setCountry] = useState('US')
  const [currency, setCurrency] = useState('USD')
  const [amount, setAmount] = useState('10')
  const { walletAddress, reachAccount } = useGlobalUser([
    'reachAccount',
    'walletAddress',
  ])
  const onSuccess = () => {
    const msg = { message: 'Transaction completed!' }
    launchToast('success', msg, undefined, { autoClose: 5000 })
  }

  const openPurchaseModal = async () => {
    clearGlobalModal()
    sendGoogleTagEvent(
      `SENDWYRE-Buy_Algo_${getPurchaseRange(Number(amount))}`,
      reachAccount,
      search,
    )
    const message = PROMPTS.BUY_CRYPTO_POPUP.replace('%%', 'SendWyre')
    launchToast('progress', { message }, undefined, { autoClose: 1500 })

    try {
      const wyreWidget = getWyreWidget(
        await getReservationId({
          amount,
          walletAddress,
          sourceCurrency: currency,
          country,
        }),
      )

      wyreWidget.on('paymentSuccess', onSuccess)
      wyreWidget.open()
    } catch (e) {
      const err = {
        message: ERRORS.CRYPTO_CHECKOUT_CONNECT.replace('%%', 'SendWyre'),
      }
      launchToast('reject', err, undefined, { autoClose: 30000 })
      captureException(e, 'WyrePayments')
    }
  }

  const openMoonpayiFrame = async () => {
    clearGlobalModal()
    sendGoogleTagEvent(
      `MOONPAY-Buy_Algo_${getPurchaseRange(Number(amount))}`,
      reachAccount,
      search,
    )
    const message = PROMPTS.BUY_CRYPTO_POPUP.replace('%%', 'Moonpay')
    launchToast('progress', { message }, undefined, { autoClose: 1500 })

    try {
      if (!walletAddress) throw Error('Wallet not connected')

      const signedUrl = await getMoonpaySignedUrl(
        amount,
        currency.toLowerCase(),
        walletAddress,
      ).then((res) => res.data)

      window.open(
        signedUrl,
        'popup',
        'width=600,height=600,scrollbars=no,resizable=no',
      )
    } catch (e) {
      const err = {
        message: ERRORS.CRYPTO_CHECKOUT_CONNECT.replace('%%', 'Moonpay'),
      }
      launchToast('reject', err, undefined, { autoClose: 30000 })
      captureException(e, 'MoonpayPayments')
    }
  }
  const invalidAmt = () => !amount || Number.isNaN(amount) || Number(amount) < 1
  const { BY_PROVIDER, AMOUNT } = BUY_TOKENS
  const prompt = BY_PROVIDER.replace('%%', connector).replace('%PRV%', variant)
  const amtPrompt = AMOUNT.replace('%%', connector).replace('%MIN%', '1')

  return (
    <ModalComponent open={open} onClose={clearGlobalModal}>
      <>
        <ModalTitle className='h4'>
          {variant === 'Wyre' ? <WyreLogo /> : <MoonPayLogo />}
          <span>{prompt}</span>
        </ModalTitle>

        <ColLabel>
          <b className='label'>{amtPrompt}</b>
          <ModalInput
            type='number'
            placeholder='e.g. 10'
            value={amount || ''}
            onChange={({ target }) => setAmount(target.value)}
            min={1}
          />
        </ColLabel>

        <ColLabel>
          <b className='label'>
            <Trans>You will be paying with:</Trans>
          </b>
          <ModalSelect
            onChange={({ target }) => setCurrency(target.value)}
            options={SENDWYRE_CURRENCIES}
            itemText={(c) => c}
            itemValue={(c) => c}
            value={currency}
          />
        </ColLabel>

        <ColLabel>
          <b className='label'>
            <Trans>Your country code:</Trans>
          </b>
          <ModalInput
            onChange={({ target }) => setCountry(target.value.toUpperCase())}
            placeholder='e.g. US'
            maxLength={2}
            value={country || ''}
          />
        </ColLabel>

        <BuyButton
          onClick={variant === 'Wyre' ? openPurchaseModal : openMoonpayiFrame}
          disabled={invalidAmt() || !country}
        >
          <b>{`Buy ${amount} ${connector}`}</b>
        </BuyButton>
      </>
    </ModalComponent>
  )
})``

export default BuyAlgoModal

type ReservationFormData = {
  amount: string
  walletAddress?: string | null
  country?: string
  sourceCurrency?: string
}
/**
 * Connect to SendWyre to create a payment reservation. Returns a
 * `reservationId` along with a URL for a GUI widget that can be
 * shown to the user.
 */
async function getReservationId(data: ReservationFormData) {
  const { amount, walletAddress, sourceCurrency = 'USD', country = 'US' } = data
  if (!walletAddress) {
    return Promise.reject(new Error('No wallet address found'))
  }

  const response = await fetch(sendwyreAPI(), {
    method: 'POST',
    body: JSON.stringify({
      sourceCurrency,
      country,
      amount,
      network: 'algorand',
      walletAddress,
    }),
  })

  if (!response.ok) return Promise.reject(response)

  const responseData: AWSResponse = await response.json()
  if (responseData.error) return Promise.reject(responseData.error)
  if (responseData.body) {
    const { reservation }: ReservationData = JSON.parse(responseData.body)
    return reservation
  }

  return Promise.reject(new Error('Could not connect to SendWyre'))
}

function getWyreWidget(reservationId: string) {
  // @ts-ignore
  return new Wyre({
    env: 'prod',
    reservation: reservationId,
    operation: { type: 'debitcard-hosted-dialog' },
  })
}
