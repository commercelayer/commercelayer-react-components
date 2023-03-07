type Item = Record<string, any>

interface TArgs<A, B> {
  attributes: A
  object: B
}

function sortObj<T extends Item>(obj: T): Item {
  return Object.keys(obj)
    .sort()
    .reduce<Item>((result, key) => {
      result[key] = obj[key]
      return result
    }, {})
}

export default function compareObjAttribute<A extends Item, B extends Item>({
  attributes,
  object
}: TArgs<A, B>): Item {
  const returnObj: Item = {}
  Object.keys(object).forEach((v) => {
    const element = attributes[v]
    const compare = object[v]
    if (typeof element === 'object' && element) {
      const elementSorted = sortObj(element)
      const compareSorted = sortObj(compare)
      if (JSON.stringify(elementSorted) !== JSON.stringify(compareSorted)) {
        returnObj[v] = element
      }
    }
    if (typeof element !== 'object' && element && element !== compare) {
      returnObj[v] = element
    }
  })
  return returnObj
}
