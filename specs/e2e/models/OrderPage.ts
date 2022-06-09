import DevPage from './Page'
import { expect } from '@playwright/test'

export class OrderPage extends DevPage {
  async clickCartLinkButton() {
    const button = this.page.locator('[data-test-id=cart-link]')
    await button.waitFor({ state: 'visible' })
    await button.click()
  }
  async addItemToCart(code: string) {
    const selector = this.page.locator(`[data-test=variant-selector]`)
    await selector.waitFor({ state: 'visible' })
    await selector.selectOption({ value: code })
    const button = this.page.locator('[data-test=add-to-cart-button]')
    await button.waitFor({ state: 'visible' })
    await button.click()
  }
  async checkCurrentUrl(value = 'cart') {
    await this.page.waitForURL(`**/${value}/**`)
    await expect(this.page.url()).toMatch(/commercelayer.app\/cart\//gm)
  }
}
