describe('E2E - Item Management', () => {
  let user, categories, recommendedItems;
  
  before(() => {
    // Load mock data from fixtures
    cy.fixture('user.json').then((data) => { user = data; });
    cy.fixture('categories.json').then((data) => { categories = data; });
    cy.fixture('recommendedItems.json').then((data) => { recommendedItems = data; });
  });

  beforeEach(() => {
    // Use custom login and mockApiRequests
    cy.mockApiRequests(user, categories, recommendedItems);  // Mock API requests
    cy.login('Robert@hotmail.com', '12345678');  // Login the user
  });
  it('should create a new item', () => {
    // Intercept the create item request
    cy.intercept('POST', '**/api/create', {
      statusCode: 201,
      body: { id: 'new-item-id', title: 'Test Item' }
    }).as('createItem');
    
    cy.log('Navigating to create item page');
    cy.visit('/create');

    
    cy.get('.parent-selector .InputBox.box.title').type('New Title');
    cy.get('textarea[name="description"]').should('be.visible').debug().type('Test Description');
    cy.get('select[name="categoryId"]').should('be.visible').select('1');
    cy.get('input[name="price"]').should('be.visible').type('100');
    
    // For map location
    cy.get('input[name="latitude"]').should('be.visible').type('59.9139');
    cy.get('input[name="longitude"]').should('be.visible').type('10.7522');
    
    // For file upload
    cy.get('input[type="file"]').should('exist').attachFile('test-image.jpg');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for the create item API request to complete and log the result
    cy.wait('@createItem').its('response.statusCode').should('eq', 201).then((response) => {
      console.log('API Response:', response);
      cy.log('Item created successfully!');
    });
    
    // Verify redirection to new item page
    cy.url().should('include', '/items/new-item-id');
  });
  

  
});
