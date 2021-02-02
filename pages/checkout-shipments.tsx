import React, { useState, useEffect, Fragment } from 'react'
import { getCustomerToken } from '@commercelayer/js-auth'
import { Nav } from '.'
import Head from 'next/head'
import {
  CommerceLayer,
  LineItem,
  OrderContainer,
  Shipment,
  ShipmentsContainer,
  LineItemImage,
  LineItemName,
  LineItemQuantity,
  ShippingMethodName,
  ShippingMethod,
  ShippingMethodRadioButton,
  ShippingMethodPrice,
  LineItemsContainer,
  StockTransfer,
  StockTransferField,
  DeliveryLeadTime,
} from '@commercelayer/react-components'
import { Order } from '@commercelayer/js-sdk'
import _ from 'lodash'

const endpoint = 'https://the-blue-brand-3.commercelayer.co'
const orderId = 'JwXQehvvyP'

export default function Main() {
  const [token, setToken] = useState('')
  const [shippingMethod, setShippingMethod] = useState('')
  const getOrder = async () => {
    const config = { accessToken: token, endpoint }
    const order = await Order.withCredentials(config).find(orderId)
    const shipments = await order
      .withCredentials(config)
      .shipments()
      ?.includes('shippingMethod')
      .load()
    if (!_.isEmpty(shipments) && shipments) {
      const name = shipments.first()?.shippingMethod()?.name
      console.log('shipping method name', name)
      setShippingMethod(name as string)
    }
  }
  useEffect(() => {
    const getToken = async () => {
      // @ts-ignore
      const token = await getCustomerToken(
        {
          clientId:
            '48ee4802f8227b04951645a9b7c8af1e3943efec7edd1dcfd04b5661bf1da5db',
          endpoint,
          scope: 'market:58',
        },
        {
          username: 'bruce@wayne.com',
          password: '123456',
        }
      )
      if (token) setToken(token.accessToken)
    }
    if (!token) getToken()
    if (token) getOrder()
  }, [token])
  const handleChange = (shippingMethod: any) => {
    setShippingMethod(shippingMethod.name)
  }
  return (
    <Fragment>
      <Head>
        <script src="http://localhost:8097"></script>
      </Head>
      <Nav links={['/multiOrder', '/multiApp', '/giftCard']} />
      <CommerceLayer accessToken={token} endpoint={endpoint}>
        <div className="container mx-auto mt-5 px-5">
          <OrderContainer orderId={orderId}>
            <ShipmentsContainer>
              <Shipment>
                <div>Shipments</div>
                <LineItemsContainer>
                  <LineItem>
                    <div className="flex justify-between items-center border-b p-5">
                      <LineItemImage className="p-2" width={80} />
                      <LineItemName data-cy="line-item-name" className="p-2" />
                      <LineItemQuantity
                        readonly
                        data-cy="line-item-quantity"
                        max={100}
                        className="p-2"
                      />
                    </div>
                    <div>
                      <StockTransfer>
                        <div className="flex flex-row" data-cy="stock-transfer">
                          <StockTransferField
                            className="px-1"
                            type="quantity"
                          />{' '}
                          of <LineItemQuantity readonly className="px-1" />
                          items will undergo a transfer
                        </div>
                      </StockTransfer>
                    </div>
                  </LineItem>
                </LineItemsContainer>
                <ShippingMethod>
                  <div className="flex justify-around w-2/3 items-center p-5">
                    <ShippingMethodRadioButton
                      data-cy="shipping-method-button"
                      onChange={handleChange}
                    />
                    <ShippingMethodName data-cy="shipping-method-name" />
                    <ShippingMethodPrice data-cy="shipping-method-price" />
                    <div className="flex">
                      <DeliveryLeadTime
                        type="minDays"
                        data-cy="delivery-lead-time-min-days"
                      />{' '}
                      -{' '}
                      <DeliveryLeadTime
                        type="maxDays"
                        data-cy="delivery-lead-time-max-days"
                        className="mr-1"
                      />
                      days
                    </div>
                  </div>
                </ShippingMethod>
              </Shipment>
            </ShipmentsContainer>
          </OrderContainer>
          <div className="mt-5">
            {}
            <pre data-cy="current-shipping-method">{`Current shipping method: ${JSON.stringify(
              shippingMethod,
              null,
              2
            )}`}</pre>
          </div>
        </div>
      </CommerceLayer>
    </Fragment>
  )
}
