import PropTypes, { InferProps } from 'prop-types'
import React, { FunctionComponent } from 'react'

const PProps = {
  children: PropTypes.func
}

export type ParentProps = InferProps<typeof PProps>

const Parent: FunctionComponent<ParentProps> = props => {
  const Child = props.children
  return Child ? <Child {...props} /> : null
}

Parent.propTypes = PProps

export default Parent
