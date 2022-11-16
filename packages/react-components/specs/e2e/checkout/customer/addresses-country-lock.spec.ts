import { test, expect } from '../../baseFixtures'
const endpoint = `checkout/customer/addresses-country-lock`
import mock from '../../fixtures/checkout/customer/addresses-country-lock.json'
import { getScreenshotPath } from '../../utils/response'

test('Customer address country lock', async ({ page }) => {
  await page.route('**/oauth/token', (route) => {
    route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*' },
      contentType: 'application/vnd.api+json',
      body: JSON.stringify(mock.token),
    })
  })
  await page.route('**/customer_addresses?include=address', (route) => {
    route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*' },
      contentType: 'application/vnd.api+json',
      body: JSON.stringify(mock.customer_addresses),
    })
  })
  await page.route('**/orders/*', (route) => {
    route.fulfill({
      status: 200,
      headers: { 'access-control-allow-origin': '*' },
      contentType: 'application/vnd.api+json',
      body: JSON.stringify(mock.orders),
    })
  })
  await page.coverage.startJSCoverage()
  await page.goto(endpoint)
  const shipToDifferentAddressButton = await page.waitForSelector(
    '[data-test=ship-to-different-address-button]'
  )
  await shipToDifferentAddressButton.click()
  const shippingAddresses = await page.locator(
    '[data-test=customer-shipping-address]'
  )
  const textContents = await shippingAddresses.allTextContents()
  expect(textContents.length).toBe(2)
  textContents.map((t) => {
    expect(t).toContain('(IT)')
  })
  await page.screenshot({
    path: getScreenshotPath('customer-addresses-country-lock.jpg'),
  })
})
