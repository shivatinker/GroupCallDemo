package com.int20h.backend.websocket

import com.int20h.backend.RoomManager
import mu.KotlinLogging
import org.springframework.context.event.EventListener
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Controller
import javax.annotation.PostConstruct

@Controller
class RoomController(val template: SimpMessagingTemplate, val roomManager: RoomManager) {
    private val log = KotlinLogging.logger {}

    @PostConstruct
    private fun postConstruct() {
        val roomName = roomManager.createRoom()
        log.info("Test room: $roomName")
    }

    @MessageMapping("/room")
    private fun action(action: RoomControllerAction) {
        when (action) {
            is RoomControllerAction.Join -> {
                roomManager.joinRoom(action.username, action.room)
            }
            is RoomControllerAction.Leave -> {
                roomManager.leaveRoom(action.username, action.room)
            }
        }
    }

    private fun updateUsersForRoom(roomName: String) {
        val room = roomManager.getRoom(roomName)

        template.convertAndSend(
            "/room/${roomName}",
            RoomControllerResponse.Users(room.users.toList())
        )
    }

    @EventListener
    fun onUserDidJoinRoom(event: RoomManager.UserDidJoinRoomEvent) {
        log.info("User ${event.username} joined room ${event.roomName}!")
        updateUsersForRoom(event.roomName)
    }

    @EventListener
    fun onUserDidLeaveRoom(event: RoomManager.UserDidLeaveRoomEvent) {
        log.info("User ${event.username} left room ${event.roomName}!")
        updateUsersForRoom(event.roomName)
    }
}
