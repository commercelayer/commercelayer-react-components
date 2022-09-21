import CommerceLayer from '#components/auth/CommerceLayer'
import PricesContainer from '#components/prices/PricesContainer'
import Price from '#components/prices/Price'
import { TestContext } from 'vitest'
import getToken from './utils/getToken'
import { render, waitFor, screen } from '@testing-library/react'

interface LocalContext extends TestContext {
  accessToken: string
  endpoint: string
  sku: string
}

describe('Prices components', () => {
  beforeEach<LocalContext>(async (ctx) => {
    const { accessToken, endpoint } = await getToken()
    if (accessToken !== undefined) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.sku = 'BABYONBU000000E63E7412MX'
    }
  })
  it<LocalContext>('Show single price', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <PricesContainer>
          <Price skuCode={ctx.sku} />
        </PricesContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitFor(() => screen.getByText('€35,00'))
    const price = screen.getByText('€35,00')
    const compare = screen.getByText('€45,00')
    // console.debug(price)
    // console.debug(compare)
    expect(price).toBeDefined()
    expect(compare).toBeDefined()
    // const tree = toJson(component)
    // console.debug('istance', tree)
  })
  it<LocalContext>('Show single price with custom loading', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <PricesContainer loader={<>Caricamento...</>}>
          <Price skuCode={ctx.sku} showCompare={false} />
        </PricesContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Caricamento...'))
  })
  it<LocalContext>('Show single price without compare price', async (ctx) => {
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
  it<LocalContext>('Show single price with compare class name', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <PricesContainer>
          <Price skuCode={ctx.sku} compareClassName="compare-class-name" />
        </PricesContainer>
      </CommerceLayer>
    )
    await waitFor(() => screen.getByTestId(`price-${ctx.sku}`))
    const price = screen.getByTestId(`price-${ctx.sku}`)
    const compare = screen.queryByTestId(`compare-${ctx.sku}`)
    expect(price).toBeDefined()
    expect(compare?.className).toBe('compare-class-name')
  })
  // it('Endpoint is empty', () => {
  //   const component = () =>
  //     renderer.create(
  //       <CommerceLayer accessToken="dasouioewuhbbc" endpoint="">
  //         <PricesContainer>
  //           <Price skuCode="BABYONBU000000E63E7412MX" />
  //         </PricesContainer>
  //       </CommerceLayer>
  //     )
  //   expect(component).toThrowError('Endpoint is required.')
  // })
  // it('Endpoint is empty', () => {
  //   const component = () =>
  //     renderer.create(
  //       <CommerceLayer accessToken="dasouioewuhbbc" endpoint="">
  //         <PricesContainer>
  //           <Price skuCode="BABYONBU000000E63E7412MX" />
  //         </PricesContainer>
  //       </CommerceLayer>
  //     )
  //   expect(component).toThrowError('Endpoint is required.')
  // })
})
