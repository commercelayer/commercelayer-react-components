interface TReturn {
  screenWidth: string | number
  screenHeight: string | number
  colorDepth: string | number
  userAgent: string
  timeZoneOffset: number
  language: string
  javaEnabled: boolean
}

export default function getBrowserInfo(): TReturn {
  const screenWidth = window?.screen ? window.screen.width : ''
  const screenHeight = window?.screen ? window.screen.height : ''
  const colorDepth = window?.screen ? window.screen.colorDepth : ''
  const userAgent = window?.navigator ? window.navigator.userAgent : ''
  const javaEnabled = window?.navigator ? navigator.javaEnabled() : false
  const acceptHeader =
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'

  let language = ''
  if (window?.navigator) language = window.navigator.language

  const d = new Date()
  const timeZoneOffset = d.getTimezoneOffset()

  const browserInfo = {
    screenWidth,
    screenHeight,
    colorDepth,
    userAgent,
    timeZoneOffset,
    language,
    javaEnabled,
    acceptHeader
  }

  return browserInfo
}

export function cleanUrlBy(symbol: string = '&'): string {
  const currentLocation = window?.location.href
  const [splitLocation] = currentLocation.split(symbol)
  return splitLocation ?? currentLocation
}
