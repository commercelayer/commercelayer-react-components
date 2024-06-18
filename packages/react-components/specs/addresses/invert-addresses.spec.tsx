import CommerceLayer from '#components/auth/CommerceLayer'
import getToken from '../utils/getToken'
import { render, screen } from '@testing-library/react'
import { type OrderContext } from '../utils/context'
import AddressesContainer from '#components/addresses/AddressesContainer'
import AddressInput from '#components/addresses/AddressInput'
import ShippingAddressForm from '#components/addresses/ShippingAddressForm'
import AddressCountrySelector from '#components/addresses/AddressCountrySelector'
import AddressStateSelector from '#components/addresses/AddressStateSelector'
import OrderContainer from '#components/orders/OrderContainer'
import OrderNumber from '#components/orders/OrderNumber'

describe('Billing info input', () => {
  let token: string | undefined
  let domain: string | undefined
  beforeAll(async () => {
    const { accessToken, endpoint } = await getToken()
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
  it.skip<OrderContext>('Use shipping address as billing address', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer orderId={ctx.orderId}>
          <OrderNumber />
          <AddressesContainer invertAddresses>
            <ShippingAddressForm>
              <AddressInput
                data-testid='first-name'
                name='shipping_address_first_name'
              />
              <AddressInput
                data-testid='last-name'
                name='shipping_address_last_name'
              />
              <AddressInput
                data-testid='line-1'
                name='shipping_address_line_1'
              />
              <AddressInput
                data-testid='line-2'
                name='shipping_address_line_2'
              />
              <AddressInput data-testid='city' name='shipping_address_city' />
              <AddressCountrySelector
                data-testid='country-code'
                name='shipping_address_country_code'
              />
              <AddressStateSelector
                data-testid='state-code'
                name='shipping_address_state_code'
              />
              <AddressInput
                data-testid='zip-code'
                name='shipping_address_zip_code'
              />
              <AddressInput data-testid='phone' name='shipping_address_phone' />
              <AddressInput
                data-testid='billing-info'
                name='shipping_address_billing_info'
              />
            </ShippingAddressForm>
          </AddressesContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    await screen.findByText('2454728')
    const firstName = screen.getByTestId('first-name')
    const lastName = screen.getByTestId('last-name')
    const line1 = screen.getByTestId('line-1')
    const line2 = screen.getByTestId('line-2')
    const city = screen.getByTestId('city')
    const countryCode = screen.getByTestId('country-code')
    const stateCode = screen.getByTestId('state-code')
    const zipCode = screen.getByTestId('zip-code')
    const phone = screen.getByTestId('phone')
    const billingInfo = screen.getByTestId('billing-info')
    expect(firstName).toBeDefined()
    expect(lastName).toBeDefined()
    expect(line1).toBeDefined()
    expect(line2).toBeDefined()
    expect(city).toBeDefined()
    expect(countryCode).toBeDefined()
    expect(stateCode).toBeDefined()
    expect(zipCode).toBeDefined()
    expect(phone).toBeDefined()
    expect(billingInfo).toBeDefined()
  })
  // it<OrderContext>('Hide billing info if requires_billing_info is false and required is undefined', async (ctx) => {
  //   render(
  //     <CommerceLayer accessToken={ctx.accessToken}>
  //       <OrderContainer orderId={ctx.orderId}>
  //         <OrderNumber />
  //         <AddressesContainer>
  //           <BillingAddressForm>
  //             <AddressInput
  //               data-testid='billing-info'
  //               name='billing_address_billing_info'
  //             />
  //           </BillingAddressForm>
  //         </AddressesContainer>
  //       </OrderContainer>
  //     </CommerceLayer>
  //   )
  //   const billingInfo = screen.queryByTestId('billing-info')
  //   expect(billingInfo).toBeNull()
  // })
})
