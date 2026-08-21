import type { Order } from "@commercelayer/sdk"
import { useCallback, useMemo, useReducer, useRef } from "react"
import { defaultAddressContext } from "#context/AddressContext"
import type { CommerceLayerConfig } from "#context/CommerceLayerContext"
import addressReducer, {
  addressInitialState,
  type ICustomerAddress,
  saveAddresses,
  setAddress as setAddressAction,
  setAddressErrors as setAddressErrorsAction,
} from "#reducers/AddressReducer"
import type { updateOrder } from "#reducers/OrderReducer"
import type { BaseError } from "#typings/errors"

interface UseStandaloneAddressParams {
  isStandalone: boolean
  config: CommerceLayerConfig
  order: Order | undefined
  orderId: string | undefined
  updateOrder: typeof updateOrder | undefined
  isBusiness: boolean
  shipToDifferentAddress: boolean
  invertAddresses?: boolean
}

export function useStandaloneAddress({
  isStandalone,
  config,
  order,
  orderId,
  updateOrder,
  isBusiness,
  shipToDifferentAddress,
  invertAddresses = false,
}: UseStandaloneAddressParams) {
  const [standaloneState, standaloneDispatch] = useReducer(addressReducer, addressInitialState)
  const errorsRef = useRef(standaloneState.errors)
  errorsRef.current = standaloneState.errors

  const standaloneSetAddress = useCallback((params: Parameters<typeof setAddressAction>[0]) => {
    setAddressAction({ ...params, dispatch: standaloneDispatch })
  }, [])

  const standaloneSetAddressErrors = useCallback(
    (errors: BaseError[], resource: Parameters<typeof setAddressErrorsAction>[0]["resource"]) => {
      setAddressErrorsAction({
        errors,
        resource,
        dispatch: standaloneDispatch,
        currentErrors: errorsRef.current,
      })
    },
    []
  )

  const standaloneSaveAddresses = useCallback(
    async (params: { customerEmail?: string; customerAddress?: ICustomerAddress } = {}) => {
      return saveAddresses({
        config,
        dispatch: standaloneDispatch,
        updateOrder,
        order,
        orderId,
        state: standaloneState,
        ...params,
      })
    },
    [config, updateOrder, order, orderId, standaloneState]
  )

  const standaloneContextValue = useMemo(
    () => ({
      ...standaloneState,
      isBusiness,
      shipToDifferentAddress,
      invertAddresses,
      setAddress: standaloneSetAddress,
      setAddressErrors: standaloneSetAddressErrors,
      saveAddresses: standaloneSaveAddresses,
      setCloneAddress: defaultAddressContext.setCloneAddress,
    }),
    [
      standaloneState,
      isBusiness,
      shipToDifferentAddress,
      invertAddresses,
      standaloneSetAddress,
      standaloneSetAddressErrors,
      standaloneSaveAddresses,
    ]
  )

  return {
    isStandalone,
    standaloneSetAddress,
    standaloneSetAddressErrors,
    standaloneContextValue,
    standaloneDispatch,
    standaloneState,
  }
}
