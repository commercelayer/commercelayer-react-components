import { LoaderType } from '#typings'

export default function getLoaderComponent(Loader: LoaderType) {
  return <>{Loader}</>
}
