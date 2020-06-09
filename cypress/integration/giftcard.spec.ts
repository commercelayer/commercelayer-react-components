/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

describe('Gift Card', () => {
  const filename = 'giftCard'

  before(() => {
    cy.server()
    cy.setRoutes({
      endpoint: Cypress.env('apiEndpoint'),
      routes: [Cypress.env('requests')[0]],
      record: Cypress.env('RECORD'),
      filename,
    })
    cy.visit(`/${filename}`)
  })

  beforeEach(() => {
    cy.server()
    cy.setRoutes({
      endpoint: Cypress.env('apiEndpoint'),
      routes: Cypress.env('requests'),
      record: Cypress.env('RECORD'),
      filename,
    })
  })

  after(() => {
    if (Cypress.env('RECORD')) {
      cy.saveRequests(filename)
    }
  })

  it('Select a currency EUR', () => {
    cy.wait(['@token'])
    cy.get('form > :nth-child(2) > select')
      .select('EUR')
      .should('have.value', 'EUR')
  })
  it('Insert an amount', () => {
    cy.get('form > :nth-child(3) > input')
      .type('5000')
      .should('have.value', '5000')
  })
  it('Insert an email', () => {
    cy.get('form > :nth-child(4) > input')
      .type('cypress@test.co')
      .should('have.value', 'cypress@test.co')
  })
  it('Insert a card image', () => {
    cy.get('form > :nth-child(5) > input')
      .type(
        'https://i.pinimg.com/736x/a5/32/de/a532de337eff9b1c1c4bfb8df73acea4--darth-vader-stencil-darth-vader-head.jpg?b=t'
      )
      .should(
        'have.value',
        'https://i.pinimg.com/736x/a5/32/de/a532de337eff9b1c1c4bfb8df73acea4--darth-vader-stencil-darth-vader-head.jpg?b=t'
      )
  })
  it('Insert a firstname', () => {
    cy.get('form > :nth-child(6) > input')
      .type('Darth')
      .should('have.value', 'Darth')
  })
  it('Insert a lastname', () => {
    cy.get('form > :nth-child(7) > input')
      .type('Vader')
      .should('have.value', 'Vader')
  })
  it('Insert a message', () => {
    cy.get('form > :nth-child(8) > textarea')
      .type('May the force be with you')
      .should('have.value', 'May the force be with you')
  })
  it('Create a Gift Card', () => {
    cy.get('form > :nth-child(10) > button').click()
    cy.wait(['@insertGiftCard'])
  })
  // NOTE It seems that Cypress does not support dispatch context content in the right way like a normal browser 🤷🏻‍♂️
})
