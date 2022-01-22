package com.int20h.backend

import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.util.*

@Service
class RoomManager(val eventPublisher: ApplicationEventPublisher) {
    data class Room(val name: String) {
        val users: MutableSet<String> = HashSet()
    }

    data class UserDidJoinRoomEvent(val roomName: String, val username: String)
    data class UserDidLeaveRoomEvent(val roomName: String, val username: String)

    private val allRooms: MutableMap<String, Room> = HashMap()

    fun createRoom(): String {
        val name = UUID.randomUUID().toString().substring(0, 8)
        allRooms[name] = Room(name)
        return name
    }

    fun getRoom(roomName: String): Room {
        return allRooms[roomName] ?: throw IllegalArgumentException("No such room: $roomName")
    }

    fun joinRoom(username: String, roomName: String) {
        val room = getRoom(roomName)

        if (!room.users.add(username)) {
            throw IllegalStateException("User $username already in room $roomName")
        }

        eventPublisher.publishEvent(UserDidJoinRoomEvent(roomName, username))
    }

    fun leaveRoom(username: String, roomName: String) {
        val room = getRoom(roomName)

        if (!room.users.remove(username)) {
            throw IllegalStateException("User $username is not in the room $roomName")
        }

        eventPublisher.publishEvent(UserDidLeaveRoomEvent(roomName, username))
    }
}
