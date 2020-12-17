export interface GetLocalOrder {
  (key: string): string | null
}

export const getLocalOrder: GetLocalOrder = (key) => {
  return localStorage.getItem(key)
}

export interface SetLocalOrder {
  (key: string, value: string): void
}

export const setLocalOrder: SetLocalOrder = (key, value) => {
  localStorage.setItem(key, value)
}

export interface DeleteLocalOrder {
  (key: string): void
}

export const deleteLocalOrder: DeleteLocalOrder = (key) => {
  localStorage.removeItem(key)
}
