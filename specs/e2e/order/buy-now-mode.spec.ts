import { test } from '../baseFixtures'
import { OrderPage } from '../models'

test.describe('Buy now mode', () => {
  test('Add item', async ({ page }) => {
    const order = new OrderPage(page)
    await order.goto('order/buy-now-mode')
    await order.addItemToCart('BABYONBU000000E63E7412MX')
    await order.checkCurrentUrl('checkout')
  })
  test('Add and check if the line item is always one', async ({ page }) => {
    const order = new OrderPage(page)
    await order.goto('order/buy-now-mode')
    await order.addItemToCart('BABYONBU000000E63E7412MX')
    await order.checkCurrentUrl('checkout')
    await order.goBack()
    await order.checkItemsQuantity(1)
    await order.addItemToCart('BABYONBU000000E63E7412MX')
    await order.checkCurrentUrl('checkout')
    await order.goBack()
    await order.checkItemsQuantity(1)
  })
})
