/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Checkout GiftCard or Coupon Code', () => {
  const filename = 'checkout-payments'

  before(() => {
    // @ts-ignore
    cy.setRoutes({
      endpoint: 'https://the-blue-brand-3.commercelayer.co',
      routes: Cypress.env('requests'),
      record: Cypress.env('RECORD'),
      filename,
    })
    cy.visit(`/${filename}?orderId=PWYOhJvmBB`)
    cy.wait('@token')
    cy.wait('@getOrders')
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
    // cy.wait('@getOrders')
  })

  it('Select payment method', () => {
    cy.wait('@getOrders')
    cy.get('[data-cy="payment-radio-button"]').each(function (e, i) {
      cy.wrap(e).as(`paymentMethod${i}`)
    })
    cy.get('paymentMethod1').check()
    // cy.get('[data-cy="code-submit"]').as('codeSubmit')
    // cy.get('@codeInput').should('be.visible')
    // cy.get('@codeSubmit').should('be.visible')
    // cy.get('@codeInput').should('have.value', '')
    // cy.get('@codeInput').type('alessandro5')
    // cy.get('@codeSubmit').click()
  })

  // it('Checking a invalid code', () => {
  //   cy.get('[data-cy="code-input"]').as('codeInput')
  //   cy.get('[data-cy="code-error"]').as('codeError')
  //   cy.get('@codeError').should(
  //     'have.text',
  //     `gift_card_or_coupon_code - doesn't match any active gift card or coupon`
  //   )
  //   cy.get('@codeInput').should('have.class', 'text-red-900')
  // })

  // it('Checking a valid code', () => {
  //   cy.get('[data-cy="code-input"]').as('codeInput')
  //   cy.get('[data-cy="code-submit"]').as('codeSubmit')
  //   cy.get('@codeInput').type('0')
  //   cy.get('@codeSubmit').click()
  //   cy.get('[data-cy="code-label"]').as('codeLabel')
  //   cy.get('@codeLabel').should('have.text', 'alessandro50')
  // })

  // it('Removing a code', () => {
  //   cy.get('[data-cy="code-remove"]').as('codeRemove')
  //   cy.get('@codeRemove').click()
  // })

  // it('Checking initial status', () => {
  //   cy.get('[data-cy="code-input"]').as('codeInput')
  //   cy.get('@codeInput').should('have.value', '')
  // })
})
