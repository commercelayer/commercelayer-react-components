import CommerceLayer from '#components/auth/CommerceLayer'
import LineItem from '#components/line_items/LineItem'
import LineItemField from '#components/line_items/LineItemField'
import LineItemImage from '#components/line_items/LineItemImage'
import LineItemName from '#components/line_items/LineItemName'
import LineItemOption from '#components/line_items/LineItemOption'
import LineItemOptions from '#components/line_items/LineItemOptions'
import LineItemsContainer from '#components/line_items/LineItemsContainer'
import LineItemsCount from '#components/line_items/LineItemsCount'
import AddToCartButton from '#components/orders/AddToCartButton'
import OrderContainer from '#components/orders/OrderContainer'
import CartLink from '#components/orders/CartLink'
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

describe('AddToCartButton component', () => {
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
      ctx.lineItemOption = {
        skuOptionId: 'mNJEgsJwBn',
        options: {
          message: 'This is a message'
        }
      }
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
  it<AddToCartContext>('Add SKU with frequency to the order with quantity', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer>
          <AddToCartButton
            data-testid='add-to-cart-button'
            skuCode={ctx.skuCode}
            quantity={ctx.quantity}
            lineItem={{
              frequency: 'monthly'
            }}
          />
          <LineItemsContainer>
            <LineItemsCount data-testid='line-items-count' />
            <LineItem>
              <LineItemField
                data-testid='line-item-frequency'
                attribute='frequency'
              />
            </LineItem>
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
    const frequency = screen.getByTestId(`line-item-frequency`)
    expect(frequency).toBeDefined()
    expect(frequency.textContent).toBe('monthly')
  })
  it<AddToCartContext>('Add SKU to the order with quantity and check CartLink href', async (ctx) => {
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
          <CartLink data-testid='cart-link' />
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
    const link = screen.getByTestId(`cart-link`)
    expect(link).toBeDefined()
    expect(link.getAttribute('href')).toContain('stg.commercelayer')
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
  it<AddToCartContext>('Add SKU to the order with custom name and image', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer>
          <AddToCartButton
            data-testid='add-to-cart-button'
            skuCode={ctx.skuCode}
            quantity={ctx.quantity}
            lineItem={ctx.lineItem}
          />
          <LineItemsContainer>
            <LineItemsCount data-testid='line-items-count' />
            <LineItem>
              <LineItemName />
              <LineItemImage />
              <LineItemField
                data-testid={`line-item-code-${ctx.skuCode}`}
                attribute='sku_code'
                tagElement='span'
              />
            </LineItem>
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
    const lineItemName = screen.getByTestId(`line-item-name-${ctx.skuCode}`)
    const lineItemImage = screen.getByTestId(`line-item-image-${ctx.skuCode}`)
    const lineItemCode = screen.getByTestId(`line-item-code-${ctx.skuCode}`)
    expect(lineItemName).toBeDefined()
    expect(lineItemImage).toBeDefined()
    expect(lineItemCode).toBeDefined()
    expect(lineItemName.textContent).toBe(ctx.lineItem.name)
    expect(lineItemImage.getAttribute('src')).toBe(ctx.lineItem.imageUrl)
    expect(lineItemCode.textContent).toBe(ctx.skuCode)
  })
  it<AddToCartContext>('Add SKU to the order with sku options', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer>
          <AddToCartButton
            data-testid='add-to-cart-button'
            skuCode={ctx.skuCode}
            quantity={ctx.quantity}
            lineItemOption={ctx.lineItemOption}
          />
          <LineItemsContainer>
            <LineItemsCount data-testid='line-items-count' />
            <LineItem>
              <LineItemName />
              <LineItemImage />
              <LineItemOptions showAll>
                <LineItemOption />
              </LineItemOptions>
            </LineItem>
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
    const lineItemName = screen.getByTestId(`line-item-name-${ctx.skuCode}`)
    const lineItemImage = screen.getByTestId(`line-item-image-${ctx.skuCode}`)
    const skuOption = screen.findByText('This is a message')
    expect(lineItemName).toBeDefined()
    expect(lineItemImage).toBeDefined()
    expect(skuOption).toBeDefined()
    expect(lineItemName.textContent).toContain('Black Baby')
    expect(lineItemImage.getAttribute('src')).toContain(
      ctx.skuCode.slice(0, ctx.skuCode.length - 4)
    )
  })
  it('AddToCartButton outside of CommerceLayer', () => {
    expect(() => render(<AddToCartButton />)).toThrow(
      'Cannot use <AddToCartButton/> outside of <CommerceLayer/>'
    )
  })
  it<AddToCartContext>('AddToCartButton outside of OrderContainer', (ctx) => {
    expect(() =>
      render(
        <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
          <AddToCartButton />
        </CommerceLayer>
      )
    ).toThrow('Cannot use <AddToCartButton/> outside of <OrderContainer/>')
  })
})
