import { useEffect } from "react"

/**
 * Warns, in development, that a container component is deprecated.
 *
 * The containers were warning in three different shapes and with three
 * different sets of brackets, and eight of them said nothing at all — so a
 * consumer following the console would migrate the ones that spoke up and be
 * left with a clean console and the rest still there. One helper keeps the
 * wording identical and makes it obvious when a container is added without one.
 *
 * The warning fires per mount rather than once per process: a container that is
 * mounted again after a migration is supposed to say so again.
 *
 * @param container - The deprecated component's name, without the angle brackets.
 * @param use - What to use instead, as it should read in the sentence.
 */
export function useDeprecatedContainer(container: string, use: string): void {
  useEffect(() => {
    // `process` is not defined in every runtime this renders in, so it is read
    // off `globalThis` rather than assumed.
    const runtime = globalThis as typeof globalThis & {
      process?: { env?: { NODE_ENV?: string } }
    }
    if (runtime.process?.env?.NODE_ENV === "production") return

    console.warn(
      `[commercelayer-react-components] <${container}> is deprecated and will be removed in the next major version. Use ${use} instead.`
    )
  }, [container, use])
}
