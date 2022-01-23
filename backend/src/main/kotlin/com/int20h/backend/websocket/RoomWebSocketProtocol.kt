package com.int20h.backend.websocket

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "t")
@JsonSubTypes(
        JsonSubTypes.Type(RoomControllerAction.Join::class, name = "join"),
        JsonSubTypes.Type(RoomControllerAction.IceCandidate::class, name = "ice"),
        JsonSubTypes.Type(RoomControllerAction.MediaRequest::class, name = "media"),
        JsonSubTypes.Type(RoomControllerAction.Leave::class, name = "leave"),
)
abstract class RoomControllerAction(val username: String, val room: String) {
    class Join(username: String, room: String, val sdpOffer: String) : RoomControllerAction(username, room)
    class IceCandidate(username: String,
                       room: String,
                       val iceUsername: String,
                       val iceCandidate: org.kurento.client.IceCandidate) : RoomControllerAction(username, room)

    class MediaRequest(username: String,
                       room: String,
                       val mediaUsername: String,
                       val sdpOffer: String) : RoomControllerAction(username, room)

    class Leave(username: String, room: String) : RoomControllerAction(username, room)
}

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "t")
@JsonSubTypes(
        JsonSubTypes.Type(RoomControllerResponse.JoinAck::class, name = "ack"),
        JsonSubTypes.Type(RoomControllerResponse.IceCandidate::class, name = "ice"),
        JsonSubTypes.Type(RoomControllerResponse.MediaResponse::class, name = "media"),
        JsonSubTypes.Type(RoomControllerResponse.RoomInfo::class, name = "info"),
        JsonSubTypes.Type(RoomControllerResponse.UserJoined::class, name = "userJoined"),
        JsonSubTypes.Type(RoomControllerResponse.UserLeft::class, name = "userLeft"),
)
abstract class RoomControllerResponse {
    data class JoinAck(val sdpAnswer: String) : RoomControllerResponse()
    data class IceCandidate(val iceUsername: String,
                            val iceCandidate: org.kurento.client.IceCandidate) : RoomControllerResponse()

    data class MediaResponse(val mediaUsername: String, val sdpAnswer: String) : RoomControllerResponse()
    data class RoomInfo(val users: List<String>) : RoomControllerResponse()
    data class UserJoined(val username: String) : RoomControllerResponse()
    data class UserLeft(val username: String) : RoomControllerResponse()
}
