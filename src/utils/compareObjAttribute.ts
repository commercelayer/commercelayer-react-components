type Item = Record<string, any>

type TArgs<A, B> = {
  attributes: A
  object: B
}

export default function compareObjAttribute<A extends Item, B extends Item>({
  attributes,
  object,
}: TArgs<A, B>): Item {
  const returnObj: Item = {}
  Object.keys(object).forEach((v) => {
    const element = attributes[v]
    const compare = object[v]
    if (element && element !== compare) {
      returnObj[v] = element
    }
  })
  return returnObj
}
