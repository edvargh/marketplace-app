describe('E2E - Item Management', () => {
  let user, categories, recommendedItems, itemDetail

  before(() => {
    // Load fixtures
    cy.fixture('user.json').then((data) => {
      user = data[0]
    })
    cy.fixture('categories.json').then((data) => {
      categories = data
    })
    cy.fixture('recommendedItems.json').then((data) => {
      recommendedItems = data
    })
    cy.fixture('itemDetail.json').then((data) => {
      itemDetail = data
    })
  })

  it('should create, update, and delete an item', () => {
    // --- CREATE PHASE ---
    cy.mockApiRequests(user, categories, recommendedItems)
    cy.login(user.email, '12345678')
    const localItemDetail = Cypress._.cloneDeep(itemDetail)

    localItemDetail.seller = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    }
    const itemId = localItemDetail.id
    const sellerId = user.id

    // Mocks
    cy.mockCreateItem(localItemDetail)
    cy.mockGetItemDetails(itemId, localItemDetail, sellerId)
    cy.mockGetMessages(itemId, sellerId)
    cy.mockGetSeller(sellerId, localItemDetail)
    cy.mockTrackView(itemId)

    // Home Page, open mobile menu, and navigate to "Create listing"
    cy.url().should('include', '/home')
    cy.contains('button', '☰').click()
    cy.contains('.mobile-dropdown a', 'Create Listing').should('exist')
    cy.contains('.mobile-dropdown a', 'Create Listing').click()
    cy.url().should('include', '/create')

    // Fill form
    cy.contains('button', 'Import Images').click()
    cy.get('input[type="file"]').selectFile('cypress/fixtures/images/test.jpg', { force: true })
    cy.get('.SelectBox').click()
    cy.contains('.custom-dropdown-menu li', localItemDetail.categoryName).click()
    cy.get('.input-title input').type(localItemDetail.title)
    cy.get('.input-description textarea').type(localItemDetail.description)
    cy.get('.input-price input[type="number"]').type(localItemDetail.price.toString())
    cy.get('.leaflet-container').should('be.visible').click(200, 200)

    // Wait and submit
    cy.get('button[type="submit"]').should('not.be.disabled').click()
    cy.wait('@createItem').its('response.statusCode').should('eq', 201)
    cy.contains('Advertisement created successfully!').should('exist')

    // Navigate to the item detail view
    cy.url().should('include', `/item/${itemId}`)

    // Verify edit button and click
    cy.contains('Edit').should('exist').click()
    cy.url().should('include', `/edit`).and('include', `${itemId}`)

    // --- EDIT PHASE ---
    const updatedStatus = 'Reserved'
    const updatedCategory = 'Pets'
    const updatedTitle = 'Updated ' + localItemDetail.title
    const updatedDescription = 'Updated ' + localItemDetail.description
    const updatedPrice = (localItemDetail.price + 100).toString()

    localItemDetail.status = updatedStatus
    localItemDetail.title = updatedTitle
    localItemDetail.description = updatedDescription
    localItemDetail.price = Number(updatedPrice)

    // Update call
    cy.intercept('PUT', `/api/items/${itemId}`, {
      statusCode: 200,
      body: localItemDetail,
    }).as('updateItem')

    // Update form
    cy.get('.status-select-box').click()
    cy.contains('.custom-dropdown-menu li', updatedStatus).click()
    cy.get('.category-select-box').click()
    cy.contains('.custom-dropdown-menu li', updatedCategory).click()
    cy.get('.input-title input').clear().type(updatedTitle)
    cy.get('.input-description textarea').clear().type(updatedDescription)
    cy.get('.input-price input[type="number"]').clear().type(updatedPrice)
    cy.get('.leaflet-container').should('be.visible').click(200, 200)

    // Click Save button and confirm notification
    cy.get('button[type="submit"]').contains(/Save/i).should('not.be.disabled').click()
    cy.wait('@updateItem').its('response.statusCode').should('eq', 200)
    cy.contains('Advertisement updated successfully!').should('exist')

    // Navigate back to the ItemView
    cy.url().should('include', `/item/${itemId}`)

    // Verify updated fields are displayed
    cy.contains(updatedStatus).should('exist')
    cy.contains(updatedTitle).should('exist')
    cy.contains(updatedDescription).should('exist')
    cy.contains(`${updatedPrice} kr`).should('exist')
    cy.contains('Edit').should('exist').click()

    // --- DELETE PHASE ---
    // Click edit button
    cy.url().should('include', `/edit`).and('include', `${itemId}`)

    // Delete call
    cy.intercept('DELETE', `/api/items/${itemId}`, {
      statusCode: 204,
      body: {},
    }).as('deleteItem')

    // Click Delete button and confirm notification
    cy.contains('button', /Delete/i)
      .should('be.visible')
      .click()
    cy.on('window:confirm', () => true)
    cy.wait('@deleteItem').its('response.statusCode').should('eq', 204)
    cy.contains('Advertisement deleted successfully!').should('exist')
  })
})
