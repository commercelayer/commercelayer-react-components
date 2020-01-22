import React, { Fragment } from 'react'

export default function LineItemName(props) {
  return <p className={props.className}>{props.lineItem.name}</p>
}
