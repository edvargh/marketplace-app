describe('E2E - Update Profile', () => {
  let user;

  before(() => {
    cy.fixture('user.json').then((data) => {
      user = data;
    });
  });

  it('logs in and updates the profile information', () => {
    cy.mockApiRequests(user, [], []);
    cy.login('testuser@example.com', 'password123');
    cy.wait('@loginRequest');
    cy.wait('@getMe');

    cy.visit('/profile');
    cy.url().should('include', '/profile');
    cy.contains('Profile');

    cy.get('img.edit-icon').click(); 
    cy.get('input[type="file"]').attachFile('images/test-profile.jpg', { subjectType: 'input' });

    cy.get('#fullName').clear().type('Updated Name');
    cy.get('#email').clear().type('updated@example.com');
    cy.get('#phoneNumber').clear().type('12345678');
    cy.get('#password').clear().type('newsecurepass');
    cy.get('#confirmPassword').clear().type('newsecurepass');
    cy.get('select').select('English');

    // ✅ Use the custom command here:
    cy.mockProfileUpdate({
      ...user,
      fullName: 'Updated Name',
      email: 'updated@example.com',
      phoneNumber: '12345678',
      preferredLanguage: 'english',
      profilePicture: 'some-profile-url.jpg'
    });

    cy.get('form').submit();
    cy.wait('@updateProfile');
    cy.contains('Profile updated successfully');
  });
});
