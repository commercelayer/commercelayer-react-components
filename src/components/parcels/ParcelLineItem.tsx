import ParcelChildrenContext from '#context/ParcelChildrenContext'
import ParcelLineItemChildrenContext from '#context/ParcelLineItemChildrenContext'
import { useContext } from 'react'

interface Props {
  children: JSX.Element[] | JSX.Element
}

export function ParcelLineItem({ children }: Props): JSX.Element {
  const { parcel } = useContext(ParcelChildrenContext)
  const components = parcel?.parcel_line_items?.map((parcelLineItem, key) => {
    return (
      <ParcelLineItemChildrenContext.Provider
        key={key}
        value={{ parcelLineItem }}
      >
        {children}
      </ParcelLineItemChildrenContext.Provider>
    )
  })
  return <>{components}</>
}

export default ParcelLineItem
