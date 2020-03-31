import PropTypes from 'prop-types'
import childrenTypes from '../utils/childrenTypes'
import { TimeFormat, BaseOrderComponentPropTypes } from '../@types'
import { ErrorPropTypes } from '../@types/errors'

const components = {
  AddToCart: {
    displayName: 'CLAddToCart',
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
    displayName: 'CLAvailabilityContainer',
    permittedChildren: ['AvailabilityTemplate', 'ReactNode'],
    props: {
      children: childrenTypes.isRequired,
      skuCode: PropTypes.string
    }
  },
  AvailabilityTemplate: {
    displayName: 'CLAvailabilityTemplate',
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
    displayName: 'CLCheckout',
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
    displayName: 'CLDiscount',
    props: BaseOrderComponentPropTypes,
    defaultProps: {
      format: 'formatted'
    }
  },
  Errors: {
    displayName: 'CLErrors',
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
    displayName: 'CLGiftCard',
    props: {
      children: childrenTypes.isRequired,
      metadata: PropTypes.objectOf(PropTypes.string),
      onSubmit: PropTypes.func
    },
    defaultProps: {
      onSubmit: undefined,
      metadata: {}
    }
  }
}

export default components
