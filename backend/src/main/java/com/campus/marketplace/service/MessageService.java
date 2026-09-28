package com.campus.marketplace.service;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.*;
import com.campus.marketplace.entity.enums.NotificationType;
import com.campus.marketplace.exception.*;
import com.campus.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final NotificationService notificationService;

    @Transactional
    public MessageResponse sendMessage(MessageRequest request, User sender) {
        if (sender.getId().equals(request.getReceiverId())) {
            throw new BadRequestException("You cannot send a message to yourself");
        }

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .listing(listing)
                .content(request.getContent())
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        notificationService.createNotification(receiver, NotificationType.MESSAGE,
                "New Message from " + sender.getFullName(),
                sender.getFullName() + " sent you a message about '" + listing.getTitle() + "'",
                listing.getId());

        return mapToResponse(message);
    }

    public List<ConversationResponse> getConversations(Long userId) {
        List<Object[]> partners = messageRepository.findConversationPartners(userId);
        Map<String, ConversationResponse> conversations = new LinkedHashMap<>();

        for (Object[] pair : partners) {
            Long otherUserId = ((Number) pair[0]).longValue();
            Long listingId = ((Number) pair[1]).longValue();
            String key = otherUserId + "-" + listingId;

            if (!conversations.containsKey(key)) {
                User otherUser = userRepository.findById(otherUserId).orElse(null);
                Listing listing = listingRepository.findById(listingId).orElse(null);

                if (otherUser != null && listing != null) {
                    Message lastMsg = messageRepository.findLastMessage(userId, otherUserId, listingId);
                    long unread = messageRepository.countUnreadInConversation(userId, otherUserId, listingId);

                    String listingImage = listing.getImages().isEmpty() ? null :
                            "/uploads/" + listing.getImages().get(0).getImageUrl();

                    conversations.put(key, ConversationResponse.builder()
                            .otherUserId(otherUserId)
                            .otherUserName(otherUser.getFullName())
                            .otherUserProfileImage(otherUser.getProfileImage())
                            .listingId(listingId)
                            .listingTitle(listing.getTitle())
                            .listingImage(listingImage)
                            .lastMessage(lastMsg != null ? lastMsg.getContent() : "")
                            .lastMessageTime(lastMsg != null ? lastMsg.getTimestamp() : null)
                            .unreadCount(unread)
                            .build());
                }
            }
        }

        // Sort by last message time descending
        return conversations.values().stream()
                .sorted((a, b) -> {
                    if (a.getLastMessageTime() == null) return 1;
                    if (b.getLastMessageTime() == null) return -1;
                    return b.getLastMessageTime().compareTo(a.getLastMessageTime());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public List<MessageResponse> getConversation(Long userId, Long otherUserId, Long listingId) {
        // Mark messages as read
        messageRepository.markConversationAsRead(userId, otherUserId, listingId);

        return messageRepository.findConversation(userId, otherUserId, listingId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return messageRepository.countUnreadByUserId(userId);
    }

    private MessageResponse mapToResponse(Message m) {
        return MessageResponse.builder()
                .id(m.getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getFullName())
                .senderProfileImage(m.getSender().getProfileImage())
                .receiverId(m.getReceiver().getId())
                .receiverName(m.getReceiver().getFullName())
                .listingId(m.getListing().getId())
                .listingTitle(m.getListing().getTitle())
                .content(m.getContent())
                .isRead(m.isRead())
                .timestamp(m.getTimestamp())
                .build();
    }
}
