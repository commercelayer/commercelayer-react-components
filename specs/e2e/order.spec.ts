import { test, expect } from './baseFixtures'
import path from 'path'
import './config/dotenv-config'
import { waitForResponse } from './utils/response'
const endpointURL = `${process.env.__ENDPOINT__}/order`

test('Order', async ({ page, browser }) => {
  await page.coverage.startJSCoverage()
  await page.goto(endpointURL)
  await Promise.all([
    page.waitForResponse(waitForResponse('/api/prices')),
    page.waitForResponse(waitForResponse('/api/skus')),
  ])
  const priceItem = await await page.textContent('[data-test=price]')
  const comparePriceItem = await page.textContent(
    ':right-of(:nth-match([data-test=price], 1))'
  )
  // Check prices
  expect(priceItem).toBe('€29,00')
  expect(comparePriceItem).toBe('€37,70')
  await Promise.all([
    await page.selectOption('[data-test=variant-selector]', {
      label: '6 months',
    }),
    page.waitForResponse(waitForResponse('/api/skus')),
  ])
  const availability = await await page.textContent(
    '[data-test=availability-template]'
  )
  expect(availability).toBe(
    'Available in 7 - 10 days with Standard Shipping EU'
  )
  await Promise.all([
    await page.click('[data-test=add-to-cart-button]'),
    await page.waitForResponse(waitForResponse('api/line_items')),
    await page.waitForResponse(waitForResponse('api/orders')),
  ])
  const subTotalAmount = await await page.textContent(
    '[data-test=subtotal-amount]'
  )
  expect(subTotalAmount).toBe('')
  // await page.pause()
  // const filterdPrice = await page.textContent('data-test=price-filter-0')
  // const compareFilteredPrice = await page.textContent(
  //   ':right-of(:nth-match([data-test="price-filter-0"], 1))'
  // )
  // const price = await page.textContent('data-test=price-0')
  // const comparePrice = await page.textContent(
  //   ':right-of(:nth-match([data-test="price-0"], 1))'
  // )
  // const dollarPrice = await page.textContent(
  //   ':nth-match([data-test="price-0"], 3)'
  // )
  // const compareDollarPrice = await page.textContent(
  //   ':nth-match([data-test="price-0"], 4)'
  // )
  // expect(filterdPrice).toBe('€29,00')
  // expect(filterdPrice).not.toBe('$29,00')
  // expect(compareFilteredPrice).toBe('€37,70')
  // expect(price).toBe('€29,00')
  // expect(comparePrice).toBe('€37,70')
  // expect(dollarPrice).toBe('$34.80')
  // expect(compareDollarPrice).toBe('$45.24')
  await page.screenshot({
    path: path.join(__dirname, 'screenshots', 'prices.jpg'),
  })
  await page.coverage.stopJSCoverage()
  await browser.close()
})
