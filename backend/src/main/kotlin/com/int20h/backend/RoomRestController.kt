package com.int20h.backend

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class RoomRestController(val roomManager: RoomManager) {
    @GetMapping("get_room")
    fun getRoom(@RequestParam name: String): Any {
        if (!roomManager.isRoomExists(name)) {
            throw IllegalArgumentException("No such room: $name")
        }

        val room = roomManager.getRoom(name)
        return object {
            val name = room.roomName
            val usernames = room.usernames
        }
    }

    @PostMapping("create_room")
    fun createRoom(): Any {
        val roomName = roomManager.createRoom(null)
        return object {
            val roomName = roomName
        }
    }
}
