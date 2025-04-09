describe('E2E - Admin User Login, Create and Edit Categories', () => {
  let adminUser, categories;

  before(() => {
    cy.fixture('adminUser.json').then((data) => { adminUser = data; });
    cy.fixture('categories.json').then((data) => { categories = data; });
  });

  it('logs in as admin, navigates to categories, creates and edits a category', () => {
    // Set up login mocks
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: adminUser
    }).as('loginRequest');

    cy.intercept('GET', '/api/users/me', {
      statusCode: 200,
      body: adminUser
    }).as('getMe');

    // Initial categories setup
    let currentCategories = [...categories];

    // Use a function to dynamically respond with the current categories
    cy.intercept('GET', '/api/categories', (req) => {
      req.reply({
        statusCode: 200,
        body: currentCategories
      });
    }).as('getCategories');

    // Create category endpoint
    cy.intercept('POST', '/api/categories', (req) => {
      const newCategory = { id: 11, name: 'New Category' };
      // Update our local state to match what the backend would do
      currentCategories = [...currentCategories, newCategory];

      req.reply({
        statusCode: 201,
        body: newCategory
      });
    }).as('createCategory');

    // Update category endpoint
    cy.intercept('PUT', '/api/categories/*', (req) => {
      const updatedCategory = { id: 2, name: 'Updated Category' };
      // Update our local state
      currentCategories = currentCategories.map(c =>
          c.id === 2 ? updatedCategory : c
      );

      req.reply({
        statusCode: 200,
        body: updatedCategory
      });
    }).as('updateCategory');

    // Login as admin
    cy.visit('/login');
    cy.get('#email').type(adminUser.email);
    cy.get('#password').type('adminpassword123');
    cy.get('button[type="submit"]').click();
    cy.wait('@loginRequest');
    cy.wait('@getMe');
    cy.url().should('include', '/home');

    // Open mobile menu and navigate to categories
    cy.contains('button', '☰').click();
    cy.contains('.mobile-dropdown a', 'Categories').should('exist');
    cy.contains('.mobile-dropdown a', 'Categories').click();

    // Verify category page
    cy.url().should('include', '/categories');
    cy.wait('@getCategories');
    cy.get('.category-name').should('have.length', categories.length);

    // Create new category
    cy.contains('button', 'Create new category').click();
    cy.get('input[placeholder="Category Name"]').type('New Category');
    cy.get('button[type="submit"]').click();
    cy.wait('@createCategory');
    cy.wait('@getCategories');

    // Verify the new category appears
    cy.get('.category-name').should('have.length', currentCategories.length + 1);
    cy.contains('.category-name', 'New Category').should('exist');

    // Edit category
    cy.contains('button', 'Edit').first().click();
    cy.get('input[placeholder="Category Name"]').clear().type('Updated Category');
    cy.get('button[type="submit"]').click();
    cy.wait('@updateCategory');
    cy.wait('@getCategories');

    // Verify the category was updated
    cy.contains('.category-name', 'Updated Category').should('exist');
  });
});