describe('E2E - Messages View with Mocked Conversations', () => {
  let user, conversations, messages, items;
  
  before(() => {
    cy.fixture('user.json').then((data) => { user = data[0] }); 
    cy.fixture('conversations.json').then((data) => { conversations = data });
    cy.fixture('messages.json').then((data) => { messages = data });
    cy.fixture('items.json').then((data) => { items = data });
  });
  
  it('shows conversation preview cards from mocked data', () => {
    cy.mockApiRequestsConversation(user, conversations, messages, items);
    
    cy.login(user.email, 'password123');
    cy.wait('@getMe');
    
    cy.visit('/messages/conversations');
    cy.wait(800)
    cy.wait('@getConversations');
    cy.wait(`@getItem-${items[0].id}`);
    
    cy.contains('Desktop pc').should('exist');
    cy.contains('400 kr').should('exist');
    cy.get('img[src*="cloudinary"]').should('exist', { timeout: 5000 });
    
    cy.log('About to click conversation...');
    
    cy.contains('Desktop pc').click();
    
    cy.wait('@getMessages', { timeout: 10000 });
    
    cy.get('.message-bubble', { timeout: 5000 }).should('have.length.at.least', 1);
    cy.contains('Is this still available?').should('exist');
  });
});