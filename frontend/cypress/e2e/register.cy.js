describe('E2E - Register Success', () => {
  it('fills out the form and registers successfully', () => {
    // Mock successful registration
    cy.mockRegister({ id: 1, fullName: 'New User' });

    cy.visit('/register');
    cy.url().should('include', '/register');
    cy.contains('Register new account');

    cy.get('#fullName').type('New User');
    cy.get('#email').type('newuser@example.com');
    cy.get('#phoneNumber').type('12345678');
    cy.get('#password').type('newstrongpass');
    cy.get('#confirmPassword').type('newstrongpass');

    cy.get('button[type="submit"]').click();
    cy.wait('@registerRequest');

    cy.contains('Registration successful! Redirecting to login...');
    // check redirect
    cy.url({ timeout: 3000 }).should('include', '/login');
  });

  it('shows validation errors when fields are invalid', () => {
    cy.visit('/register');

    // Leave fields empty and try to submit
    cy.get('button[type="submit"]').should('be.disabled');

    // Invalid register inputs
    cy.get('#fullName').type('X'.repeat(31)); 
    cy.get('#email').type('bademail');
    cy.get('#phoneNumber').type('123'); 
    cy.get('#password').type('123'); 
    cy.get('#confirmPassword').type('456'); 

    cy.get('button[type="submit"]').should('be.disabled');

    cy.contains('Full name cannot exceed 30 characters');
    cy.contains('Please enter a valid email address');
    cy.contains('Phone number must be 8 digits');
    cy.contains('Password must be at least 8 characters');
    cy.contains('Passwords do not match');
  });
});
