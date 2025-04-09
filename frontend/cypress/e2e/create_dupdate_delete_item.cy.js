describe('E2E - Item Management', () => {
  let user, categories, recommendedItems;

  before(() => {
    cy.fixture('user.json').then((data) => { user = data; });
    cy.fixture('categories.json').then((data) => { categories = data; });
    cy.fixture('recommendedItems.json').then((data) => { recommendedItems = data; });
  });

  beforeEach(() => {
    cy.mockApiRequests(user, categories, recommendedItems);
    cy.login('Robert@hotmail.com', '12345678');
  });

  it('should create a new item via navbar navigation', () => {
    cy.intercept('POST', '**/api/items/create', {
      statusCode: 201,
      body: { id: 'new-item-id', title: 'Test Item' }
    }).as('createItem');

    cy.url().should('include', '/home');

    // Open mobile menu and navigate to categories
    cy.contains('button', '☰').click();
    cy.contains('.mobile-dropdown a', 'Create Listing').should('exist');
    cy.contains('.mobile-dropdown a', 'Create Listing').click();
    cy.url().should('include', '/create');

    // Upload image
    cy.contains('button', 'Import Images').click();
    cy.get('input[type="file"]').selectFile('cypress/images/test.jpg', { force: true });

    // Select category
    cy.get('.SelectBox').click();
    cy.contains('.custom-dropdown-menu li', 'Electronics').click();

    // Set title, description and price
    cy.get('.input-title input').type('My Test Item');
    cy.get('.input-description textarea').type('This is a detailed description for my test item.');
    cy.get('.input-price input[type="number"]').type('199');

    // Set location (click on Leaflet map)
    cy.get('.leaflet-container')
      .should('be.visible')
      .click(200, 200);

    // Wait and submit
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.get('button[type="submit"]').click();
    cy.wait('@createItem').its('response.statusCode').should('eq', 201);

    // Confirm redirect
    cy.url().should('include', '/item/new-item-id'); // singular!
  });
});
