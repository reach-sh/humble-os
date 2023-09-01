import React, { useEffect, useState } from 'react'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { dynamicActivate, getUserLocale } from 'i18n'
import styled from 'styled-components'
import { captureException } from 'helpers/error'

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  z-index: 101;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.ring2};
  color: ${({ theme }) => theme.colors.text};
`

const LoadingImage = styled.div`
  width: 60px;
  height: 78px;
  margin-bottom: 10px;
  background-image: ${({ theme }) => `url(${theme.images.loading})`};
`

const LoadingText = styled.p`
  font-weight: bold;
`

/**
 * Application Language data/settings provider
 * @param props App component props
 * @returns Wrapped `<I18nProvider>` element
 */
const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [localeLoaded, setLocaleLoaded] = useState<boolean>(false)
  const [localeError, setLocaleError] = useState<string | null>(null)

  // Load default user locale
  useEffect(() => {
    const userLocale = getUserLocale()
    dynamicActivate(userLocale)
      .then(() => setLocaleLoaded(true))
      .catch((e) => {
        captureException(e, 'Config.LanguageProvider')
        setLocaleError(e)
      })
  })

  return localeLoaded ? (
    // Provider with user locale
    <I18nProvider forceRenderOnLocaleChange i18n={i18n}>
      {children}
    </I18nProvider>
  ) : (
    // Placeholder if locale still loading or there was an error
    <Container>
      {localeError ? (
        <LoadingText>{localeError}</LoadingText>
      ) : (
        <>
          <LoadingImage />
          <LoadingText>Loading Language settings...</LoadingText>
        </>
      )}
    </Container>
  )
}

export default LanguageProvider
