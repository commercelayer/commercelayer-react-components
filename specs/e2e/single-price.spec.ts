import { test, expect } from './baseFixtures'
import path from 'path'
const endpoint = `/`

test('Prices page', async ({ page, browser }) => {
  await page.coverage.startJSCoverage()
  await page.goto(endpoint)
  const loading = await page.waitForSelector('text=Caricamento...')
  expect(await loading.textContent()).toBe('Caricamento...')
  const firstPrice = await page.textContent('data-test=price-0')
  const compareFirstPrice = await page.textContent(
    ':right-of(:nth-match([data-test="price-0"], 1))'
  )
  const sndPrice = await page.textContent(
    ':right-of(:nth-match([data-test="price-0"], 2))'
  )
  const compareSndPrice = await page.textContent(
    ':right-of(:nth-match([data-test="price-0"], 3))'
  )
  expect(firstPrice).toBe('€35,00')
  expect(compareFirstPrice).toBe('€45,00')
  expect(sndPrice).toBe('$34.80')
  expect(compareSndPrice).toBe('$45.24')
  await page.screenshot({
    path: path.join(__dirname, 'screenshots', 'prices.jpg'),
  })
  await page.coverage.stopJSCoverage()
  await browser.close()
})
