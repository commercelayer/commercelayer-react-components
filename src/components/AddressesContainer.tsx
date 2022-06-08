import AddressesContext, {
  defaultAddressContext,
} from '#context/AddressContext'
import {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react'
import addressReducer, {
  addressInitialState,
  AddressSchema,
  setAddressErrors,
  SetAddressParams,
  setCloneAddress,
} from '#reducers/AddressReducer'
import { BaseError } from '#typings/errors'
import OrderContext from '#context/OrderContext'
import CommerceLayerContext from '#context/CommerceLayerContext'
import { saveAddresses } from '#reducers/AddressReducer'
import components from '#config/components'
import { AddressResource } from '../reducers/AddressReducer'

const propTypes = components.AddressesContainer.propTypes
const displayName = components.AddressesContainer.displayName

export type AddressesContainerProps = {
  children: ReactNode
  shipToDifferentAddress?: boolean
  isBusiness?: boolean
}
const AddressesContainer: FunctionComponent<AddressesContainerProps> = (
  props
) => {
  const { children, shipToDifferentAddress = false, isBusiness } = props
  const [state, dispatch] = useReducer(addressReducer, addressInitialState)
  const { order, orderId, updateOrder } = useContext(OrderContext)
  const config = useContext(CommerceLayerContext)
  useEffect(() => {
    dispatch({
      type: 'setShipToDifferentAddress',
      payload: {
        shipToDifferentAddress,
        isBusiness,
      },
    })
    return () => {
      dispatch({
        type: 'cleanup',
        payload: {},
      })
    }
  }, [shipToDifferentAddress, isBusiness])
  const contextValue = {
    ...state,
    setAddressErrors: (errors: BaseError[], resource: AddressResource) =>
      setAddressErrors({
        errors,
        resource,
        dispatch,
        currentErrors: state.errors,
      }),
    setAddress: (params: SetAddressParams<AddressSchema>) =>
      defaultAddressContext['setAddress']({ ...params, dispatch }),
    saveAddresses: async (): Promise<void> =>
      await saveAddresses({
        config,
        dispatch,
        updateOrder,
        order,
        orderId,
        state,
      }),
    setCloneAddress: (id: string, resource: AddressResource): void =>
      setCloneAddress(id, resource, dispatch),
  }
  return (
    <AddressesContext.Provider value={contextValue}>
      {children}
    </AddressesContext.Provider>
  )
}

AddressesContainer.propTypes = propTypes
AddressesContainer.displayName = displayName

export default AddressesContainer
