import {
  CommerceLayer,
  CustomerContainer,
  OrderList,
  OrderListRow,
} from '@commercelayer/react-components'
import React from 'react'
import useGetToken from '../../hooks/useGetToken'
const colClassName = 'uppercase text-left p-1 text-gray-400 text-sm'
const columns = [
  {
    Header: 'Order',
    accessor: 'number',
    className: colClassName,
  },
  {
    Header: 'Status',
    accessor: 'status',
    className: colClassName,
  },
  {
    Header: 'Date',
    accessor: 'updated_at',
    className: colClassName,
  },
]

const OrdersList = () => {
  const config = useGetToken({ userMode: true })
  return (
    <CommerceLayer {...config}>
      <CustomerContainer>
        <OrderList
          className="table-fixed w-full border-collapse m-5"
          columns={columns}
        >
          <OrderListRow field="number">
            {({ cell, order, ...p }) => {
              return cell.map((cell) => {
                return (
                  <td {...p} {...cell.getCellProps()} className="py-2 border-b">
                    <p className="font-bold">Order # {cell.render('Cell')}</p>
                    <p className="text-xs text-gray-500">
                      contains {order.skus_count} items
                    </p>
                  </td>
                )
              })
            }}
          </OrderListRow>
          <OrderListRow field="status" className="align-top py-2 border-b" />
          <OrderListRow
            field="updated_at"
            className="align-top py-2 border-b"
          />
        </OrderList>
      </CustomerContainer>
    </CommerceLayer>
  )
}

export default OrdersList
