import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  collectPageDeviceData,
  DEVICE_DATA_WAIT_MS,
  pageDeviceData,
  resetPageDeviceData,
} from "#utils/braintree"

const { dataCollectorCreate } = vi.hoisted(() => ({ dataCollectorCreate: vi.fn() }))
vi.mock("braintree-web/data-collector", () => ({ default: { create: dataCollectorCreate } }))

const CLIENT = { name: "client" } as never
const DEVICE_DATA = '{"correlation_id":"abc"}'

describe("page device data", () => {
  beforeEach(() => {
    resetPageDeviceData()
    dataCollectorCreate.mockReset()
    dataCollectorCreate.mockResolvedValue({ deviceData: DEVICE_DATA })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("collects with the first client and hands its device data to every payment", async () => {
    collectPageDeviceData(CLIENT)

    await expect(pageDeviceData()).resolves.toBe(DEVICE_DATA)
    await expect(pageDeviceData()).resolves.toBe(DEVICE_DATA)
    expect(dataCollectorCreate).toHaveBeenCalledWith({ client: CLIENT })
  })

  // FraudNet's session is the page's: a second collector would share its id
  // and, torn down, remove the first one's iframes.
  it("creates one collector per page, whichever component asks", async () => {
    collectPageDeviceData(CLIENT)
    collectPageDeviceData({ name: "another client" } as never)

    await pageDeviceData()
    expect(dataCollectorCreate).toHaveBeenCalledTimes(1)
  })

  it("has no device data when nothing started collecting", async () => {
    await expect(pageDeviceData()).resolves.toBeUndefined()
    expect(dataCollectorCreate).not.toHaveBeenCalled()
  })

  it("pays without device data when the collector fails, and tries again with the next component", async () => {
    dataCollectorCreate.mockRejectedValueOnce(new Error("DATA_COLLECTOR_REQUIRES_CREATE_OPTIONS"))
    collectPageDeviceData(CLIENT)

    await expect(pageDeviceData()).resolves.toBeUndefined()

    collectPageDeviceData(CLIENT)
    await expect(pageDeviceData()).resolves.toBe(DEVICE_DATA)
    expect(dataCollectorCreate).toHaveBeenCalledTimes(2)
  })

  it("does not hold a payment for device data that is not ready in time", async () => {
    vi.useFakeTimers()
    dataCollectorCreate.mockReturnValue(new Promise(() => {}))
    collectPageDeviceData(CLIENT)

    const deviceData = pageDeviceData()
    await vi.advanceTimersByTimeAsync(DEVICE_DATA_WAIT_MS)

    await expect(deviceData).resolves.toBeUndefined()
  })
})
