it('Toggle favorite button in ItemView', () => {
  const item = {
    id: 2,
    title: "Laptop",
    price: 800,
    status: "FOR_SALE",
    sellerId: 99,
    sellerName: "Jane Doe",
    imageUrls: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"]
  };

  const sellerId = item.sellerId;

  cy.fixture('user.json').then(userData => {
    const user = userData[0];

    // Mock logged-in user
    cy.intercept('GET', '/api/users/me', {
      statusCode: 200,
      body: user
    }).as('getMe');

    // Mock item data
    cy.intercept('GET', `/api/items/${item.id}`, {
      statusCode: 200,
      body: item
    }).as(`getItem-${item.id}`);

    // Mock seller info
    cy.intercept('GET', `/api/users/${sellerId}`, {
      statusCode: 200,
      body: {
        id: sellerId,
        fullName: 'Jane Doe',
        email: 'JaneDoe@test.com',
        profilePicture: '/images/test.jpg'
      }
    }).as(`getUser-${sellerId}`);

    // Mock conversations
    cy.intercept('GET', `/api/messages/conversation?itemId=${item.id}&withUserId=${sellerId}`, {
      statusCode: 200,
      body: []
    }).as('getMessages');

    // Mock favorite toggle
    cy.intercept('PUT', `/api/items/${item.id}/favorite-toggle`, {
      statusCode: 200,
      body: { success: true }
    }).as('toggleFavorite');

    // Login and item page
    cy.login(user.email, 'password123');
    cy.wait('@getMe');
    cy.visit(`/item/${item.id}`);
    cy.wait(`@getItem-${item.id}`);
    cy.wait(`@getUser-${sellerId}`);
    cy.contains(item.title).should('exist');
    cy.contains(`${item.price} kr`).should('exist');

    // Verify the favorite button is initially in "not favorited" state
    cy.get('.favorite-btn')
      .should('be.visible')
      .should('contain', 'Favorite');
    cy.get('.favorite-btn span')
      .should('not.have.class', 'favorite');

    // Click the favorite button to toggle favorite on
    cy.get('.favorite-btn').click();
    cy.wait('@toggleFavorite');
    cy.get('.favorite-btn')
      .should('be.visible')
      .should('contain', 'Unfavorite');
    cy.get('.favorite-btn span')
      .should('have.class', 'favorite');

    // Click the favorite button again to toggle favorite off
    cy.get('.favorite-btn').click();
    cy.wait('@toggleFavorite');
    cy.get('.favorite-btn')
      .should('be.visible')
      .should('contain', 'Favorite');
    cy.get('.favorite-btn span')
      .should('not.have.class', 'favorite');
  });
});