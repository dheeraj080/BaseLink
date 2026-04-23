package com.em.emily.contact.controller;

import com.em.emily.auth.UserPrincipal;
import com.em.emily.contact.entity.ContactGroup;
import com.em.emily.contact.service.ContactGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class ContactGroupController {

    private final ContactGroupService groupService;

    @PostMapping
    public ResponseEntity<ContactGroup> create(@RequestBody ContactGroup group,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        group.setUserId(principal.id());
        return ResponseEntity.ok(groupService.createGroup(group));
    }

    @GetMapping
    public ResponseEntity<List<ContactGroup>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(groupService.getUserGroups(principal.id()));
    }

    @PostMapping("/{groupId}/add-selected")
    public ResponseEntity<String> addSelected(@PathVariable UUID groupId,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        groupService.addSelectedToGroup(groupId, principal.id());
        return ResponseEntity.ok("Selected contacts added to group successfully.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        groupService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }
}
