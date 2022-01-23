export type RoomResponse = {
    t: "ack"
    sdpAnswer: string
} | {
    t: "ice"
    iceUsername: string
    iceCandidate: RTCIceCandidate
} | {
    t: "info"
    users: string[]
} | {
    t: "media"
    mediaUsername: string
    sdpAnswer: string
} | {
    t: "userJoined"
    username: string
} | {
    t: "userLeft"
    username: string
}
