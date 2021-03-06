/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />
import { euAddress, usAddress } from '../support/utils'

describe('Customer Addresses', () => {
  const filename = 'checkout-customer-addresses-country-lock'

  before(() => {
    // @ts-ignore
    cy.visit(`/${filename}?cleanAddresses=true`)
  })

  after(() => {
    if (Cypress.env('RECORD')) {
      // @ts-ignore
      cy.saveRequests(filename)
    }
  })

  beforeEach(() => {
    // @ts-ignore
    cy.setRoutes({
      endpoint: '',
      routes: Cypress.env('requests'),
      record: Cypress.env('RECORD'),
      filename,
    })
    // Customer Address
    cy.get('[data-cy="customer-billing-address"]')
      .first()
      .as(`customerBillingAddress0`)
    cy.get('[data-cy="customer-billing-address"]')
      .last()
      .as(`customerBillingAddress1`)
    cy.get('[data-cy="customer-shipping-address"]').each((e, i) => {
      cy.wrap(e).as(`customerShippingAddress${i}`)
    })
    cy.get('[data-cy="add-new-billing-address"]').as('addNewBillingAddress')
    cy.get('[data-cy="add-new-shipping-address"]').as('addNewShippingAddress')

    // Billing Address fields
    cy.get('[data-cy="billing_address_first_name"]').as('billingFirstName')
    cy.get('[data-cy="billing_address_last_name"]').as('billingLastName')
    cy.get('[data-cy="billing_address_line_1"]').as('billingLine1')
    cy.get('[data-cy="billing_address_city"]').as('billingCity')
    cy.get('[data-cy="billing_address_country_code"]').as('billingCountryCode')
    cy.get('[data-cy="billing_address_state_code"]').as('billingStateCode')
    cy.get('[data-cy="billing_address_zip_code"]').as('billingZipCode')
    cy.get('[data-cy="billing_address_phone"]').as('billingPhone')
    // Ship to different address
    cy.get('[data-cy="ship-to-different-address-button"]').as(
      'buttonDifferentAddress'
    )
    // Shipping Address fields
    cy.get('[data-cy="shipping_address_first_name"]').as('shippingFirstName')
    cy.get('[data-cy="shipping_address_last_name"]').as('shippingLastName')
    cy.get('[data-cy="shipping_address_line_1"]').as('shippingLine1')
    cy.get('[data-cy="shipping_address_city"]').as('shippingCity')
    cy.get('[data-cy="shipping_address_country_code"]').as(
      'shippingCountryCode'
    )
    cy.get('[data-cy="shipping_address_state_code"]').as('shippingStateCode')
    cy.get('[data-cy="shipping_address_zip_code"]').as('shippingZipCode')
    cy.get('[data-cy="shipping_address_phone"]').as('shippingPhone')
    // Save Addresses button
    cy.get('[data-cy="save-addresses-button"]').as('saveAddressesButton')
    // Current addresses
    cy.get('[data-cy="current-billing-address"]').as('currentBillingAddress')
    cy.get('[data-cy="current-shipping-address"]').as('currentShippingAddress')
  })

  it('Selecting first billing address', () => {
    cy.reload()
    cy.wait([
      '@token',
      '@getCustomerAddresses',
      '@getOrders',
      '@getCustomerAddresses',
    ])
    cy.get('@saveAddressesButton').should('have.attr', 'disabled')
    cy.get('@customerBillingAddress0').should('exist')
    cy.get('@customerBillingAddress0').click()
    cy.get('@customerBillingAddress0').should('have.class', 'border-blue-500')
    cy.get('@saveAddressesButton').should('have.attr', 'disabled')
  })

  it('Selecting second billing address', () => {
    cy.get('@customerBillingAddress1').should('exist')
    cy.get('@customerBillingAddress1').click()
    cy.get('@customerBillingAddress1').should('have.class', 'border-blue-500')
    cy.get('@saveAddressesButton').should('not.have.attr', 'disabled')
  })

  it('Filling new billing address form', () => {
    cy.get('@addNewBillingAddress').click()
    cy.get('@billingFirstName').type('a').type('{backspace}')
    cy.get('[data-cy="billing_address_first_name_error"]').should(
      'contain.text',
      `Can't be blank`
    )
    cy.get('@billingFirstName')
      .type(euAddress.first_name)
      .should('have.value', euAddress.first_name)
    cy.get('@customerBillingAddress0').should(
      'not.have.class',
      'border-blue-500'
    )
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

  it('Setting a wrong country', () => {
    cy.get('@billingCountryCode')
      .select(usAddress.country)
      .should('have.value', usAddress.country_code)
    cy.get('@saveAddressesButton').should('have.attr', 'disabled', 'disabled')
  })

  it('Closing the billing address form', () => {
    cy.get('@addNewBillingAddress').click()
    cy.get('@saveAddressesButton').should(
      'not.have.attr',
      'disabled',
      'disabled'
    )
    cy.get('@customerBillingAddress0').click()
  })

  it('Selecting shipping address', () => {
    cy.get('@buttonDifferentAddress')
      .click()
      .should('have.attr', 'data-status', 'true')
    cy.get('@customerShippingAddress0').should('have.class', 'opacity-50')
    cy.get('@saveAddressesButton').should('have.attr', 'disabled', 'disabled')
    cy.get('@customerShippingAddress1').click()
    cy.get('@customerShippingAddress1').should('have.class', 'border-blue-500')
    cy.get('@saveAddressesButton').should(
      'not.have.attr',
      'disabled',
      'disabled'
    )
  })

  it('Adding new shipping address', () => {
    cy.get('@addNewShippingAddress').click()
    cy.get('@shippingFirstName')
      .type(usAddress.first_name)
      .should('have.value', usAddress.first_name)
    cy.get('@customerShippingAddress1').should(
      'not.have.class',
      'border-blue-500'
    )
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
    cy.get('@saveAddressesButton').should('have.attr', 'disabled', 'disabled')
    cy.get('@shippingCountryCode')
      .select(euAddress.country)
      .should('have.value', euAddress.country_code)
    cy.get('@saveAddressesButton').should(
      'not.have.attr',
      'disabled',
      'disabled'
    )
    cy.get('@addNewShippingAddress').click()
  })
})
