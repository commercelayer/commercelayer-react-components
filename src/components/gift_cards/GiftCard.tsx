import { Fragment, useRef, useContext, RefObject } from 'react'
import validateFormFields from '#utils/validateFormFields'
import { isEmpty } from 'lodash'
import GiftCardContext from '#context/GiftCardContext'
import { GiftCardI } from '#reducers/GiftCardReducer'
import { BaseState } from '#typings/index'

type RequiredFields = 'currencyCode' | 'balanceCents'

type Props = {
  children: JSX.Element[] | JSX.Element
  onSubmit?: (values: BaseState) => void
} & JSX.IntrinsicElements['form']

export function GiftCard(props: Props): JSX.Element {
  const { children, onSubmit } = props
  const name = 'giftCardForm'
  const ref: RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null)
  const { addGiftCard, addGiftCardError } = useContext(GiftCardContext)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const currentForm = ref.current
    const elements = currentForm?.elements as HTMLFormControlsCollection
    const { errors, values } = validateFormFields<RequiredFields[]>(
      elements,
      ['currencyCode', 'balanceCents'],
      'gift_cards'
    )
    if (isEmpty(errors)) {
      addGiftCard(values as GiftCardI)
      currentForm?.reset()
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

export default GiftCard
