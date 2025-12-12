// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

import { PARAM_KEY } from ".storybook/addon-container/constants"
import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks"
import type { Parameters } from "@storybook/react-vite"
import { worker } from "../mocks/browser"

export const parameters: Parameters = {
  layout: "centered",
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    values: [
      {
        name: "overlay",
        value: "#F8F8F8",
      },
    ],
  },
  options: {
    storySort: {
      order: [
        "Getting Started",
        "Components",
        [
          "Skus",
          ["SkusContainer", "Skus"],
          "Prices",
          ["PricesContainer"],
          "Availability",
          ["AvailabilityContainer"],
          "Orders",
          ["OrderStorage", "OrderContainer"],
          "Cart",
          ["AddToCartButton", "HostedCart", "CartLink", "MiniCart"],
          "Customers",
          [
            "CustomerContainer",
            "CustomerField",
            "AddressesContainer",
            "AddressesEmpty",
            "Address",
            "AddressField",
            "BillingAddressForm",
            "MyAccountLink",
          ],
        ],
        "Examples",
        ["Listing Page", "Shopping Cart", "Checkout Page", "My Account"],
        "Hooks",
      ],
    },
  },
  docs: {
    page: () => (
      <>
        <Title />
        <Subtitle />
        <Description />
        <Primary />
        <Controls />
        <Stories includePrimary={false} />
      </>
    ),
  },
}

// Storybook executes this module in both bootstrap phase (Node)
// and a story's runtime (browser). However, we cannot call `setupWorker`
// in Node environment, so need to check if we're in a browser.
if (typeof global.process === "undefined") {
  // Start the mocking when each story is loaded.
  // Repetitive calls to the `.start()` method do not register a new worker,
  // but check whether there's an existing once, reusing it, if so.
  worker.start({
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
    quiet: import.meta.env.PROD,
    onUnhandledRequest: !import.meta.env.PROD
      ? (req, reqPrint) => {
        const url = new URL(req.url)
        if (url.hostname === "mock.localhost") {
          reqPrint.warning()
        }
      }
      : () => { },
  })
}

export const initialGlobals = {
  [PARAM_KEY]: true,
}
export const tags = ["autodocs"]
