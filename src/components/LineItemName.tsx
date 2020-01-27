import React, { Fragment, useContext } from 'react'
import LineItemChildrenContext from './context/LineItemChildrenContext'

export default function LineItemName(props) {
  const { lineItem } = useContext(LineItemChildrenContext)
  return <p className={props.className}>{lineItem.name}</p>
}
