export default function getBrowserInfo() {
  const screenWidth = window && window.screen ? window.screen.width : ''
  const screenHeight = window && window.screen ? window.screen.height : ''
  const colorDepth = window && window.screen ? window.screen.colorDepth : ''
  const userAgent = window && window.navigator ? window.navigator.userAgent : ''
  const javaEnabled =
    window && window.navigator ? navigator.javaEnabled() : false

  let language = ''
  if (window && window.navigator) language = window.navigator.language

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
  }

  return browserInfo
}
