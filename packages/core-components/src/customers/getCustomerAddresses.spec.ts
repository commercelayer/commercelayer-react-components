import { beforeEach, describe, expect, test, vi } from "vitest"
import { getCustomerAddresses } from "./getCustomerAddresses.js"

const { mockList } = vi.hoisted(() => ({ mockList: vi.fn() }))

vi.mock("@commercelayer/sdk", () => ({
  CommerceLayer: vi.fn().mockReturnValue({
    addRequestInterceptor: vi.fn(),
    addResponseInterceptor: vi.fn(),
    addRawResponseReader: vi.fn(),
    customer_addresses: { list: mockList },
  }),
}))

vi.mock("@commercelayer/js-auth", () => ({
  jwtDecode: vi.fn().mockReturnValue({ payload: { organization: { slug: "my-org" } } }),
}))

function page(names: string[], pageCount: number) {
  const items = names.map((name) => ({
    id: `ca_${name}`,
    address: { id: `addr_${name}`, full_name: name },
  }))
  return Object.assign(items, { meta: { pageCount } })
}

describe("getCustomerAddresses", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("fetches every page and sorts the full list", async () => {
    mockList
      .mockResolvedValueOnce(page(["Zoe", "Bob"], 2))
      .mockResolvedValueOnce(page(["Anna"], 2))

    const result = await getCustomerAddresses({ accessToken: "fake-token" })

    expect(mockList).toHaveBeenCalledTimes(2)
    expect(mockList).toHaveBeenNthCalledWith(2, expect.objectContaining({ pageNumber: 2 }))
    expect(result.map((a) => a.full_name)).toEqual(["Anna", "Bob", "Zoe"])
    expect(result.map((a) => a.reference)).toEqual(["ca_Anna", "ca_Bob", "ca_Zoe"])
  })

  test("uses pageSize 25 by default and honours a custom pageSize", async () => {
    mockList.mockResolvedValue(page(["Anna"], 1))

    await getCustomerAddresses({ accessToken: "fake-token" })
    await getCustomerAddresses({ accessToken: "fake-token", pageSize: 5 })

    expect(mockList).toHaveBeenNthCalledWith(1, expect.objectContaining({ pageSize: 25 }))
    expect(mockList).toHaveBeenNthCalledWith(2, expect.objectContaining({ pageSize: 5 }))
  })
})
