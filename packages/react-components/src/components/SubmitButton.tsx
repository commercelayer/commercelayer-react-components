import { ReactNode } from 'react'
import Parent from '#components/utils/Parent'
import { ChildrenFunction } from '#typings/index'
import isFunction from 'lodash/isFunction'

interface ChildrenProps extends Omit<Props, 'children'> {}

interface Props extends Omit<JSX.IntrinsicElements['button'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  label?: string | ReactNode
}

export function SubmitButton(props: Props): JSX.Element {
  const { children, label = 'Submit', ...p } = props
  const parentProps = {
    ...p,
    label
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button type='submit' {...p}>
      {isFunction(label) ? label() : label}
    </button>
  )
}

export default SubmitButton
