it('allows direct visit to /item/:id and mocks item detail', () => {
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

    // Mock the item data
    cy.intercept('GET', `/api/items/${item.id}`, {
      statusCode: 200,
      body: item
    }).as(`getItem-${item.id}`);

    // Mock the seller info
    cy.intercept('GET', `/api/users/${sellerId}`, {
      statusCode: 200,
      body: {
        id: sellerId,
        fullName: 'Jane Doe',
        email: 'JaneDoe@test.com',
        profilePicture: '/images/test.jpg'
      }
    }).as(`getUser-${sellerId}`);

    // Optional: intercept logItemView or reservation check if used
    cy.intercept('POST', `/api/items/${item.id}/views`, {
      statusCode: 200
    }).as('logItemView');

    cy.intercept('GET', `/api/messages/conversation?itemId=${item.id}&withUserId=${sellerId}`, {
      statusCode: 200,
      body: [] // no messages yet
    }).as('getMessages');

    // Login
    cy.login(user.email, 'password123');
    cy.wait('@getMe');

    // Directly visit item page
    cy.visit(`/item/${item.id}`);

    // Wait for item and seller to load
    cy.wait(`@getItem-${item.id}`);
    cy.wait(`@getUser-${sellerId}`);

    // Assert item is shown
    cy.contains(item.title).should('exist');
    cy.contains(`${item.price} kr`).should('exist');

    // Press reserve button
    cy.contains('button', 'Reserve').click();

    cy.url().should('include', `/messages/conversation?itemId=${item.id}&withUserId=${sellerId}&reserve=true`);
  });
});
