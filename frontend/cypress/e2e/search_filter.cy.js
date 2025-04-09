describe('E2E - Login, Search, Filter', () => {
  let user, categories, recommendedItems, marketItems;

  before(() => {
    // Load mock data from fixtures
    cy.fixture('user.json').then((data) => { user = data; });
    cy.fixture('categories.json').then((data) => { categories = data; });
    cy.fixture('recommendedItems.json').then((data) => { recommendedItems = data; });
    cy.fixture('marketItems.json').then((data) => { marketItems = data; });
  });

  it('logs in, searches, applies filters, and searches again', () => {
    // Intercept API requests and mock responses for other API calls
    cy.intercept('GET', '/api/users/me', {
      statusCode: 200,
      body: user // Mocked response for GET /api/users/me
    }).as('getMe');

    cy.intercept('GET', '/api/categories', {
      statusCode: 200,
      body: categories // Mocked response for GET /api/categories
    }).as('getCategories');

    cy.intercept('GET', '/api/items/recommended', {
      statusCode: 200,
      body: recommendedItems // Mocked response for GET /api/items/recommended
    }).as('getRecommended');

    // Intercept API call to get filtered items
    cy.intercept('GET', /\/api\/items/, (req) => {
      const url = new URL(req.url);
      const searchParams = url.searchParams;

      const matchesSearch = searchParams.get('searchQuery')?.toLowerCase().includes('laptop');
      const minPrice = parseInt(searchParams.get('minPrice'), 10);
      const maxPrice = parseInt(searchParams.get('maxPrice'), 10);
      const categoryIds = searchParams.getAll('categoryIds');

      const shouldReturn = matchesSearch &&
        categoryIds.includes('1') &&
        minPrice <= 3000 &&
        maxPrice >= 3000;

      req.reply({
        statusCode: 200,
        body: shouldReturn ? recommendedItems : []
      });
    }).as('getItems');

    // Use the custom login command to log in (mocked request)
    cy.login('testuser@example.com', 'password123');  // This will use the mock login response

    // Wait for the mocked login request to complete
    cy.wait('@loginRequest');
    cy.wait('@getMe');
    cy.wait('@getCategories');
    cy.wait('@getItems');

    // Confirm the user was redirected to the home page
    cy.url().should('include', '/home');

    // Perform a search for "laptop"
    cy.get('.search-input').should('exist').type('laptop{enter}');
    cy.url().should('include', '/items');
    cy.contains('Results for "laptop"');
    cy.wait('@getItems');
    cy.wait('@getCategories');

    // Open filters and apply filters
    cy.contains(/Show filters/i).click();
    cy.get('.FilterPanel input[type="checkbox"]').first().check({ force: true });
    cy.get('input[placeholder="0"]').clear().type('1000');
    cy.get('input[placeholder="10000000"]').clear().type('5000');
    cy.get('input[placeholder="Distance in km"]').clear().type('10');
    cy.get('input[placeholder="Latitude"]').clear().type('59.3293');
    cy.get('input[placeholder="Longitude"]').clear().type('18.0686');
    cy.contains(/Apply filters/i).click();

    // Wait for filtered results and assert they're shown
    cy.url().should('include', '/items');
    cy.wait('@getItems');
    cy.get('.CardGrid, .item-card', { timeout: 10000 }).should('exist');
  });
});
