import CommerceLayer from '#components/auth/CommerceLayer'
import OrderContainer from '#components/orders/OrderContainer'
import ParcelField from '#components/parcels/ParcelField'
import ParcelLineItem from '#components/parcels/ParcelLineItem'
import { ParcelLineItemField } from '#components/parcels/ParcelLineItemField'
import Parcels from '#components/parcels/Parcels'
import Shipment from '#components/shipments/Shipment'
import ShipmentField from '#components/shipments/ShipmentField'
import ShipmentsContainer from '#components/shipments/ShipmentsContainer'
import {
  render,
  screen,
  waitForElementToBeRemoved
} from '@testing-library/react'
import { LocalContext } from './utils/context'
import getToken from './utils/getToken'

interface ParcelContext extends LocalContext {
  orderId: string
}

describe('Parcels components', () => {
  beforeEach<ParcelContext>(async (ctx) => {
    const { accessToken, endpoint } = await getToken('customer')
    if (accessToken !== undefined) {
      ctx.accessToken = accessToken
      ctx.endpoint = endpoint
      // TODO: create a new one in the future
      ctx.orderId = 'NrnYhAdEkx'
    }
  })
  it<ParcelContext>('Show a parcel', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer orderId={ctx.orderId}>
          <ShipmentsContainer>
            <Shipment>
              <ShipmentField data-testid='shipment-number' name='key_number' />
              <Parcels>
                <ParcelField
                  data-testid='parcel-number'
                  attribute='number'
                  tagElement='span'
                />
              </Parcels>
            </Shipment>
          </ShipmentsContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), {
      timeout: 5000
    })
    expect(screen.getByTestId(`shipment-number`)).toBeDefined()
    const parcel = screen.getByTestId(`parcel-number`)
    expect(parcel).toBeDefined()
    expect(parcel.tagName).toBe('SPAN')
    expect(parcel.textContent).not.toBe('')
  })
  it<ParcelContext>('Show a parcel with parcel line items', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer orderId={ctx.orderId}>
          <ShipmentsContainer>
            <Shipment>
              <ShipmentField data-testid='shipment-number' name='key_number' />
              <Parcels>
                <ParcelField attribute='number' tagElement='span' />
                <ParcelLineItem>
                  <ParcelLineItemField
                    data-testid='parcel-line-item-sku-code'
                    tagElement='p'
                    attribute='sku_code'
                  />
                  <ParcelLineItemField
                    data-testid='parcel-line-item-image-url'
                    tagElement='img'
                    attribute='image_url'
                  />
                </ParcelLineItem>
              </Parcels>
            </Shipment>
          </ShipmentsContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), {
      timeout: 5000
    })
    expect(screen.getByTestId(`shipment-number`)).toBeDefined()
    const parcelLineItemSku = screen.getByTestId(`parcel-line-item-sku-code`)
    expect(parcelLineItemSku).toBeDefined()
    expect(parcelLineItemSku.tagName).toBe('P')
    expect(parcelLineItemSku.textContent).not.toBe('')
    const parcelLineItemImage = screen.getByTestId(`parcel-line-item-image-url`)
    expect(parcelLineItemImage).toBeDefined()
    expect(parcelLineItemImage.tagName).toBe('IMG')
    expect(parcelLineItemImage.getAttribute('href')).not.toBe('')
  })
  it<ParcelContext>('Show a parcel with parcel line items', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer orderId={ctx.orderId}>
          <ShipmentsContainer>
            <Shipment>
              <ShipmentField data-testid='shipment-number' name='key_number' />
              <Parcels>
                <ParcelField attribute='number' tagElement='span' />
                <ParcelLineItem>
                  <ParcelLineItemField
                    data-testid='parcel-line-item-sku-code'
                    tagElement='p'
                    attribute='sku_code'
                  />
                  <ParcelLineItemField
                    data-testid='parcel-line-item-image-url'
                    tagElement='img'
                    attribute='image_url'
                  />
                </ParcelLineItem>
              </Parcels>
            </Shipment>
          </ShipmentsContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), {
      timeout: 5000
    })
    expect(screen.getByTestId(`shipment-number`)).toBeDefined()
    const parcelLineItemSku = screen.getByTestId(`parcel-line-item-sku-code`)
    expect(parcelLineItemSku).toBeDefined()
    expect(parcelLineItemSku.tagName).toBe('P')
    expect(parcelLineItemSku.textContent).not.toBe('')
    const parcelLineItemImage = screen.getByTestId(`parcel-line-item-image-url`)
    expect(parcelLineItemImage).toBeDefined()
    expect(parcelLineItemImage.tagName).toBe('IMG')
    expect(parcelLineItemImage.getAttribute('href')).not.toBe('')
  })
  it<ParcelContext>('Show empty parcels', async (ctx) => {
    ctx.orderId = 'qXQehvzyxx'
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer orderId={ctx.orderId}>
          <ShipmentsContainer>
            <Shipment>
              <ShipmentField data-testid='shipment-number' name='key_number' />
              <Parcels>
                <ParcelField
                  data-testid='parcel-number'
                  attribute='number'
                  tagElement='span'
                />
              </Parcels>
            </Shipment>
          </ShipmentsContainer>
        </OrderContainer>
      </CommerceLayer>
    )
    expect(screen.getByText('Loading...'))
    await waitForElementToBeRemoved(() => screen.queryByText('Loading...'), {
      timeout: 5000
    })
    expect(screen.getByTestId(`shipment-number`)).toBeDefined()
    const parcels = screen.queryByTestId('parcel-number')
    expect(parcels).toBeNull()
  })
})
