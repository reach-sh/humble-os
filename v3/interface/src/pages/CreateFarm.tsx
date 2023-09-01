import { Suspense, lazy, useState } from 'react'
import CreateFarmDisclaimer from 'components/Farm/CreateFarmDisclaimer'
import useGlobalUser from 'hooks/useGlobalUser'
import LoadingScreen from 'LoadingScreen'
import { t } from '@lingui/macro'

const LS_CREATE_FARMS_DISCLAIMER = 'createFarmsDisclaimer'
const CreateFarmForm = lazy(() => import('components/Farm/CreateFarmForm'))

/**
 * `Create Farm` route (for partner and public farms)
 */
function CreateFarm(): JSX.Element {
  const { connected } = useGlobalUser(['walletAddress'])
  const shouldShow = localStorage.getItem(LS_CREATE_FARMS_DISCLAIMER) !== '1'
  const [showDisclaimer, setShowDisclaimer] = useState(shouldShow)
  const hideDisclaimer = () => {
    localStorage.setItem(LS_CREATE_FARMS_DISCLAIMER, '1')
    setShowDisclaimer(false)
  }

  return (
    <>
      <Suspense
        fallback={
          <LoadingScreen fullscreen={false} msg={t`Loading Form ...`} />
        }
      >
        <CreateFarmForm />
      </Suspense>

      <CreateFarmDisclaimer
        open={connected && showDisclaimer}
        onClose={hideDisclaimer}
      />
    </>
  )
}

export default CreateFarm
