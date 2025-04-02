package com.marketplace.backend.repository;

import com.marketplace.backend.model.Message;
import com.marketplace.backend.model.User;
import com.marketplace.backend.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repository for handling message related requests.
 */
public interface MessageRepository extends JpaRepository<Message, Long> {

  // Get all messages in a conversation between two users about an item
  List<Message> findByItemAndSenderAndReceiverOrItemAndSenderAndReceiverOrderBySentAt(
      Item item1, User sender1, User receiver1,
      Item item2, User sender2, User receiver2
  );

  // Get all messages involving a specific user
  List<Message> findBySenderOrReceiver(User sender, User receiver);
}
