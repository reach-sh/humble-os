// USE THIS FILE TO DYNAMICALLY INJECT ANY EXTERNAL SCRIPTS INTO THE APP
import createState from '@jackcom/raphsducks'

/** Track page-session scripts (i.e. scripts that should be reloaded with the page) */
const InjectedScripts = createState({
  Hubspot: false,
})

/**
 * Inject a `<script />` tag with the supplied contents into the current tab's
 * html. This will execute `contents` immediately.
 * @param {string} contents Script tag contents
 */
export function injectScript(contents: string) {
  const scrpt = document.createElement('script')
  scrpt.innerHTML = contents
  const lastElem = document.head.lastChild
  document.head.insertBefore(scrpt, lastElem)
}

/**
 * SWAP-1003 | Trigger NPS (net promoter score) survey modal.
 * Happens only after cache is completely cleared (following a user trigger)
 */
export function executeNPSSurvey() {
  // BYPASS until we have someone to monitor this. It will require reintegration.
  //
  //
  // const LOCAL_STORAGE_NPS_SURVEY_KEY = 'seenNPSSurvey'
  // if (localStorage.getItem(LOCAL_STORAGE_NPS_SURVEY_KEY) === '1') return
  /* eslint-disable-next-line */
  // const scr = `var t = 'fzvbo'; var theme = 'ffbe1d'; var pt = ''; var pn = 'right'; var survey_display = 'active'; (function () { setTimeout(function () { var d = document, f = d.getElementsByTagName('script')[0], s = d.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = 'https://www.proprofs.com/survey/embed/proprofsPopUp.js?v=35'; f.parentNode.appendChild(s, f); }, 1); })();`
  // localStorage.setItem(LOCAL_STORAGE_NPS_SURVEY_KEY, '1')
}

/**
 * Inject HubSpot Embed Code (should happen on page refresh)
 */
export async function executeHubspotSupport() {
  const { Hubspot } = InjectedScripts.getState()
  if (Hubspot) return

  const scrpt = document.createElement('script')
  scrpt.src = '//js-na1.hs-scripts.com/21135646.js'
  const lastElem = document.head.lastChild
  document.head.insertBefore(scrpt, lastElem)
  InjectedScripts.Hubspot(true)
}
