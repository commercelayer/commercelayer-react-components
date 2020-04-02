import React, {
  FunctionComponent,
  Fragment,
  useRef,
  useContext,
  RefObject
} from 'react'
import validateFormFields from '../utils/validateFormFields'
import _ from 'lodash'
import GiftCardContext from '../context/GiftCardContext'
import { GiftCardI } from '../reducers/GiftCardReducer'
import components from '../config/components'
import { PropsType } from '../utils/PropsType'

type RequiredFields = 'currencyCode' | 'balanceCents'

const propTypes = components.GiftCard.props
const defaultProps = components.GiftCard.defaultProps
const displayName = components.GiftCard.displayName

export type GiftCardProps = PropsType<typeof propTypes> &
  JSX.IntrinsicElements['form']

const GiftCard: FunctionComponent<GiftCardProps> = props => {
  const { children, onSubmit } = props
  const name = 'giftCardForm'
  const ref: RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null)
  const { addGiftCard, addGiftCardError } = useContext(GiftCardContext)
  const handleSubmit = (e): void => {
    e.preventDefault()
    const elements = ref.current?.elements as HTMLFormControlsCollection
    const reset = ref.current?.reset() as HTMLFormElement['current']
    const { errors, values } = validateFormFields<RequiredFields[]>(
      elements,
      ['currencyCode', 'balanceCents'],
      'giftCard'
    )
    if (_.isEmpty(errors)) {
      addGiftCard(values as GiftCardI)
      reset()
      if (onSubmit) {
        onSubmit(values)
      }
    } else {
      addGiftCardError(errors)
    }
  }
  return (
    <Fragment>
      <form key={name} name={name} ref={ref} onSubmit={handleSubmit}>
        {children}
      </form>
    </Fragment>
  )
}

GiftCard.propTypes = propTypes
GiftCard.defaultProps = defaultProps
GiftCard.displayName = displayName

export default GiftCard
