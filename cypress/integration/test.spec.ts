/// <reference types="Cypress" />
import { fixRoute } from '../support/utils'

Cypress.env('pages').map(page => {
  if (page.mainTitle === '') return false
  if (page.path === '') return false
  describe(page.mainTitle, () => {
    const xhrData = {}
    const aliasRoutes = {}
    let aliasRequest = []
    before(() => {
      cy.server({
        // Here we handle all requests passing through Cypress' server
        onResponse: response => {
          if (Cypress.env('RECORD')) {
            const url = response.url
            const method = response.method
            const data = response.response.body ? response.response.body : {}
            const { alias, request } = fixRoute(
              url,
              aliasRoutes,
              method,
              Cypress.env('baseUrl'),
              aliasRequest
            )
            aliasRequest = request
            xhrData[alias] = { url, method, data }
          }
        }
      })
      // This tells Cypress to hook into any GET request
      if (Cypress.env('RECORD')) {
        cy.fixture('routes').then(routes => {
          Object.keys(routes).map(rk => {
            console.log('rk', rk)
            const { method, url, alias } = routes[rk]
            const aliasK = `${url}`
            aliasRoutes[aliasK] = {
              [method]: alias
            }
            console.log('method', method)
            console.log('url', url)
            console.log('alias', alias)
            cy.route({ method, url }).as(alias)
          })
        })
      } else {
        cy.fixture(`${page.filePrefix}-alias`).then(async f => {
          f.map(rk => {
            // ABOUT CYPRESS ROUTE BUG
            if (rk === 'getOrder1' || rk === 'getSkus1') return null
            cy.task(
              'readFileMaybe',
              `cypress/fixtures/${page.filePrefix}${rk}.json`
            ).then(exists => {
              if (!exists) return null
              cy.fixture(`${page.filePrefix}${rk}`).then(d => {
                const { url, method, data } = d
                cy.route(method, url, data).as(`${rk}`)
              })
            })
          })
        })
      }
      cy.visit(page.path)
    })
    after(() => {
      // In record mode, save gathered XHR data to local JSON file
      if (Cypress.env('RECORD')) {
        Object.keys(xhrData).map(v => {
          const path = `./cypress/fixtures/${page.filePrefix}${v}.json`
          cy.writeFile(path, xhrData[v])
        })
        const path = `./cypress/fixtures/${page.filePrefix}-alias.json`
        const keys = Object.keys(xhrData)
        cy.writeFile(path, keys)
      }
    })
    it(page.title, () => {
      cy.wait(['@accessToken'])
      if (page.typeSelectSku === 'category') {
        // cy.wait('@getPricesCat')
        cy.wait('@getSkus')
        cy.get('#quantity-selector').as('addToBagQuantity')
        cy.get('#add-to-bag').as('addToBag')
      } else {
        cy.wait(['@getPrices', '@getSkus'])
        cy.get('#add-to-bag').as('addToBag')
        cy.get('#quantity-selector').as('addToBagQuantity')
        cy.get('@addToBagQuantity').should('be.disabled')
        cy.get('@addToBag').should('have.attr', 'disabled')
      }

      // SELECT SKU WITH SELECT INPUT
      if (page.typeSelectSku === 'select') {
        cy.get('#variant-selector').as('variant-selector')
        cy.get('@variant-selector').select('12 months')
        cy.get('@variant-selector').should(
          'have.value',
          'BABYONBU000000E63E7412MX'
        )
      }
      // SELECT SKU WITH RADIO INPUT
      if (page.typeSelectSku === 'radio') {
        cy.get('#variant-selector-1')
          .as('variant-selector-1')
          .check()
        cy.get('@variant-selector-1')
          .should('be.checked')
          .should('have.value', 'BABYONBU000000E63E7412MX')
      }
      if (page.typeSelectSku !== 'category') {
        cy.wait(['@retrieveSku'])
      }
      cy.get('@addToBagQuantity').should('not.be.disabled')
      cy.get('@addToBag').should('not.have.attr', 'disabled')

      cy.get('@addToBagQuantity').type('{backspace}2')
      cy.get('@addToBagQuantity').should('contain.value', '2')

      cy.get('@addToBag').click()

      cy.wait(['@createOrder', '@createLineItems', '@getOrder'])
      cy.get('#items-count')
        .as('item-count')
        .should('contain.text', '2')
      cy.get('#total-amount').should('contain.text', '€58,00')
      cy.get('#line-item-name').should(
        'contain.text',
        'Black Baby Onesie Short Sleeve with Pink Logo (12 Months)'
      )
      cy.get('#line-item-quantity').should('have.value', '2')
      cy.get('#line-item-total').should('contain.text', '€58,00')
      cy.get('#line-item-remove').should('contain.text', 'remove')
      cy.get('#line-item-remove').click()

      // FIXME: Cypress bug
      if (Cypress.env('RECORD')) {
        cy.wait(['@deleteLineItems', '@getLineItems', '@getOrder'])
        cy.get('@item-count').should('contain.text', '0')
      } else {
        // cy.server({ enable: false })
        // cy.wait('@getOrder')
      }
      // cy.get('.clayer-shopping-bag-toggle').click()
      // cy.get('#clayer-shopping-bag-container').should('not.have.class', 'open')
    })
    // it('Product Page Select', () => {
    //   cy.visit('/product-page-select.html')
    //   cy.wait(['@accessToken', '@getPrices', '@getSkus'])

    //   cy.get('.clayer-add-to-bag-quantity').as('addToBagQuantity')
    //   cy.get('#add-to-bag').as('addToBag')

    //   cy.get('@addToBagQuantity').should('be.disabled')
    //   cy.get('@addToBag').should('have.class', 'disabled')
    //   cy.get('.clayer-variant-select')
    //     .select('New born')
    //     .should('have.value', 'bWRwRSmvPB')

    //   cy.wait(['@retrieveSku'])

    //   cy.get('@addToBagQuantity').should('not.be.disabled')
    //   cy.get('@addToBag').should('not.have.class', 'disabled')
    //   cy.get('@addToBag').should(
    //     'have.attr',
    //     'data-sku-code',
    //     'BABYONBU000000E63E74NBXX'
    //   )

    //   cy.get('#add-to-bag-quantity').type('{backspace}2')
    //   cy.get('#add-to-bag-quantity').should('contain.value', '2')

    //   cy.get('@addToBag').click()

    //   cy.wait(['@createOrder', '@createLineItems', '@getOrder'])
    //   cy.get('.clayer-shopping-bag-items-count').should('contain.text', '2')
    //   cy.get(':nth-child(7) > .clayer-shopping-bag-total').should(
    //     'contain.text',
    //     '€58,00'
    //   )
    //   cy.get('#clayer-shopping-bag-container').should('have.class', 'open')
    //   cy.get('.clayer-shopping-bag-item-name').should(
    //     'contain.text',
    //     'Black Baby Onesie Short Sleeve with Pink Logo (New born)'
    //   )
    //   cy.get('.clayer-shopping-bag-item-qty-container > select').should(
    //     'have.value',
    //     '2'
    //   )
    //   cy.get('.clayer-shopping-bag-item-total-amount').should(
    //     'contain.text',
    //     '€58,00'
    //   )
    //   cy.get('.clayer-shopping-bag-item-remove').should('contain.text', 'remove')
    //   cy.get('.clayer-shopping-bag-item-remove').click()

    //   // FIXME: Cypress bug
    //   if (Cypress.env('RECORD')) {
    //     cy.wait(['@deleteLineItems', '@getLineItems', '@getOrder'])
    //     cy.get('.clayer-shopping-bag-items-count').should('contain.text', '0')
    //   } else {
    //     // cy.server({ enable: false })
    //     // cy.wait('@getOrder')
    //   }
    //   cy.get('.clayer-shopping-bag-toggle').click()
    //   cy.get('#clayer-shopping-bag-container').should('not.have.class', 'open')
    // })
  })
})
