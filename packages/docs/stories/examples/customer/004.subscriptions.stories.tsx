import type { Meta, StoryFn } from '@storybook/react'
import CommerceLayer from '../../_internals/CommerceLayer'
import CustomerContainer from '#components/customers/CustomerContainer'
import OrderList from '#components/orders/OrderList'
import OrderListEmpty from '#components/orders/OrderListEmpty'
import OrderListRow from '#components/orders/OrderListRow'
import OrderListPaginationButtons from '#components/orders/OrderListPaginationButtons'
import OrderListPaginationInfo from '#components/orders/OrderListPaginationInfo'

const setup: Meta = {
  title: 'Examples/Customer Account/Subscription list'
}

export default setup

export const Default: StoryFn = (args) => {
  const colClassName = 'uppercase text-left p-1 text-gray-400 text-sm'
  const titleClassName = 'flex flex-row items-center gap-3 py-3'

  const columns: React.ComponentProps<typeof OrderList>['columns'] = [
    {
      header: 'Subscription',
      accessorKey: 'number',
      className: colClassName,
      titleClassName
    },
    {
      header: 'Started',
      accessorKey: 'starts_at',
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
      header: 'Frequency',
      accessorKey: 'frequency',
      className: colClassName,
      titleClassName
    },
    {
      header: 'Next run',
      accessorKey: 'next_run_at',
      className: colClassName,
      titleClassName
    }
  ]

  return (
    <CommerceLayer accessToken='customer-orders-access-token'>
      <CustomerContainer>
        <OrderList
          type='subscriptions'
          className='table-fixed w-full border-collapse'
          columns={columns}
          theadClassName='thead-class bg-gray-100'
          rowTrClassName='row-tr-class border-b'
          showPagination
          pageSize={15}
          paginationContainerClassName='flex justify-between items-center'
        >
          <OrderListEmpty emptyText='No subscriptions available' />

          <OrderListRow field='number'>
            {({ cell, order, ...p }) => {
              return (
                <>
                  {cell?.map((cell) => (
                    <div {...p} key={cell.id} className='py-5'>
                      <p className='font-bold'>
                        Subscription # {cell.renderValue<string>()}
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
          <OrderListRow field='starts_at' className='align-top py-5 border-b' />
          <OrderListRow field='status' className='align-top py-5 border-b' />
          <OrderListRow field='frequency' className='align-top py-5 border-b' />
          <OrderListRow
            field='next_run_at'
            className='align-top py-5 border-b'
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
