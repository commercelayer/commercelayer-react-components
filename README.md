# Commerce Layer React Components

A collection of reusable React components that makes it super fast and simple to build your own custom commerce UI, leveraging [Commerce Layer API](https://docs.commercelayer.io/api/).

### What is Commerce Layer?

[Commerce Layer](https://commercelayer.io/) is a headless platform that lets you easily build enterprise-grade ecommerce into any website, by using the language, CMS, and tools you already master and love.

# Getting started

To get started with Commerce Layer React Components you need to install them and then get the credentials that will allow you to perform the API calls they wrap.

- [Installation](#installation)
- [Authentication](#authentication)
- [Using ES6 import](#using-es6-import)

## Installation

Commerce Layer React Components are available as an [npm package](https://www.npmjs.com/package/@commercelayer/react-components):

```
// npm
npm install @commercelayer/react-components

// yarn
yarn add @commercelayer/react-components
```

## Authentication

All requests to Commerce Layer API must be authenticated with an [OAuth2](https://oauth.net/2/) bearer token. Hence, to use these components, you need to get a valid access token. Once you got it, you can pass it as prop — together with the endpoint of your Commerce Layer organization — to the `<CommerceLayer />` component, as follow:

```
<CommerceLayer
  accessToken='your-access-token'
  endpoint='https://yourdomain.commercelayer.io'>

  {/* ... children components */}

</CommerceLayer>
```

This token will be used to authorize the API calls of all its children components. That's why the presence of (at least) one `<CommerceLayer />` component is mandatory — it must wrap every other component you need to use.

> Please note that — in case you need to fetch data with different token (i.e. from different organizations or using apps with different roles and permissions) — nothing prevents you from putting as many `<CommerceLayer />` components you want in the same page.

You can check [our documentation](https://docs.commercelayer.io/api/authentication) for more information about the available authorization flows and leverege [Commerce Layer JS Auth](https://github.com/commercelayer/commercelayer-js-auth) to easily interact with our authentication API.

## Using ES6 import

You can use ES6 named import with each single component you plan to use, as follow:

```
import { CommerceLayer, PriceContainer, Price } from '@commercelayer/react-components'
```

Check [this summary table](#list-of-components) for the complete (and constantly updated) list of availabe components.

# Usage

The code snippets below show how to put into action Commerce Layer React Components in some common use cases. Check the `pages` folder of this repository for [more detailed examples](/pages).

- [Prices](#prices)
- [Add to cart](#add-to-cart)
- [Shopping cart](#shopping-cart)
- [Order summary](#order-summary)

## Prices

This example shows how to use Commerce Layer `<Price Container />` and `<Price />` components to display the prices of three SKUs, identified by their SKU codes:

```
import { CommerceLayer, PriceContainer, Price } from '@commercelayer/react-components'

// your code [...]

<CommerceLayer accessToken='your-access-token' endpoint='https://your-domain.commercelayer.io'>
  <PriceContainer>
    <Price
      skuCode='BABYONBU000000E63E7412MX'
      className='your-custom-class'
      compareClassName='your-custom-class'
    />
    <Price
      skuCode='CANVASAU000000FFFFFF1824'
      className='your-custom-class'
      compareClassName='your-custom-class'
    />
    <Price
      skuCode='LSLEEVMM000000E63E74LXXX'
      className='your-custom-class'
      compareClassName='your-custom-class'
    />
  </PriceContainer>
</CommerceLayer>

// your code [...]
```

You can style the selling price and the full price as you like by passing the `className` and `compareClassName` props to the `<Price />` component. You can choose not to show the full price by passing `showCompare={false}` (default is `true`).

Check [pages/prices.tsx](/pages/prices.tsx) for a complete working example.

## Add to cart

```
import {
  CommerceLayer,
  OrderContainer,
  ItemContainer,
  PriceContainer,
  Price,
  VariantContainer,
  VariantSelector,
  QuantitySelector,
  AddToCart,
  AvailabilityContainer,
  AvailabilityTemplate
} from '@commercelayer/react-components'

// your code [...]

<CommerceLayer accessToken='your-access-token' endpoint='https://your-domain.commercelayer.io'>
  <OrderContainer persitKey='your-persist-key'>
    <ItemContainer>
      <PriceContainer>
        <Price skuCode='BABYONBU000000E63E746MXX' />
      </PriceContainer>
      <VariantContainer>
        <VariantSelector
          skuCodes={[
            {
              label: '6 months',
              code: 'BABYONBU000000E63E746MXX',
            },
            {
              label: '12 months',
              code: 'BABYONBU000000E63E7412MX',
            },
            {
              label: '24 months',
              code: 'BABYONBU000000E63E7424MX',
            },
          ]}
        />
      </VariantContainer>
      <QuantitySelector />
      <AddToCart />
      <AvailabilityContainer>
        <AvailabilityTemplate />
      </AvailabilityContainer>
    </ItemContainer>
  </OrderContainer>
</CommerceLayer>

// your code [...]
```

## Shopping cart

```
import {
  CommerceLayer,
  OrderContainer,
  LineItemsContainer,
  LineItemsCount,
  LineItem,
  LineItemImage,
  LineItemName,
  LineItemQuantity,
  LineItemPrice,
  LineItemRemove,
  Errors
} from '@commercelayer/react-components'

// your code [...]

<CommerceLayer accessToken='your-access-token' endpoint='https://your-domain.commercelayer.io'>
  <OrderContainer persitKey='your-persist-key'>
    <LineItemsContainer>
      <p className='your-custom-class'>
        Your shopping bag contains{' '}
        <LineItemsCount /> items
      </p>
      <LineItem>
        <LineItemImage width={80} />
        <LineItemName  />
        <LineItemQuantity max={100} />
        <Errors resource='lineItem' field='quantity' />
        <LineItemPrice />
        <LineItemRemove />
      </LineItem>
    </LineItemsContainer>
  </OrderContainer>
</CommerceLayer>

// your code [...]
```

## Order summary

```
import {
  CommerceLayer,
  OrderContainer,
  SubTotal,
  Discount,
  Shipping,
  Taxes,
  Total,
  Checkout
} from '@commercelayer/react-components'

// your code [...]

<CommerceLayer accessToken="your-access-token" endpoint="https://your-domain.commercelayer.io">
  <OrderContainer persitKey="your-persit-key">
    <SubTotal />
    <Discount />
    <Shipping />
    <Taxes />
    <Total />
    <Checkout label="Checkout" />
  </OrderContainer>
</CommerceLayer>

// your code [...]
```

# List of components

These are the currently available Commerce Layer React Components.

| Name                   | Description                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<OrderContainer />`   | Wraps an order and it is responsible for interacting with the `/orders` API. Use the `persistKey` property to define the Local Storage key and hold the order reference. |
| `<PriceContainer />`   | Wraps one or more `<Price />` components and it is responsible for calling the `/prices` API for all the associated SKUs, with a single query.                           |
| `<Price />`            | Displays the price of the associated `skuCode`. Use the `showCompare` property to show/hide the "compare at" price (if present).                                         |
| `<VariantContainer />` | Wraps one or more `<VariantOption />` components, holding the selected `skuCode`. It is responsible for calling the `/skus` API when the selected variant changes.       |
| `<VariantSelector />`  | Displays a select or radio input where you can choose an SKU. The `skuCodes` property all holds the available options to choose from.                                    |

---

### License

This repository is published under the [MIT](LICENSE) license.
