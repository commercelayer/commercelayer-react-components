import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { test as baseTest, Page } from '@playwright/test'

const istanbulCLIOutput = path.join(process.cwd(), '.nyc_output')

export function createGuid(): string {
  return crypto.randomBytes(16).toString('hex')
}

export const test = baseTest.extend<
  {},
  {
    _collectIstanbulCoverageWritenPages: Map<Page, Promise<any>>
  }
>({
  _collectIstanbulCoverageWritenPages: [new Map(), { scope: 'worker' }],
  context: async ({ context, _collectIstanbulCoverageWritenPages }, use) => {
    await context.addInitScript(() =>
      window.addEventListener('beforeunload', () =>
        (window as any).collectIstanbulCoverage((window as any).__coverage__)
      )
    )
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true })
    context.on('page', async (page: Page) => {
      let resolve = (value?: unknown) => {}
      const promise = new Promise((r) => (resolve = r))
      _collectIstanbulCoverageWritenPages.set(page, promise)
      await page.exposeFunction(
        'collectIstanbulCoverage',
        (coverageData: unknown) => {
          if (coverageData)
            fs.writeFileSync(
              path.join(
                istanbulCLIOutput,
                `playwright_coverage_${createGuid()}.json`
              ),
              JSON.stringify(coverageData)
            )
          resolve()
        }
      )
    })
    await use(context)
    for (const page of context.pages()) {
      await page.close({ runBeforeUnload: true })
      if (_collectIstanbulCoverageWritenPages.has(page)) {
        const coverageSaved = _collectIstanbulCoverageWritenPages.get(page)!
        _collectIstanbulCoverageWritenPages.delete(page)
        await coverageSaved
      }
    }
  },
})

export const expect = test.expect
