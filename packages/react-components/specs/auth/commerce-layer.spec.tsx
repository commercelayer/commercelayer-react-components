import CommerceLayer from '#components/auth/CommerceLayer'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { render, screen } from '@testing-library/react'
import { useContext } from 'react'

function ContextInspector({
  onContext
}: {
  onContext: (ctx: ReturnType<typeof useContext<typeof CommerceLayerContext>>) => void
}) {
  const ctx = useContext(CommerceLayerContext)
  onContext(ctx)
  return null
}

function makeFakeToken(slug: string): string {
  const header = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
  const payload = btoa(JSON.stringify({ organization: { slug } }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${header}.${payload}.fakesig`
}

describe('CommerceLayer component', () => {
  it('renders children', () => {
    render(
      <CommerceLayer accessToken='fake' endpoint='https://test.commercelayer.io'>
        <span data-testid='child'>hello</span>
      </CommerceLayer>
    )
    expect(screen.getByTestId('child').textContent).toBe('hello')
  })

  it('provides accessToken and endpoint to context', () => {
    let captured: { accessToken?: string; endpoint?: string } = {}
    render(
      <CommerceLayer accessToken='my-token' endpoint='https://explicit.commercelayer.io'>
        <ContextInspector onContext={(ctx) => { captured = ctx }} />
      </CommerceLayer>
    )
    expect(captured.accessToken).toBe('my-token')
    expect(captured.endpoint).toBe('https://explicit.commercelayer.io')
  })

  it('derives endpoint from JWT when endpoint is not provided', () => {
    const token = makeFakeToken('my-org')
    let captured: { endpoint?: string } = {}
    render(
      <CommerceLayer accessToken={token}>
        <ContextInspector onContext={(ctx) => { captured = ctx }} />
      </CommerceLayer>
    )
    expect(captured.endpoint).toBe('https://my-org.commercelayer.io')
  })

  it('uses custom domain with JWT-derived endpoint', () => {
    const token = makeFakeToken('my-org')
    let captured: { endpoint?: string } = {}
    render(
      <CommerceLayer accessToken={token} domain='custom.domain.io'>
        <ContextInspector onContext={(ctx) => { captured = ctx }} />
      </CommerceLayer>
    )
    expect(captured.endpoint).toBe('https://my-org.custom.domain.io')
  })

  it('re-renders with same props (cache-hit path)', () => {
    const child = <span data-testid='stable-child'>stable</span>
    const { rerender } = render(
      <CommerceLayer accessToken='my-token' endpoint='https://explicit.commercelayer.io'>
        {child}
      </CommerceLayer>
    )
    rerender(
      <CommerceLayer accessToken='my-token' endpoint='https://explicit.commercelayer.io'>
        {child}
      </CommerceLayer>
    )
    expect(screen.getByTestId('stable-child').textContent).toBe('stable')
  })
})
