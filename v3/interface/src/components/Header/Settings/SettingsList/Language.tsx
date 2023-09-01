import { Trans } from '@lingui/macro'
import { supportedLocales, supportedLocaleKeys } from 'constants/i18n'
import { dynamicActivate, getUserLocale } from 'i18n'
import styled from 'styled-components'

const LanguageContainer = styled.div`
  margin: 1.5rem 0;
  display: flex;
  justify-content: space-between;
`

const LanguageText = styled.p``

const LanguageSelect = styled.select`
  flex-grow: 1;
  margin-left: 2rem;
  padding: 5px 3px;
  border-radius: 4px;
  border: none;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  &:active,
  &:focus {
    outline: none;
  }
`
const LanguageOption = styled.option``

/**
 * Language settings components
 */
const Langauge = () => {
  const userLocale = getUserLocale()
  const handleLanguageSelect = (e: any) => {
    const { value } = e.target
    dynamicActivate(value as string)
  }
  return (
    <LanguageContainer>
      <LanguageText>
        <Trans>Language</Trans>
      </LanguageText>
      <LanguageSelect onChange={handleLanguageSelect} value={userLocale}>
        {supportedLocaleKeys.map((key: string) => {
          const langaugeOption = supportedLocales[key]
          return (
            <LanguageOption key={key} value={key}>
              {langaugeOption}
            </LanguageOption>
          )
        })}
      </LanguageSelect>
    </LanguageContainer>
  )
}

export default Langauge
