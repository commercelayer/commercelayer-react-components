import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArgTypes, Canvas, Source } from "@storybook/addon-docs/blocks"
import CommerceLayer from "../_internals/CommerceLayer"
import {
  AddToCartButton,
  AvailabilityContainer,
  AvailabilityTemplate,
  Errors,
  LineItem,
  LineItemName,
  LineItemQuantity,
  LineItemRemoveLink,
  LineItemsContainer,
  LineItemsEmpty,
  Order,
  OrderStorage,
  Skus,
  SkusContainer,
} from "@commercelayer/react-components"

function AddToCartButtonDocsPage(): JSX.Element {
  return (
    <>
      <h1>AddToCartButton</h1>
      <p>
        <code>{"<AddToCartButton>"}</code> adds a SKU, bundle, or SKU list to
        the cart (draft order). It must be a descendant of{" "}
        <code>{"<Order>"}</code>. When nested inside <code>{"<Skus>"}</code> or{" "}
        <code>{"<SkuList>"}</code>, the <code>skuCode</code> is inherited from
        context automatically.
      </p>
      <span title="Usage" type="info">
        <p>
          Must be a child of <code>{"<Order>"}</code> (or{" "}
          <code>{"<OrderContainer>"}</code>). See the{" "}
          <a href="https://docs.commercelayer.io/core/v/how-tos/placing-orders/shopping-cart/create-a-shopping-cart">
            shopping cart how-to
          </a>{" "}
          for the full flow.
        </p>
      </span>
      <ArgTypes />
      <Source
        language="jsx"
        dark
        code={`
import {
  CommerceLayer,
  OrderStorage,
  Order,
  AddToCartButton,
} from '@commercelayer/react-components'

<CommerceLayer accessToken="..." endpoint="https://yourdomain.commercelayer.io">
  <OrderStorage persistKey="my-cart">
    <Order>
      <AddToCartButton skuCode="TSHIRTWS000000FFFFFFLXXX" label="Add to cart" quantity="1" />
    </Order>
  </OrderStorage>
</CommerceLayer>
`}
      />
      <hr />
      <h2>Add SKU to cart</h2>
      <Canvas of={AddSku} />
      <hr />
      <h2>Add bundle to cart</h2>
      <Canvas of={AddBundle} />
      <hr />
      <h2>Disabled when out of stock</h2>
      <p>
        Combine with <code>{"<AvailabilityTemplate>"}</code> to disable the
        button when the SKU has no stock.
      </p>
      <Canvas of={DisabledWhenOutOfStock} />
      <hr />
      <h2>Custom attributes / external price</h2>
      <p>
        Pass a <code>lineItem</code> prop to customise the created line item
        (e.g. custom name, external price).
      </p>
      <Canvas of={UseCustomAttributesOrExternalPrice} />
      <hr />
      <h2>Children render prop</h2>
      <p>
        Pass a function as <code>children</code> to take full control of the
        button UI. The <code>disabled</code> flag reflects the loading state.
      </p>
      <Canvas of={ChildrenProps} />
    </>
  )
}

const meta = {
  title: "Components/Cart/AddToCartButton",
  component: AddToCartButton,
  parameters: {
    docs: {
      page: AddToCartButtonDocsPage,
    },
  },
  argTypes: {
    skuCode: {
      control: "text",
      description:
        "SKU code to add to the cart. Automatically inherited from context when nested inside `<Skus>` or `<SkuList>`.",
    },
    bundleCode: {
      control: "text",
      description: "Bundle code to add to the cart instead of a single SKU.",
    },
    skuListId: {
      control: "text",
      description:
        "SKU list ID — adds all SKUs in the list to the cart at once.",
    },
    quantity: {
      control: "text",
      description: "Quantity of the item to add. Defaults to `1`.",
    },
    label: {
      control: "text",
      description: "Button label text or element.",
    },
    disabled: {
      control: "boolean",
      description: "Disables the button.",
    },
    buyNowMode: {
      control: "boolean",
      description:
        "When `true`, redirects to the hosted checkout after adding the item.",
    },
    checkoutUrl: {
      control: "text",
      description: "Self-hosted checkout URL used when `buyNowMode` is `true`.",
    },
    redirectToHostedCart: {
      control: "boolean",
      description:
        "When `true`, redirects to the hosted cart after adding the item.",
    },
    hostedCartUrl: {
      control: "text",
      description:
        "Self-hosted cart URL used when `redirectToHostedCart` is `true`.",
    },
    lineItem: {
      control: "object",
      description:
        "Custom line item attributes (e.g. `name`, `externalPrice`) applied to the created line item.",
    },
    children: {
      control: false,
      description:
        "Render prop receiving `{ handleClick, disabled }` for a fully custom button UI.",
    },
  },
} satisfies Meta<typeof AddToCartButton>

