// TODO: add action to onClick event
import React from 'react'

export interface AddToCartProps {
  className?: string
  label?: string
  onClick?: () => void
  disabled?: boolean
}

export default function AddToCart(props) {
  return (
    <button className={props.className}>
      {props.label ? props.label : 'add to cart'}
    </button>
  )
}
