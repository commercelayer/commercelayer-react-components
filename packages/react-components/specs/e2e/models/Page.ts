import type { Page } from '@playwright/test'

type PathReference = {
  checkout: {
    page: [
      { path: 'index' },
      { path: 'addresses' },
      { path: 'payments' },
      { path: 'giftcard-or-coupon-code' },
      { path: 'shipments' }
    ]
  }
  order: {
    page: [
      { path: 'buy-now-mode' },
      { path: 'add-item-to-hosted-cart' },
      { path: 'order-with-cart-link-button' },
      { path: 'order-with-cart-link-button?reactNodeLabel=true' },
      {
        path: 'add-item-to-hosted-cart?hostedCartUrl=true'
      }
    ]
  }
}

type PathPages = {
  [K in keyof PathReference]: `${K}/${PathReference[K]['page'][number]['path']}`
}[keyof PathReference]

export default class DevPage {
  readonly page: Page
  constructor(page: Page) {
    this.page = page
  }
  async goto(url: PathPages) {
    await this.page.goto(url)
  }
  async goBack() {
    await this.page.goBack()
  }
  async isFinished(response, url) {
    return (
      response.url().includes(url) &&
      response.status() === 200 &&
      (await response.json()).response === 'Completed'
    )
  }
}
