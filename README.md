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

All requests to Commerce Layer API must be authenticated with an [OAuth2](https://oauth.net/2/) bearer token. Hence, to use these components, you need to get a valid access token. Once you got it, you can pass it as prop — together with the endpoint of your Commerce Layer organization — to the `CommerceLayer` component, as follow:

```
<CommerceLayer
  accessToken="your-access-token"
  endpoint="https://yourdomain.commercelayer.io">

  {/* ... child components */}

</CommerceLayer>
```

This token will be used to authorize the API calls of all its child components. That's why the presence of (at least) one `CommerceLayer` component is mandatory — it must wrap every other component you need to use.

> Please note that — in case you need to fetch data with different token (i.e. from different organizations or using apps with different roles and permissions) — nothing prevents you from putting as many `CommerceLayer` components you want in the same page.

You can check [our documentation](https://docs.commercelayer.io/api/authentication) for more information about the available authorization flows and leverege [Commerce Layer JS Auth](https://github.com/commercelayer/commercelayer-js-auth) to easily interact with our authentication API.

## Using ES6 import

You can use ES6 named import with each single component you plan to use (in addition to `CommerceLayer` one), as follow:

```
import { CommerceLayer, ...otherComponents } from '@commercelayer/react-components'
```

Check [this summary table](#list-of-components) for the complete (and constantly updated) list of availabe components.

# Usage

The code snippets below show how to put into action Commerce Layer React Components in some common use cases. Check the [`pages`](/pages) folder of this repository for more detailed examples.

- [Prices](#prices)
- [Add to cart](#add-to-cart)
- [Shopping cart](#shopping-cart)
- [Cart summary](#cart-summary)

Under the hood, our React components are built on top of [Commerce Layer JS SDK](https://github.com/commercelayer/commercelayer-js-sdk) — feel free to use it if you want to develop your custom ones.

## Prices

This example shows how to use Commerce Layer React Components to display the prices of some SKUs, identified by their SKU codes:

```
import {
  CommerceLayer,
  PriceContainer,
  Price
} from '@commercelayer/react-components'

// your code [...]

<CommerceLayer accessToken="your-access-token" endpoint="https://your-domain.commercelayer.io">
  <PriceContainer>
    <Price
      skuCode="BABYONBU000000E63E7412MX"
      className="your-custom-class"
      compareClassName="your-custom-class"
    />
    <Price
      skuCode="CANVASAU000000FFFFFF1824"
      className="your-custom-class"
      compareClassName="your-custom-class"
    />
    <Price
      skuCode="LSLEEVMM000000E63E74LXXX"
      className="your-custom-class"
      compareClassName="your-custom-class"
    />
  </PriceContainer>
</CommerceLayer>

// your code [...]
```

You can style the selling price and the full price as you like by passing the `className` and `compareClassName` props to the `Price` component. You can choose not to show the full price by passing `showCompare={false}` (default is `true`).

## Add to cart

This example shows how to use Commerce Layer React Components to implement the "add to cart" functionality on your page, showing the price of the selected SKU variant, its quantity, the information about its availability, and the related button to perform the action:

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

<CommerceLayer accessToken="your-access-token" endpoint="https://your-domain.commercelayer.io">
  <OrderContainer persistKey="your-persist-key">
    <ItemContainer>
      <PriceContainer>
        <Price skuCode="BABYONBU000000E63E746MXX" />
      </PriceContainer>
      <VariantContainer>
        <VariantSelector
          placeholder="Select a size"
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

For each variant you can show a custom name (i.e. its translation based on location, according to what you defined in your CMS) by setting the value of the `label` key. You can change the type of input by passing `type='radio'` to the `VariantSelector` component (default is `select`).

When you add a product to your shopping cart:

- if there is an oder stored in the Local Storage identified by a key that matches the `persistKey` property, a line item is created and it is associated with that order;
- if no order in the Local Storage matches the `persistKey` property, a new order is created and stored.

> A common best practice — especially for multi-country ecommerce — is to use as `persistKey` a key containing the country code, so that you have a different shopping cart for each country.

## Shopping cart

This example shows how to use Commerce Layer React Components to build a shopping cart UI, containing the items that are going to be purchased with all their information (image, name, price, quantity) and the option to possibile remove some of them:

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

<CommerceLayer accessToken="your-access-token" endpoint="https://your-domain.commercelayer.io">
  <OrderContainer persistKey="your-persist-key">
    <LineItemsContainer>
      <p className="your-custom-class">
        Your shopping bag contains{' '}
        <LineItemsCount /> items
      </p>
      <LineItem>
        <LineItemImage src="your-image-url" width={80} />
        <LineItemName label="your-item-name" />
        <LineItemQuantity max={100} />
        <Errors resource="lineItem" field="quantity" />
        <LineItemPrice />
        <LineItemRemove />
      </LineItem>
    </LineItemsContainer>
  </OrderContainer>
</CommerceLayer>

// your code [...]
```

For each line item you can show a custom image (by passing the `src` prop to the `LineItemImage` component) and a custom name (by passing the `label` prop to the `LineItemName` component) — usually taken from your CMS.

The `Errors` component lets you show the error (if present) returned by our API on a single attribute of a specific resource. You can customize the error message as you like by passing an object as the `message` prop of the component.

## Cart summary

This example shows how to use Commerce Layer React Components to show a sample order summary with all the order line items (including discounts, shipping costs, taxes, and gift cards — if present) and totals.

```
import {
  CommerceLayer,
  OrderContainer,
  SubTotal,
  Discount,
  Shipping,
  Taxes,
  GiftCardPrice,
  Total,
  Checkout
} from '@commercelayer/react-components'

// your code [...]

<CommerceLayer accessToken="your-access-token" endpoint="https://your-domain.commercelayer.io">
  <OrderContainer persistKey="your-persist-key">
    <SubTotal />
    <Discount />
    <Shipping />
    <Taxes />
    <GiftCardPrice />
    <Total />
    <Checkout label="Checkout" />
  </OrderContainer>
</CommerceLayer>

// your code [...]
```

The `Checkout` component lets you proceed to checkout and links to the checkout URL configured on Commerce Layer (_Settings → Markets_).

# List of components

These are the currently available Commerce Layer React Components.

| Name                       | Description                                                                                                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AddToCart`                | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `AvailabilityContainer`    | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `AvailabilityTemplate`     | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `Checkout`                 | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `CommerceLayer`            | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `Discount`                 | Displays the sum of all the discounts applied to an order. Use the `format` property to change the format of the amount (one of `formatted`, `cent` or `float`).        |
| `Errors`                   | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `GiftCard`                 | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `GiftCardContainer`        | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `GiftCardCurrencySelector` | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `GiftCardInput`            | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `GiftCardPrice`            | Displays the sum of all the gift cards applied to an order. Use the `format` property to change the format of the amount (one of `formatted`, `cent` or `float`).       |
| `ItemContainer`            | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `LineItem`                 | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `LineItemImage`            | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `LineItemName`             | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `LineItemOption`           | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `LineItemOptions`          | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `LineItemPrice`            | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `LineItemQuantity`         | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `LineItemRemove`           | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `LineItemsContainer`       | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `LineItemsCount`           | Displays the total number of items associated with an order.                                                                                                            |
| `MetadataInput`            | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `OrderContainer`           | Wraps an order and it is responsible for interacting with the `orders` API. Use the `persistKey` property to define the Local Storage key and hold the order reference. |
| `Price`                    | Displays the price of the associated `skuCode`. Use the `showCompare` property to show/hide the full price (if present).                                                |
| `PriceContainer`           | Wraps one or more `Price` components and it is responsible for calling the `prices` API for all the associated SKUs, with a single query.                               |
| `PriceTemplate`            | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `QuantitySelector`         | Displays an HTML input where to insert the quantity of the associated `skuCode`. Use the `min` and `max` properties to set the allowed range.                           |
| `Shipping`                 | Displays the sum of all the shipping costs related to an order. Use the `format` property to change the format of the amount (one of `formatted`, `cent` or `float`).   |
| `SkuOption`                | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `SkuOptionInput`           | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `SkuOptionsContainer`      | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `SubmitButton`             | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |
| `SubTotal`                 | Displays the order's subtotal amount. Use the `format` property to change the format of the amount (one of `formatted`, `cent` or `float`).                             |
| `Taxes`                    | Displays the amount of all the taxes applied to an order. Use the `format` property to change the format of the amount (one of `formatted`, `cent` or `float`).         |
| `Total`                    | Displays the order's total amount. Use the `format` property to change the format of the amount (one of `formatted`, `cent` or `float`).                                |
| `VariantContainer`         | Wraps one or more `VariantOption` components, holding the selected `skuCode`. It is responsible for calling the `skus` API when the selected variant changes.           |
| `VariantSelector`          | Displays a select or radio input where you can choose an SKU. The `skuCodes` property all holds the available options to choose from.                                   |
| `VariantTemplate`          | _Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua._                                           |

For more detailed information on each components, have a look at the configuration file [`src/config/components.ts`](/src/config/components.ts).

---

### License

This repository is published under the [MIT](LICENSE) license.
