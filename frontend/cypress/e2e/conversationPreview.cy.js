describe('E2E - Messages View with Mocked Conversations', () => {
  let user, conversations, messages, items;

  before(() => {
    cy.fixture('user.json').then((data) => { user = data });
    cy.fixture('conversations.json').then((data) => { conversations = data });
    cy.fixture('messages.json').then((data) => { messages = data });
    cy.fixture('items.json').then((data) => { items = data });
  });

  it('shows conversation preview cards from mocked data', () => {
    cy.mockApiRequests(user, conversations, messages, items);

    cy.login(user.email, 'password123');
    cy.wait('@getMe');

    cy.visit('/messages/conversations');
    cy.wait('@getConversations');
    cy.wait(`@getItem-${items[0].id}`);

    cy.contains('Desktop pc').should('exist');
    cy.contains('400 kr').should('exist');
    cy.get('img[src*="cloudinary"]').should('exist');
    cy.contains('.status-banner', 'RESERVED').should('exist');

    cy.contains('Desktop pc').click();
    cy.url().should('include', `/messages/conversation?itemId=${items[0].id}&withUserId=${conversations[0].withUserId}`);

  });
});
