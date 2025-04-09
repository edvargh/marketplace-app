it('allows direct visit to /item/:id and mocks reservation flow', () => {
  const item = {
    id: 2,
    title: "Laptop",
    price: 800,
    status: "FOR_SALE",
    sellerId: 99,
    sellerName: "Jane Doe",
    imageUrls: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"]
  };

  cy.fixture('user.json').then(userData => {
    const user = userData[0];

    cy.mockReservationFlow(user, item);
    cy.wait(500);
    cy.login(user.email, 'password123');
    cy.wait('@getMe');

    cy.visit(`/item/${item.id}`);
    cy.wait('@getItem');

    cy.contains(item.title).should('exist');
    cy.contains(`${item.price} kr`).should('exist');

    cy.wait(500);
    cy.contains('button', 'Reserve').click();

    cy.url().should('include', `/messages/conversation`);
    cy.url().should('include', `itemId=${item.id}`);
    cy.url().should('include', `withUserId=${item.sellerId}`);
    cy.url().should('include', `reserve=true`);

    cy.wait('@getMessages');

    cy.wait(500);
    cy.contains('button', 'Send').click();

    const reservationAliases = ['@sendReservation', '@sendReservationAlt', '@sendReservationConversation', '@sendMessage'];

    cy.wait(reservationAliases[0], { timeout: 10000 }).then(() => {
      cy.contains('I would like to reserve this item').should('exist');
    });
  });
});
