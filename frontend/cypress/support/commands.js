import 'cypress-file-upload';

Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      email: email,
      name: 'Test User',
      token: 'fake-jwt-token',
      id: 1,
      role: 'USER',
    },
  }).as('loginRequest');

  cy.visit('/login');
  cy.get('#email').type(email);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();

  cy.window().then((win) => {
    win.localStorage.setItem('token', 'fake-jwt-token');
  });
});


Cypress.Commands.add('mockApiRequests', (user, categories, recommendedItems) => {
  cy.intercept('GET', '/api/users/me', {
    statusCode: 200,
    body: user
  }).as('getMe');

  cy.intercept('GET', '/api/categories', {
    statusCode: 200,
    body: categories
  }).as('getCategories');

  cy.intercept('GET', '/api/items/recommended', {
    statusCode: 200,
    body: recommendedItems
  }).as('getRecommended');


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
});

Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height();
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.lessThan(bottom);
  expect(rect.bottom).to.be.greaterThan(0);
  
  return subject;
});

Cypress.Commands.add('mockProfileUpdate', (updatedUser) => {
  cy.intercept('PUT', `/api/users/${updatedUser.id}`, {
    statusCode: 200,
    body: updatedUser,
  }).as('updateProfile');
});

Cypress.Commands.add('mockRegister', (responseBody = {}, statusCode = 200) => {
  cy.intercept('POST', '/api/auth/register', {
    statusCode,
    body: responseBody
  }).as('registerRequest');
});

Cypress.Commands.add('mockApiRequestsConversation', (user, conversations, messages, items = []) => {
  const itemId = messages[0].itemId;
  const withUserId = messages.find(m => m.senderId !== user.id)?.senderId ?? 4;

  const otherUser = {
    id: withUserId,
    fullName: 'Jane Doe',
    email: 'JaneDoe@test.com',
    profilePicture: '/images/test.jpg'
  };

  cy.intercept('POST', '/api/auth/login', {
    statusCode: 200,
    body: {
      email: user.email,
      name: user.fullName,
      token: 'fake-jwt-token',
      id: user.id,
      role: 'USER',
    },
  }).as('loginRequest');

  cy.intercept('GET', '/api/users/me', {
    statusCode: 200,
    body: user
  }).as('getMe');

  cy.intercept('GET', '/api/messages/conversations', {
    statusCode: 200,
    body: conversations
  }).as('getConversations');

  cy.intercept('GET', `/api/users/${withUserId}`, {
    statusCode: 200,
    body: otherUser
  }).as(`getUser-${withUserId}`);

  cy.intercept('GET', new RegExp(`/api/messages/conversation\\?.*itemId=${itemId}.*withUserId=${withUserId}.*`), {
    statusCode: 200,
    body: messages
  }).as('getMessages');

  cy.intercept('GET', /\/api\/users\/\d+/, {
    statusCode: 200,
    body: otherUser
  }).as('getAnyUser');

  items.forEach((item) => {
    cy.intercept('GET', `/api/items/${item.id}`, {
      statusCode: 200,
      body: item
    }).as(`getItem-${item.id}`);
  });
});

Cypress.Commands.add('mockReservationFlow', (user, item) => {
  const sellerId = item.sellerId;
  let conversationRequested = false;

  cy.intercept('GET', '**/api/users/me', {
    statusCode: 200,
    body: user
  }).as('getMe');

  cy.intercept('GET', `**/api/items/${item.id}`, {
    statusCode: 200,
    body: item
  }).as('getItem');

  cy.intercept('POST', `**/api/items/${item.id}/view`, { statusCode: 200, body: { success: true } }).as('logItemView');
  cy.intercept('POST', `**/api/items/${item.id}/views`, { statusCode: 200, body: { success: true } }).as('logItemViewAlt');

  cy.intercept('GET', `**/api/users/${sellerId}`, {
    statusCode: 200,
    body: {
      id: sellerId,
      fullName: 'Jane Doe',
      email: 'JaneDoe@test.com',
      profilePicture: '/default-picture.jpg'
    }
  }).as('getSeller');

  cy.intercept('GET', '**/api/messages/conversation**', req => {
    if (!conversationRequested) {
      conversationRequested = true;
      req.reply({ statusCode: 200, body: [] });
    } else {
      req.reply({
        statusCode: 200,
        body: [
          {
            messageId: 123,
            fromYou: true,
            senderId: user.id,
            text: "I would like to reserve this item",
            sentAt: new Date().toISOString(),
            reservationStatus: 'PENDING'
          }
        ]
      });
    }
  }).as('getMessages');

  cy.intercept('POST', '**/api/messages/send-reservation-request', {
    statusCode: 200,
    body: { success: true, messageId: 123 }
  }).as('sendReservation');

  cy.intercept('POST', '**/api/messages/reservation', {
    statusCode: 200,
    body: { success: true, messageId: 123 }
  }).as('sendReservationAlt');

  cy.intercept('POST', '**/api/messages/conversation/reservation', {
    statusCode: 200,
    body: { success: true, messageId: 123 }
  }).as('sendReservationConversation');

  cy.intercept('POST', '**/api/messages/send', {
    statusCode: 200,
    body: { success: true, messageId: 123 }
  }).as('sendMessage');
});

Cypress.Commands.add('mockProfileUpdate', (updatedUser) => {
  cy.intercept('PUT', `/api/users/${updatedUser.id}`, (req) => {
    expect(req.headers).to.have.property('Authorization', 'Bearer fake-jwt-token');
    req.reply({
      statusCode: 200,
      body: updatedUser,
    });
  }).as('updateProfile');
});

Cypress.Commands.add('mockCreateItem', (itemDetail) => {
  cy.intercept('POST', '**/api/items/create', {
    statusCode: 201,
    body: itemDetail
  }).as('createItem');
});

Cypress.Commands.add('mockGetItemDetails', (itemId, itemDetail, sellerId) => {
  cy.intercept('GET', `/api/items/${itemId}`, {
    statusCode: 200,
    body: {
      id: itemDetail.id,
      title: itemDetail.title,
      description: itemDetail.description,
      category: { id: itemDetail.categoryId, name: itemDetail.categoryName },
      price: itemDetail.price,
      status: itemDetail.status,
      location: { lat: itemDetail.latitude, lng: itemDetail.longitude },
      images: itemDetail.imageUrls,
      sellerId: sellerId,
      sellerName: itemDetail.seller.username,
      reservedById: null

    }
  }).as('getItemDetails');
});

Cypress.Commands.add('mockGetMessages', (itemId, sellerId) => {
  cy.intercept('GET', `/api/messages/conversation?itemId=${itemId}&withUserId=${sellerId}`, {
    statusCode: 200,
    body: []
  }).as('getMessages');
});

Cypress.Commands.add('mockGetSeller', (sellerId, itemDetail) => {
  cy.intercept('GET', `/api/users/${sellerId}`, {
    statusCode: 200,
    body: {
      id: sellerId,
      name: itemDetail.seller.username,
      email: 'seller@example.com',
      profilePicture: '/images/seller.jpg',
      role: 'USER'
    }
  }).as('getSeller');
});

Cypress.Commands.add('mockTrackView', (itemId) => {
  cy.intercept('POST', `/api/items/${itemId}/view`, {
    statusCode: 200,
    body: {}
  }).as('trackView');
});