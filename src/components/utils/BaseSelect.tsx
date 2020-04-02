import React, { FunctionComponent, useEffect } from 'react'
import Parent from './Parent'
import { PropsType } from '../../utils/PropsType'
import { BaseSelectComponentPropTypes } from '../../@types'

export type BaseSelectProps = PropsType<typeof BaseSelectComponentPropTypes>

const BaseSelect: FunctionComponent<BaseSelectProps> = props => {
  const { options, children, placeholder, value, ...p } = props
  useEffect(() => {
    if (options.indexOf(placeholder as any) === -1) {
      options.unshift(placeholder as any)
    }
  }, [])
  const Options = options.map((o, k) => {
    return (
      <option key={k} value={o.value}>
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
    <select value={value || ''} {...p}>
      {Options}
    </select>
  )
}

BaseSelect.propTypes = BaseSelectComponentPropTypes
BaseSelect.defaultProps = {
  value: '',
  options: [],
  placeholder: {
    label: 'select an option',
    value: ''
  }
}

export default BaseSelect
