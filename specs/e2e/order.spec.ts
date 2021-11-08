import { test, expect } from './baseFixtures'
import path from 'path'
import { waitForResponse } from './utils/response'
const endpointURL = `order`
test.describe('Orders', () => {
  test('Basic order', async ({ page, browser }) => {
    await page.coverage.startJSCoverage()
    await page.goto(endpointURL)
    await Promise.all([
      page.waitForResponse(waitForResponse('/api/prices')),
      page.waitForResponse(waitForResponse('/api/skus')),
    ])
    const priceItem = await page.textContent('[data-test=price]')
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
      await page.waitForResponse(waitForResponse('/api/skus')),
    ])
    const availability = await page.textContent(
      '[data-test=availability-template]'
    )
    expect(availability).toBe(
      'Available in 7 - 10 days with Standard Shipping EU'
    )
    await Promise.all([
      await page.click('[data-test=add-to-cart-button]'),
      await page.waitForResponse(waitForResponse('api/orders')),
      await page.waitForResponse(waitForResponse('api/line_items')),
      await page.waitForResponse(waitForResponse('api/orders')),
    ])
    const subTotalAmount = await page.textContent('[data-test=subtotal-amount]')
    const discoutAmount = await page.textContent('[data-test=discount-amount]')
    const totalAmount = await page.textContent('[data-test=total-amount]')
    expect(subTotalAmount).toBe('€29,00')
    expect(discoutAmount).toBe('€0,00')
    expect(totalAmount).toBe('€29,00')
    const itemsCount = await page.textContent('[data-test=items-count]')
    expect(itemsCount).toBe('1')
    await Promise.all([
      await page.selectOption('[data-test=line-item-quantity]', {
        value: '2',
      }),
      await page.waitForResponse(waitForResponse('/api/line_items')),
      await page.waitForResponse(waitForResponse('/api/orders')),
    ])
    await page.waitForLoadState('networkidle', { timeout: 800 })
    const countUpdated = await page.textContent('[data-test=items-count]')
    expect(countUpdated).toBe('2')
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', 'basic_order.jpg'),
    })
    await page.coverage.stopJSCoverage()
    await browser.close()
  })
})
