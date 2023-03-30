import type PropTypes from 'prop-types'

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

type Defined<T> = T extends undefined ? never : T

/**
 * Get the type that represents the props with the defaultProps included.
 *
 * Alternatively, we could have done something like this:
 * ```
 * export type WithDefaultProps<P, DP extends Partial<P>> = Omit<P, keyof DP> &
 *   Required<Pick<P, Extract<keyof DP, keyof P>>>;
 * ```
 * But there were usages of `null` in `defaultProps` that would need to be changed to `undefined`
 * to meet the `DP extends Partial<P>` constraint.
 * So, instead we take the union type in cases when a property in defaultProps does not extend
 * the corresponding property in the Props declaration.
 */
type WithDefaultProps<P, DP> = Omit<P, keyof DP> & {
  [K in Extract<keyof DP, keyof P>]: DP[K] extends Defined<P[K]>
    ? Defined<P[K]>
    : Defined<P[K]> | DP[K]
}

/**
 * Get the props type from propTypes and defaultProps.
 *
 * Usage:
 * ```
 * // Without defaultProps
 * type Props = PropsType<typeof propTypes>;
 *
 * // With defaultProps
 * type Props = PropsType<typeof propTypes, typeof defaultProps>;
 * ```
 */
export type PropsType<PT, DP> = WithDefaultProps<PropTypes.InferProps<PT>, DP>
