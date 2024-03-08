import InStockSubscriptionsContainer from '#components/in_stock_subscriptions/InStockSubscriptionsContainer'
import InStockSubscriptionButton from '#components/in_stock_subscriptions/InStockSubscriptionButton'
import Errors from '#components/errors/Errors'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type SkusContext } from '../utils/context'
import CommerceLayer from '#components/auth/CommerceLayer'
import { faker } from '@faker-js/faker'
import { getAccessToken } from 'mocks/getAccessToken'

describe('InStockSubscription components', () => {
  beforeEach<SkusContext>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.sku = 'BABYONBU000000E63E746MXX'
    }
  })
  it.skip('InStockSubscriptionsContainer outside of CommerceLayer', () => {
    expect(() =>
      render(
        <InStockSubscriptionsContainer>
          <></>
        </InStockSubscriptionsContainer>
      )
    ).toThrow(
      'Cannot use <InStockSubscriptionsContainer/> outside of <CommerceLayer/>'
    )
  })
  it.skip<SkusContext>('InStockSubscriptionButton outside of InStockSubscriptionsContainer', ({
    sku
  }) => {
    expect(() => render(<InStockSubscriptionButton skuCode={sku} />)).toThrow(
      'Cannot use <InStockSubscriptionButton/> outside of <InStockSubscriptionsContainer/>'
    )
  })
  it<SkusContext>('Button is not visible by default', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <InStockSubscriptionsContainer>
          <InStockSubscriptionButton
            data-testid='in-stock-subscription-button'
            skuCode={ctx.sku}
          />
        </InStockSubscriptionsContainer>
      </CommerceLayer>
    )
    const button = screen.queryByTestId('in-stock-subscription-button')
    expect(button).toBeNull()
  })
  it<SkusContext>('Button is visible', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <InStockSubscriptionsContainer>
          <InStockSubscriptionButton
            data-testid='in-stock-subscription-button'
            skuCode={ctx.sku}
            show
          />
        </InStockSubscriptionsContainer>
      </CommerceLayer>
    )
    const button = screen.queryByTestId('in-stock-subscription-button')
    expect(button).toBeDefined()
    expect(button?.textContent).toBe('Subscribe')
  })
  it<SkusContext>('Button is visible with custom label and try to subscribe', async (ctx) => {
    let successResponse = false
    const email = faker.internet.email().toLowerCase()
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <InStockSubscriptionsContainer>
          <InStockSubscriptionButton
            data-testid='in-stock-subscription-button'
            skuCode={ctx.sku}
            customerEmail={email}
            label={<span data-testid='button-label'>Subscribe on click</span>}
            show
            onClick={({ success }) => {
              successResponse = success
            }}
          />
          <Errors
            data-testid='in_stock_subscriptions_errors'
            resource='in_stock_subscriptions'
          />
        </InStockSubscriptionsContainer>
      </CommerceLayer>
    )
    const button = screen.getByTestId('in-stock-subscription-button')
    const buttonLabel = screen.getByTestId('button-label')
    expect(button).toBeDefined()
    expect(button?.textContent).toBe('Subscribe on click')
    expect(buttonLabel?.tagName).toBe('SPAN')
    fireEvent.click(button)
    await waitFor(async () => await screen.findByText('Subscribe on click'), {
      timeout: 5000
    })
    const errors = screen.queryByTestId('in_stock_subscriptions_errors')
    expect(errors?.textContent).toBeUndefined()
    expect(successResponse).toBe(true)
  })
  it.skip<SkusContext>('Subscribe to sku has already been taken', async (ctx) => {
    // NOTE: This test is not working because the error is not being returned from the server
    let successResponse = false
    const email = 'jacinthe.nolan10@hotmail.com'
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <InStockSubscriptionsContainer>
          <InStockSubscriptionButton
            data-testid='in-stock-subscription-button'
            skuCode={ctx.sku}
            customerEmail={email}
            show
            onClick={({ success }) => {
              successResponse = success
            }}
          />
          <Errors
            data-testid='in_stock_subscriptions_errors'
            resource='in_stock_subscriptions'
          />
        </InStockSubscriptionsContainer>
      </CommerceLayer>
    )
    const button = screen.getByTestId('in-stock-subscription-button')
    expect(button).toBeDefined()
    fireEvent.click(button)
    await waitFor(async () => await screen.findByText('Subscribe'), {
      timeout: 5000
    })
    const errors = screen.queryByTestId('in_stock_subscriptions_errors')
    expect(errors?.textContent).toBe('sku - has already been taken')
    expect(successResponse).toBe(false)
  })
})
