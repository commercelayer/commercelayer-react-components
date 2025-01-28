import Parent from '#components/utils/Parent'
import OrderListPaginationContext, {
  type OrderListPaginationContext as TOrderListPaginationContext
} from '#context/OrderListPaginationContext'
import type { ChildrenFunction } from '#typings/index'
import useCustomContext from '#utils/hooks/useCustomContext'
import omit from '#utils/omit'

import type { JSX } from "react";

interface PaginationButton
  extends Omit<JSX.IntrinsicElements['button'], 'children' | 'disabled'> {
  /**
   * Show or hide the pagination button. Default is true.
   */
  show?: boolean
  /**
   * Label to display
   */
  label?: string | JSX.Element
  /**
   * Hide the pagination button when the attribute disabled is true. Default is false.
   */
  hideWhenDisabled?: boolean
}

interface NavigationButtons
  extends Omit<JSX.IntrinsicElements['button'], 'children'> {
  /**
   * Show or hide the navigation buttons. Default is true.
   */
  show?: boolean
  /**
   * Attach the class name to the current page button
   */
  activeClassName?: string
}

type ChildrenProps = Omit<Props, 'children'> & TOrderListPaginationContext

interface Props extends Omit<JSX.IntrinsicElements['div'], 'children'> {
  children?: ChildrenFunction<ChildrenProps>
  /**
   * Previous button props
   */
  previousPageButton?: PaginationButton
  /**
   * Next button props
   */
  nextPageButton?: PaginationButton
  /**
   * Navigation buttons props
   */
  navigationButtons?: NavigationButtons
}

export function OrderListPaginationButtons({
  previousPageButton,
  nextPageButton,
  navigationButtons,
  children,
  ...props
}: Props): JSX.Element | null {
  const { ...prevButton } = { show: true, ...previousPageButton }
  const { ...nextButton } = { show: true, ...nextPageButton }
  const { ...navButton } = { show: true, ...navigationButtons }
  const ctx = useCustomContext({
    context: OrderListPaginationContext,
    contextComponentName: 'OrderList',
    currentComponentName: 'OrderListPaginationButtons',
    key: 'totalRows'
  })
  const PrevButton = prevButton.show ? (
    prevButton.hideWhenDisabled === true &&
    ctx?.canPreviousPage === false ? null : (
      <button
        data-testid='prev-button'
        {...omit(prevButton, ['show', 'hideWhenDisabled'])}
        disabled={ctx?.canPreviousPage === false}
        onClick={() => ctx?.previousPage()}
      >
        {previousPageButton?.label ?? '<'}
      </button>
    )
  ) : null
  const NextButton = nextButton.show ? (
    nextButton.hideWhenDisabled === true &&
    ctx?.canNextPage === false ? null : (
      <button
        data-testid='next-button'
        {...omit(nextButton, ['show', 'hideWhenDisabled'])}
        disabled={ctx?.canNextPage === false}
        onClick={() => ctx?.nextPage()}
      >
        {nextButton?.label ?? '>'}
      </button>
    )
  ) : null
  const pagesToShow =
    ctx?.canPreviousPage === false
      ? ctx?.pageOptions.slice(0, 3).map((v) => v + 1)
      : ctx?.canNextPage === false
        ? ctx?.pageOptions
            .slice(ctx?.pageOptions.length - 3, ctx?.pageOptions.length)
            .map((v) => v + 1)
        : ctx?.pageOptions
            .slice(ctx?.pageIndex - 1, ctx?.pageIndex + 2)
            .map((v) => v + 1)
  const NavButtons = navButton.show
    ? pagesToShow?.map((v) => {
        const currentPage = ctx?.pageIndex != null ? ctx?.pageIndex + 1 : 1
        const className =
          currentPage === v
            ? `${navButton?.className ?? ''} ${
                navButton?.activeClassName ?? ''
              }`
            : navButton?.className
        return (
          <button
            data-testid={`page-${v}`}
            key={`page-${v}`}
            {...omit(navButton, ['show', 'activeClassName', 'className'])}
            className={className}
            onClick={() => ctx?.gotoPage(v - 1)}
          >
            {v}
          </button>
        )
      })
    : null
  const parentProps = {
    navigationButtons,
    prevButton,
    nextButton,
    ...ctx,
    ...props
  }
  return children == null ? (
    ctx?.totalRows === 0 ? null : (
      <div {...props}>
        {PrevButton}
        {NavButtons}
        {NextButton}
      </div>
    )
  ) : (
    <Parent {...parentProps}>{children}</Parent>
  )
}

OrderListPaginationButtons.displayName = 'OrderListPaginationButtons'

export default OrderListPaginationButtons
