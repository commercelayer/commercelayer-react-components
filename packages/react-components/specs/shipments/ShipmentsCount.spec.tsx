import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { ShipmentsCount } from "#components/shipments/ShipmentsCount"
import ShipmentContext from "#context/ShipmentContext"

function withShipments(shipments: unknown, children: ReactNode) {
  return render(
    // biome-ignore lint/suspicious/noExplicitAny: test cast
    <ShipmentContext.Provider value={{ shipments } as any}>{children}</ShipmentContext.Provider>
  )
}

describe("ShipmentsCount", () => {
  it("renders the number of shipments", () => {
    withShipments([{ id: "ship_1" }, { id: "ship_2" }], <ShipmentsCount data-testid="count" />)

    expect(screen.getByTestId("count").textContent).toBe("2")
  })

  it("renders zero when there are no shipments", () => {
    withShipments(null, <ShipmentsCount data-testid="count" />)

    expect(screen.getByTestId("count").textContent).toBe("0")
  })

  it("passes props through to the span", () => {
    withShipments([{ id: "ship_1" }], <ShipmentsCount className="custom" data-testid="count" />)

    expect(screen.getByTestId("count").className).toBe("custom")
  })

  it("hands quantity and shipments to a children function", () => {
    withShipments(
      [{ id: "ship_1" }, { id: "ship_2" }],
      <ShipmentsCount>
        {({ quantity, shipments }) => (
          <span data-testid="custom">{`${quantity} of ${shipments?.length}`}</span>
        )}
      </ShipmentsCount>
    )

    expect(screen.getByTestId("custom").textContent).toBe("2 of 2")
    expect(screen.queryByTestId("count")).toBeNull()
  })

  it("throws outside of <Shipments>", () => {
    // useCustomContext guards against being rendered without its provider.
    expect(() => render(<ShipmentsCount />)).toThrow(
      "Cannot use <ShipmentsCount/> outside of <Shipments/>"
    )
  })
})
