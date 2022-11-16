import DevPage from './Page'
import { expect } from '@playwright/test'

export class OrderPage extends DevPage {
  async clickCartLinkButton() {
    const button = this.page.locator('[data-test=cart-link]')
    await button.waitFor({ state: 'visible' })
    await button.click()
  }
  async addItemToCart(code: string) {
    const selector = this.page.locator(`[data-test=variant-selector]`)
    await selector.waitFor({ state: 'visible' })
    await selector.waitFor({ state: 'attached' })
    await selector.selectOption({ value: code })
    const button = this.page.locator('[data-test=add-to-cart-button]')
    await button.waitFor({ state: 'visible' })
    await button.click()
  }
  async checkCurrentUrl(value: string) {
    await this.page.waitForURL(
      (url) =>
        url.toJSON().includes(value) && !url.toJSON().includes('localhost')
    )
    await expect(this.page.url()).toMatch(/commercelayer.app\//gm)
  }
  async checkText(selector: string, text: string) {
    const button = this.page.locator(selector)
    await button.waitFor({ state: 'visible' })
    await expect(button).toContainText(text)
  }
  async checkItemsQuantity(quantity: number) {
    const itemsCounter = this.page.locator('[data-test=items-count]')
    await expect(itemsCounter).toContainText(quantity.toString())
  }
}
