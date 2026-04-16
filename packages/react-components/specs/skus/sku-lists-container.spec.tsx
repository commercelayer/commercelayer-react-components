import CommerceLayer from '#components/auth/CommerceLayer'
import { SkuList } from '#components/skus/SkuList'
import { SkuListsContainer } from '#components/skus/SkuListsContainer'
import SkuListsContext from '#context/SkuListsContext'
import { getAccessToken } from 'mocks/getAccessToken'
import { render, screen, waitFor } from '@testing-library/react'
import { createElement, useContext, type ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { type SkuListsContext as SkuListsCtx } from '../utils/context'
import { getSkuLists } from '@commercelayer/core'

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

function SkuListsInspector({
  onCapture
}: {
  onCapture: (v: Record<string, unknown>) => void
}) {
  const { skuLists } = useContext(SkuListsContext)
  onCapture(skuLists)
  return null
}

describe('SkuListsContainer component', () => {
  beforeEach<SkuListsCtx>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      const lists = await getSkuLists({ accessToken, params: { pageSize: 1 } })
      ctx.skuListId = lists.first()?.id ?? ''
    }
  })

  it<SkuListsCtx>('renders children inside SkuListsContainer', (ctx) => {
    const { container } = render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <SkuListsContainer>
          <div data-testid='child'>content</div>
        </SkuListsContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })

  it<SkuListsCtx>('registers a SkuList id and renders its children', async (ctx) => {
    if (!ctx.skuListId) return
    render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <SkuListsContainer>
          <SkuList id={ctx.skuListId}>
            <span data-testid={`list-${ctx.skuListId}`}>item</span>
          </SkuList>
        </SkuListsContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    await waitFor(
      () => expect(screen.getByTestId(`list-${ctx.skuListId}`)).toBeTruthy(),
      { timeout: 5000 }
    )
    expect(screen.getByTestId(`list-${ctx.skuListId}`).textContent).toBe('item')
  })

  it<SkuListsCtx>('fetches sku list and populates skuLists in context', async (ctx) => {
    if (!ctx.skuListId) return
    let captured: Record<string, unknown> = {}
    render(
      <CommerceLayer accessToken={ctx.accessToken}>
        <SkuListsContainer>
          <SkuList id={ctx.skuListId}>
            <span />
          </SkuList>
          <SkuListsInspector onCapture={(v) => { captured = v }} />
        </SkuListsContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    await waitFor(
      () => expect(Object.keys(captured)).toContain(ctx.skuListId),
      { timeout: 10000 }
    )
    expect(Array.isArray(captured[ctx.skuListId])).toBe(true)
  })
})
