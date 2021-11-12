export const waitForResponse = (s) => (resp) => {
  return resp.url().includes(s) && [200, 201, 204].includes(resp.status())
}
