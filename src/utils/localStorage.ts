export interface GetLocalOrderInterface {
  (key: string): string | null
}

export const getLocalOrder: GetLocalOrderInterface = (key) => {
  return localStorage.getItem(key)
}

export interface SetLocalOrderInterface {
  (key: string, value: string): void
}

export const setLocalOrder: SetLocalOrderInterface = (key, value) => {
  localStorage.setItem(key, value)
}

export interface DeleteLocalOrderInterface {
  (key: string): void
}

export const deleteLocalOrder: DeleteLocalOrderInterface = (key) => {
  localStorage.removeItem(key)
}
