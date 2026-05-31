```tsx
autoComplete="off"
                      className={
                        shipToDifferentAddress ? `block p-2` : `hidden`
                      }
                      reset={!showShippingAddressForm}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                    >
```