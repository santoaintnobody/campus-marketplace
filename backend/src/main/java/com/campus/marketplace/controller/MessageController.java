package com.campus.marketplace.controller;

import com.campus.marketplace.dto.*;
import com.campus.marketplace.entity.User;
import com.campus.marketplace.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/messages", "/api/conversations"})
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getConversationsAlias(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(messageService.getConversations(user.getId()));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(messageService.getConversations(user.getId()));
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<MessageResponse>> getConversation(
            @RequestParam Long otherUserId,
            @RequestParam Long listingId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(messageService.getConversation(user.getId(), otherUserId, listingId));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(@Valid @RequestBody MessageRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.sendMessage(request, user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<java.util.Map<String, Long>> getUnreadCount(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(java.util.Map.of("count", messageService.getUnreadCount(user.getId())));
    }
}
