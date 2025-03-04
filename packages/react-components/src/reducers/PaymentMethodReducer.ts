/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { AdyenPaymentConfig } from "#components/payment_source/AdyenPayment";
import type { BraintreeConfig } from "#components/payment_source/BraintreePayment";
import type { PaypalConfig } from "#components/payment_source/PaypalPayment";
import type { StripeConfig } from "#components/payment_source/StripePayment";
import type { WireTransferConfig } from "#components/payment_source/WireTransferPayment";
import type { CommerceLayerConfig } from "#context/CommerceLayerContext";
import type { getOrderContext, updateOrder } from "#reducers/OrderReducer";
import type { BaseError } from "#typings/errors";
import baseReducer from "#utils/baseReducer";
import getErrors, { setErrors } from "#utils/getErrors";
import getSdk from "#utils/getSdk";
import type {
  Order,
  PaymentMethod,
  StripePayment,
  WireTransfer,
  AdyenPayment,
  BraintreePayment,
  CheckoutComPayment,
  ExternalPayment,
  PaypalPayment,
  KlarnaPayment,
} from "@commercelayer/sdk";
import type { Dispatch, MutableRefObject } from "react";
import type { CheckoutComConfig } from "#components/payment_source/CheckoutComPayment";
import type { ExternalPaymentConfig } from "#components/payment_source/ExternalPayment";
import { snakeToCamelCase } from "#utils/snakeToCamelCase";
import { replace } from "#utils/replace";
import { pick } from "#utils/pick";
import type { ResourceKeys } from "#utils/getPaymentAttributes";

export type PaymentSourceType = Order["payment_source"];

interface Card {
  type: string;
  brand: string;
  last4: string;
  exp_year: number;
  exp_month: number;
}

export interface PaymentSourceObject {
  adyen_payments: AdyenPayment & {
    payment_request_data?: {
      payment_method?: Card;
    };
    payment_response?: {
      resultCode?: "Authorised";
    };
  };
  braintree_payments: BraintreePayment & {
    options?: {
      card: Card;
    };
  };
  external_payments: ExternalPayment & {
    payment_source_token?: string;
  };
  paypal_payments: PaypalPayment;
  stripe_payments: StripePayment & {
    options?: {
      card: Card;
    };
    payment_method?: {
      card: Card;
      type: string | "klarna" | "card";
    };
  };
  wire_transfers: WireTransfer;
  checkout_com_payments: CheckoutComPayment & {
    payment_response: {
      source?: Pick<Card, "last4"> & {
        scheme: string;
        expiry_year: number;
        expiry_month: number;
      };
    };
  };
  klarna_payments: KlarnaPayment;
}

export type PaymentMethodActionType =
  | "setErrors"
  | "setPaymentMethods"
  | "setPaymentMethodConfig"
  | "setPaymentSource"
  | "setPaymentRef"
  | "setLoading";

export type PaymentRef = MutableRefObject<null | HTMLFormElement>;

export interface PaymentMethodActionPayload {
  errors: BaseError[];
  paymentMethods: PaymentMethod[] | null;
  currentPaymentMethodType: PaymentResource;
  currentPaymentMethodId: string;
  currentPaymentMethodRef: PaymentRef;
  currentCustomerPaymentSourceId: string | null;
  config: PaymentMethodConfig;
  paymentSource: Order["payment_source"] | null;
  loading: boolean;
}

export function setLoading({
  loading,
  dispatch,
}: {
  loading: boolean;
  dispatch?: Dispatch<PaymentMethodAction>;
}): void {
  if (dispatch)
    dispatch({
      type: "setLoading",
      payload: { loading },
    });
}

export type SetPaymentRef = (args: {
  ref: PaymentRef;
  dispatch?: Dispatch<PaymentMethodAction>;
}) => void;

export const setPaymentRef: SetPaymentRef = ({ ref, dispatch }) => {
  if (ref && dispatch) {
    dispatch({
      type: "setPaymentRef",
      payload: {
        currentPaymentMethodRef: ref,
      },
    });
  }
};

export type PaymentMethodState = Partial<PaymentMethodActionPayload>;

export interface PaymentMethodAction {
  type: PaymentMethodActionType;
  payload: Partial<PaymentMethodActionPayload>;
}

export const paymentMethodInitialState: PaymentMethodState = {
  errors: [],
  paymentMethods: undefined,
};

export type SetPaymentMethodErrors = <V extends BaseError[]>(
  errors: V,
  dispatch?: Dispatch<PaymentMethodAction>,
) => void;

export const setPaymentMethodErrors: SetPaymentMethodErrors = (
  errors,
  dispatch,
) => {
  if (dispatch)
    dispatch({
      type: "setErrors",
      payload: {
        errors,
      },
    });
};

