/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
	type FormEvent,
	useContext,
	useEffect,
	useRef,
	useState,
	type JSX,
} from "react";
import PaymentMethodContext from "#context/PaymentMethodContext";
import type { PaymentSourceProps } from "./PaymentSource";
import { setCustomerOrderParam } from "#utils/localStorage";
import {
	type AdditionalDetailsData,
	AdyenCheckout,
	type CardConfiguration,
	type CheckoutAdvancedFlowResponse,
	type CoreConfiguration,
	Dropin,
	type DropinConfiguration,
	type OnChangeData,
	type PayPalConfiguration,
	type SubmitData,
	type UIElement,
	type UIElementProps,
} from "@adyen/adyen-web/auto";
import Parent from "#components/utils/Parent";
import browserInfo, { cleanUrlBy } from "#utils/browserInfo";
import PlaceOrderContext from "#context/PlaceOrderContext";
import OrderContext from "#context/OrderContext";
import { getPublicIP } from "#utils/getPublicIp";
import CustomerContext from "#context/CustomerContext";

interface PaymentMethodsStyle {
	card?: CardConfiguration["styles"];
	paypal?: PayPalConfiguration["style"];
}

/**
 * Configuration options for the Adyen payment component.
 */
export interface AdyenPaymentConfig {
	/**
	 * Optional CSS class name for the card container.
	 */
	cardContainerClassName?: string;

	/**
	 * Optional CSS class name for the 3D Secure container.
	 * @deprecated
	 */
	threeDSecureContainerClassName?: string;

	/**
	 * Callback function to be called when an order is placed.
	 * @param response - An object containing the placement status.
	 */
	placeOrderCallback?: (response: { placed: boolean }) => void;

	/**
	 * Optional styles for the payment methods.
	 */
	styles?: PaymentMethodsStyle;

	/**
	 * Configuration options for the payment methods.
	 */
	paymentMethodsConfiguration?: DropinConfiguration["paymentMethodsConfiguration"];

	/**
	 * Callback function to disable a stored payment method.
	 * @param props - An object containing the recurring detail reference and shopper reference.
	 * @returns A promise that resolves to a boolean indicating whether the stored payment method was disabled.
	 */
	onDisableStoredPaymentMethod?: (props: {
		recurringDetailReference: string;
		shopperReference: string | undefined;
	}) => Promise<boolean>;
}

interface Props {
	clientKey?: string;
	config?: AdyenPaymentConfig;
	templateCustomerSaveToWallet?: PaymentSourceProps["templateCustomerSaveToWallet"];
	locale?: CoreConfiguration["locale"];
	environment?: CoreConfiguration["environment"];
}

const defaultConfig: AdyenPaymentConfig = {};

