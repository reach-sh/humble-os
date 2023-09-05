import winston from 'winston'

const clear = '\x1b[0m'
const Blue = (s: any) => Bright(`\x1b[34m${s}${clear}`)
const Bright = (s: string) => `\x1b[1m${s}${clear}`
const Dim = (s: any) => Bright(`\x1b[2m${s}${clear}`)
const Red = (s: any) => Bright(`\x1b[31m${s}${clear}`)
const Yellow = (s: any) => Bright(`\x1b[33m${s}${clear}`)
const Green = (s: any) => Bright(`\x1b[32m${s}${clear}`)

/** Global application logger */
const logger = winston.createLogger({
  exitOnError: false,
  format: winston.format.printf(colorAndFormatLogs),
  transports: [new winston.transports.Console()],
})

const logFormatter = {
  error: Red,
  warn: Yellow,
  debug: Green,
  info: Blue,
}

export default logger

export function fmtJSON(val: any) {
  return JSON.stringify(val, null, 2)
}

/**
 * Pretty-print and colorize logs for console output
 * @param val Winston message/log value object
 * @returns Formatted text
 */
function colorAndFormatLogs(val: { level: string; message: any }) {
  const { level, message } = val
  const logOutput = typeof message === 'string' ? message : fmtJSON(message)
  const fmt = logFormatter[level] || Dim
  return fmt(logOutput)
}
