/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Checkout GiftCard or Coupon Code', () => {
  const filename = 'checkout-giftcard-or-coupon-code'

  before(() => {
    // @ts-ignore
    cy.setRoutes({
      endpoint: 'https://the-blue-brand-3.commercelayer.co',
      routes: Cypress.env('requests'),
      record: Cypress.env('RECORD'),
      filename,
    })
    cy.visit(`/${filename}`)
  })

  after(() => {
    if (Cypress.env('RECORD')) {
      // @ts-ignore
      cy.saveRequests(filename)
    }
  })

  beforeEach(() => {
    cy.setRoutes({
      endpoint: 'https://the-blue-brand-3.commercelayer.co',
      routes: Cypress.env('requests'),
      record: Cypress.env('RECORD'),
      filename,
    })
    // cy.get('[data-cy="code-error"]').as('codeError')
    // cy.get('[data-cy="code-label"]').as('codeLabel')
    // cy.get('[data-cy="code-remove"]').as('codeRemove')
  })

  it('Checking code', () => {
    cy.get('[data-cy="code-input"]').as('codeInput')
    cy.get('[data-cy="code-submit"]').as('codeSubmit')
    cy.wait(['@token', '@getOrders'])
    cy.get('@codeInput').should('be.visible')
    cy.get('@codeSubmit').should('be.visible')
    cy.get('@codeInput').should('have.value', '')
    cy.get('@codeInput').type('alessandro5')
    cy.get('@codeSubmit').click()
  })

  it('Checking a invalid code', () => {
    cy.get('[data-cy="code-input"]').as('codeInput')
    cy.get('[data-cy="code-error"]').as('codeError')
    cy.get('@codeError').should(
      'have.text',
      `gift_card_or_coupon_code - doesn't match any active gift card or coupon`
    )
    cy.get('@codeInput').should('have.class', 'text-red-900')
  })

  it('Checking a valid code', () => {
    cy.get('[data-cy="code-input"]').as('codeInput')
    cy.get('[data-cy="code-submit"]').as('codeSubmit')
    cy.get('@codeInput').type('0')
    cy.get('@codeSubmit').click()
    cy.get('[data-cy="code-label"]').as('codeLabel')
    cy.get('@codeLabel').should('have.text', 'alessandro50')
  })

  it('Removing a code', () => {
    cy.get('[data-cy="code-remove"]').as('codeRemove')
    cy.get('@codeRemove').click()
  })

  it('Checking initial status', () => {
    cy.get('[data-cy="code-input"]').as('codeInput')
    cy.get('@codeInput').should('have.value', '')
  })

  // it('Choosing Standard Shipping', () => {
  //   cy.get('@shippingMethodButton0').click()
  //   cy.get('@currentShippingMethod').should('contain.text', 'Standard Shipping')
  //   cy.get('[data-cy="shipping-method-name-recap"]').each((e, i) => {
  //     cy.wrap(e).as(`shippingMethodNameRecap${i}`)
  //   })
  //   cy.get('@shippingMethodNameRecap0').should(
  //     'contain.text',
  //     'Standard Shipping'
  //   )
  // })

  // it('Choosing Express Delivery', () => {
  //   cy.get('@shippingMethodButton1').click()
  //   cy.get('@currentShippingMethod').should('contain.text', 'Express Delivery')
  //   cy.get('[data-cy="shipping-method-name-recap"]').each((e, i) => {
  //     cy.wrap(e).as(`shippingMethodNameRecap${i}`)
  //   })
  //   cy.get('@shippingMethodNameRecap0').should(
  //     'contain.text',
  //     'Express Delivery'
  //   )
  // })
})
