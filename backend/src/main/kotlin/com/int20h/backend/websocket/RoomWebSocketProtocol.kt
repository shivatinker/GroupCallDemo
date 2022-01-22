package com.int20h.backend.websocket

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "t")
@JsonSubTypes(
    JsonSubTypes.Type(RoomControllerAction.Join::class, name = "join"),
    JsonSubTypes.Type(RoomControllerAction.Leave::class, name = "leave"),
)
abstract class RoomControllerAction(val username: String, val room: String) {
    class Join(username: String, room: String) : RoomControllerAction(username, room)
    class Leave(username: String, room: String) : RoomControllerAction(username, room)
}

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "t")
@JsonSubTypes(
    JsonSubTypes.Type(RoomControllerResponse.Users::class, name = "users"),
)
abstract class RoomControllerResponse {
    data class Users(val users: List<String>) : RoomControllerResponse()
}
