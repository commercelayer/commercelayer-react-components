import ParcelChildrenContext from '#context/ParcelChildrenContext'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import { useContext } from 'react'

interface Props {
  children: JSX.Element | JSX.Element[]
}

export function Parcels({ children }: Props): JSX.Element {
  const { parcels } = useContext(ShipmentChildrenContext)
  const components =
    parcels?.map((parcel, key): JSX.Element => {
      return (
        <ParcelChildrenContext.Provider key={key} value={{ parcel }}>
          {children}
        </ParcelChildrenContext.Provider>
      )
    }) ?? null
  return <>{components}</>
}

export default Parcels
