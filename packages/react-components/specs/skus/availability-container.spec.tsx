import CommerceLayer from '#components/auth/CommerceLayer'
import { AvailabilityContainer } from '#components/skus/AvailabilityContainer'
import { AvailabilityTemplate } from '#components/skus/AvailabilityTemplate'
import AvailabilityContext from '#context/AvailabilityContext'
import { getAccessToken } from 'mocks/getAccessToken'
import { render, screen, waitFor } from '@testing-library/react'
import { createElement, useContext, type ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { type AvailabilityContext as AvailabilityCtx } from '../utils/context'

const swrWrapper = ({ children }: { children: ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children)

function AvailabilityInspector({
  onCapture
}: {
  onCapture: (quantity: number | undefined) => void
}) {
  const { quantity } = useContext(AvailabilityContext)
  onCapture(quantity)
  return null
}

describe('AvailabilityContainer component', () => {
  beforeEach<AvailabilityCtx>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken()
    if (accessToken != null && endpoint != null) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      ctx.skuCode = 'BABYONBU000000E63E7412MX'
    }
  })

  it<AvailabilityCtx>('renders children', (ctx) => {
    const { container } = render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuCode={ctx.skuCode}>
          <span data-testid='child'>availability</span>
        </AvailabilityContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    expect(container.querySelector('[data-testid="child"]')).not.toBeNull()
  })

  it<AvailabilityCtx>('fetches availability and exposes quantity in context', async (ctx) => {
    let capturedQty: number | undefined
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuCode={ctx.skuCode}>
          <AvailabilityInspector onCapture={(q) => { capturedQty = q }} />
        </AvailabilityContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    await waitFor(
      () => expect(capturedQty).toBeDefined(),
      { timeout: 10000 }
    )
    expect(typeof capturedQty).toBe('number')
  })

  it<AvailabilityCtx>('renders AvailabilityTemplate with available or out-of-stock text', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuCode={ctx.skuCode}>
          <AvailabilityTemplate
            labels={{ available: 'Available', outOfStock: 'Out of stock' }}
          />
        </AvailabilityContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    await waitFor(
      () => {
        const span = screen.getByTestId(`availability-${ctx.skuCode}`)
        expect(span.textContent).toMatch(/Available|Out of stock/)
      },
      { timeout: 10000 }
    )
  })

  it<AvailabilityCtx>('calls getQuantity callback when quantity is fetched', async (ctx) => {
    const onQuantity = vi.fn()
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer skuCode={ctx.skuCode} getQuantity={onQuantity}>
          <span />
        </AvailabilityContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    await waitFor(
      () => expect(onQuantity).toHaveBeenCalledWith(expect.any(Number)),
      { timeout: 10000 }
    )
  })

  it<AvailabilityCtx>('renders nothing meaningful when skuCode is empty', (ctx) => {
    const { container } = render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AvailabilityContainer>
          <AvailabilityTemplate />
        </AvailabilityContainer>
      </CommerceLayer>,
      { wrapper: swrWrapper }
    )
    const spans = container.querySelectorAll('span')
    spans.forEach((span) => {
      expect(span.textContent).toBe('')
    })
  })
})
