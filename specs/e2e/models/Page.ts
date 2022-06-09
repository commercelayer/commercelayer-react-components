import type { Page } from '@playwright/test'

type PathReference = {
  checkout: {
    page: [
      { path: 'index'; params: [] },
      { path: 'addresses'; params: [] },
      { path: 'payments'; params: [] },
      { path: 'giftcard-or-coupon-code'; params: [] },
      { path: 'shipments'; params: [] }
    ]
  }
  order: {
    page: [
      { path: 'add-item-to-hosted-cart'; params: [] },
      { path: 'order-with-cart-link-button'; params: [] },
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
}
