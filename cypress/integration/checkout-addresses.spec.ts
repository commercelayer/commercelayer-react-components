/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />
import { euAddress, usAddress } from '../support/utils'

describe('Guest Addresses', () => {
  const filename = 'checkout-addresses'

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
    // Customer Email
    cy.get('[data-cy="save-on-blur-button"]').as('saveOnBlurButton')
    cy.get('[data-cy="customer_email"]').as('customerEmail')
    cy.get('[data-cy="save-customer-button"]').as('saveCustomerButton')
    cy.get('[data-cy="current-customer-email"]').as('currentCustomerEmail')

    // Billing Address fields
    cy.get('[data-cy="billing_address_first_name"]').as('billingFirstName')
    cy.get('[data-cy="billing_address_last_name"]').as('billingLastName')
    cy.get('[data-cy="billing_address_line_1"]').as('billingLine1')
    cy.get('[data-cy="billing_address_city"]').as('billingCity')
    cy.get('[data-cy="billing_address_country_code"]').as('billingCountryCode')
    cy.get('[data-cy="billing_address_state_code"]').as('billingStateCode')
    cy.get('[data-cy="billing_address_zip_code"]').as('billingZipCode')
    cy.get('[data-cy="billing_address_phone"]').as('billingPhone')

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
    cy.get('[data-cy="ship-to-different-address-button"]').as(
      'buttonDifferentAddress'
    )
    // Save Addresses button
    cy.get('[data-cy="save-addresses-button"]').as('saveAddressesButton')

    // Current addresses
    cy.get('[data-cy="current-billing-address"]').as('currentBillingAddress')
    cy.get('[data-cy="current-shipping-address"]').as('currentShippingAddress')
  })
  it('Checking default fields', () => {
    cy.wait(['@token', '@getOrders'])
    cy.get('@customerEmail').should('contain.value', '')
    cy.get('@saveOnBlurButton').should('have.attr', 'data-status', 'false')
    cy.get('@saveCustomerButton').should('have.attr', 'disabled', 'disabled')
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

  it('Save Customer User with the save button', () => {
    cy.get('@currentCustomerEmail').should('contain.text', '""')
    cy.get('@customerEmail').type('a')
    cy.get('[data-cy="customer_email_error"]').should(
      'contain.text',
      `Must be valid email`
    )
    cy.get('@customerEmail').type('{backspace}')
    cy.get('[data-cy="customer_email_error"]').should(
      'contain.text',
      `Can't be blank`
    )
    cy.get('@customerEmail').type(euAddress.customer_email)
    cy.get('@saveCustomerButton').should(
      'not.have.attr',
      'disabled',
      'disabled'
    )
    cy.get('@saveCustomerButton').click()
    cy.get('@currentCustomerEmail').should(
      'contain.text',
      `"${euAddress.customer_email}"`
    )
  })

  it('Save Customer User with onBlur input', () => {
    cy.get('@saveOnBlurButton')
      .click()
      .should('have.attr', 'data-status', 'true')
    cy.get('@customerEmail')
      .type(`{selectall}{backspace}${usAddress.customer_email}`)
      .blur()
    cy.get('@currentCustomerEmail').should(
      'contain.text',
      `"${usAddress.customer_email}"`
    )
  })

  it('Filling fields', () => {
    cy.get('@billingFirstName').type('a').type('{backspace}')
    cy.get('[data-cy="billing_address_first_name_error"]').should(
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

  it('Saving billing address', () => {
    cy.get('@currentBillingAddress').should('contain.text', '{}')
    cy.get('@currentShippingAddress').should('contain.text', '{}')
    cy.get('@saveAddressesButton').click()
    cy.get('@currentBillingAddress').should(
      'contain.text',
      euAddress.first_name
    )
    cy.get('@currentBillingAddress').should('contain.text', euAddress.last_name)
    cy.get('@currentBillingAddress').should('contain.text', euAddress.line_1)
    cy.get('@currentBillingAddress').should('contain.text', euAddress.city)
    cy.get('@currentBillingAddress').should(
      'contain.text',
      euAddress.country_code
    )
    cy.get('@currentBillingAddress').should(
      'contain.text',
      euAddress.state_code
    )
    cy.get('@currentBillingAddress').should('contain.text', euAddress.zip_code)
    cy.get('@currentBillingAddress').should('contain.text', euAddress.phone)
    cy.get('@currentShippingAddress').should(
      'contain.text',
      euAddress.first_name
    )
    cy.get('@currentShippingAddress').should(
      'contain.text',
      euAddress.last_name
    )
    cy.get('@currentShippingAddress').should('contain.text', euAddress.line_1)
    cy.get('@currentShippingAddress').should('contain.text', euAddress.city)
    cy.get('@currentShippingAddress').should(
      'contain.text',
      euAddress.country_code
    )
    cy.get('@currentShippingAddress').should(
      'contain.text',
      euAddress.state_code
    )
    cy.get('@currentShippingAddress').should('contain.text', euAddress.zip_code)
    cy.get('@currentShippingAddress').should('contain.text', euAddress.phone)
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

  it('Saving different shipping address', () => {
    cy.get('@saveAddressesButton').click()
    cy.get('@currentBillingAddress').should(
      'contain.text',
      euAddress.first_name
    )
    cy.get('@currentBillingAddress').should('contain.text', euAddress.last_name)
    cy.get('@currentBillingAddress').should('contain.text', euAddress.line_1)
    cy.get('@currentBillingAddress').should('contain.text', euAddress.city)
    cy.get('@currentBillingAddress').should(
      'contain.text',
      euAddress.country_code
    )
    cy.get('@currentBillingAddress').should(
      'contain.text',
      euAddress.state_code
    )
    cy.get('@currentBillingAddress').should('contain.text', euAddress.zip_code)
    cy.get('@currentBillingAddress').should('contain.text', euAddress.phone)
    cy.get('@currentShippingAddress').should(
      'contain.text',
      usAddress.first_name
    )
    cy.get('@currentShippingAddress').should(
      'contain.text',
      usAddress.last_name
    )
    cy.get('@currentShippingAddress').should('contain.text', usAddress.line_1)
    cy.get('@currentShippingAddress').should('contain.text', usAddress.city)
    cy.get('@currentShippingAddress').should(
      'contain.text',
      usAddress.country_code
    )
    cy.get('@currentShippingAddress').should(
      'contain.text',
      usAddress.state_code
    )
    cy.get('@currentShippingAddress').should('contain.text', usAddress.zip_code)
    cy.get('@currentShippingAddress').should('contain.text', usAddress.phone)
  })
})
