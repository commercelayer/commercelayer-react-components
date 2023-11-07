import CommerceLayer from '#components/auth/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import CustomerPaymentSource from '#components/customers/CustomerPaymentSource'
import CustomerPaymentSourceEmpty from '#components/customers/CustomerPaymentSourceEmpty'
import PaymentSourceBrandIcon from '#components/payment_source/PaymentSourceBrandIcon'
import PaymentSourceBrandName from '#components/payment_source/PaymentSourceBrandName'
import PaymentSourceDetail from '#components/payment_source/PaymentSourceDetail'
import {
  render,
  screen,
  waitForElementToBeRemoved
} from '@testing-library/react'
import { type LocalContext } from '../utils/context'
import getToken from '../utils/getToken'

describe('Customer payments', () => {
  let token: string | undefined
  let domain: string | undefined
  const timeout = 10000
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
  it<LocalContext>('CustomerPaymentSource outside of CustomerContainer', (ctx) => {
    expect(() =>
      render(
        <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
          <CustomerPaymentSource />
        </CommerceLayer>
      )
    ).toThrow(
      'Cannot use <CustomerPaymentSource/> outside of <CustomerContainer/>'
    )
  })
  it<LocalContext>(
    'Show customer payment sources',
    async (ctx) => {
      render(
        <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
          <CustomerContainer>
            <CustomerPaymentSource>
              <PaymentSourceBrandIcon data-testid='payment-source-brand-icon' />
              <PaymentSourceBrandName data-testid='payment-source-brand-name' />
              <PaymentSourceDetail
                type='last4'
                data-testid='payment-source-last4'
              />
              <PaymentSourceDetail
                type='exp_month'
                data-testid='payment-source-exp-month'
              />
              <PaymentSourceDetail
                type='exp_year'
                data-testid='payment-source-exp-year'
              />
            </CustomerPaymentSource>
          </CustomerContainer>
        </CommerceLayer>
      )
      expect(screen.getByText('Loading...'))
      await waitForElementToBeRemoved(() => screen.getByText('Loading...'), {
        timeout
      })
      const brandIcons = screen.getAllByTestId('payment-source-brand-icon')
      const brandNames = screen.getAllByTestId('payment-source-brand-name')
      const last4Numbers = screen.getAllByTestId('payment-source-last4')
      const expMonthNumbers = screen.getAllByTestId('payment-source-exp-month')
      const expYearNumbers = screen.getAllByTestId('payment-source-exp-year')
      for (const brandIcon of brandIcons) {
        expect(brandIcon).toBeDefined()
        expect(brandIcon?.getAttribute('src')).toBeDefined()
      }
      for (const brandName of brandNames) {
        expect(brandName).toBeDefined()
        expect(brandName?.textContent).not.toBe('')
      }
      for (const last4 of last4Numbers) {
        expect(last4).toBeDefined()
        expect(last4?.textContent).not.toBe('')
        expect(last4?.textContent).toMatch(/[0-9]{4}|[*]{4}/gm)
      }
      for (const expMonth of expMonthNumbers) {
        expect(expMonth).toBeDefined()
        expect(expMonth?.textContent).not.toBe('')
      }
      for (const expYear of expYearNumbers) {
        expect(expYear).toBeDefined()
        expect(expYear?.textContent).not.toBe('')
      }
    },
    { timeout }
  )
  it<LocalContext>('Show customer payment sources empty', async (ctx) => {
    const { accessToken, endpoint } = await getToken('customer_empty')
    if (accessToken !== undefined) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
    }
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <CustomerPaymentSourceEmpty />
          <CustomerPaymentSource />
        </CustomerContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    expect(screen.queryByText('No payments available')).toBeNull()
    await waitForElementToBeRemoved(() => screen.getByText('Loading...'))
    expect(screen.getByText('No payments available'))
  })
  it<LocalContext>('Show customer payment sources empty with custom component', async (ctx) => {
    const { accessToken, endpoint } = await getToken('customer_empty')
    if (accessToken !== undefined) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
    }
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <CustomerContainer>
          <CustomerPaymentSourceEmpty>
            {() => {
              return <span>Nessun pagamento disponibile</span>
            }}
          </CustomerPaymentSourceEmpty>
          <CustomerPaymentSource loader={<>Caricamento...</>} />
        </CustomerContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Caricamento...'))
    expect(screen.queryByText('Nessun pagamento disponibile')).toBeNull()
    await waitForElementToBeRemoved(() => screen.getByText('Caricamento...'))
    expect(screen.getByText('Nessun pagamento disponibile'))
  })
  it<LocalContext>(
    'Show customer payment sources with custom component',
    async (ctx) => {
      render(
        <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
          <CustomerContainer>
            <CustomerPaymentSource loader={<>Caricamento...</>}>
              <PaymentSourceBrandIcon>
                {({ url, brand }) => {
                  return (
                    <img
                      alt={brand}
                      src={url}
                      data-testid='payment-source-brand-icon'
                    />
                  )
                }}
              </PaymentSourceBrandIcon>
              <PaymentSourceBrandName>
                {({ brand }) => {
                  return (
                    <span data-testid='payment-source-brand-name'>{brand}</span>
                  )
                }}
              </PaymentSourceBrandName>
              <PaymentSourceDetail type='last4'>
                {({ text }) => {
                  return <span data-testid='payment-source-last4'>{text}</span>
                }}
              </PaymentSourceDetail>
            </CustomerPaymentSource>
          </CustomerContainer>
        </CommerceLayer>
      )
      expect(screen.getByText('Caricamento...'))
      await waitForElementToBeRemoved(
        () => screen.getByText('Caricamento...'),
        {
          timeout
        }
      )
      const [brandIcon] = screen.getAllByTestId('payment-source-brand-icon')
      const [brandName] = screen.getAllByTestId('payment-source-brand-name')
      const [last4] = screen.getAllByTestId('payment-source-last4')
      expect(brandIcon).toBeDefined()
      expect(brandIcon?.getAttribute('src')).toBeDefined()
      expect(brandName).toBeDefined()
      expect(brandName?.textContent).not.toBe('')
      expect(last4).toBeDefined()
      expect(last4?.textContent).not.toBe('')
    },
    { timeout }
  )
})
