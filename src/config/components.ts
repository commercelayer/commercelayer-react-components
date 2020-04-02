import PropTypes from 'prop-types'
import childrenTypes from '../utils/childrenTypes'
import {
  TimeFormat,
  BaseOrderComponentPropTypes,
  BaseInputType,
  GiftCardInputName
} from '../@types'
import { ErrorPropTypes } from '../@types/errors'

const components = {
  AddToCart: {
    displayName: 'AddToCart',
    props: {
      children: PropTypes.func,
      label: PropTypes.string,
      skuCode: PropTypes.string,
      disabled: PropTypes.bool
    },
    defaultProps: {
      label: 'Add to cart'
    }
  },
  AvailabilityContainer: {
    displayName: 'AvailabilityContainer',
    permittedChildren: ['AvailabilityTemplate', 'ReactNode'],
    props: {
      children: childrenTypes.isRequired,
      skuCode: PropTypes.string
    }
  },
  AvailabilityTemplate: {
    displayName: 'AvailabilityTemplate',
    props: {
      timeFormat: PropTypes.oneOf<TimeFormat>(['days', 'hours']),
      showShippingMethodName: PropTypes.bool,
      children: PropTypes.func
    },
    defaultProps: {
      timeFormat: 'days',
      showShippingMethodName: false
    }
  },
  Checkout: {
    displayName: 'Checkout',
    props: {
      children: PropTypes.func,
      label: PropTypes.string
    },
    defaultProps: {
      label: 'Checkout'
    }
  },
  CommerceLayer: {
    permittedChildren: [
      'OrderContainer',
      'PriceContainer',
      'GiftCardContainer',
      'ReactNode'
    ],
    props: {
      children: childrenTypes.isRequired,
      accessToken: PropTypes.string.isRequired,
      endpoint: PropTypes.string.isRequired
    }
  },
  Discount: {
    displayName: 'Discount',
    props: BaseOrderComponentPropTypes,
    defaultProps: {
      format: 'formatted'
    }
  },
  Errors: {
    displayName: 'Errors',
    props: ErrorPropTypes,
    defaultProps: {
      messages: [],
      field: 'base'
    }
  },
  GiftCard: {
    permittedChildren: [
      'GiftCardCurrencySelector',
      'GiftCardInput',
      'Errors',
      'MetadataInput',
      'SubmitButton',
      'ReactNode'
    ],
    displayName: 'GiftCard',
    props: {
      children: childrenTypes.isRequired,
      metadata: PropTypes.objectOf(PropTypes.string),
      onSubmit: PropTypes.func
    },
    defaultProps: {
      onSubmit: undefined,
      metadata: {}
    }
  },
  GiftCardContainer: {
    permittedChildren: ['GiftCard', 'ReactNode'],
    displayName: 'GiftCardContainer',
    props: {
      children: childrenTypes.isRequired
    }
  },
  GiftCardCurrencySelector: {
    displayName: 'GiftCardCurrencySelector',
    props: {
      children: PropTypes.func,
      placeholder: PropTypes.exact({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string
      }),
      value: PropTypes.string,
      required: PropTypes.bool
    },
    defaultProps: {
      required: true
    }
  },
  GiftCardInput: {
    displayName: 'GiftCardInput',
    props: {
      type: PropTypes.oneOf<BaseInputType>([
        'text',
        'email',
        'number',
        'date',
        'checkbox'
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
        'reference'
      ]).isRequired,
      children: PropTypes.func,
      placeholder: PropTypes.string
    }
  }
}

export default components
