// npm install --save-dev cypress-file-upload

import 'cypress-file-upload';

Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/auth/login`,
    body: { email, password }
  }).then((response) => {
    expect(response.status).to.eq(200);
    localStorage.setItem('user', JSON.stringify(response.body));
    localStorage.setItem('token', response.body.token);
  });
});

Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height();
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.lessThan(bottom);
  expect(rect.bottom).to.be.greaterThan(0);
  
  return subject;
});