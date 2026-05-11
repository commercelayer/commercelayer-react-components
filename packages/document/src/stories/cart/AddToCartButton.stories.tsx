import type { Meta, StoryObj } from "@storybook/react-vite"
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

const meta = {
  title: "Orders/AddToCartButton",
  component: AddToCartButton,
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
