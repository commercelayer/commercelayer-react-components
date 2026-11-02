import { CommerceLayer as CommerceLayerComponent } from "@commercelayer/react-components"
import { useGetToken } from "./useGetToken"

type DefaultChildrenType = JSX.Element[] | JSX.Element | null

interface Props {
  children: DefaultChildrenType
  accessToken: "customer-access-token" | "customer-orders-access-token" | "my-access-token" // guest token
}

/**
 * Custom setup for the `CommerceLayer` component that can be used in Storybook.
 * without exposing the `accessToken` prop.
 */
function CommerceLayer({ children, ...props }: Props): JSX.Element {
  const { accessToken } = useGetToken({
    mode:
      props.accessToken === "customer-access-token"
        ? "customer"
        : props.accessToken === "customer-orders-access-token"
          ? "customer-orders"
          : "guest",
  })

  return (
    <CommerceLayerComponent accessToken={accessToken}>
      {children}
    </CommerceLayerComponent>
  )
}

export default CommerceLayer
