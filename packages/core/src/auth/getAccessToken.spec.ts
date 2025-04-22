import { authenticate } from "@commercelayer/js-auth"
import { describe, expect, vi } from "vitest"
import { coreTest } from "#extender"
import { getAccessToken } from "./getAccessToken"

vi.mock("@commercelayer/js-auth", () => ({
  authenticate: vi.fn(),
}))

describe("getAccessToken", () => {
  coreTest(
    "should call authenticate with the correct parameters",
    async ({ accessToken, config }) => {
      const token = accessToken?.accessToken
      const grantType = "client_credentials"
      const mockToken = { accessToken: token }
      // @ts-expect-error No types for this function
      authenticate.mockResolvedValue(mockToken)
      const result = await getAccessToken({ grantType, config })
      await expect(authenticate).toHaveBeenCalledWith(grantType, config)
      expect(result).toEqual(mockToken)
      expect(result).toHaveProperty("accessToken")
      expect(result.accessToken).toBe(mockToken.accessToken)
    },
  )

  coreTest("should throw an error if authenticate fails", async () => {
    const grantType = "client_credentials"
    const config = {
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
    }
    const mockError = new Error("Authentication failed")
    // @ts-expect-error No types for this function
    authenticate.mockRejectedValue(mockError)
    await expect(getAccessToken({ grantType, config })).rejects.toThrow(
      "Authentication failed",
    )
  })
})
