import AvailabilityContainer from '#components/skus/AvailabilityContainer'
import AvailabilityTemplate from '#components/skus/AvailabilityTemplate'
import CommerceLayer from '#components/auth/CommerceLayer'
import { render, screen, waitFor } from '@testing-library/react'
import { type SkusContext } from '../utils/context'
import Skus from '#components/skus/Skus'
import { SkusContainer } from '#components/skus/SkusContainer'
import SkuField from '#components/skus/SkuField'
import { getAccessToken } from 'mocks/getAccessToken'

describe('AvailabilityContainer component', () => {
  beforeEach<SkusContext>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.sku = 'BABYONBU000000E63E7412MX'
      ctx.skuId = 'wZeDdSamqn'
      ctx.skus = ['BABYONBU000000E63E7412MX', 'BABYONBU000000FFFFFF12MX']
    }
  })
  it('AvailabilityContainer outside of CommerceLayer', () => {
    expect(() =>
      render(
        <AvailabilityContainer>
          <></>
        </AvailabilityContainer>
      )
    ).toThrow('Cannot use <AvailabilityContainer/> outside of <CommerceLayer/>')
  })
  it('AvailabilityTemplate outside of AvailabilityContainer', () => {
    expect(() => render(<AvailabilityTemplate />)).toThrow(
      'Cannot use <AvailabilityTemplate/> outside of <AvailabilityContainer/>'
    )
  })
  it<SkusContext>('Show SKU availability', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuCode={ctx.sku}>
          <AvailabilityTemplate data-testid='availability-template' />
        </AvailabilityContainer>
      </CommerceLayer>
    )
    await waitFor(
      async () => await screen.findByText(`Available`, { exact: false }),
      {
        timeout: 5000
      }
    )
    const template = screen.getByTestId('availability-template')
    expect(template.textContent).toContain('Available')
  })
  it<SkusContext>('Show SKU availability by SKU Id', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuId={ctx.skuId}>
          <AvailabilityTemplate data-testid='availability-template' />
        </AvailabilityContainer>
      </CommerceLayer>
    )
    await waitFor(
      async () => await screen.findByText(`Available`, { exact: false }),
      {
        timeout: 5000
      }
    )
    const template = screen.getByTestId('availability-template')
    expect(template.textContent).toContain('Available')
  })
  it<SkusContext>('Show SKU availability with loading callback', async (ctx) => {
    const mock = vi.fn().mockImplementation((quantity: number) => {
      expect(quantity).toBeGreaterThan(0)
    })
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuCode={ctx.sku} getQuantity={mock}>
          <AvailabilityTemplate data-testid='availability-template' />
        </AvailabilityContainer>
      </CommerceLayer>
    )
    await waitFor(
      async () => await screen.findByText(`Available`, { exact: false }),
      {
        timeout: 5000
      }
    )
    expect(mock).toHaveBeenCalledTimes(1)
    const template = screen.getByTestId('availability-template')
    expect(template.textContent).toContain('Available')
  })
  it<SkusContext>('Show SKU availability with shipping method name', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuCode={ctx.sku}>
          <AvailabilityTemplate
            data-testid='availability-template'
            timeFormat='days'
            showShippingMethodName
          />
        </AvailabilityContainer>
      </CommerceLayer>
    )
    await waitFor(
      async () => await screen.findByText(`Available`, { exact: false }),
      {
        timeout: 5000
      }
    )
    const template = screen.getByTestId('availability-template')
    expect(template.textContent).toContain('Available')
    expect(template.textContent).toContain('Standard Shipping EU')
  })
  it<SkusContext>('Show SKU availability with shipping method price', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuCode={ctx.sku}>
          <AvailabilityTemplate
            data-testid='availability-template'
            timeFormat='days'
            showShippingMethodPrice
          />
        </AvailabilityContainer>
      </CommerceLayer>
    )
    await waitFor(
      async (): Promise<HTMLElement> =>
        await screen.findByText(`Available`, { exact: false }),
      {
        timeout: 5000
      }
    )
    const template = screen.getByTestId('availability-template')
    expect(template.textContent).toContain('Available')
    expect(template.textContent).toContain('5,00')
  })
  it<SkusContext>('Show SKU availability with shipping method name and price', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuCode={ctx.sku}>
          <AvailabilityTemplate
            data-testid='availability-template'
            timeFormat='days'
            showShippingMethodPrice
            showShippingMethodName
          />
        </AvailabilityContainer>
      </CommerceLayer>
    )
    await waitFor(
      async (): Promise<HTMLElement> =>
        await screen.findByText(`Available`, { exact: false }),
      {
        timeout: 5000
      }
    )
    const template = screen.getByTestId('availability-template')
    expect(template.textContent).toContain('Available')
    expect(template.textContent).toContain('Standard Shipping EU')
    expect(template.textContent).toContain('5,00')
  })
  it<SkusContext>('Show SKU availability with custom component', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuCode={ctx.sku}>
          <AvailabilityTemplate>
            {(props) => (
              <span data-testid='availability-template'>
                {props.quantity > 1 ? 'Disponibile' : 'Non disponibile'}
              </span>
            )}
          </AvailabilityTemplate>
        </AvailabilityContainer>
      </CommerceLayer>
    )
    await waitFor(async () => await screen.findByText(`Disponibile`), {
      timeout: 5000
    })
    const template = screen.getByTestId('availability-template')
    expect(template.textContent).toBe('Disponibile')
  })
  it<SkusContext>('Show SKU out of stock', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuCode='BABYONBU000000E63E746MXX'>
          <AvailabilityTemplate data-testid='availability-template' />
        </AvailabilityContainer>
      </CommerceLayer>
    )
    await waitFor(
      async (): Promise<HTMLElement> => await screen.findByText(`Out of stock`),
      {
        timeout: 5000
      }
    )
    const template = screen.getByTestId('availability-template')
    expect(template.textContent).toBe('Out of stock')
  })
  it<SkusContext>('Show twice availability using Skus components', async (ctx) => {
    const skus = ['BABYONBU000000E63E7412MX', 'BABYONBU000000E63E746MXX']
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <SkusContainer skus={skus}>
          <Skus>
            <SkuField attribute='image_url' tagElement='img' />
            <SkuField attribute='code' tagElement='p' />
            <AvailabilityContainer>
              <AvailabilityTemplate />
            </AvailabilityContainer>
          </Skus>
        </SkusContainer>
      </CommerceLayer>
    )
    for await (const sku of skus) {
      await waitFor(() => screen.getByTestId(sku))
      await waitFor(() => screen.getByTestId(`availability-${sku}`))
      const code = screen.getByTestId(sku)
      const compare = screen.getByTestId(`availability-${sku}`)
      expect(code.textContent).not.toBe('')
      expect(compare.textContent).not.toBe('')
      if (sku === skus[1]) {
        expect(compare.textContent).toBe('Out of stock')
      } else {
        expect(compare.textContent).toBe('Available')
      }
    }
  })
})
