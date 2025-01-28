import type { LoaderType } from '#typings'

import type { JSX } from "react";

export default function getLoaderComponent(loader: LoaderType): JSX.Element {
  return <>{loader}</>
}
