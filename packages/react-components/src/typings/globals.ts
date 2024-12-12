import type { JSX } from "react";
export type DefaultChildrenType = JSX.Element[] | JSX.Element | null

type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

export type TRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>

export type LooseAutocomplete<T extends string> = T | Omit<string, T>
