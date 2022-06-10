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
    if (
      typeof element === 'object' &&
      element &&
      JSON.stringify(element) !== JSON.stringify(compare)
    ) {
      returnObj[v] = element
    }
    if (typeof element !== 'object' && element && element !== compare) {
      returnObj[v] = element
    }
  })
  return returnObj
}
