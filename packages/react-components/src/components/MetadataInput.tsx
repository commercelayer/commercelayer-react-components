import BaseInput from '#components/utils/BaseInput'
import type { BaseInputComponentProps } from '#typings'

import type { JSX } from "react";

type Props = BaseInputComponentProps &
  JSX.IntrinsicElements['input'] &
  JSX.IntrinsicElements['textarea']

export function MetadataInput(props: Props): JSX.Element {
  return <BaseInput data-metadata={true} {...props} />
}

export default MetadataInput
