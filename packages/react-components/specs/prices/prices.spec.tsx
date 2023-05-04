import CommerceLayer from '#components/auth/CommerceLayer'
import PricesContainer from '#components/prices/PricesContainer'
import Price from '#components/prices/Price'
import { render, waitFor, screen } from '@testing-library/react'
import SkusContainer from '#components/skus/SkusContainer'
import Skus from '#components/skus/Skus'
import SkuField from '#components/skus/SkuField'
import { type SkusContext } from '../utils/context'
import { getAccessToken } from 'mocks/getAccessToken'

describe('Prices components', () => {
  beforeEach<SkusContext>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.sku = 'BABYONBU000000E63E7412MX'
      ctx.skus = ['BABYONBU000000E63E7412MX', 'BABYONBU000000FFFFFF12MX']
    }
  })
  it<SkusContext>('Show single price', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <PricesContainer>
          <Price skuCode={ctx.sku} />
        </PricesContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitFor(() => screen.getByTestId(`price-${ctx.sku}`))
    const price = screen.getByTestId(`price-${ctx.sku}`)
    const compare = screen.queryByTestId(`compare-${ctx.sku}`)
    expect(price.textContent).not.toBe('')
    expect(compare?.textContent).not.toBe('')
  })
  it<SkusContext>('Show single price with custom loading', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <PricesContainer loader={<>Caricamento...</>}>
          <Price skuCode={ctx.sku} showCompare={false} />
        </PricesContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Caricamento...'))
  })
  it<SkusContext>('Show single price without compare price', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <PricesContainer>
          <Price skuCode={ctx.sku} showCompare={false} />
        </PricesContainer>
      </CommerceLayer>
    )
    await waitFor(() => screen.getByTestId(`price-${ctx.sku}`))
    const price = screen.getByTestId(`price-${ctx.sku}`)
    const compare = screen.queryByTestId(`compare-${ctx.sku}`)
    expect(price).toBeDefined()
    expect(compare).toBeNull()
  })
  it<SkusContext>('Show single price with compare class name', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <PricesContainer>
          <Price skuCode={ctx.sku} compareClassName='compare-class-name' />
        </PricesContainer>
      </CommerceLayer>
    )
    await waitFor(() => screen.getByTestId(`price-${ctx.sku}`))
    const price = screen.getByTestId(`price-${ctx.sku}`)
    const compare = screen.queryByTestId(`compare-${ctx.sku}`)
    expect(price).toBeDefined()
    expect(compare?.className).toBe('compare-class-name')
  })
  it<SkusContext>('Show single price with skuCode on Price container', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <PricesContainer skuCode={ctx.sku}>
          <Price />
        </PricesContainer>
      </CommerceLayer>
    )
    await waitFor(() => screen.getByTestId(`price-${ctx.sku}`))
    const price = screen.getByTestId(`price-${ctx.sku}`)
    const compare = screen.queryByTestId(`compare-${ctx.sku}`)
    expect(price.textContent).not.toBe('')
    expect(compare?.textContent).not.toBe('')
  })
  it<SkusContext>('Show twice prices', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <PricesContainer>
          {ctx.skus.map((sku, index) => (
            <Price key={index} skuCode={sku} />
          ))}
        </PricesContainer>
      </CommerceLayer>
    )
    for await (const sku of ctx.skus) {
      await waitFor(() => screen.getByTestId(`price-${sku}`))
      const price = screen.getByTestId(`price-${sku}`)
      const compare = screen.queryByTestId(`compare-${sku}`)
      expect(price.textContent).not.toBe('')
      expect(compare?.textContent).not.toBe('')
    }
  })
  it<SkusContext>('Show twice prices using Skus components', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <SkusContainer skus={ctx.skus}>
          <Skus>
            <SkuField attribute='image_url' tagElement='img' />
            <SkuField attribute='code' tagElement='p' />
            <PricesContainer>
              <Price />
            </PricesContainer>
          </Skus>
        </SkusContainer>
      </CommerceLayer>
    )
    for await (const sku of ctx.skus) {
      await waitFor(() => screen.getByTestId(`price-${sku}`))
      const price = screen.getByTestId(`price-${sku}`)
      const compare = screen.queryByTestId(`compare-${sku}`)
      expect(price.textContent).not.toBe('')
      expect(compare?.textContent).not.toBe('')
    }
  })
})
