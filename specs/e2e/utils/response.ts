export const waitForResponse = (s) => (resp) => {
  console.log(`url`, resp.url())
  return resp.url().includes(s) && [200, 201].includes(resp.status())
}
