```tsx
autoComplete="off"
                      className={
                        shipToDifferentAddress ? `block p-2` : `hidden`
                      }
                      reset={!showShippingAddressForm}
                      value={shippingAddress.street}
                      onChange={(e) => {
                        const sanitizedValue = e.target.value.replace(/['"\\;]/g, '');
                        setShippingAddress({ ...shippingAddress, street: sanitizedValue });
                      }}
                    >
```