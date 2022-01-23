package com.int20h.backend.websocket

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.int20h.backend.RoomManager
import mu.KotlinLogging
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.ConcurrentHashMap


@Component
@Suppress("MoveVariableDeclarationIntoWhen")
class RoomWebSocketHandler(val roomManager: RoomManager) : TextWebSocketHandler() {

    data class SessionInfo(val roomName: String, val username: String)

    private val log = KotlinLogging.logger {}
    private val sessions: MutableMap<String, SessionInfo> = ConcurrentHashMap()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        log.info("Established")
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        val sessionInfo = sessions[session.id]

        if (sessionInfo != null) {
            roomManager.getRoom(sessionInfo.roomName).removeUser(sessionInfo.username)
        }

        log.info("Closed")
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        val mapper = jacksonObjectMapper()
        val action: RoomControllerAction = mapper.readValue(message.payload)
        val room = roomManager.getRoom(action.room)
        when (action) {
            is RoomControllerAction.Join -> {
//                log.info("Join room ${message.payload}")
                room.addUser(action.username, session, action.sdpOffer)
                sessions[session.id] = SessionInfo(room.roomName, action.username)
            }
            is RoomControllerAction.IceCandidate -> {
//                log.info("Ice candidate ${message.payload}")
                room.addIceCandidate(action.iceUsername, action.iceCandidate)
            }
            is RoomControllerAction.MediaRequest -> {
                log.info("Media request ${message.payload}")
                room.requestMedia(action.username, action.mediaUsername, action.sdpOffer)
            }
            is RoomControllerAction.Leave -> {
//                log.info("Leave room ${message.payload}")
                room.removeUser(action.username)
                sessions.remove(session.id)
            }
            else -> log.warn("Unrecognized message: ${message.payload}")
        }
    }
}
