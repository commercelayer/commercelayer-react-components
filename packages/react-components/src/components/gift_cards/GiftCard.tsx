import { useContext, type RefObject, type JSX } from "react"
import validateFormFields from "#utils/validateFormFields"
import { isEmpty } from "#utils/isEmpty"
import GiftCardContext from "#context/GiftCardContext"
import type { GiftCardI } from "#reducers/GiftCardReducer"
import type { BaseState } from "#typings/index"
import type { DefaultChildrenType } from "#typings/globals"

type RequiredFields = "currencyCode" | "balanceCents"

interface Props extends Omit<JSX.IntrinsicElements["form"], "children" | "ref"> {
  children: DefaultChildrenType
  onSubmit?: (values: BaseState) => void
  ref?: RefObject<HTMLFormElement | null>
}

export function GiftCard(props: Props): JSX.Element {
  const { children, onSubmit, ref, ...formProps } = props
  const { addGiftCard, addGiftCardError } = useContext(GiftCardContext)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const form = e.currentTarget
    const { errors, values } = validateFormFields<RequiredFields[]>(
      form.elements,
      ["currencyCode", "balanceCents"],
      "gift_cards"
    )
    if (isEmpty(errors)) {
      addGiftCard(values as GiftCardI)
      form.reset()
      if (onSubmit) {
        onSubmit(values)
      }
    } else {
      addGiftCardError(errors)
    }
  }
  return (
    <form {...formProps} ref={ref} name="giftCardForm" onSubmit={handleSubmit}>
      {children}
    </form>
  )
}
export default GiftCard