type GetPaymentMethods = (args: {
  order: Order;
  dispatch: Dispatch<PaymentMethodAction>;
}) => Promise<void>;

export const getPaymentMethods: GetPaymentMethods = async ({
  order,
  dispatch,
}) => {
  const paymentMethods = order.available_payment_methods;
  const paymentMethod = order.payment_method;
  const paymentSource = order.payment_source;
  dispatch({
    type: "setPaymentMethods",
    payload: {
      paymentMethods,
      currentPaymentMethodId: paymentMethod?.id,
      currentPaymentMethodType:
        paymentMethod?.payment_source_type as PaymentResource,
      paymentSource,
    },
  });
};

export type PaymentResource = keyof PaymentSourceObject;

export type PaymentResourceKey =
  | "braintreePayment"
  | "stripePayment"
  | "klarnaPayment"
  | "wireTransfer"
  | "paypalPayment"
  | "adyenPayment"
  | "checkoutComPayment";

export type SDKPaymentResource =
  | "AdyenPayment"
  | "BraintreePayment"
  | "ExternalPayment"
  | "PaypalPayment"
  | "StripePayment"
  | "WireTransfer"
  | "CheckoutComPayment";

interface TSetPaymentMethodParams {
  config?: CommerceLayerConfig;
  dispatch?: Dispatch<PaymentMethodAction>;
  updateOrder?: typeof updateOrder;
  setOrderErrors?: (collection: any) => { success: boolean };
  order?: Order;
  paymentMethodId: string;
  paymentResource?: PaymentResource;
}

export async function setPaymentMethod({
  config,
  dispatch,
  order,
  paymentMethodId,
  updateOrder,
  setOrderErrors,
  paymentResource,
}: TSetPaymentMethodParams): Promise<{ success: boolean; order?: Order }> {
  let response: { success: boolean; order?: Order } = {
    success: false,
  };
  try {
    if (config && order && dispatch && paymentResource) {
      localStorage.removeItem("_save_payment_source_to_customer_wallet");
      const sdk = getSdk(config);
      const attributes = {
        payment_method: sdk.payment_methods.relationship(paymentMethodId),
      };
      if (updateOrder != null) {
        const currentOrder = await updateOrder({ id: order.id, attributes });
        response = currentOrder;
      }
      dispatch({
        type: "setPaymentMethods",
        payload: {
          currentPaymentMethodId: paymentMethodId,
          currentPaymentMethodType: paymentResource,
          errors: [],
        },
      });
      if (setOrderErrors) setOrderErrors([]);
    }
    return response;
  } catch (error: any) {
    const errors = getErrors({
      error,
      resource: "orders",
      field: paymentResource,
    });
    console.error("Set payment method", errors);
    return response;
  }
}

type PaymentSourceTypes =
  | (StripePayment & WireTransfer)
  | (StripePayment | WireTransfer);

export type SetPaymentSourceResponse = {
  order: Order;
  paymentSource: PaymentSourceTypes;
} | null;

export interface SetPaymentSourceParams
  extends Omit<PaymentMethodState, "config"> {
  config?: CommerceLayerConfig;
  dispatch?: Dispatch<PaymentMethodAction>;
  getOrder?: getOrderContext;
  attributes?: Record<string, unknown>;
  order?: Order;
  paymentResource: PaymentResource;
  paymentSourceId?: string;
  customerPaymentSourceId?: string;
  updateOrder?: typeof updateOrder;
}

