describe('E2E - Authentication', () => {
  let user;
  
  before(() => {
    // Load mock data from fixtures
    cy.fixture('user.json').then((data) => { user = data; });
  });

  it('should be able to login using the UI', () => {
    // Visit the welcome page
    cy.visit('/');
    
    // Check if we're on the welcome page and navigate to login
    cy.get('h1').contains('Welcome to Marketplace!').should('be.visible');
    cy.get('.login-btn').click();

    // Now on login page - authenticate
    cy.url().should('include', '/login');
    cy.get('#email').type('Robert@hotmail.com');
    cy.get('#password').type('12345678');
    cy.get('button[type="submit"]').click();

    // Should be redirected to home
    cy.url().should('not.include', '/login');
  });

  it('should handle login errors', () => {
    // Set up API intercept for failed login
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { 
        message: 'Invalid credentials' 
      }
    }).as('failedLogin');
    
    // Visit login page
    cy.visit('/login');
    
    // Attempt login with bad credentials
    cy.get('#email').type('wrong@example.com');
    cy.get('#password').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Verify error is shown
    cy.wait('@failedLogin');
    cy.contains('Invalid credentials').should('be.visible');
    
    // Should still be on login page
    cy.url().should('include', '/login');
  });
});