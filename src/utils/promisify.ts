import isFunction from 'lodash/isFunction'

export default function promisify(cb: any, params?: any) {
  return new Promise<any>((resolve, reject) => {
    if (params)
      cb(params, (err: any, res: any) => {
        if (err) reject(err)
        resolve(res)
      })
    else if (isFunction(cb?.tokenize)) {
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
