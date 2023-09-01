import { truncateAccountString } from 'utils/reach'
import styled from 'styled-components'
import useGlobalUser from 'hooks/useGlobalUser'

const AddressText = styled.p`
  cursor: pointer;
  font-weight: bold;
  font-size: 0.75rem;
`

const Address = () => {
  const { walletAddress } = useGlobalUser(['walletAddress'])

  return (
    <>
      {walletAddress && (
        <AddressText title={walletAddress}>
          {truncateAccountString(walletAddress)}
        </AddressText>
      )}
    </>
  )
}

export default Address
