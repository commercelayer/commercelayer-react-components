export const waitForResponse = (s) => (resp) => {
  return resp.url().includes(s) && resp.status() === 200
}
