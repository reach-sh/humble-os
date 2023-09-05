/**
 * Supported currencies that can be used in CoinGecko queries.
 * Can also be supplied for user preference setting
 */
export const SENDWYRE_CURRENCIES = [
  'USD',
  'ARS',
  'AUD',
  'BRL',
  'CAD',
  'CHF',
  'CLP',
  'CNY',
  'COP',
  'CZK',
  'DKK',
  'EUR',
  'GBP',
  'HKD',
  'ILS',
  'INR',
  'ISK',
  'JPY',
  'KRW',
  'MXN',
  'MYR',
  'NOK',
  'NZD',
  'PHP',
  'PLN',
  'SEK',
  'SGD',
  'THB',
  'VND',
  'ZAR',
]

/** SendWyre API url */
export function sendwyreAPI() {
  const base = 'https://yhnyufyj90.execute-api.us-east-1.amazonaws.com'
  const env = '/prod/humble-sendwyre'
  return `${base}${env}`
}
