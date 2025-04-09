// npm install --save-dev cypress-file-upload

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

