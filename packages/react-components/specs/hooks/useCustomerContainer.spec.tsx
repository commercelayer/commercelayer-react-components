import CommerceLayer from '#components/auth/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import { render, renderHook, waitFor, screen } from '@testing-library/react'
import { useEffect, useState } from 'react'
import { type LocalContext } from 'specs/utils/context'
import getToken from '../utils/getToken'
import useCustomerContainer from '#hooks/useCustomerContainer'

function HookComponent(): JSX.Element {
  const customerCtx = useCustomerContainer()
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (customerCtx.addresses != null) {
      setLoaded(true)
    }
    if (customerCtx.customers != null) {
      setLoaded(true)
    }
  }, [customerCtx.addresses])
  if (loaded) {
    return <>loaded</>
  }
  return <>Hook component</>
}

describe('useCustomerContainer hook', () => {
  let token: string | undefined
  let domain: string | undefined
  beforeAll(async () => {
    const { accessToken, endpoint } = await getToken('customer')
    if (accessToken !== undefined) {
      token = accessToken
      domain = endpoint
    }
  })
  beforeEach<LocalContext>(async (ctx) => {
    if (token != null && domain != null) {
      ctx.accessToken = token
      ctx.endpoint = domain
    }
  })
  it('useCustomerContainer outside of CustomerContainer', () => {
    expect(() => renderHook(() => useCustomerContainer())).toThrow(
      'Cannot use `useCustomerContainer` outside of <CustomerContainer/>'
    )
  })
  it<LocalContext>('Load customer data by hook', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <HookComponent />
        </CustomerContainer>
      </CommerceLayer>
    )
    await waitFor(async () => await screen.findByText('loaded'), {
      timeout: 5000
    })
    const addressesLoaded = screen.getByText('loaded')
    expect(addressesLoaded.textContent).toEqual('loaded')
  })
})
