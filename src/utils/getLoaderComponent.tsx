import { LoaderType } from '#typings'
import React from 'react'

export default function getLoaderComponent(Loader: LoaderType) {
  return typeof Loader === 'function' ? <Loader /> : <>{Loader}</>
}
