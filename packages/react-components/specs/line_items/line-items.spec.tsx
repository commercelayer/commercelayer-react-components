import CommerceLayer from '#components/auth/CommerceLayer'
import LineItem from '#components/line_items/LineItem'
import LineItemQuantity from '#components/line_items/LineItemQuantity'
import LineItemsContainer from '#components/line_items/LineItemsContainer'
import LineItemsCount from '#components/line_items/LineItemsCount'
import LineItemCode from '#components/line_items/LineItemCode'
import AddToCartButton from '#components/orders/AddToCartButton'
import OrderContainer from '#components/orders/OrderContainer'
import Errors from '#components/errors/Errors'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type LocalContext } from '../utils/context'
import { getAccessToken } from 'mocks/getAccessToken'

interface AddToCartContext extends LocalContext {
  skuCode: string
  quantity: string
  lineItem: {
    name: string
    imageUrl?: string
  }
  lineItemOption: {
    skuOptionId: string
    options: Record<string, string>
    quantity?: number
  }
}

describe('Line items components', () => {
  const globalTimeout: number = 5000
  beforeEach<AddToCartContext>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.skuCode = 'BABYONBU000000E63E7412MX'
      ctx.quantity = '3'
      ctx.lineItem = {
        name: 'Darth Vader',
        imageUrl:
          'https://i.pinimg.com/736x/a5/32/de/a532de337eff9b1c1c4bfb8df73acea4--darth-vader-stencil-darth-vader-head.jpg?b=t'
      }
    }
  })
  it<AddToCartContext>('LineItemsCount outside of CustomerContainer', (ctx) => {
    expect(() =>
      render(
        <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
          <LineItemsCount />
        </CommerceLayer>
      )
    ).toThrow('Cannot use <LineItemsCount/> outside of <LineItemsContainer/>')
  })
  it<AddToCartContext>('Show out of stock error changing quantity', async (ctx) => {
    const skuWithoutStock = 'BABYONBU000000FFFFFFNBXX'
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer>
          <AddToCartButton
            data-testid='add-to-cart-button'
            skuCode={ctx.skuCode}
            quantity={ctx.quantity}
          />
          <AddToCartButton
            data-testid='second-add-to-cart-button'
            skuCode={skuWithoutStock}
            quantity={ctx.quantity}
          />
          <LineItemsContainer>
            <LineItemsCount data-testid='line-items-count' />
            <LineItem>
              <LineItemCode />
              <LineItemQuantity />
              <Errors
                data-testid='errors'
                resource='line_items'
                field='quantity'
              >
                {() => {
                  return <span data-testid='errors'>Errors</span>
                }}
              </Errors>
            </LineItem>
          </LineItemsContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    const button = screen.getByTestId(`add-to-cart-button`)
    const secondButton = screen.getByTestId(`second-add-to-cart-button`)
    const count = screen.getByTestId(`line-items-count`)
    expect(button).toBeDefined()
    expect(secondButton).toBeDefined()
    expect(count).toBeDefined()
    expect(count.textContent).toBe('0')
    fireEvent.click(button)
    await waitFor(
      () => {
        expect(screen.getByTestId(`line-items-count`).textContent).toBe('3')
      },
      { timeout: globalTimeout }
    )
    fireEvent.click(secondButton)
    await waitFor(
      () => {
        expect(screen.getByTestId(`line-items-count`).textContent).toBe('6')
      },
      { timeout: globalTimeout }
    )
    const quantitySelector =
      screen.getByTestId<HTMLSelectElement>(skuWithoutStock)
    expect(quantitySelector).toBeDefined()
    expect(quantitySelector.value).toBe('3')
    fireEvent.change(screen.getByTestId(skuWithoutStock), {
      target: { value: '6' }
    })
    await waitFor(
      () => {
        expect(screen.getByTestId(`line-items-count`).textContent).toBe('6')
      },
      { timeout: globalTimeout }
    )
    expect(screen.getByTestId(`line-items-count`).textContent).toBe('6')
    // NOTE: Should check if the error component is showing the error message.
  })
})
