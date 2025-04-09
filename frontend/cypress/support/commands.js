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


Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height();
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.lessThan(bottom);
  expect(rect.bottom).to.be.greaterThan(0);
  
  return subject;
});