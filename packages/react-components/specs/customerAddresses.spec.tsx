import CommerceLayer from '#components/auth/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import Address from '#components/addresses/Address'
import AddressesContainer from '#components/addresses/AddressesContainer'
import AddressesEmpty from '#components/addresses/AddressesEmpty'
import AddressField from '#components/addresses/AddressField'
import { render, screen, waitFor } from '@testing-library/react'
import { LocalContext } from './utils/context'
import getToken from './utils/getToken'

describe('Customer addresses', () => {
  beforeEach<LocalContext>(async (ctx) => {
    const { accessToken, endpoint } = await getToken('customer')
    if (accessToken !== undefined) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
    }
  })
  it<LocalContext>('Show customer addresses', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <AddressesContainer>
            <AddressesEmpty />
            <Address>
              <AddressField name='first_name' />
              <AddressField name='last_name' />
            </Address>
          </AddressesContainer>
        </CustomerContainer>
      </CommerceLayer>
    )
    await waitFor(() => screen.getAllByTestId(`address-field-first_name`))
    const [firstName] = screen.getAllByTestId(`address-field-first_name`)
    expect(firstName).toBeDefined()
    const [lastName] = screen.getAllByTestId(`address-field-last_name`)
    expect(lastName).toBeDefined()
  })
  it<LocalContext>('Show customer addresses empty', async (ctx) => {
    const { accessToken, endpoint } = await getToken('customer_empty')
    if (accessToken !== undefined) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
    }
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <AddressesContainer>
            <AddressesEmpty />
            <Address>
              <AddressField name='first_name' />
              <AddressField name='last_name' />
            </Address>
          </AddressesContainer>
        </CustomerContainer>
      </CommerceLayer>
    )
    await waitFor(() => screen.getByTestId(`addresses-empty`))
    const empty = screen.getByTestId(`addresses-empty`)
    expect(empty).toBeDefined()
    expect(empty.textContent).not.toBe('')
    expect(empty.textContent).toContain('No addresses available')
  })
  it<LocalContext>('Show customer addresses empty with custom component', async (ctx) => {
    const { accessToken, endpoint } = await getToken('customer_empty')
    if (accessToken !== undefined) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
    }
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <AddressesContainer>
            <AddressesEmpty>
              {() => <>There are not addresses available</>}
            </AddressesEmpty>
            <Address>
              <AddressField name='first_name' />
              <AddressField name='last_name' />
            </Address>
          </AddressesContainer>
        </CustomerContainer>
      </CommerceLayer>
    )
    await waitFor(() => screen.getByText('There are not addresses available'))
    expect(screen.getByText('There are not addresses available')).toBeDefined()
  })
})
