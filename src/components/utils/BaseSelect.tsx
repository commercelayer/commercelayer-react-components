import React, { FunctionComponent } from 'react'
import PropTypes from 'prop-types'
import { BaseComponent } from '../../@types/index'
import Parent from './Parent'

interface OptionType {
  label: string
  value: number | string
  selected?: boolean
}

export interface BaseSelectProps extends BaseComponent {
  name: string
  options: OptionType[]
  value?: string
  required?: boolean
  placeholder?: OptionType
  children?: FunctionComponent
}

const BaseSelect: FunctionComponent<BaseSelectProps> = props => {
  const { options, children, placeholder, ...p } = props
  options.unshift(placeholder)
  const Options = options.map((o, k) => {
    return (
      <option selected={o.selected} key={k} value={o.value}>
        {o.label}
      </option>
    )
  })
  const parentProps = {
    options,
    ...p
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <select {...p}>{Options}</select>
  )
}

BaseSelect.propTypes = {
  options: PropTypes.arrayOf<OptionType>(
    PropTypes.exact({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      selected: PropTypes.bool
    })
  ).isRequired,
  placeholder: PropTypes.exact({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    selected: PropTypes.bool
  })
}

BaseSelect.defaultProps = {
  options: [],
  placeholder: {
    label: 'select an option',
    value: '',
    selected: true
  }
}

export default BaseSelect