export async function setPaymentSource({
  config,
  dispatch,
  getOrder,
  attributes,
  order,
  paymentResource,
  customerPaymentSourceId,
  paymentSourceId,
  updateOrder,
  errors: currentErrors,
}: SetPaymentSourceParams): Promise<PaymentSourceType | undefined | null> {
  try {
    const isAlreadyPlaced = order?.status === "placed";
    if (config && order && !isAlreadyPlaced) {
      let paymentSource: PaymentSourceType;
      const sdk = getSdk(config);
      if (!customerPaymentSourceId) {
        if (!paymentSourceId) {
          const attrs: any = {
            ...attributes,
            order: sdk.orders.relationship(order.id),
          };
          paymentSource = await sdk[paymentResource].create(attrs);
        } else {
          const attrs = {
            id: paymentSourceId,
            ...attributes,
          };
          paymentSource =
            attributes != null
              ? await sdk[paymentResource].update(attrs)
              : await sdk[paymentResource].retrieve(paymentSourceId);
        }
        getOrder && (await getOrder(order.id));
        if (dispatch) {
          dispatch({
            type: "setPaymentSource",
            payload: {
              paymentSource,
              errors: [],
              currentCustomerPaymentSourceId: null,
            },
          });
        }
        return paymentSource;
      } else {
        if (updateOrder != null) {
          const { order: orderUpdated } = await updateOrder({
            id: order.id,
            attributes: {
              _customer_payment_source_id: customerPaymentSourceId,
            },
          });
          if (dispatch != null && orderUpdated != null) {
            dispatch({
              type: "setPaymentSource",
              payload: {
                paymentSource: orderUpdated.payment_source,
                currentCustomerPaymentSourceId: orderUpdated.payment_source?.id,
              },
            });
          }
        }
      }
    }
  } catch (error: any) {
    const errors = getErrors({
      error,
      resource: "payment_methods",
      field: paymentResource,
    });
    if (errors != null && errors?.length > 0) {
      const [error] = errors;
      if (error?.status === "401" && getOrder != null && order != null) {
        const currentOrder = await getOrder(order?.id);
        if (
          currentOrder?.status != null &&
          !["placed", "approved"].includes(currentOrder.status)
        ) {
          console.error("Set payment source:", errors);
          setErrors({
            currentErrors,
            newErrors: errors,
            dispatch,
          });
        }
      }
    } else {
      setErrors({
        currentErrors,
        newErrors: errors,
        dispatch,
      });
    }
  }
  return undefined;
}

export type UpdatePaymentSource = (args: {
  id: string;
  attributes: Record<string, any>;
  paymentResource: PaymentResource;
  config?: CommerceLayerConfig;
  dispatch?: Dispatch<PaymentMethodAction>;
}) => Promise<void>;

export const updatePaymentSource: UpdatePaymentSource = async ({
  id,
  attributes,
  config,
  dispatch,
  paymentResource,
}) => {
  if (config) {
    try {
      const sdk = getSdk(config);
      const paymentSource = await sdk[paymentResource].update({
        id,
        ...attributes,
      });
      if (dispatch) {
        dispatch({
          type: "setPaymentSource",
          payload: { paymentSource },
        });
      }
    } catch (err) {
      console.error("Update payment source:", err);
    }
  }
};

export type DestroyPaymentSource = (args: {
  paymentSourceId: string;
  paymentResource: PaymentResource;
  dispatch?: Dispatch<PaymentMethodAction>;
  updateOrder?: typeof updateOrder;
  orderId?: string;
}) => Promise<void>;

export const destroyPaymentSource: DestroyPaymentSource = async ({
  paymentSourceId,
  paymentResource,
  dispatch,
  // updateOrder,
  // orderId,
}) => {
  if (paymentSourceId && paymentResource) {
    // await updateOrder({
    //   id: orderId,
    //   attributes: {
    //     payment_source: {},
    //   },
    // })
    if (dispatch)
      dispatch({
        type: "setPaymentSource",
        payload: { paymentSource: undefined },
      });
  }
};

export interface PaymentMethodConfig {
  adyenPayment?: AdyenPaymentConfig;
  braintreePayment?: BraintreeConfig;
  checkoutComPayment?: CheckoutComConfig;
  externalPayment?: ExternalPaymentConfig;
  klarnaPayment?: Pick<AdyenPaymentConfig, "placeOrderCallback"> &
    Pick<StripeConfig, "containerClassName">;
  paypalPayment?: PaypalConfig;
  stripePayment?: StripeConfig;
  wireTransfer?: Partial<WireTransferConfig>;
}

type SetPaymentMethodConfig = (
  config: PaymentMethodConfig,
  dispatch: Dispatch<PaymentMethodAction>,
) => void;

export const setPaymentMethodConfig: SetPaymentMethodConfig = (
  config,
  dispatch,
) => {
  dispatch({
    type: "setPaymentMethodConfig",
    payload: { config },
  });
};

export function getPaymentConfig<
  R extends PaymentResource = PaymentResource,
  K extends PaymentMethodConfig = PaymentMethodConfig,
>(paymentResource: R, config: K): Pick<K, ResourceKeys<R>> {
  const resourceKeys = replace(
    replace(paymentResource, "payments", "payment"),
    "transfers",
    "transfer",
  );
  const resource = snakeToCamelCase(resourceKeys);
  return pick(config, [resource]);
}

const type: PaymentMethodActionType[] = [
  "setErrors",
  "setPaymentMethodConfig",
  "setPaymentMethods",
  "setPaymentSource",
  "setPaymentRef",
  "setLoading",
];

const paymentMethodReducer = (
  state: PaymentMethodState,
  reducer: PaymentMethodAction,
): PaymentMethodState =>
  baseReducer<
    PaymentMethodState,
    PaymentMethodAction,
    PaymentMethodActionType[]
  >(state, reducer, type);

export default paymentMethodReducer;
