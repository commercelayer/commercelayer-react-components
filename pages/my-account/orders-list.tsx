import {
  OrderList,
  OrderListRow,
  CustomerContainer,
  CommerceLayer,
  OrderListEmpty,
  OrderListColumn
} from '@commercelayer/react-components'
import useGetToken from '../../hooks/useGetToken'
const colClassName = 'uppercase text-left p-1 text-gray-400 text-sm'
const titleClassName = 'flex flex-row items-center'
const columns: OrderListColumn[] = [
  {
    Header: 'Order',
    accessor: 'number',
    className: colClassName,
    titleClassName,
  },
  {
    Header: 'Status',
    accessor: 'status',
    className: colClassName,
    titleClassName,
  },
  {
    Header: 'Date',
    accessor: 'updated_at',
    className: colClassName,
    titleClassName,
  },
  {
    Header: 'Amount',
    accessor: 'formatted_total_amount_with_taxes',
    className: colClassName,
    titleClassName,
  },
]

const ActionsMenu = () => (
  <button
    type="button"
    className="bg-white rounded-full flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
    id="menu-button"
    aria-expanded="true"
    aria-haspopup="true"
  >
    <span className="sr-only">Open menu</span>
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  </button>
)

const OrdersList = () => {
  const config = useGetToken({ userMode: true })
  return (
    <CommerceLayer {...config}>
      <CustomerContainer>
        <OrderList
          className="table-fixed w-full border-collapse m-5"
          columns={columns}
          showActions
          actionsComponent={() => <ActionsMenu />}
          actionsContainerClassName="align-top py-5 border-b"
          theadClassName="thead-class"
          rowTrClassName="row-tr-class"
        >
          <OrderListEmpty />
          <OrderListRow field="number">
            {({ cell, order, ...p }) => {
              return <>{cell?.map((cell) => {
                return (
                  <td {...p} {...cell.getCellProps()} className="py-5 border-b">
                    <p className="font-bold">Order # {cell.render('Cell')}</p>
                    <p className="text-xs text-gray-500">
                      contains {order.skus_count} items
                    </p>
                  </td>
                )
              })}</>
            }}
          </OrderListRow>
          <OrderListRow field="status" className="align-top py-5 border-b" />
          <OrderListRow
            field="updated_at"
            className="align-top py-5 border-b"
          />
          <OrderListRow
            field="formatted_total_amount_with_taxes"
            className="align-top py-5 border-b font-bold"
          />
        </OrderList>
      </CustomerContainer>
    </CommerceLayer>
  )
}

export default OrdersList
