/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />
import { euAddress, usAddress } from '../support/utils'

describe('Customer Addresses', () => {
  const filename = 'checkout-addresses'

  before(() => {
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
      cy.saveRequests(filename)
    }
  })

  beforeEach(() => {
    cy.get('[data-cy="input_customer_email"]').as('customerEmail')

    // Billing Address fields
    cy.get('[data-cy="input_billing_address_first_name"]').as(
      'billingFirstName'
    )
    cy.get('[data-cy="input_billing_address_last_name"]').as('billingLastName')
    cy.get('[data-cy="input_billing_address_line_1"]').as('billingLine1')
    cy.get('[data-cy="input_billing_address_city"]').as('billingCity')
    cy.get('[data-cy="input_billing_address_country_code"]').as(
      'billingCountryCode'
    )
    cy.get('[data-cy="input_billing_address_state_code"]').as(
      'billingStateCode'
    )
    cy.get('[data-cy="input_billing_address_zip_code"]').as('billingZipCode')
    cy.get('[data-cy="input_billing_address_phone"]').as('billingPhone')

    cy.get('[data-cy="button-ship-to-different-address"]').as(
      'buttonDifferentAddress'
    )

    // Shipping Address fields
    cy.get('[data-cy="input_shipping_address_first_name"]').as(
      'shippingFirstName'
    )
    cy.get('[data-cy="input_shipping_address_last_name"]').as(
      'shippingLastName'
    )
    cy.get('[data-cy="input_shipping_address_line_1"]').as('shippingLine1')
    cy.get('[data-cy="input_shipping_address_city"]').as('shippingCity')
    cy.get('[data-cy="input_shipping_address_country_code"]').as(
      'shippingCountryCode'
    )
    cy.get('[data-cy="input_shipping_address_state_code"]').as(
      'shippingStateCode'
    )
    cy.get('[data-cy="input_shipping_address_zip_code"]').as('shippingZipCode')
    cy.get('[data-cy="input_shipping_address_phone"]').as('shippingPhone')
    cy.get('[data-cy="button-ship-to-different-address"]').as(
      'buttonDifferentAddress'
    )
    // Save Addresses button
    cy.get('[data-cy="save-addresses-button"]').as('saveAddressesButton')
  })
  it('Checking default fields', () => {
    cy.wait(['@token', '@getOrders'])
    cy.get('@customerEmail').should('contain.value', '')
    cy.get('@billingFirstName').should('contain.value', '')
    cy.get('@billingLastName').should('contain.value', '')
    cy.get('@billingLine1').should('contain.value', '')
    cy.get('@billingCity').should('contain.value', '')
    cy.get('@billingCountryCode').should('contain.text', 'Country')
    cy.get('@billingStateCode').should('contain.value', '')
    cy.get('@billingZipCode').should('contain.value', '')
    cy.get('@billingPhone').should('contain.value', '')
    cy.get('@buttonDifferentAddress').should(
      'have.attr',
      'data-status',
      'false'
    )
    cy.get('@saveAddressesButton').should('have.attr', 'disabled', 'disabled')
  })

  it('Filling fields', () => {
    cy.get('@customerEmail').type('a')
    cy.get('[data-cy="error_customer_email"]').should(
      'contain.text',
      'Must be valid email'
    )
    cy.get('@customerEmail').type('{backspace}')
    cy.get('[data-cy="error_customer_email"]').should(
      'contain.text',
      `Can't be blank`
    )
    cy.get('@customerEmail')
      .type(euAddress.customer_email)
      .should('have.value', euAddress.customer_email)
    cy.get('@billingFirstName').type('a').type('{backspace}')
    cy.get('[data-cy="error_billing_address_first_name"]').should(
      'contain.text',
      `Can't be blank`
    )
    cy.get('@billingFirstName')
      .type(euAddress.first_name)
      .should('have.value', euAddress.first_name)
    cy.get('@billingLastName')
      .type(euAddress.last_name)
      .should('have.value', euAddress.last_name)
    cy.get('@billingLine1')
      .type(euAddress.line_1)
      .should('have.value', euAddress.line_1)
    cy.get('@billingCity')
      .type(euAddress.city)
      .should('have.value', euAddress.city)
    cy.get('@billingCountryCode')
      .select(euAddress.country)
      .should('have.value', euAddress.country_code)
    cy.get('@billingStateCode')
      .type(euAddress.state_code)
      .should('have.value', euAddress.state_code)
    cy.get('@billingZipCode')
      .type(euAddress.zip_code)
      .should('have.value', euAddress.zip_code)
    cy.get('@saveAddressesButton').should('have.attr', 'disabled', 'disabled')
    cy.get('@billingPhone')
      .type(euAddress.phone)
      .should('have.value', euAddress.phone)
    cy.get('@saveAddressesButton').should(
      'not.have.attr',
      'disabled',
      'disabled'
    )
  })

  it('Ship to different address', () => {
    cy.get('@buttonDifferentAddress')
      .click()
      .should('have.attr', 'data-status', 'true')
    cy.get('@saveAddressesButton').should('have.attr', 'disabled', 'disabled')
    cy.get('@shippingFirstName')
      .type(usAddress.first_name)
      .should('have.value', usAddress.first_name)
    cy.get('@shippingLastName')
      .type(usAddress.last_name)
      .should('have.value', usAddress.last_name)
    cy.get('@shippingLine1')
      .type(usAddress.line_1)
      .should('have.value', usAddress.line_1)
    cy.get('@shippingCity')
      .type(usAddress.city)
      .should('have.value', usAddress.city)
    cy.get('@shippingCountryCode')
      .select(usAddress.country)
      .should('have.value', usAddress.country_code)
    cy.get('@shippingStateCode')
      .type(usAddress.state_code)
      .should('have.value', usAddress.state_code)
    cy.get('@shippingZipCode')
      .type(usAddress.zip_code)
      .should('have.value', usAddress.zip_code)
    cy.get('@saveAddressesButton').should('have.attr', 'disabled', 'disabled')
    cy.get('@shippingPhone')
      .type(usAddress.phone)
      .should('have.value', usAddress.phone)
    cy.get('@saveAddressesButton').should(
      'not.have.attr',
      'disabled',
      'disabled'
    )
  })
})
