import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../../_internals/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import OrderList from '#components/orders/OrderList'
import OrderListEmpty from '#components/orders/OrderListEmpty'
import OrderListRow from '#components/orders/OrderListRow'
import OrderListPaginationButtons from '#components/orders/OrderListPaginationButtons'
import OrderListPaginationInfo from '#components/orders/OrderListPaginationInfo'

const setup: Meta = {
  title: 'Examples/Customer Account/Order list'
}

export default setup

export const Default: StoryFn = (args) => {
  const colClassName = 'uppercase text-left p-1 text-gray-400 text-sm'
  const titleClassName = 'flex flex-row items-center gap-3 py-3'

  const columns: React.ComponentProps<typeof OrderList>['columns'] = [
    {
      header: 'Order',
      accessorKey: 'number',
      className: colClassName,
      titleClassName
    },
    {
      header: 'Status',
      accessorKey: 'status',
      className: colClassName,
      titleClassName
    },
    {
      header: 'Date',
      accessorKey: 'updated_at',
      className: colClassName,
      titleClassName
    },
    {
      header: 'Amount',
      accessorKey: 'formatted_total_amount_with_taxes',
      className: colClassName,
      titleClassName
    }
  ]

  return (
    <CommerceLayer accessToken='customer-orders-access-token'>
      <CustomerContainer>
        <OrderList
          type='orders'
          className='table-fixed w-full border-collapse'
          columns={columns}
          theadClassName='thead-class bg-gray-100'
          rowTrClassName='row-tr-class border-b'
          showPagination
          pageSize={15}
          paginationContainerClassName='flex justify-between items-center'
        >
          <OrderListEmpty />

          <OrderListRow field='number'>
            {({ cell, order, ...p }) => {
              return (
                <>
                  {cell?.map((cell) => (
                    <div {...p} key={cell.id} className='py-5'>
                      <p className='font-bold'>
                        Order # {cell.renderValue<string>()}
                      </p>
                      {order.type === 'order_subscriptions' ? null : (
                        <p className='text-xs text-gray-500'>
                          contains {order.skus_count} items
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )
            }}
          </OrderListRow>
          <OrderListRow field='status' className='align-top py-5 border-b' />
          <OrderListRow
            field='updated_at'
            className='align-top py-5 border-b'
          />
          <OrderListRow
            field='formatted_total_amount_with_taxes'
            className='align-top py-5 border-b font-bold'
          />
          <OrderListPaginationInfo className='text-sm text-gray-500' />
          <OrderListPaginationButtons
            previousPageButton={{
              className:
                'w-[46px] h-[38px] mr-2 border rounded text-sm text-gray-500',
              show: true,
              hideWhenDisabled: true
            }}
            nextPageButton={{
              className:
                'w-[46px] h-[38px] mr-2 border rounded text-sm text-gray-500',
              show: true,
              hideWhenDisabled: true
            }}
            navigationButtons={{
              className:
                'w-[46px] h-[38px] mr-2 border rounded text-sm text-gray-500',
              activeClassName:
                'text-primary font-semibold border-primary border-2'
            }}
            className='p-2'
          />
        </OrderList>
      </CustomerContainer>
    </CommerceLayer>
  )
}

Default.parameters = {
  docs: {
    source: {
      type: 'code'
    }
  }
}
