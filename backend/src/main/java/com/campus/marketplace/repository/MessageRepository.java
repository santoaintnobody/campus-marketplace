package com.campus.marketplace.repository;

import com.campus.marketplace.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "((m.sender.id = :userId AND m.receiver.id = :otherUserId) OR " +
           "(m.sender.id = :otherUserId AND m.receiver.id = :userId)) " +
           "AND m.listing.id = :listingId ORDER BY m.timestamp ASC")
    List<Message> findConversation(
            @Param("userId") Long userId,
            @Param("otherUserId") Long otherUserId,
            @Param("listingId") Long listingId);

    @Query("SELECT DISTINCT CASE WHEN m.sender.id = :userId THEN m.receiver.id ELSE m.sender.id END, " +
           "m.listing.id FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId")
    List<Object[]> findConversationPartners(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE " +
           "((m.sender.id = :userId AND m.receiver.id = :otherUserId) OR " +
           "(m.sender.id = :otherUserId AND m.receiver.id = :userId)) " +
           "AND m.listing.id = :listingId ORDER BY m.timestamp DESC LIMIT 1")
    Message findLastMessage(
            @Param("userId") Long userId,
            @Param("otherUserId") Long otherUserId,
            @Param("listingId") Long listingId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    long countUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.sender.id = :senderId " +
           "AND m.listing.id = :listingId AND m.isRead = false")
    long countUnreadInConversation(
            @Param("userId") Long userId,
            @Param("senderId") Long senderId,
            @Param("listingId") Long listingId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.receiver.id = :userId AND m.sender.id = :senderId " +
           "AND m.listing.id = :listingId AND m.isRead = false")
    void markConversationAsRead(
            @Param("userId") Long userId,
            @Param("senderId") Long senderId,
            @Param("listingId") Long listingId);
}
