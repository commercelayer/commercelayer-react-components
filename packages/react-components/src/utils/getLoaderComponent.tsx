import { type LoaderType } from '#typings'

export default function getLoaderComponent(loader: LoaderType): JSX.Element {
  return <>{loader}</>
}
