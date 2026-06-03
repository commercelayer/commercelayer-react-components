import type { ShippingMethod as ShippingMethodResource } from "@commercelayer/sdk"
import { render, screen } from "@testing-library/react"
import { useContext } from "react"
import { describe, expect, it } from "vitest"
import { ShippingMethod } from "#components/shipping_methods/ShippingMethod"
import ShippingMethodChildrenContext from "#context/ShippingMethodChildrenContext"
import {
  MOCK_DELIVERY_LEAD_TIME,
  MOCK_SHIPMENT,
  MOCK_SHIPPING_METHOD,
  ShipmentChildrenProvider,
} from "./helpers"

function Consumer() {
  const { shippingMethod, currentShippingMethodId, deliveryLeadTimeForShipment, shipmentId } =
    useContext(ShippingMethodChildrenContext)
  return (
    <div>
      <span data-testid="sm-id">{shippingMethod?.id}</span>
      <span data-testid="current-id">{currentShippingMethodId}</span>
      <span data-testid="dlt-id">{deliveryLeadTimeForShipment?.id}</span>
      <span data-testid="shipment-id">{shipmentId}</span>
    </div>
  )
}

const MOCK_SM_2: Partial<ShippingMethodResource> = {
  id: "sm_2",
  name: "Express Shipping",
  // biome-ignore lint/suspicious/noExplicitAny: test cast
  scheme: "flat" as any,
}

describe("ShippingMethod component", () => {
  it("renders children for each available shipping method", () => {
    render(
      <ShipmentChildrenProvider shippingMethods={[MOCK_SHIPPING_METHOD, MOCK_SM_2]}>
        <ShippingMethod>
          <Consumer />
        </ShippingMethod>
      </ShipmentChildrenProvider>
    )

    expect(screen.getAllByTestId("sm-id")).toHaveLength(2)
    expect(screen.getAllByTestId("sm-id")[0].textContent).toBe("sm_1")
    expect(screen.getAllByTestId("sm-id")[1].textContent).toBe("sm_2")
  })

  it("shows only the current method when readonly", () => {
    render(
      <ShipmentChildrenProvider
        shippingMethods={[MOCK_SHIPPING_METHOD, MOCK_SM_2]}
        currentShippingMethodId="sm_2"
      >
        <ShippingMethod readonly>
          <Consumer />
        </ShippingMethod>
      </ShipmentChildrenProvider>
    )

    const ids = screen.getAllByTestId("sm-id")
    expect(ids).toHaveLength(1)
    expect(ids[0].textContent).toBe("sm_2")
  })

  it("shows default emptyText when no shipping methods are available", () => {
    render(
      <ShipmentChildrenProvider shippingMethods={[]}>
        <ShippingMethod>
          <Consumer />
        </ShippingMethod>
      </ShipmentChildrenProvider>
    )

    expect(screen.getByText("There are not any shipping method available")).toBeDefined()
    expect(screen.queryByTestId("sm-id")).toBeNull()
  })

  it("shows custom emptyText when provided and no methods", () => {
    render(
      <ShipmentChildrenProvider shippingMethods={[]}>
        <ShippingMethod emptyText="No methods">
          <Consumer />
        </ShippingMethod>
      </ShipmentChildrenProvider>
    )

    expect(screen.getByText("No methods")).toBeDefined()
  })

  it("passes correct context including deliveryLeadTime matched by shipping_method id", () => {
    const dlt2 = { ...MOCK_DELIVERY_LEAD_TIME, id: "dlt_2", shipping_method: { id: "sm_2" } }
    render(
      <ShipmentChildrenProvider
        shippingMethods={[MOCK_SHIPPING_METHOD, MOCK_SM_2]}
        currentShippingMethodId="sm_1"
        deliveryLeadTimes={[MOCK_DELIVERY_LEAD_TIME, dlt2]}
      >
        <ShippingMethod>
          <Consumer />
        </ShippingMethod>
      </ShipmentChildrenProvider>
    )

    const dltIds = screen.getAllByTestId("dlt-id")
    expect(dltIds[0].textContent).toBe("dlt_1")
    expect(dltIds[1].textContent).toBe("dlt_2")
  })

  it("passes shipmentId from the shipment in context", () => {
    render(
      <ShipmentChildrenProvider shipment={MOCK_SHIPMENT}>
        <ShippingMethod>
          <Consumer />
        </ShippingMethod>
      </ShipmentChildrenProvider>
    )

    expect(screen.getByTestId("shipment-id").textContent).toBe("ship_1")
  })

  it("shows emptyText when shippingMethods is null", () => {
    render(
      <ShipmentChildrenProvider shippingMethods={null}>
        <ShippingMethod emptyText="No methods found">
          <Consumer />
        </ShippingMethod>
      </ShipmentChildrenProvider>
    )

    expect(screen.getByText("No methods found")).toBeDefined()
  })

  it("renders methods when deliveryLeadTimes is null (no lead time in context)", () => {
    render(
      <ShipmentChildrenProvider shippingMethods={[MOCK_SHIPPING_METHOD]} deliveryLeadTimes={null}>
        <ShippingMethod>
          <Consumer />
        </ShippingMethod>
      </ShipmentChildrenProvider>
    )

    expect(screen.getByTestId("sm-id").textContent).toBe("sm_1")
    // dlt-id is empty since no deliveryLeadTimes
    expect(screen.getByTestId("dlt-id").textContent).toBe("")
  })
})
