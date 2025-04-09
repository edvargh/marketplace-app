describe('E2E - Login, Search, Filter', () => {
  let user, categories, recommendedItems, marketItems;

  before(() => {
    cy.fixture('user.json').then((data) => { user = data; });
    cy.fixture('categories.json').then((data) => { categories = data; });
    cy.fixture('recommendedItems.json').then((data) => { recommendedItems = data; });
    cy.fixture('marketItems.json').then((data) => { marketItems = data; });
  });

  it('logs in, searches, applies filters, and searches again', () => {
    cy.mockApiRequests(user, categories, recommendedItems);

    // Login and home page
    cy.login(user.email, 'password123');
    cy.wait('@loginRequest');
    cy.wait('@getMe');
    cy.wait('@getCategories');
    cy.wait('@getItems');
    cy.url().should('include', '/home');

    // Search for "laptop"
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

    // Filtered results
    cy.url().should('include', '/items');
    cy.wait('@getItems');
    cy.get('.CardGrid, .item-card', { timeout: 10000 }).should('exist');
  });
});
