import path from 'path'
export const waitForResponse = (s) => (resp) => {
  return resp.url().includes(s) && [200, 201, 204].includes(resp.status())
}

export function getScreenshotPath(img: string): string {
  return path.join(process.cwd(), 'specs', 'e2e', 'screenshots', img)
}
