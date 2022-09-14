// import  {
//   FunctionComponent,
//   Fragment,
//   ReactNode,
//   useRef,
//   useContext
// } from 'react'
// import PropTypes from 'prop-types'
// import validateFormFields from '#utils/validateFormFields'
// import _ from 'lodash'
// import GiftCardContext from '#context/GiftCardContext'
// import { GiftCardRecipientI } from '#reducers/GiftCardReducer'

// type RequiredFields = 'email'

// export interface GiftCardRecipientProps {
//   children: ReactNode
//   id?: string
//   customer?: object // Customer Collection
//   onSubmit?: () => void
// }

// const GiftCardRecipient: FunctionComponent<GiftCardRecipientProps> = props => {
//   const { children } = props
//   const { addGiftCardRecipient } = useContext(GiftCardContext)
//   const name = 'giftCardRecipientForm'
//   const ref = useRef(null)
//   const handleSubmit = (e): void => {
//     e.preventDefault()
//     const { errors, values } = validateFormFields<RequiredFields[]>(
//       ref.current.elements,
//       ['email'],
//       'giftCard'
//     )
//     if (_.isEmpty(errors)) {
//       // TODO: ADD CALLBACK TO MANAGE THE EVENT
//       addGiftCardRecipient(values as GiftCardRecipientI)
//       ref.current.reset()
//     }
//   }
//   return (
//     <Fragment>
//       <form key={name} name={name} ref={ref} onSubmit={handleSubmit}>
//         {children}
//       </form>
//     </Fragment>
//   )
// }

// GiftCardRecipient.propTypes = {
//   children: PropTypes.node.isRequired,
//   id: PropTypes.string,
//   customer: PropTypes.object
// }

// export default GiftCardRecipient
