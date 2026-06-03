import type { Address as AddressType } from "@commercelayer/sdk"
import { type JSX, useContext, useEffect, useState } from "react"
import AddressCardsTemplate, {
  type AddressCardsTemplateChildren,
  type CustomerAddress,
  type HandleSelect,
} from "#components/utils/AddressCardsTemplate"
import AddressChildrenContext from "#context/AddressChildrenContext"
import AddressContext from "#context/AddressContext"
import BillingAddressContext from "#context/BillingAddressContext"
import CustomerContext from "#context/CustomerContext"
import OrderContext from "#context/OrderContext"
import ShippingAddressContext from "#context/ShippingAddressContext"
import type { DefaultChildrenType } from "#typings/globals"
import { isEmpty } from "#utils/isEmpty"

interface Props extends Omit<JSX.IntrinsicElements["div"], "children" | "onSelect"> {
  children: DefaultChildrenType | AddressCardsTemplateChildren
  selectedClassName?: string
  disabledClassName?: string
  onSelect?: (address: AddressType) => void
  addresses?: AddressType[]
  deselect?: boolean
}

/**
 * The Address component is aimed to read from active context the list of available addresses to generate for each of them a suitable and interactive wrapper ready to deal with addresses data.
 *
 * It accept:
 * - a `selectedClassName` prop to define the className of selected generated address wrapper.
 * - a `disabledClassName` prop to define the className of disabled generated address wrapper.
 * - an `onSelect` prop to define a custom method triggered when an address wrapper is clicked.
 * - an `addresses` prop to define a list of addresses to be used instead of the ones available from active context.
 * - a `deselect` prop to define if the current address is deselected through a custom logic.
 *
 * <span title='Requirements' type='warning'>
 * Must be a child of the `<AddressesContainer>` component.
 * </span>
 * <span title='Children' type='info'>
 * `<AddressField>`,
 * </span>
 */
export function Address(props: Props): JSX.Element {
  const {
    children,
    className,
    selectedClassName = "",
    onSelect,
    addresses = [],
    deselect = false,
    ...p
  } = props
  const { addresses: addressesContext } = useContext(CustomerContext)
  const { setBillingAddress, billingCustomerAddressId } = useContext(BillingAddressContext)
  const { setShippingAddress, shippingCustomerAddressId } = useContext(ShippingAddressContext)
  const { shipToDifferentAddress, billingAddressId, shippingAddressId } = useContext(AddressContext)
  const { order } = useContext(OrderContext)
  const [selected, setSelected] = useState<null | number | undefined>(null)
  const items = !isEmpty(addresses) ? addresses : (addressesContext && addressesContext) || []
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional effect with stable context refs
  useEffect(() => {
    if (items && !deselect) {
      items.forEach((address, k) => {
        if (billingCustomerAddressId) {
          const preselected = address.reference === billingCustomerAddressId
          if (preselected && selected === null) {
            setSelected(k)
          }
        }
        if (!billingAddressId && k === selected && setBillingAddress && address.reference != null) {
          setBillingAddress(address.id, {
            customerAddressId: address.reference,
          })
        }
        if (shippingCustomerAddressId) {
          const preselected = address.reference === shippingCustomerAddressId
          preselected && selected === null && setSelected(k)
        }
        if (
          !shippingAddressId &&
          k === selected &&
          setShippingAddress &&
          address.reference != null
        ) {
          setShippingAddress(address.id, {
            customerAddressId: address.reference,
          })
        }
      })
    }
    if (deselect) {
      const disabledSaveButton = async (): Promise<void> => {
        setBillingAddress && (await setBillingAddress(""))
        setShippingAddress && (await setShippingAddress(""))
      }
      disabledSaveButton()
    }
  }, [
    deselect,
    billingCustomerAddressId,
    shippingCustomerAddressId,
    addressesContext,
    shipToDifferentAddress,
  ])
  const handleSelect: HandleSelect = async (k, addressId, customerAddressId, disabled, address) => {
    !disabled && setSelected(k)
    setBillingAddress && (await setBillingAddress(addressId, { customerAddressId }))
    !disabled && setShippingAddress && (await setShippingAddress(addressId, { customerAddressId }))
    if (onSelect) onSelect(address)
  }
  const countryLock = order?.shipping_country_code_lock
  const components =
    typeof children === "function"
      ? []
      : items
          .filter((address) => {
            if (setShippingAddress && countryLock && countryLock !== address.country_code) {
              return false
            }
            return true
          })
          .map((address, k) => {
            const addressProps = {
              address,
            }
            const selectedClass = deselect ? "" : selectedClassName
            const finalClassName =
              selected === k ? `${className || ""} ${selectedClass}` : className
            const customerAddressId: string = address?.reference || ""
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: address list has no stable unique key other than index
              <AddressChildrenContext.Provider key={k} value={addressProps}>
                {/* biome-ignore lint/a11y/noStaticElementInteractions: address card uses div for flexible layout */}
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: address card uses div for flexible layout */}
                <div
                  className={finalClassName}
                  onClick={() => {
                    handleSelect(k, address.id, customerAddressId, false, address)
                  }}
                  {...p}
                >
                  {children}
                </div>
              </AddressChildrenContext.Provider>
            )
          })
  const parentProps = {
    customerAddresses: items as CustomerAddress[],
    selected,
    handleSelect,
    countryLock,
    ...props,
  }
  return typeof children === "function" ? (
    <AddressCardsTemplate {...parentProps}>{children}</AddressCardsTemplate>
  ) : (
    components
  )
}

export default Address
