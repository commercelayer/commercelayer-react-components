import PropTypes from 'prop-types'
import childrenTypes from '../utils/childrenTypes'
import {
  TimeFormat,
  BaseInputType,
  GiftCardInputName,
  baseOrderComponentPricePropTypes,
  LineItemType,
} from '../@types'
import { ErrorPropTypes } from '../@types/errors'

const components = {
  AddToCart: {
    displayName: 'AddToCart',
    propTypes: {
      children: PropTypes.func,
      label: PropTypes.string,
      skuCode: PropTypes.string,
      disabled: PropTypes.bool,
    },
    defaultProps: {
      label: 'Add to cart',
    },
  },
  AvailabilityContainer: {
    displayName: 'AvailabilityContainer',
    permittedChildren: ['AvailabilityTemplate', 'ReactNode'],
    propTypes: {
      children: childrenTypes.isRequired,
      skuCode: PropTypes.string,
    },
  },
  AvailabilityTemplate: {
    displayName: 'AvailabilityTemplate',
    propTypes: {
      timeFormat: PropTypes.oneOf<TimeFormat>(['days', 'hours']),
      showShippingMethodName: PropTypes.bool,
      children: PropTypes.func,
    },
    defaultProps: {
      timeFormat: 'days',
      showShippingMethodName: false,
    },
  },
  Checkout: {
    displayName: 'Checkout',
    propTypes: {
      children: PropTypes.func,
      label: PropTypes.string,
    },
    defaultProps: {
      label: 'Checkout',
    },
  },
  CommerceLayer: {
    permittedChildren: [
      'OrderContainer',
      'PriceContainer',
      'GiftCardContainer',
      'ReactNode',
    ],
    propTypes: {
      children: childrenTypes.isRequired,
      accessToken: PropTypes.string.isRequired,
      endpoint: PropTypes.string.isRequired,
    },
  },
  Discount: {
    displayName: 'Discount',
    propTypes: baseOrderComponentPricePropTypes,
    defaultProps: {
      format: 'formatted',
    },
  },
  Errors: {
    displayName: 'Errors',
    propTypes: ErrorPropTypes,
    defaultProps: {
      messages: [],
      field: 'base',
    },
  },
  GiftCard: {
    permittedChildren: [
      'GiftCardCurrencySelector',
      'GiftCardInput',
      'Errors',
      'MetadataInput',
      'SubmitButton',
      'ReactNode',
    ],
    displayName: 'GiftCard',
    propTypes: {
      children: childrenTypes.isRequired,
      metadata: PropTypes.objectOf(PropTypes.string),
      onSubmit: PropTypes.func,
    },
    defaultProps: {
      onSubmit: undefined,
      metadata: {},
    },
  },
  GiftCardContainer: {
    permittedChildren: ['GiftCard', 'ReactNode'],
    displayName: 'GiftCardContainer',
    propTypes: {
      children: childrenTypes.isRequired,
    },
  },
  GiftCardCurrencySelector: {
    displayName: 'GiftCardCurrencySelector',
    propTypes: {
      children: PropTypes.func,
      placeholder: PropTypes.exact({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string,
      }),
      value: PropTypes.string,
      required: PropTypes.bool,
    },
    defaultProps: {
      required: true,
    },
  },
  GiftCardInput: {
    displayName: 'GiftCardInput',
    propTypes: {
      type: PropTypes.oneOf<BaseInputType>([
        'text',
        'email',
        'number',
        'date',
        'checkbox',
      ]).isRequired,
      name: PropTypes.oneOf<GiftCardInputName>([
        'balanceCents',
        'balanceMaxCents',
        'singleUse',
        'rechargeable',
        'imageUrl',
        'expiresAt',
        'referenceOrigin',
        'email',
        'firstName',
        'lastName',
        'reference',
      ]).isRequired,
      children: PropTypes.func,
      placeholder: PropTypes.string,
    },
  },
  GiftCardPrice: {
    displayName: 'GiftCardPrice',
    propTypes: baseOrderComponentPricePropTypes,
  },
  ItemContainer: {
    permittedChildren: [
      'PriceContainer',
      'VariantContainer',
      'SkuOptionContainer',
      'QuantitySelector',
      'AddToCart',
      'AvailabilityContainer',
      'ReactNode',
    ],
    displayName: 'ItemContainer',
    propTypes: {
      children: childrenTypes.isRequired,
      skuCode: PropTypes.string,
    },
  },
  LineItem: {
    permittedChildren: [
      'LineItemImage',
      'LineItemName',
      'LineItemOptions',
      'LineItemQuantity',
      'LineItemPrice',
      'LineItemRemove',
      'Errors',
      'ReactNode',
    ],
    displayName: 'LineItem',
    propTypes: {
      children: childrenTypes.isRequired,
      type: PropTypes.oneOf<LineItemType>([
        'skus',
        'gift_cards',
        'shipments',
        'paymentMethods',
        'promotions',
      ]),
    },
    defaultProps: {
      type: 'skus',
    },
  },
  LineItemImage: {
    displayName: 'LineItemImage',
    propTypes: {
      width: PropTypes.number,
      src: PropTypes.string,
      children: PropTypes.func,
    },
  },
  LineItemName: {
    displayName: 'LineItemName',
    propTypes: {
      children: PropTypes.func,
    },
  },
  LineItemOption: {
    displayName: 'LineItemOption',
    propTypes: {
      name: PropTypes.string.isRequired,
      children: PropTypes.func,
      optionKeyClassName: PropTypes.string,
      optionKeyId: PropTypes.string,
      optionKeyStyle: PropTypes.object,
    },
  },
}

export default components
