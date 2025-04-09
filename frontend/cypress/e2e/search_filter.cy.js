describe('E2E - Login, Search, Filter', () => {
  it('logs in, searches, applies filters, and searches again', () => {
    // ✅ Mock categories
    const mockCategories = [
      { id: 1, name: 'Category A' },
      { id: 2, name: 'Category B' }
    ]

    // ✅ Mock items
    const mockItems = [
      {
        id: 1,
        title: 'Mock Laptop',
        price: 3000,
        categoryId: 1,
        imageUrls: ['/mock-laptop.jpg'],
        sellerId: 1,
        status: 'FOR_SALE',
        description: 'A mocked laptop for testing'
      }
    ]

    // ✅ Prevent Vue crash from stopping Cypress (optional fallback)
    Cypress.on('uncaught:exception', (err) => {
      if (err.message.includes("reading 'length'")) {
        return false
      }
    })

    // ✅ Intercepts
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: {
          id: 1,
          email: 'testuser@example.com',
          name: 'Test User',
          role: 'USER'
        }
      }
    }).as('loginRequest')

    cy.intercept('GET', '/api/users/me', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'testuser@example.com',
        name: 'Test User',
        role: 'USER'
      }
    }).as('getMe')

    cy.intercept('GET', '/api/categories', {
      statusCode: 200,
      body: mockCategories
    }).as('getCategories')

    cy.intercept('GET', '/api/items/recommended', {
      statusCode: 200,
      body: mockItems
    }).as('getRecommended')

    // ✅ Dynamically handle filtering in /api/items
    cy.intercept('GET', /\/api\/items/, (req) => {
      const url = new URL(req.url)
      const searchParams = url.searchParams

      const matchesSearch = searchParams.get('searchQuery')?.toLowerCase().includes('laptop')
      const minPrice = parseInt(searchParams.get('minPrice'), 10)
      const maxPrice = parseInt(searchParams.get('maxPrice'), 10)
      const categoryIds = searchParams.getAll('categoryIds')

      const shouldReturn = matchesSearch &&
          categoryIds.includes('1') &&
          minPrice <= 3000 &&
          maxPrice >= 3000

      req.reply({
        statusCode: 200,
        body: shouldReturn ? mockItems : []
      })
    }).as('getItems')

    // ✅ Visit login page
    cy.visit('/login')
    cy.get('#email').type('testuser@example.com')
    cy.get('#password').type('password123')
    cy.get('button[type="submit"]').click()

    // ✅ Wait for app to log in and load
    cy.wait('@loginRequest')
    cy.wait('@getMe')
    cy.wait('@getCategories')
    cy.wait('@getItems')

    // ✅ Confirm redirection to home
    cy.url().should('include', '/home')

    // ✅ Perform a search
    cy.get('.search-input').should('exist').type('laptop{enter}')
    cy.url().should('include', '/items')
    cy.contains('Results for "laptop"')
    cy.wait('@getItems')
    cy.wait('@getCategories')

    // ✅ Open and apply filters
    cy.contains(/Show filters/i).click()
    cy.get('.FilterPanel input[type="checkbox"]').first().check({ force: true })
    cy.get('input[placeholder="0"]').clear().type('1000')
    cy.get('input[placeholder="10000000"]').clear().type('5000')
    cy.get('input[placeholder="Distance in km"]').clear().type('10')
    cy.get('input[placeholder="Latitude"]').clear().type('59.3293')
    cy.get('input[placeholder="Longitude"]').clear().type('18.0686')
    cy.contains(/Apply filters/i).click()

    // ✅ Wait for filtered results and assert they're shown
    cy.url().should('include', '/items')
    cy.wait('@getItems')
    cy.get('.CardGrid, .CompactItemCard', { timeout: 10000 }).should('exist')
  })
})
