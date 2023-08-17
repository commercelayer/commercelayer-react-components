import CommerceLayer from '#components/auth/CommerceLayer'
import OrderContainer from '#components/orders/OrderContainer'
import ParcelField from '#components/parcels/ParcelField'
import ParcelLineItem from '#components/parcels/ParcelLineItem'
import { ParcelLineItemField } from '#components/parcels/ParcelLineItemField'
import Parcels from '#components/parcels/Parcels'
import { ParcelsCount } from '#components/parcels/ParcelsCount'
import { ParcelLineItemsCount } from '#components/parcels/ParcelLineItemsCount'
import Shipment from '#components/shipments/Shipment'
import ShipmentField from '#components/shipments/ShipmentField'
import ShipmentsContainer from '#components/shipments/ShipmentsContainer'
import ShipmentsCount from '#components/shipments/ShipmentsCount'
import {
  render,
  screen,
  waitForElementToBeRemoved
} from '@testing-library/react'
import { type LocalContext } from '../utils/context'
import { getAccessToken } from 'mocks/getAccessToken'

interface ParcelContext extends LocalContext {
  orderId: string
}

describe('Parcels components', () => {
  beforeEach<ParcelContext>(async (ctx) => {
    const { accessToken, endpoint } = await getAccessToken('customer')
    if (accessToken != null && endpoint != null) {
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
              <ShipmentsCount data-testid='shipments-count' />
              <ShipmentField data-testid='shipment-number' name='key_number' />
              <ParcelsCount data-testid='parcels-count' />
              <Parcels>
                <ParcelLineItemsCount data-testid='parcel-line-items-count' />
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
    const shipmentsCount = screen.getByTestId(`shipments-count`)
    expect(shipmentsCount).toBeDefined()
    expect(shipmentsCount.textContent).not.toBe('')
    const parcelsCount = screen.getByTestId(`parcels-count`)
    expect(parcelsCount).toBeDefined()
    expect(parcelsCount.textContent).not.toBe('')
    const parcelLineItemsCount = screen.getByTestId(`parcel-line-items-count`)
    expect(parcelLineItemsCount).toBeDefined()
    expect(parcelLineItemsCount.textContent).not.toBe('')
    const parcel = screen.getByTestId(`parcel-number`)
    expect(parcel).toBeDefined()
    expect(parcel.tagName).toBe('SPAN')
    expect(parcel.textContent).not.toBe('')
  })
  it<ParcelContext>('Show a parcel by a filter', async (ctx) => {
    render(
      <CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
        <OrderContainer orderId={ctx.orderId}>
          <ShipmentsContainer>
            <Shipment>
              <ShipmentsCount>
                {(props) => (
                  <span data-testid='shipments-count'>
                    {props.shipments?.length ?? 0}
                  </span>
                )}
              </ShipmentsCount>
              <ShipmentField data-testid='shipment-number' name='key_number' />
              <Parcels filterBy={['jezvyfrVeK']}>
                <ParcelsCount data-testid='parcels-count' />
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
    const shipmentsCount = screen.getByTestId(`shipments-count`)
    expect(shipmentsCount).toBeDefined()
    expect(shipmentsCount.textContent).not.toBe('')
    const parcelsCount = screen.getByTestId(`parcels-count`)
    expect(parcelsCount).toBeDefined()
    expect(parcelsCount.textContent).not.toBe('')
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
              <ParcelsCount>
                {(props) => <>{props.parcels?.length ?? 0}</>}
              </ParcelsCount>
              <Parcels>
                <ParcelLineItemsCount>
                  {(props) => (
                    <span data-testid='parcel-line-items-count'>
                      {props.parcel?.parcel_line_items?.length ?? 0}
                    </span>
                  )}
                </ParcelLineItemsCount>
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
    const parcelLineItemsCount = screen.getByTestId(`parcel-line-items-count`)
    expect(parcelLineItemsCount).toBeDefined()
    expect(parcelLineItemsCount.textContent).not.toBe('')
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
              <ParcelsCount data-testid='parcels-count' />
              <Parcels>
                <ParcelLineItemsCount />
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
    const parcelsCount = screen.queryByTestId('parcels-count')
    expect(parcelsCount).toBeDefined()
    expect(parcelsCount?.textContent).toBe('0')
    const parcels = screen.queryByTestId('parcel-number')
    expect(parcels).toBeNull()
  })
  it<ParcelContext>('ParcelsCount outside of ShipmentsContainer', () => {
    expect(() => render(<ParcelsCount />)).toThrow(
      'Cannot use <ParcelsCount/> outside of <ShipmentsContainer/>'
    )
  })
  it<ParcelContext>('ShipmentsCount outside of ShipmentsContainer', () => {
    expect(() => render(<ShipmentsCount />)).toThrow(
      'Cannot use <ShipmentsCount/> outside of <ShipmentsContainer/>'
    )
  })
  it<ParcelContext>('ParcelLineItemsCount outside of Parcels', () => {
    expect(() => render(<ParcelLineItemsCount />)).toThrow(
      'Cannot use <ParcelLineItemsCount/> outside of <Parcels/>'
    )
  })
})
