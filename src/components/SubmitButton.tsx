import Parent from '#components-utils/Parent'
import { FunctionChildren } from '#typings/index'
import isFunction from 'lodash/isFunction'

type ChildrenProps = FunctionChildren<Omit<Props, 'children'>>

type Props = {
  children?: ChildrenProps
  label?: string | JSX.Element
} & JSX.IntrinsicElements['button']

export function SubmitButton(props: Props): JSX.Element {
  const { children, label = 'Submit', ...p } = props
  const parentProps = {
    ...p,
    label,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button type="submit" {...p}>
      {isFunction(label) ? label() : label}
    </button>
  )
}

export default SubmitButton
