export type StringReplace<
  TString extends string,
  TToReplace extends string,
  TReplacement extends string
> = TString extends `${infer TPrefix}${TToReplace}${infer TSuffix}`
  ? `${TPrefix}${TReplacement}${StringReplace<
      TSuffix,
      TToReplace,
      TReplacement
    >}`
  : TString

export function replace<V extends string, R extends string, P extends string>(
  value: V,
  replace: R,
  replacement: P
): StringReplace<V, R, P> {
  return value.replace(replace, replacement) as StringReplace<V, R, P>
}
