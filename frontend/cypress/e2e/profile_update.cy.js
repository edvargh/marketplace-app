describe('Profile View', () => {
  const fakeUser = {
    id: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '12345678',
    profilePicture: '/default-picture.jpg',
    preferredLanguage: 'english'
  };

  beforeEach(() => {
    // Visit the base URL first so we can access localStorage.
    cy.visit('/');
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify(fakeUser));
    });

    // Stub the checkAuth call that gets user profile on mount.
    cy.intercept('GET', '**/api/users/me', {
      statusCode: 200,
      body: fakeUser
    }).as('checkAuth');

    // Stub the GET request for fetching a user by ID.
    cy.intercept('GET', '**/api/users/1', {
      statusCode: 200,
      body: fakeUser
    }).as('getUserById');

    // Stub the PUT request for updating the user.
    cy.intercept('PUT', '**/api/users/1', (req) => {
      const sendReply = (userData) => {
        req.reply({
          statusCode: 200,
          body: {
            id: fakeUser.id,
            fullName: userData.fullName || fakeUser.fullName,
            email: userData.email || fakeUser.email,
            phoneNumber: userData.phoneNumber || fakeUser.phoneNumber,
            profilePicture: '/updated-picture.jpg',
            preferredLanguage: userData.preferredLanguage || fakeUser.preferredLanguage,
          }
        });
      };

      // Check if req.body.get exists (indicating a FormData-like object)
      if (req.body && typeof req.body.get === 'function') {
        req.body.get('dto')
          .text()
          .then(text => {
            const userData = JSON.parse(text);
            sendReply(userData);
          });
      } else if (req.body && req.body.dto) {
        // Otherwise, assume a plain JSON object
        let userData;
        if (typeof req.body.dto === 'string') {
          userData = JSON.parse(req.body.dto);
        } else {
          userData = req.body.dto;
        }
        sendReply(userData);
      } else {
        // Fallback if there's no dto in the payload.
        sendReply({});
      }
    }).as('updateUser');

    // Navigate to the profile view page. Adjust the URL path if needed.
    cy.visit('/profile');
    cy.wait('@checkAuth');
  });

  it('displays the current user profile information', () => {
    // Verify profile information is rendered.
    cy.contains('John Doe');
    cy.get('.profile-picture')
      .should('have.attr', 'src')
      .and('include', '/default-picture.jpg');
  });

  it('updates the profile successfully', () => {
    // Fill in the form with new user details.
    cy.get('#fullName').clear().type('Jane Doe');
    cy.get('#email').clear().type('jane@example.com');
    cy.get('#phoneNumber').clear().type('87654321');
    cy.get('#password').clear().type('newpassword');
    cy.get('#confirmPassword').clear().type('newpassword');

    // --- Language Dropdown Interaction ---
    // Click the dropdown arrow to open the options.
    cy.get('.dropdown-arrow').click();
    // Then click the language option "Norwegian".
    cy.contains('Norwegian').click();

    cy.get('.profile-picture-wrapper .profile-picture-container input[type="file"]')
      .then(($input) => {
        const blob = new Blob(['fake image content'], { type: 'image/png' });
        const file = new File([blob], 'sample.png', { type: 'image/png' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        $input[0].files = dataTransfer.files;
        cy.wrap($input).trigger('change', { force: true });
      });

    // Submit the form.
    cy.get('form').submit();

    // Wait for the update API call and verify it returns a 200 OK status.
    cy.wait('@updateUser').its('response.statusCode').should('eq', 200);
  });

  it('shows validation errors when required fields are invalid', () => {
    // Clear required field to test validation (full name)
    cy.get('#fullName').clear();
    cy.get('form').submit();
    // Check for a validation message indicating the error.
    cy.contains(/full name is required/i);

    // Also test with an invalid email.
    cy.get('#email').clear().type('invalid-email');
    cy.get('form').submit();
    cy.contains(/please enter a valid email address/i);
  });
});
