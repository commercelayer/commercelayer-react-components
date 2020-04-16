import PropTypes from 'prop-types'
import childrenTypes from '../utils/childrenTypes'
import {
  TimeFormat,
  BaseInputType,
  GiftCardInputName,
  baseOrderComponentPricePropTypes,
  LineItemType,
  BasePriceType,
  BaseFormatPrice,
  PTLoader,
  BMObject,
  BaseSelectorType,
} from '../@types'
import { ErrorPropTypes } from '../@types/errors'
import { BaseInputComponentPropTypes } from '../@types/index'

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
      format: 'formatted' as BaseFormatPrice,
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
      valueClassName: PropTypes.string,
      keyClassName: PropTypes.string,
      keyId: PropTypes.string,
      keyStyle: PropTypes.object,
    },
  },
  LineItemOptions: {
    permittedChildren: ['LineItemOption', 'ReactNode'],
    displayName: 'LineItemOptions',
    propTypes: {
      name: PropTypes.string.isRequired,
      children: childrenTypes.isRequired,
      showName: PropTypes.bool,
    },
    defaultProps: {
      showName: true,
    },
  },
  LineItemPrice: {
    displayName: 'LineItemPrice',
    propTypes: {
      ...baseOrderComponentPricePropTypes,
      type: PropTypes.oneOf<BasePriceType>(['total', 'unit', 'option']),
    },
    defaultProps: {
      format: 'formatted' as BaseFormatPrice,
      type: 'total' as BasePriceType,
    },
  },
  LineItemQuantity: {
    displayName: 'LineItemQuantity',
    propTypes: {
      children: PropTypes.func,
      max: PropTypes.number,
      disabled: PropTypes.bool,
    },
    defaultProps: {
      max: 50,
    },
  },
  LineItemRemove: {
    displayName: 'LineItemRemove',
    propTypes: {
      children: PropTypes.func,
      label: PropTypes.string,
    },
    defaultProps: {
      label: 'remove',
    },
  },
  LineItemsContainer: {
    permittedChildren: ['LineItemsCount', 'LineItem', 'ReactNode'],
    displayName: 'LineItemsContainer',
    propTypes: {
      children: childrenTypes.isRequired,
      filters: PropTypes.object,
      loader: PTLoader,
    },
    defaultProps: {
      filters: {},
      loader: 'Loading...',
    },
  },
  LineItemsCount: {
    displayName: 'LineItemsCount',
    propTypes: {
      children: PropTypes.func,
    },
  },
  MetadataInput: {
    displayName: 'MetadataInput',
    propTypes: BaseInputComponentPropTypes,
  },
  OrderContainer: {
    permittedChildren: [
      'ItemContainer',
      'LineItemsContainer',
      'SubTotal',
      'Discount',
      'Shipping',
      'Taxes',
      'GiftCardPrice',
      'Total',
      'Checkout',
      'GiftCardContainer',
      'ReactNode',
    ],
    displayName: 'OrderContainer',
    propTypes: {
      children: childrenTypes.isRequired,
      persistKey: PropTypes.string.isRequired,
      metadata: BMObject,
    },
    defaultProps: {
      metadata: {},
    },
  },
  Price: {
    displayName: 'Price',
    propTypes: {
      children: PropTypes.func,
      compareClassName: PropTypes.string,
      skuCode: PropTypes.string,
      showCompare: PropTypes.bool,
    },
    defaultProps: {
      skuCode: '',
    },
  },
  PriceContainer: {
    permittedChildren: ['Price', 'ReactNode'],
    displayName: 'PriceContainer',
    propTypes: {
      children: childrenTypes.isRequired,
      skuCode: PropTypes.string,
      loader: PTLoader,
      perPage: PropTypes.number,
      filters: PropTypes.object,
    },
    defaultProps: {
      perPage: 10,
      filters: {},
      loader: 'Loading...',
      skuCode: '',
    },
  },
  PriceTemplate: {
    displayName: 'PriceTemplate',
    propTypes: {
      formattedAmount: PropTypes.string,
      formattedCompare: PropTypes.string,
    },
    defaultProps: {
      formattedAmount: '',
      formattedCompare: '',
    },
  },
  QuantitySelector: {
    displayName: 'QuantitySelector',
    propTypes: {
      children: PropTypes.func,
      min: PropTypes.string,
      max: PropTypes.string,
      value: PropTypes.string,
      skuCode: PropTypes.string,
    },
    defaultProps: {
      min: '1',
    },
  },
  Shipping: {
    displayName: 'Shipping',
    propTypes: baseOrderComponentPricePropTypes,
  },
  SkuOption: {
    permittedChildren: ['SkuOptionInput', 'ReactNode'],
    displayName: 'SkuOption',
    propTypes: {
      children: childrenTypes.isRequired,
      name: PropTypes.string.isRequired,
    },
  },
  SkuOptionInput: {
    displayName: 'SkuOptionInput',
    propTypes: BaseInputComponentPropTypes,
  },
  SkuOptionsContainer: {
    permittedChildren: ['SkuOption', 'ReactNode'],
    displayName: 'SkuOptionsContainer',
    propTypes: {
      children: childrenTypes.isRequired,
      skuCode: PropTypes.string,
    },
  },
  SubmitButton: {
    displayName: 'SubmitButton',
    propTypes: {
      children: PropTypes.func,
      label: PropTypes.string,
    },
    defaultProps: {
      label: 'Submit',
    },
  },
  SubTotal: {
    displayName: 'SubTotal',
    propTypes: baseOrderComponentPricePropTypes,
    defaultProps: {
      format: 'formatted' as BaseFormatPrice,
    },
  },
  Taxes: {
    displayName: 'Taxes',
    propTypes: baseOrderComponentPricePropTypes,
    defaultProps: {
      format: 'formatted' as BaseFormatPrice,
    },
  },
  Total: {
    displayName: 'Total',
    propTypes: baseOrderComponentPricePropTypes,
    defaultProps: {
      format: 'formatted' as BaseFormatPrice,
    },
  },
  VariantContainer: {
    permittedChildren: ['VariantSelector', 'ReactNode'],
    displayName: 'VariantContainer',
    propTypes: {
      children: childrenTypes.isRequired,
      skuCode: PropTypes.string,
      filters: PropTypes.object,
    },
    defaultProps: {
      skuCode: '',
      filters: {},
    },
  },
  VariantSelector: {
    displayName: 'VariantSelector',
    propTypes: {
      skuCodes: PropTypes.arrayOf(
        PropTypes.exact({
          label: PropTypes.string.isRequired,
          code: PropTypes.string.isRequired,
        }).isRequired
      ).isRequired,
      name: PropTypes.string,
      children: PropTypes.func,
      type: PropTypes.oneOf<BaseSelectorType>(['select', 'radio']),
      loader: PropTypes.element,
      placeholder: PropTypes.string,
      skuCode: PropTypes.string,
    },
    defaultProps: {
      placeholder: 'select an variant',
      type: 'select' as BaseSelectorType,
    },
  },
  VariantTemplate: {
    displayName: 'VariantTemplate',
    propTypes: {
      variants: PropTypes.object.isRequired,
      onChange: PropTypes.func,
      skuCodes: PropTypes.arrayOf(
        PropTypes.exact({
          label: PropTypes.string.isRequired,
          code: PropTypes.string.isRequired,
        }).isRequired
      ).isRequired,
      name: PropTypes.string,
      children: PropTypes.func,
      type: PropTypes.oneOf<BaseSelectorType>(['select', 'radio']),
      loader: PropTypes.element,
      placeholder: PropTypes.string,
      skuCode: PropTypes.string,
    },
  },
}

export default components
