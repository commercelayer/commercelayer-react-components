import type { PaymentMethod } from '@commercelayer/sdk'

export function sortPaymentMethods(
  methods: PaymentMethod[],
  labels: PaymentMethod['payment_source_type'][]
): PaymentMethod[] {
  return methods.sort((a, b) => {
    const indexA = labels.indexOf(a.payment_source_type)
    const indexB = labels.indexOf(b.payment_source_type)
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })
}
