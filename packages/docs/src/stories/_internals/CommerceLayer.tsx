import { CommerceLayer as CommerceLayerComponent } from "@commercelayer/react-components"
import { useGetToken } from "./useGetToken"

type DefaultChildrenType = JSX.Element[] | JSX.Element | null

interface Props {
  children: DefaultChildrenType
  accessToken: "customer-access-token" | "customer-orders-access-token" | "my-access-token" // guest token
  endpoint?: string
}

/**
 * Custom setup for the `CommerceLayer` component that can be used in Storybook.
 * without exposing the `accessToken` and `endpoint` props.
 */
function CommerceLayer({ children, ...props }: Props): JSX.Element {
  const { accessToken, endpoint } = useGetToken({
    mode:
      props.accessToken === "customer-access-token"
        ? "customer"
        : props.accessToken === "customer-orders-access-token"
          ? "customer-orders"
          : "guest",
  })

  return (
    <CommerceLayerComponent accessToken={accessToken} endpoint={endpoint}>
      {children}
    </CommerceLayerComponent>
  )
}

export default CommerceLayer