export function AdyenPayment({
	clientKey,
	config,
	templateCustomerSaveToWallet,
	environment = "test",
	locale = "en_US",
}: Props): JSX.Element | null {
	const { cardContainerClassName, styles, onDisableStoredPaymentMethod } = {
		...defaultConfig,
		...config,
	};
	const [loadAdyen, setLoadAdyen] = useState(false);
	const [checkout, setCheckout] = useState<
		UIElement<UIElementProps> | undefined
	>();
	const {
		setPaymentSource,
		paymentSource,
		setPaymentMethodErrors,
		currentPaymentMethodType,
		setPaymentRef,
		currentCustomerPaymentSourceId,
	} = useContext(PaymentMethodContext);
	const { order } = useContext(OrderContext);
	const { placeOrderButtonRef, setPlaceOrder } = useContext(PlaceOrderContext);
	const { customers } = useContext(CustomerContext);
	const ref = useRef<null | HTMLFormElement>(null);
	const dropinRef = useRef<Dropin | null>(null);

	const handleSubmit = async (
		e: FormEvent<HTMLFormElement>,
	): Promise<boolean> => {
		const savePaymentSourceToCustomerWallet: string =
			// @ts-expect-error no type
			e?.elements?.save_payment_source_to_customer_wallet?.checked;
		if (savePaymentSourceToCustomerWallet)
			setCustomerOrderParam(
				"_save_payment_source_to_customer_wallet",
				savePaymentSourceToCustomerWallet,
			);
		if (dropinRef.current) {
			dropinRef.current.submit();
		}
		return false;
	};
	const handleChange = async (state: OnChangeData): Promise<void> => {
		if (state.isValid) {
			if (ref.current) {
				ref.current.onsubmit = async () => {
					return await handleSubmit(ref.current as any);
				};
				setPaymentRef({ ref });
			}
		}
	};
	const handleOnAdditionalDetails = async (
		state: AdditionalDetailsData,
		component?: UIElement<UIElementProps>,
	): Promise<CheckoutAdvancedFlowResponse> => {
    const attributes = {
      payment_request_details: state.data,
			_details: 1,
		};
		try {
			const pSource =
				paymentSource &&
				(await setPaymentSource({
					paymentSourceId: paymentSource.id,
					paymentResource: "adyen_payments",
					attributes,
				}));
			// const adyenAction = pSource?.payment_response?.action
			// @ts-expect-error no type
			const resultCode = pSource?.payment_response?.resultCode;
			// if (adyenAction && component) {
			//   component.handleAction(adyenAction)
			//   return false
			// }
			if (["Authorised", "Pending", "Received"].includes(resultCode)) {
				if (placeOrderButtonRef?.current != null) {
					if (placeOrderButtonRef.current.disabled) {
						placeOrderButtonRef.current.disabled = false;
					}
					placeOrderButtonRef.current.click();
				}
				return {
					resultCode,
				};
			}
			if (["Cancelled", "Refused"].includes(resultCode)) {
				// @ts-expect-error no type
				const message = pSource?.payment_response?.refusalReason;
				setPaymentMethodErrors([
					{
						code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
						resource: "payment_methods",
						field: currentPaymentMethodType,
						message,
					},
				]);
				if (component) {
					component.mount("#adyen-dropin");
				}
			}
			return {
				resultCode,
			};
		} catch (error) {
			console.error("Adyen additional details error:", error);
			return {
				resultCode: "Error",
			};
		}
	};
	const onSubmit = async (
		state: SubmitData,
		component: UIElement<UIElementProps>,
	): Promise<CheckoutAdvancedFlowResponse> => {
		const url = cleanUrlBy();
		const shopperIp = await getPublicIP();
		const control = await setPaymentSource({
			paymentSourceId: paymentSource?.id,
			paymentResource: "adyen_payments",
		});
		// @ts-expect-error no type
		const controlCode = control?.payment_response?.resultCode;
		if (controlCode === "Authorised") {
			return {
				resultCode: controlCode,
			};
		}
		const attributes: any = {
			payment_request_data: {
				...state.data,
				payment_method: state.data.paymentMethod,
				return_url: url,
				origin: window.location.origin,
				redirect_from_issuer_method: "GET",
				shopper_ip: shopperIp,
				shopperInteraction: "Ecommerce",
				recurringProcessingModel: "CardOnFile",
				browser_info: {
					...browserInfo(),
				},
			},
		};
		delete attributes.payment_request_data.paymentMethod;
		try {
			await setPaymentSource({
				paymentSourceId: paymentSource?.id,
				paymentResource: "adyen_payments",
				attributes,
			});
			if (order?.id == null) {
				console.error("Order id is missing");
				return {
					resultCode: "Error",
				};
			}
			const res = await setPaymentSource({
				paymentSourceId: paymentSource?.id,
				paymentResource: "adyen_payments",
				attributes: {
					_authorize: 1,
				},
			});
			// @ts-expect-error no type
			const action = res?.payment_response?.action;
			// @ts-expect-error no type
			const resultCode = res?.payment_response?.resultCode;
			if (action != null) {
				return {
					resultCode,
					action,
				};
			}

			// @ts-expect-error no type
			const issuerType = res?.payment_instrument?.issuer_type;
			if (["Authorised", "Pending", "Received"].includes(resultCode)) {
				if (
					["apple pay", "google pay"].includes(issuerType) &&
					setPlaceOrder != null
				) {
					await setPlaceOrder({
						paymentSource: res,
						currentCustomerPaymentSourceId,
					});
					return {
						resultCode,
					};
				} else if (placeOrderButtonRef?.current != null) {
					if (placeOrderButtonRef.current.disabled) {
						placeOrderButtonRef.current.disabled = false;
					}
					placeOrderButtonRef.current.click();
				}
				return {
					resultCode,
				};
			}
			if (["Cancelled", "Refused"].includes(resultCode)) {
				// @ts-expect-error no type
				const message = res?.payment_response?.refusalReason;
				setPaymentMethodErrors([
					{
						code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
						resource: "payment_methods",
						field: currentPaymentMethodType,
						message,
					},
				]);
				if (component) {
					component.mount("#adyen-dropin");
				}
			}
			// @ts-expect-error no type
			const errorType = res?.payment_response?.errorType;
			if (errorType) {
				// @ts-expect-error no type
				const errorCode = res?.payment_response?.errorCode;
				if (errorCode === "14_006") {
					onSubmit(state, component);
				} else {
					// @ts-expect-error no type
					const message = res?.payment_response?.message;
					setPaymentMethodErrors([
						{
							code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
							resource: "payment_methods",
							field: currentPaymentMethodType,
							message,
						},
					]);
				}
			}
			return {
				resultCode,
			};
		} catch (error: any) {
			setPaymentMethodErrors([
				{
					code: "PAYMENT_INTENT_AUTHENTICATION_FAILURE",
					resource: "payment_methods",
					field: currentPaymentMethodType,
					message: error.message as string,
				},
			]);
			return {
				resultCode: `Error`,
			};
		}
	};

	useEffect(() => {
		const paymentMethodsResponse = {
			// @ts-expect-error no type
			paymentMethods: paymentSource?.payment_methods?.paymentMethods
				? // @ts-expect-error no type
					paymentSource?.payment_methods.paymentMethods
				: [],
			// @ts-expect-error no type
			storedPaymentMethods: paymentSource?.payment_methods?.storedPaymentMethods
				? // @ts-expect-error no type
					paymentSource?.payment_methods.storedPaymentMethods
				: [],
		};
		if (paymentMethodsResponse.paymentMethods.length === 0) {
			console.error(
				"Payment methods are not available. Please, check your Adyen configuration.",
			);
		}
		const showStoredPaymentMethods =
			// @ts-expect-error no type
			paymentSource?.payment_methods?.storedPaymentMethods != null ?? false;

		const options = {
			locale: order?.language_code ?? locale,
			environment,
			clientKey,
			amount: {
				currency: order?.currency_code || "",
				value: order?.total_amount_with_taxes_cents || 0,
			},
			countryCode: order?.country_code || "",
			paymentMethodsResponse,
			showPayButton: false,
			onAdditionalDetails: (state, element, actions) => {
				const onAdditionalDetails = async (): Promise<void> => {
					const { resultCode } = await handleOnAdditionalDetails(
						state,
						element,
					);
					if (["Cancelled", "Refused"].includes(resultCode)) {
						actions.reject();
					} else {
						actions.resolve({
							resultCode,
						});
					}
				};
				onAdditionalDetails();
			},
			onChange: (state) => {
				handleChange(state);
			},
			onSubmit: (state, element, actions) => {
				const handleSubmit = async (): Promise<void> => {
					const { resultCode, action } = await onSubmit(state, element);
					if (["Cancelled", "Refused"].includes(resultCode)) {
						actions.reject();
					} else if (action != null) {
						dropinRef.current?.handleAction(action);
						// actions.resolve({
						//   resultCode,
						//   action
						// })
					} else {
						actions.resolve({
							resultCode,
						});
					}
				};
				handleSubmit();
			},
		} satisfies CoreConfiguration;
		if (!ref && clientKey)
			setCustomerOrderParam("_save_payment_source_to_customer_wallet", "false");
		if (clientKey && !loadAdyen && window && !checkout) {
			const initializeAdyen = async (): Promise<void> => {
				const checkout = await AdyenCheckout(options);
				const dropin = new Dropin(checkout, {
					disableFinalAnimation: true,
					showRemovePaymentMethodButton: showStoredPaymentMethods,
					instantPaymentTypes: ["applepay", "googlepay"],
					paymentMethodsConfiguration: {
						showStoredPaymentMethods,
						paypal: {
							showPayButton: true,
							style: styles?.paypal,
							...config?.paymentMethodsConfiguration?.paypal,
						},
						card: {
							enableStoreDetails: showStoredPaymentMethods,
							styles: styles?.card,
							holderNameRequired: false,
							...config?.paymentMethodsConfiguration?.card,
						},
						...config?.paymentMethodsConfiguration,
					},
					onDisableStoredPaymentMethod: (state) => {
						const recurringDetailReference = state;
						const shopperReference = customers?.shopper_reference ?? undefined;
						if (onDisableStoredPaymentMethod != null) {
							onDisableStoredPaymentMethod({
								recurringDetailReference,
								shopperReference,
							})
								.then((response) => {
									if (response) {
										setPaymentSource({
											paymentResource: "adyen_payments",
											order,
											attributes: {},
										});
									} else {
										console.error("onDisableStoredPaymentMethod error");
									}
								})
								.catch((error) => {
									console.error("onDisableStoredPaymentMethod error", error);
								});
						}
					},
					onSelect: (component) => {
						const id: string = component._id;
						if (id.search("scheme") === -1) {
							if (ref.current) {
								if (id.search("paypal") === -1) {
									ref.current.onsubmit = async () => {
										return await handleSubmit(ref.current as any);
									};
								} else {
									ref.current.onsubmit = null;
								}
								setPaymentRef({ ref });
							}
						}
					},
				}).mount("#adyen-dropin");
				if (dropin && checkout) {
					dropinRef.current = dropin;
					setCheckout(dropin);
					setLoadAdyen(true);
				}
			};
			if (!dropinRef.current) {
				initializeAdyen();
			}
		}
		return () => {
			setPaymentRef({ ref: { current: null } });
			setLoadAdyen(false);
		};
	}, [clientKey, ref != null]);
	return !clientKey && !loadAdyen && !checkout ? null : (
		<form
			ref={ref}
			onSubmit={(e) => {
				handleSubmit(e);
			}}
		>
			<div className={cardContainerClassName} id="adyen-dropin" />
			{templateCustomerSaveToWallet && (
				<Parent {...{ name: "save_payment_source_to_customer_wallet" }}>
					{templateCustomerSaveToWallet}
				</Parent>
			)}
		</form>
	);
}

export default AdyenPayment;
