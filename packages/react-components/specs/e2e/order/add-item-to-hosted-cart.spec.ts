import { test } from '../baseFixtures'
import { OrderPage } from '../models'

test.describe('Add item to hosted cart', () => {
  test('Default hosted cart url', async ({ page }) => {
    const order = new OrderPage(page)
    await order.goto('order/add-item-to-hosted-cart')
    await order.addItemToCart('BABYONBU000000E63E7412MX')
    await order.checkCurrentUrl('cart')
  })
  test('Custom hosted cart url', async ({ page }) => {
    const order = new OrderPage(page)
    await order.goto('order/add-item-to-hosted-cart?hostedCartUrl=true')
    await order.addItemToCart('BABYONBU000000E63E7412MX')
  })
})
