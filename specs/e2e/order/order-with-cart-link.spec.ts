import type { Page } from '@playwright/test'
import { test } from '../baseFixtures'
import { OrderPage } from '../models/'

test.describe('Order with cart link', () => {
  let page: Page
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })
  test.afterAll(async () => {
    await page.close()
  })
  test('Click cart link without an order', async () => {
    const order = new OrderPage(page)
    await order.goto('order/order-with-cart-link-button')
    await order.checkText('[data-test=cart-link]', 'Cart link string')
    await order.clickCartLinkButton()
    await order.checkCurrentUrl('cart')
  })
  test('Click cart link with an order', async () => {
    const order = new OrderPage(page)
    await order.goBack()
    await order.clickCartLinkButton()
    await order.checkCurrentUrl('cart')
  })
  test('Label button', async ({ page }) => {
    const order = new OrderPage(page)
    await order.goto('order/order-with-cart-link-button?reactNodeLabel=true')
    await order.checkText('[data-test=cart-link]', 'Cart link react node label')
  })
})
