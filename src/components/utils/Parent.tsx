import PropTypes, { InferProps } from 'prop-types'
import React, { FunctionComponent } from 'react'

const PProps = {
  children: PropTypes.func.isRequired
}

export type ParentProps = InferProps<typeof PProps>

const Parent: FunctionComponent<ParentProps> = props => {
  const Child = props.children
  return <Child {...props} />
}

Parent.propTypes = PProps

export default Parent
