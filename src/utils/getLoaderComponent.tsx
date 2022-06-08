import { LoaderType } from '#typings'

export default function getLoaderComponent(Loader: LoaderType) {
  return typeof Loader === 'function' ? <Loader /> : <>{Loader}</>
}
