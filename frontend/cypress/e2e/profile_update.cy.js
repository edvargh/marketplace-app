describe('E2E - Update Profile', () => {
  let user;

  before(() => {
    cy.fixture('user.json').then((data) => {
      user = data;
    });
  });

  it('logs in and updates the profile information', () => {
    // Mock the initial API responses for login and loading user data
    cy.mockApiRequests(user, [], []);
    cy.login('testuser@example.com', 'password123');
    cy.wait('@loginRequest');
    cy.wait('@getMe');

    // Go to the profile page
    cy.visit('/profile');
    cy.url().should('include', '/profile');
    cy.contains('Profile');

    // Simulate clicking the edit icon to enable file input
    cy.get('img.edit-icon').click();

    // Upload a profile image from fixtures/images/test.jpg
    cy.get('input[type="file"]').attachFile('images/test.jpg', { subjectType: 'input' });

    // Fill out the rest of the profile fields
    cy.get('#fullName').clear().type('Updated Name');
    cy.get('#email').clear().type('updated@example.com');
    cy.get('#phoneNumber').clear().type('12345678');
    cy.get('#password').clear().type('newsecurepass');
    cy.get('#confirmPassword').clear().type('newsecurepass');

    // Select a new language
    cy.get('.SelectBox').click();
    cy.contains('.custom-dropdown-menu li', 'English').click();

    // Mock the profile update API call before form submission
    cy.mockProfileUpdate({
      ...user,
      fullName: 'Updated Name',
      email: 'updated@example.com',
      phoneNumber: '12345678',
      preferredLanguage: 'english',
      profilePicture: 'some-profile-url.jpg'
    });

    // Submit the form and wait for the mocked API response
    cy.get('form').submit();
    cy.wait('@updateProfile');

    // Verify the success message shows up
    cy.contains('Profile updated successfully');
  });


  it('displays validation errors when updating the profile with invalid data', () => {
    // Mock initial API responses
    cy.mockApiRequests(user, [], []);
    cy.login('testuser@example.com', 'password123');
    cy.wait('@loginRequest');
    cy.wait('@getMe');

    // Navigate to the profile page
    cy.visit('/profile');
    cy.url().should('include', '/profile');
    cy.contains('Profile');

    // Click the edit icon to enable file input
    cy.get('img.edit-icon').click();

    // Attempt to upload an invalid profile image 
    cy.get('input[type="file"]').attachFile('images/invalid-file.txt', { subjectType: 'input' });

    // Leave required fields empty or enter invalid data
    cy.get('#fullName').clear();
    cy.get('#email').clear().type('invalid-email');
    cy.get('#phoneNumber').clear().type('invalid-phone');
    cy.get('#password').clear().type('short');
    cy.get('#confirmPassword').clear().type('mismatch');

    // Submit the form
    cy.get('form').submit();

    // Check for a general error message
    cy.contains('Please fill in all required fields correctly.');
  });
});
