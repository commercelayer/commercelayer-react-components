import ParcelChildrenContext from '#context/ParcelChildrenContext'
import ShipmentChildrenContext from '#context/ShipmentChildrenContext'
import { useContext, type JSX } from 'react';

interface Props {
  children: JSX.Element | JSX.Element[]
  filterBy?: string[]
}

export function Parcels({ children, filterBy }: Props): JSX.Element {
  const { parcels } = useContext(ShipmentChildrenContext)
  const components = parcels
    ?.filter((parcel) => filterBy?.includes(parcel.id) ?? true)
    .map((parcel, key): JSX.Element => {
      return (
        <ParcelChildrenContext.Provider key={key} value={{ parcel }}>
          {children}
        </ParcelChildrenContext.Provider>
      )
    })
  return <>{components}</>
}

export default Parcels
