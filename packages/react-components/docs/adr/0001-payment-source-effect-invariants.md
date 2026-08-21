# ADR 0001 — Payment-source effect invariants

- Status: Accepted
- Component: `src/components/payment_gateways/PaymentGateway.tsx`
- Reducer: `src/reducers/PaymentMethodReducer.ts` (`setPaymentSource`)
- Related issue: [#803](https://github.com/commercelayer/commercelayer-react-components/issues/803)

## Context

`<PaymentGateway>` runs an effect that reconciles the order's payment source: it
creates or recreates a source when the current one is missing, mismatched, or wrong
for the selected method, and toggles the loader. This effect has repeatedly
regressed into infinite render loops — React 19's stricter update-depth accounting
turns what used to be an intermittent extra-render nuisance into a hard
`Maximum update depth exceeded` crash.

Two independent forces cause the loops:

1. **Object-identity dependencies.** The effect used to depend on whole `order`,
   `paymentSource`, `errors`, and `config` objects. A `getCustomerPaymentSources()`
   refetch mints new object identities for the same data, which re-fired the effect
   even though nothing meaningful changed.
2. **No-op passes that still re-armed the effect.** The single-payment-method branch
   only recreated a source when it was `null` or when there were errors — never when an
   existing source had `mismatched_amounts: true`. So a mismatched single-method source
   ran the reconcile helper, recreated nothing, yet still called
   `getCustomerPaymentSources()`, whose refetch churned identities and re-fired the
   effect indefinitely (issue #803).

## Decision

The effect obeys three invariants. Changing any of them has historically reintroduced
a loop — treat them as load-bearing.

1. **Reactive triggers are stable ids/scalars only — never whole objects.**
   The driving `useEffect` depends on selectors such as `order?.payment_source?.id`,
   `order?.payment_source?.mismatched_amounts`, `paymentSource?.id`,
   `errors?.length`, `paymentMethods?.length`, `order?.status`. The reconcile logic
   itself lives in a `useEffectEvent` (`onPaymentSync`) that reads the *latest*
   `order`/`config`/`paymentSource` on each call, so those objects never need to be
   dependencies and their identity churn cannot re-fire the effect. Because the
   trigger set is now hand-curated (the linter cannot infer it from a `useEffectEvent`
   body), **any new field the reconcile logic branches on must be added here as a
   selector**, or the effect will silently stop reacting to it.

2. **Recreate on a mismatched single-method source, and only refetch after a real
   (re)create.** The single-method branch recreates when the source is absent
   (`== null`), there are errors, **or** the existing source is mismatched.
   `getCustomerPaymentSources()` fires only when a source was actually (re)created
   (the `recreated` flag), so a no-op pass can never re-arm the effect.

3. **Two layers of concurrency protection, kept in sync.**
   - `settingPaymentSourceRef` in the component skips a whole reconcile pass while a
     previous fire-and-forget request is still in flight.
   - `inFlightPaymentSourceRequests` in `setPaymentSource` coalesces genuinely
     concurrent duplicate calls, keyed per order/resource/operation, and removes the
     entry once settled so a later legitimate re-create still runs.

## Consequences

- The single-method mismatched-amounts loop (#803) is closed: the mismatch is now a
  reactive trigger, the source is genuinely recreated, `mismatched_amounts` flips to
  `false`, and the effect settles.
- The `useEffect` dependency array is no longer a mechanical "everything the body
  reads" list — it is a deliberate trigger set. Reviewers must reason about triggers,
  not rely solely on `useExhaustiveDependencies`.
- Regression coverage lives in `specs/payment_gateways/PaymentGateway.spec.tsx`; the
  deterministic loop reproduction lives in the checkout e2e suite.
