import { useRef, useContext, type RefObject, type JSX } from 'react';
import validateFormFields from '#utils/validateFormFields'
import isEmpty from 'lodash/isEmpty'
import GiftCardContext from '#context/GiftCardContext'
import type { GiftCardI } from '#reducers/GiftCardReducer'
import type { BaseState } from '#typings/index'
import type { DefaultChildrenType } from '#typings/globals'

type RequiredFields = 'currencyCode' | 'balanceCents'

interface Props extends Omit<JSX.IntrinsicElements['form'], 'children' | 'ref'> {
  children: DefaultChildrenType
  onSubmit?: (values: BaseState) => void
  ref?: RefObject<HTMLFormElement | null>
}

export function GiftCard(props: Props): JSX.Element {
  const { children, onSubmit } = props
  const name = 'giftCardForm'
  const ref: RefObject<HTMLFormElement | null> = useRef<HTMLFormElement>(null)
  const { addGiftCard, addGiftCardError } = useContext(GiftCardContext)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const currentForm = ref.current
    const elements = currentForm?.elements
    const { errors, values } = validateFormFields<RequiredFields[]>(
      // @ts-expect-error type undefined
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
    <>
      <form key={name} name={name} onSubmit={handleSubmit}>
        {children}
      </form>
    </>
  )
}

export default GiftCard
