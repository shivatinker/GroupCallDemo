package com.int20h.backend

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.int20h.backend.websocket.RoomControllerResponse
import mu.KotlinLogging
import org.kurento.client.IceCandidate
import org.kurento.client.KurentoClient
import org.kurento.client.MediaPipeline
import org.kurento.client.WebRtcEndpoint
import org.springframework.stereotype.Service
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import java.io.Closeable
import java.util.*
import javax.annotation.PostConstruct

class RoomUserSession(
        val username: String,
        private val roomPipeline: MediaPipeline,
        private val webSocketSession: WebSocketSession
) : Closeable {
    private val log = KotlinLogging.logger {}
    private val outgoingMediaEndpoint: WebRtcEndpoint = WebRtcEndpoint.Builder(roomPipeline).build()
    private val incomingMediaEndpoints: MutableMap<String, WebRtcEndpoint> = HashMap()

    init {
        outgoingMediaEndpoint.addIceCandidateFoundListener { event ->
            sendByWebSocket(RoomControllerResponse.IceCandidate(this.username, event.candidate))
        }
    }

    fun handleUserDidJoin(userSession: RoomUserSession) {
        val incomingEndpoint = WebRtcEndpoint.Builder(roomPipeline).build()
        userSession.outgoingMediaEndpoint.connect(incomingEndpoint)
        incomingMediaEndpoints[userSession.username] = incomingEndpoint
    }

    fun notifyAboutJoining(username: String) {
        sendByWebSocket(RoomControllerResponse.UserJoined(username))
    }

    fun notifyAboutLeaving(username: String) {
        sendByWebSocket(RoomControllerResponse.UserLeft(username))
    }

    fun connect(sdpOffer: String) {
        val sdpAnswer = outgoingMediaEndpoint.processOffer(sdpOffer)

        sendByWebSocket(RoomControllerResponse.JoinAck(sdpAnswer))

        outgoingMediaEndpoint.gatherCandidates()
    }

    fun handleUserDidLeave(username: String) {
        incomingMediaEndpoints[username]?.release()
        incomingMediaEndpoints.remove(username)
    }

    fun requestMedia(username: String, sdpOffer: String) {
        val endpoint = incomingMediaEndpoints[username]
                       ?: throw IllegalArgumentException("No such incoming endpoint: $username")
        val sdpAnswer = endpoint.processOffer(sdpOffer)

        sendByWebSocket(RoomControllerResponse.MediaResponse(username, sdpAnswer))

        log.info("${this.username} $username gather")
        endpoint.addIceCandidateFoundListener { event ->
            sendByWebSocket(RoomControllerResponse.IceCandidate(username, event.candidate))
        }
        endpoint.gatherCandidates()
    }

    fun sendByWebSocket(response: RoomControllerResponse) {
        synchronized(webSocketSession) {
            val mapper = jacksonObjectMapper()
            webSocketSession.sendMessage(TextMessage(mapper.writeValueAsString(response)))
        }
    }

    fun addIceCandidate(username: String, iceCandidate: IceCandidate) {
        if (username == this.username) {
            outgoingMediaEndpoint.addIceCandidate(iceCandidate)
        }
        else {
            incomingMediaEndpoints[username]?.addIceCandidate(iceCandidate)
        }
    }

    override fun close() {
        outgoingMediaEndpoint.release()
        for (endpoint in incomingMediaEndpoints.values) {
            endpoint.release()
        }
    }
}

class Room(val roomName: String, private val pipeline: MediaPipeline) : Closeable {
    private val log = KotlinLogging.logger {}
    private val userSessions: MutableMap<String, RoomUserSession> = HashMap()

    val usernames: List<String>
        get() {
            return userSessions.values.map { session -> session.username }
        }

    fun addUser(username: String, webSocketSession: WebSocketSession, sdpOffer: String) {
        val userSession = RoomUserSession(username, pipeline, webSocketSession)
        userSession.connect(sdpOffer)

        for (session in userSessions.values) {
            session.handleUserDidJoin(userSession)
            userSession.handleUserDidJoin(session)

            session.notifyAboutJoining(userSession.username)
        }
        userSessions[username] = userSession

        userSession.sendByWebSocket(RoomControllerResponse.RoomInfo(usernames))

        log.info("User $username joined $roomName")
    }

    fun removeUser(username: String) {
        val userSession = userSessions[username] ?: throw IllegalArgumentException("No such user: $username")

        userSessions.remove(username)

        for (session in userSessions.values) {
            session.handleUserDidLeave(username)
            session.notifyAboutLeaving(username)
        }

        userSession.close()

        log.info("User $username left $roomName")
    }

    fun addIceCandidate(username: String, iceCandidate: IceCandidate) {
        for (userSession in userSessions.values) {
            userSession.addIceCandidate(username, iceCandidate)
        }
    }

    fun requestMedia(fromUsername: String, username: String, sdpOffer: String) {
        val userSession = userSessions[fromUsername] ?: throw IllegalArgumentException("No such user: $fromUsername")
        userSession.requestMedia(username, sdpOffer)
    }

    override fun close() {
        for (userSession in userSessions.values) {
            userSession.close()
        }

        pipeline.release()
    }
}

@Service
class RoomManager(val kurentoClient: KurentoClient) {
    private val log = KotlinLogging.logger {}
    private val allRooms: MutableMap<String, Room> = HashMap()

    @PostConstruct
    private fun postConstruct() {
        createRoom("test")
    }

    fun createRoom(nameOrNull: String?): String {
        val name = nameOrNull ?: UUID.randomUUID().toString().substring(0, 8)
        allRooms[name] = Room(name, kurentoClient.createMediaPipeline())
        log.info("Room \"$name\" created")
        return name
    }

    fun getRoom(roomName: String): Room {
        return allRooms[roomName] ?: throw IllegalArgumentException("No such room: $roomName")
    }

    fun isRoomExists(roomName: String): Boolean {
        return allRooms.containsKey(roomName)
    }
}
