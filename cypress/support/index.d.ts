// in cypress/support/index.d.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />
import {
  SetRoutes,
  NewStubData,
  SaveRequests,
} from '@commercelayer/cypress-vcr'

declare namespace Cypress {
  interface Chainable {
    setRoutes: SetRoutes
    newStubData: NewStubData
    saveRequests: SaveRequests
  }
}
