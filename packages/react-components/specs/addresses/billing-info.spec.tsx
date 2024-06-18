import CommerceLayer from '#components/auth/CommerceLayer'
import getToken from '../utils/getToken'
import { render, screen } from '@testing-library/react'
import { type LocalContext, type OrderContext } from '../utils/context'
import AddressesContainer from '#components/addresses/AddressesContainer'
import AddressInput from '#components/addresses/AddressInput'
import BillingAddressForm from '#components/addresses/BillingAddressForm'
import OrderContainer from '#components/orders/OrderContainer'
import OrderNumber from '#components/orders/OrderNumber'

describe('Billing info input', () => {
  let token: string | undefined
  let domain: string | undefined
  beforeAll(async () => {
    const { accessToken, endpoint } = await getToken('customer')
    if (accessToken !== undefined) {
      token = accessToken
      domain = endpoint
    }
  })
  beforeEach<OrderContext>(async (ctx) => {
    if (token != null && domain != null) {
      ctx.accessToken = token
      ctx.endpoint = domain
      ctx.orderId = 'wxzYheVAAY'
    }
  })
  it.skip<LocalContext>('Show billing info passing required false', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <AddressesContainer>
          <BillingAddressForm>
            <AddressInput
              data-testid='billing-info'
              name='billing_address_billing_info'
              required={false}
            />
          </BillingAddressForm>
        </AddressesContainer>
      </CommerceLayer>
    )
    const billingInfo = screen.getByTestId('billing-info')
    expect(billingInfo).toBeDefined()
  })
  it.skip<OrderContext>('Show billing info if requires_billing_info is true', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer orderId={ctx.orderId}>
          <OrderNumber />
          <AddressesContainer>
            <BillingAddressForm>
              <AddressInput
                data-testid='billing-info'
                name='billing_address_billing_info'
              />
            </BillingAddressForm>
          </AddressesContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    await screen.findByText('2454728')
    const billingInfo = screen.getByTestId('billing-info')
    expect(billingInfo).toBeDefined()
  })
  it.skip<OrderContext>('Hide billing info if requires_billing_info is false and required is undefined', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer orderId={ctx.orderId}>
          <OrderNumber />
          <AddressesContainer>
            <BillingAddressForm>
              <AddressInput
                data-testid='billing-info'
                name='billing_address_billing_info'
              />
            </BillingAddressForm>
          </AddressesContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    const billingInfo = screen.queryByTestId('billing-info')
    expect(billingInfo).toBeNull()
  })
})
