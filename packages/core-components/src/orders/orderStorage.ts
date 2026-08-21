export type GetLocalOrder = (key: string) => string | null

/**
 * Retrieves the order ID stored in localStorage under the given key.
 */
export const getLocalOrder: GetLocalOrder = (key) => {
  return localStorage.getItem(key)
}

export type SetLocalOrder = (key: string, value: string) => void

/**
 * Persists the order ID in localStorage under the given key.
 */
export const setLocalOrder: SetLocalOrder = (key, value) => {
  localStorage.setItem(key, value)
}

export type DeleteLocalOrder = (key: string) => void

/**
 * Removes the order ID from localStorage for the given key.
 */
export const deleteLocalOrder: DeleteLocalOrder = (key) => {
  localStorage.removeItem(key)
}
