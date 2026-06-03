/* eslint-disable n/no-callback-literal */

// biome-ignore lint/suspicious/noExplicitAny: legacy utility, caller types are unknown
export default async function promisify(cb: any, params?: any): Promise<any> {
  return await new Promise<any>((resolve, reject) => {
    if (params)
      cb(params, (err: any, res: any) => {
        if (err) reject(err)
        resolve(res)
      })
    else if (typeof cb?.tokenize === "function") {
      cb?.tokenize((err: any, payload: any) => {
        if (err) reject(err)
        resolve(payload)
      })
    } else
      cb((err: any, res: any) => {
        if (err) reject(err)
        resolve(res)
      })
  })
}
