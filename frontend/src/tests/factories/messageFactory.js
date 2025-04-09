export const messageFactory = {
  createUser(overrides = {}) {
    return {
      id: '123-user-id',
      token: 'valid-auth-token',
      ...overrides
    };
  },
  
  createMessage(overrides = {}) {
    return {
      id: 'msg-123',
      itemId: 'item-456',
      senderId: '123-user-id',
      receiverId: '456-receiver-id',
      messageText: 'Hello, is this item still available?',
      createdAt: new Date().toISOString(),
      ...overrides
    };
  },
  
  createReservationMessage(overrides = {}) {
    return {
      ...this.createMessage(),
      isReservationRequest: true,
      reservationStatus: 'PENDING',
      ...overrides
    };
  },
  
  createConversation(overrides = {}) {
    return {
      itemId: 'item-456',
      withUserId: '456-receiver-id',
      messages: [
        this.createMessage({ id: 'msg-123' }),
        this.createMessage({ id: 'msg-124', senderId: '456-receiver-id', receiverId: '123-user-id' })
      ],
      ...overrides
    };
  },
  
  createConversations(count = 3) {
    return Array.from({ length: count }, (_, i) => ({
      itemId: `item-${456 + i}`,
      withUserId: `456-receiver-id-${i}`,
      lastMessage: this.createMessage({
        id: `msg-${123 + i}`,
        itemId: `item-${456 + i}`,
        receiverId: `456-receiver-id-${i}`
      }),
      unreadCount: i
    }));
  }
};