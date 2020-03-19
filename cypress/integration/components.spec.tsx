/// <reference types="cypress" />
import React from 'react'
import CommerceLayer from '../../src/components/CommerceLayer'
describe('HelloState component', () => {
  it('works', () => {
    // mount the component under test
    cy.mount(
      <CommerceLayer accessToken="" endpoint="">
        ciao
      </CommerceLayer>
    )
    // start testing!
    cy.contains('ciao')
    // mounted component can be selected via its name, function, or JSX
    // e.g. '@HelloState', HelloState, or <HelloState />
    // cy.get(HelloState).invoke('setState', { name: 'React' })
    // cy.get(HelloState)
    //   .its('state')
    //   .should('deep.equal', { name: 'React' })
    // // check if GUI has rerendered
    // cy.contains('Hello React!')
  })
})
