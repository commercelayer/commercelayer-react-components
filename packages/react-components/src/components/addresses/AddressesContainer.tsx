import AddressesContext, {
  defaultAddressContext
} from '#context/AddressContext'
import { type ReactNode, useContext, useEffect, useReducer } from 'react'
import addressReducer, {
  addressInitialState,
  type AddressResource,
  type AddressSchema,
  setAddressErrors,
  type SetAddressParams,
  setCloneAddress,
  saveAddresses
} from '#reducers/AddressReducer'
import { type BaseError } from '#typings/errors'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'

interface Props {
  children: ReactNode
  /**
   * If true, the shipping address will be considered. Default is false.
   */
  shipToDifferentAddress?: boolean
  /**
   * If true, the address will be considered a business address.
   */
  isBusiness?: boolean
  /**
   * If true, the shipping address will be considered as primary address. Default is false.
   */
  invertAddresses?: boolean
}

export function AddressesContainer(props: Props): JSX.Element {
  const {
    children,
    shipToDifferentAddress = false,
    isBusiness,
    invertAddresses = false
  } = props
  const [state, dispatch] = useReducer(addressReducer, addressInitialState)
  const { order, orderId, updateOrder } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    dispatch({
      type: 'setShipToDifferentAddress',
      payload: {
        shipToDifferentAddress,
        isBusiness,
        invertAddresses
      }
    })
    return () => {
      dispatch({
        type: 'cleanup',
        payload: {}
      })
    }
  }, [shipToDifferentAddress, isBusiness, invertAddresses])
  const contextValue = {
    ...state,
    setAddressErrors: (errors: BaseError[], resource: AddressResource) => {
      setAddressErrors({
        errors,
        resource,
        dispatch,
        currentErrors: state.errors
      })
    },
    setAddress: (params: SetAddressParams<AddressSchema>) => {
      defaultAddressContext.setAddress({ ...params, dispatch })
    },
    saveAddresses: async (
      customerEmail?: string
    ): ReturnType<typeof saveAddresses> =>
      await saveAddresses({
        config,
        dispatch,
        updateOrder,
        order,
        orderId,
        state,
        customerEmail
      }),
    setCloneAddress: (id: string, resource: AddressResource): void => {
      setCloneAddress(id, resource, dispatch)
    }
  }
  return (
    <AddressesContext.Provider value={contextValue}>
      {children}
    </AddressesContext.Provider>
  )
}

export default AddressesContainer
