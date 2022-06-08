import OrderContext from '#context/OrderContext'
import {
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import Parent from './Parent'

type BaseFieldChildren = Omit<BaseFieldProps, 'children'>

export type BaseFieldProps = {
  attribute: 'number' | 'id'
  children?: (props: BaseFieldChildren) => ReactNode
} & JSX.IntrinsicElements['span']

const BaseField: FunctionComponent<BaseFieldProps> = ({
  children,
  attribute,
  ...p
}) => {
  const { order } = useContext(OrderContext)
  const [field, setField] = useState('')
  useEffect(() => {
    if (order && attribute in order) setField(order[attribute] as string)
    return () => {
      setField('')
    }
  }, [order])
  const parentProps = { attribute: field, ...p }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <span {...p}>{field}</span>
  )
}

export default BaseField
