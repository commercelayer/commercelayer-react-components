import { test, expect } from './baseFixtures'
import path from 'path'
import { waitForResponse } from './utils/response'
const endpointURL = `order`
test.describe('Orders', () => {
  const timeout = 500
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
    await expect(priceItem).toBe('€29,00')
    await expect(comparePriceItem).toBe('€37,70')
    await Promise.all([
      await page.selectOption('[data-test=variant-selector]', {
        label: '6 months',
      }),
      await page.waitForResponse(waitForResponse('/api/skus')),
    ])
    const availability = await page.textContent(
      '[data-test=availability-template]'
    )
    await expect(availability).toBe(
      'Available in 7 - 10 days with Standard Shipping EU'
    )
    await Promise.all([
      await page.click('[data-test=add-to-cart-button]'),
      await page.waitForResponse(waitForResponse('api/orders')),
      await page.waitForResponse(waitForResponse('api/line_items')),
      await page.waitForResponse(waitForResponse('api/orders')),
      await page.waitForTimeout(timeout),
    ])
    await page.waitForLoadState('domcontentloaded')
    let itemsCount = await page.textContent('[data-test=items-count]')
    let subTotalAmount = await page.textContent('[data-test=subtotal-amount]')
    let totalAmount = await page.textContent('[data-test=total-amount]')
    const discountAmount = await page.textContent('[data-test=discount-amount]')
    await expect(itemsCount).toBe('1')
    await expect(subTotalAmount).toBe('€29,00')
    await expect(discountAmount).toBe('€0,00')
    await expect(totalAmount).toBe('€29,00')
    await Promise.all([
      await page.selectOption('[data-test=line-item-quantity]', {
        value: '2',
      }),
      await page.waitForResponse(waitForResponse('/api/line_items')),
      await page.waitForResponse(waitForResponse('/api/orders')),
      await page.waitForTimeout(timeout),
    ])
    itemsCount = await page.textContent('[data-test=items-count]')
    subTotalAmount = await page.textContent('[data-test=subtotal-amount]')
    totalAmount = await page.textContent('[data-test=total-amount]')
    await Promise.all([
      await expect(itemsCount).toBe('2'),
      await expect(subTotalAmount).toBe('€58,00'),
      await expect(totalAmount).toBe('€58,00'),
    ])
    await Promise.all([
      await page.click('[data-test=line-item-remove]'),
      await page.waitForResponse(waitForResponse('api/line_items')),
      await page.waitForResponse(waitForResponse('api/orders')),
      await page.waitForTimeout(timeout),
    ])
    itemsCount = await page.textContent('[data-test=items-count]')
    subTotalAmount = await page.textContent('[data-test=subtotal-amount]')
    totalAmount = await page.textContent('[data-test=total-amount]')
    await expect(itemsCount).toBe('0')
    await expect(subTotalAmount).toBe('€0,00')
    await expect(totalAmount).toBe('€0,00')
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', 'basic_order.jpg'),
    })
    await page.coverage.stopJSCoverage()
    await browser.close()
  })
})
