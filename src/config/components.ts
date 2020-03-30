import PropTypes from 'prop-types'
import childrenTypes from '../utils/childrenTypes'
import { TimeFormat } from '../@types'

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
  }
}

export default components