export default meta
type Story = StoryObj<typeof meta>

// Hidden cart recap — shows added items without cluttering the story source
function CartRecap() {
  return (
    <div id="cart-recap" className="mt-8 block">
      <LineItemsContainer>
        <LineItemsEmpty text="Cart is empty" />
        <div>
          {(["skus", "bundles"] as const).map((type) => (
            <LineItem type={type} key={type}>
              <div className="flex gap-4 items-center mb-2">
                <div className="flex" />
                <LineItemName />
                <LineItemQuantity readonly />
                <LineItemRemoveLink className="ml-auto px-2 text-sm rounded bg-red-500 text-white" />
              </div>
            </LineItem>
          ))}
        </div>
        <Errors resource="orders" />
      </LineItemsContainer>
    </div>
  )
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <CommerceLayer accessToken="my-access-token">
      <OrderStorage persistKey="cl-examples-addToCart">
        <Order>
          {children}
          <CartRecap />
        </Order>
      </OrderStorage>
    </CommerceLayer>
  )
}

export const AddSku: Story = {
  name: "Add SKU to cart",
  args: {
    skuCode: "SWEATWCX000000FFFFFFXSXX",
    label: "Add SKU to cart",
    quantity: "2",
    className: "px-3 py-2 bg-black text-white rounded disabled:opacity-50",
  },
  render: (args) => (
    <Wrapper>
      <AddToCartButton {...args} />
    </Wrapper>
  ),
}

export const AddBundle: Story = {
  name: "Add bundle to cart",
  args: {
    bundleCode: "BUNDLE001",
    label: "Add bundle to cart",
    quantity: "2",
    className: "px-3 py-2 bg-black text-white rounded disabled:opacity-50",
  },
  render: (args) => (
    <Wrapper>
      <AddToCartButton {...args} />
    </Wrapper>
  ),
}

/**
 * Combine `<AddToCartButton>` with `<AvailabilityTemplate>` to automatically
 * disable the button when the SKU is out of stock.
 */
export const DisabledWhenOutOfStock: Story = {
  name: "Disabled when out of stock",
  render: () => (
    <Wrapper>
      <SkusContainer
        skus={["POLOMXXX000000FFFFFFLXXX", "TSHIRTWV000000FFFFFFSXXX"]}
      >
        <Skus>
          <AvailabilityContainer>
            <AvailabilityTemplate>
              {({ quantity }) => (
                <div className="mb-4 grid max-w-md">
                  Quantity available: {quantity}
                  <AddToCartButton
                    className="px-3 py-2 bg-black text-white rounded disabled:opacity-50"
                    disabled={quantity <= 0}
                  />
                </div>
              )}
            </AvailabilityTemplate>
          </AvailabilityContainer>
        </Skus>
      </SkusContainer>
    </Wrapper>
  ),
}

/**
 * Pass a `lineItem` prop to customise the created line item attributes — useful for
 * custom names or enabling external prices.
 *
 * <span title="Core API" type="info">
 * See the [line_items API reference](https://docs.commercelayer.io/core/v/api-reference/line_items/object).
 * </span>
 */
export const UseCustomAttributesOrExternalPrice: Story = {
  name: "Custom attributes / external price",
  render: () => (
    <Wrapper>
      <AddToCartButton
        label="Add with custom name"
        skuCode="SWEATWCX000000FFFFFFXSXX"
        className="px-3 py-2 bg-black text-white rounded disabled:opacity-50"
        lineItem={{
          name: "My custom item name",
          externalPrice: false,
        }}
      />
    </Wrapper>
  ),
}

/**
 * Use the `children` render prop to fully control the button UI.
 * The `disabled` prop reflects the loading state — it is `true` while the
 * cart operation is in progress, preventing double-clicks automatically.
 */
export const ChildrenProps: Story = {
  name: "Children props (render prop)",
  render: () => (
    <Wrapper>
      <AddToCartButton skuCode="SWEATWCX000000FFFFFFXSXX" quantity="1">
        {({ handleClick, disabled }) => (
          <div
            role="button"
            className="border-dotted border-2 border-blue-500 text-blue-500 p-4 w-auto inline"
            onClick={() => {
              void handleClick().then(({ orderId, success }) => {
                if (success) {
                  alert(`Item added to cart — orderId: ${orderId}`)
                }
              })
            }}
          >
            {disabled ? "Adding…" : "Add to cart"}
          </div>
        )}
      </AddToCartButton>
    </Wrapper>
  ),
}
