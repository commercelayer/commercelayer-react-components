import renderer from 'react-test-renderer'

export default function toJson(
  component: renderer.ReactTestRenderer
): renderer.ReactTestRendererJSON {
  const result = component.toJSON()
  expect(result).toBeDefined()
  expect(result).not.toBeInstanceOf(Array)
  return result as renderer.ReactTestRendererJSON
}
