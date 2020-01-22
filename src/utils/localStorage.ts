export interface GetLocalOrderInterface {
  (key: string): string
}

export const getLocalOrder = key => {
  return localStorage.getItem(key)
}

export interface SetLocalOrderInterface {
  (key: string, value: string): void
}

export const setLocalOrder = (key, value) => {
  localStorage.setItem(key, value)
}
