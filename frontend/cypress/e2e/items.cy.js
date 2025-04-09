describe('Item Store E2E Tests', () => {
  beforeEach(() => {
    const user = {
      token: 'fake-jwt-token'
    };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', 'fake-jwt-token');

    cy.visit('/');

    cy.intercept('GET', '**/api/items*', { fixture: 'marketItems.json' }).as('getMarketItems');
    cy.intercept('GET', '**/api/items/recommended', { fixture: 'recommendedItems.json' }).as('getRecommendedItems');
    cy.intercept('POST', '**/api/items/*/view', { statusCode: 200 }).as('logItemView');
    cy.intercept('GET', '**/api/items/favorites', { fixture: 'favoriteItems.json' }).as('getFavoriteItems');
    cy.intercept('PUT', '**/api/items/*/favorite-toggle', { statusCode: 200 }).as('toggleFavorite');
    cy.intercept('GET', '**/api/items/my-items', { fixture: 'userItems.json' }).as('getUserItems');
  });

  it('should fetch and display market items', () => {
    cy.get('[data-test="market-items-section"]').should('be.visible');
    cy.wait('@getMarketItems');
    
    // Verify items are displayed
    cy.get('[data-test="item-card"]').should('have.length.at.least', 1);
  });

  it('should fetch and display item details', () => {
    // Intercept the specific item request
    cy.intercept('GET', '**/api/items/123', { fixture: 'itemDetail.json' }).as('getItemDetail');
    
    // Visit item detail page
    cy.visit('/items/123');
    cy.wait('@getItemDetail');
    
    // Verify item details are displayed
    cy.get('[data-test="item-title"]').should('be.visible');
    cy.get('[data-test="item-price"]').should('be.visible');
    cy.get('[data-test="item-description"]').should('be.visible');
  });

  it('should log item view when viewing an item', () => {
    // Intercept the specific item request and view log
    cy.intercept('GET', '**/api/items/123', { fixture: 'itemDetail.json' }).as('getItemDetail');
    cy.intercept('POST', '**/api/items/123/view', { statusCode: 200 }).as('logItemView');
    
    // Visit item detail page
    cy.visit('/items/123');
    cy.wait('@getItemDetail');
    
    // Verify view was logged
    cy.wait('@logItemView').its('response.statusCode').should('eq', 200);
  });

  it('should toggle item favorite status', () => {
    // Visit item detail page
    cy.intercept('GET', '**/api/items/123', { fixture: 'itemDetail.json' }).as('getItemDetail');
    cy.visit('/items/123');
    cy.wait('@getItemDetail');
    
    // Click favorite button
    cy.get('[data-test="favorite-button"]').click();
    
    // Verify favorite toggle API was called
    cy.wait('@toggleFavorite').its('response.statusCode').should('eq', 200);
    
    // Verify UI was updated
    cy.get('[data-test="favorite-button"]').should('have.class', 'favorited');
  });

  it('should fetch user items', () => {
    // Visit user items page
    cy.visit('/my-items');
    cy.wait('@getUserItems');
    
    // Verify user items are displayed
    cy.get('[data-test="user-item-card"]').should('have.length.at.least', 1);
  });

  it('should create a new item', () => {
    // Intercept the create item request
    cy.intercept('POST', '**/api/items/create', { 
      statusCode: 201, 
      body: { id: 'new-item-id', title: 'Test Item' } 
    }).as('createItem');
    
    // Visit create item page
    cy.visit('/items/create');
    
    // Fill the form
    cy.get('[data-test="item-title-input"]').type('Test Item');
    cy.get('[data-test="item-description-input"]').type('Test Description');
    cy.get('[data-test="item-category-select"]').select('1'); // Assuming '1' is a valid category ID
    cy.get('[data-test="item-price-input"]').type('100');
    
    // Mock file upload
    cy.get('[data-test="item-image-upload"]').attachFile('test-image.jpg');
    
    // Submit the form
    cy.get('[data-test="submit-item-button"]').click();
    
    // Verify API call was made
    cy.wait('@createItem').its('response.statusCode').should('eq', 201);
    
    // Verify user is redirected to the new item
    cy.url().should('include', '/items/new-item-id');
  });

  it('should update an existing item', () => {
    // Intercept the get and update item requests
    cy.intercept('GET', '**/api/items/123', { fixture: 'itemDetail.json' }).as('getItemDetail');
    cy.intercept('PUT', '**/api/items/123', { 
      statusCode: 200, 
      body: { id: '123', title: 'Updated Test Item' } 
    }).as('updateItem');
    
    // Visit edit item page
    cy.visit('/items/123/edit');
    cy.wait('@getItemDetail');
    
    // Update the form
    cy.get('[data-test="item-title-input"]').clear().type('Updated Test Item');
    cy.get('[data-test="item-price-input"]').clear().type('150');
    
    // Submit the form
    cy.get('[data-test="submit-item-button"]').click();
    
    // Verify API call was made
    cy.wait('@updateItem').its('response.statusCode').should('eq', 200);
    
    // Verify user is redirected to the updated item
    cy.url().should('include', '/items/123');
  });

  it('should delete an item', () => {
    // Intercept the delete request
    cy.intercept('DELETE', '**/api/items/123', { statusCode: 204 }).as('deleteItem');
    
    // Visit user items page
    cy.visit('/my-items');
    cy.wait('@getUserItems');
    
    // Click delete button on an item
    cy.get('[data-test="delete-item-button"]').first().click();
    
    // Confirm deletion in modal
    cy.get('[data-test="confirm-delete-button"]').click();
    
    // Verify API call was made
    cy.wait('@deleteItem').its('response.statusCode').should('eq', 204);
    
    // Verify item was removed from the list
    cy.get('[data-test="delete-success-message"]').should('be.visible');
  });

  it('should search for items with filters', () => {
    // Intercept search request with custom response
    cy.intercept('GET', '**/api/items?*searchQuery=bike*', { fixture: 'searchResults.json' }).as('searchItems');
    
    // Visit search page
    cy.visit('/search');
    
    // Apply filters
    cy.get('[data-test="search-input"]').type('bike');
    cy.get('[data-test="category-filter"]').select('1'); // Assuming '1' is a valid category ID
    cy.get('[data-test="min-price-input"]').type('50');
    cy.get('[data-test="max-price-input"]').type('500');
    
    // Submit search
    cy.get('[data-test="search-button"]').click();
    
    // Verify search API was called
    cy.wait('@searchItems');
    
    // Verify results are displayed
    cy.get('[data-test="search-results"]').should('be.visible');
    cy.get('[data-test="item-card"]').should('have.length.at.least', 1);
  });

  it('should update item status', () => {
    // Intercept the status update request
    cy.intercept('PUT', '**/api/items/123/status*', { statusCode: 200 }).as('updateStatus');
    
    // Visit item detail page
    cy.intercept('GET', '**/api/items/123', { fixture: 'itemDetail.json' }).as('getItemDetail');
    cy.visit('/items/123');
    cy.wait('@getItemDetail');
    
    // Click status update button
    cy.get('[data-test="status-dropdown"]').click();
    cy.get('[data-test="status-sold"]').click();
    
    // Verify API call was made
    cy.wait('@updateStatus').its('response.statusCode').should('eq', 200);
    
    // Verify UI was updated
    cy.get('[data-test="item-status"]').should('contain', 'Sold');
  });

  it('should initiate Vipps payment', () => {
    // Intercept payment request
    cy.intercept('POST', '**/api/payments/vipps?itemId=123', { 
      statusCode: 200,
      body: { redirectUrl: 'https://vipps.no/payment/123' }
    }).as('initiatePayment');
    
    // Visit item detail page
    cy.intercept('GET', '**/api/items/123', { fixture: 'itemDetail.json' }).as('getItemDetail');
    cy.visit('/items/123');
    cy.wait('@getItemDetail');
    
    // Click buy button
    cy.get('[data-test="buy-button"]').click();
    
    // Click Vipps payment option
    cy.get('[data-test="vipps-payment-button"]').click();
    
    // Verify payment API was called
    cy.wait('@initiatePayment');
    
    // Test that we're redirected to Vipps
    cy.url().should('include', 'vipps.no/payment');
  });
});