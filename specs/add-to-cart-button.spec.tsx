import CommerceLayer from '#components/auth/CommerceLayer'
import LineItemsContainer from '#components/line_items/LineItemsContainer'
import LineItemsCount from '#components/line_items/LineItemsCount'
import AddToCartButton from '#components/orders/AddToCartButton'
import OrderContainer from '#components/orders/OrderContainer'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LocalContext } from './utils/context'
import getToken from './utils/getToken'

interface AddToCartContext extends LocalContext {
  skuCode: string
  quantity: string
}

describe('AddToCartButton component', () => {
  let token: string | undefined
  let domain: string | undefined
  beforeAll(async () => {
    const { accessToken, endpoint } = await getToken('customer')
    if (accessToken !== undefined) {
      token = accessToken
      domain = endpoint
    }
  })
  beforeEach<AddToCartContext>(async (ctx) => {
    if (token != null && domain != null) {
      ctx.accessToken = token
      ctx.endpoint = domain
      ctx.skuCode = 'BABYONBU000000E63E7412MX'
      ctx.quantity = '3'
    }
  })
  it<AddToCartContext>('Add SKU to the order with quantity', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer>
          <AddToCartButton
            data-testid='add-to-cart-button'
            skuCode={ctx.skuCode}
            quantity={ctx.quantity}
          />
          <LineItemsContainer>
            <LineItemsCount data-testid='line-items-count' />
          </LineItemsContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    const button = screen.getByTestId(`add-to-cart-button`)
    const count = screen.getByTestId(`line-items-count`)
    expect(button).toBeDefined()
    expect(count).toBeDefined()
    expect(count.textContent).toBe('0')
    fireEvent.click(button)
    await waitFor(async () => await screen.findByText('3'), { timeout: 5000 })
    expect(count.textContent).toBe('3')
  })
  it<AddToCartContext>('Add SKU to the order with quantity and change quantity', async (ctx) => {
    const { rerender } = render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer>
          <AddToCartButton
            data-testid='add-to-cart-button'
            skuCode={ctx.skuCode}
            quantity={ctx.quantity}
          />
          <LineItemsContainer>
            <LineItemsCount data-testid='line-items-count' />
          </LineItemsContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    const button = screen.getByTestId(`add-to-cart-button`)
    const count = screen.getByTestId(`line-items-count`)
    expect(button).toBeDefined()
    expect(count).toBeDefined()
    expect(count.textContent).toBe('0')
    fireEvent.click(button)
    await waitFor(async () => await screen.findByText('3'), { timeout: 5000 })
    expect(count.textContent).toBe('3')
    rerender(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer>
          <AddToCartButton
            data-testid='add-to-cart-button'
            skuCode={ctx.skuCode}
            quantity='2'
          />
          <LineItemsContainer>
            <LineItemsCount data-testid='line-items-count' />
          </LineItemsContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    expect(button).toBeDefined()
    expect(count).toBeDefined()
    expect(count.textContent).toBe('3')
    fireEvent.click(button)
    await waitFor(async () => await screen.findByText('5'), { timeout: 5000 })
    expect(count.textContent).toBe('5')
  })
  it('AddToCartButton outside of CommerceLayer', () => {
    expect(() => render(<AddToCartButton />)).toThrow(
      'Cannot use `AddToCartButton` outside of `CommerceLayer`'
    )
  })
  it<AddToCartContext>('AddToCartButton outside of OrderContainer', (ctx) => {
    expect(() =>
      render(
        <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
          <AddToCartButton />
        </CommerceLayer>
      )
    ).toThrow('Cannot use `AddToCartButton` outside of `OrderContainer`')
  })
})
