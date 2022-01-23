import {RoomResponse} from "./Api"
import {action, makeObservable, observable, runInAction} from "mobx"

export const enum RoomClientState {
    connected = "connected",
    joining = "joining",
    joined = "joined",
    disconnected = "disconnected",
}

interface RoomClientDelegate {
    onLocalMediaStreamReady: (stream: MediaStream) => void
    onLocalMediaStreamRemoved: () => void
    onRemoteMediaStreamReady: (username: string, stream: MediaStream) => void
    onRemoteMediaStreamRemoved: (username: string) => void
}

export class RoomClient {
    @observable users: Set<string> = new Set<string>()
    @observable state: RoomClientState = RoomClientState.disconnected

    private webSocket!: WebSocket
    private localPeer: RTCPeerConnection | null = null

    private remotePeers: { [username: string]: RTCPeerConnection } = {}
    private localStream: MediaStream | null = null

    constructor(public readonly username: string,
                public readonly room: string,
                private readonly delegate: RoomClientDelegate)
    {
        makeObservable(this)
        console.log(`Create client ${username}@${room}`)
        this.webSocket = new WebSocket("ws://192.168.0.229:8080/ws")
        this.webSocket.onopen = () => {
            console.log("Connected")
            runInAction(() => this.state = RoomClientState.connected)
        }
        this.webSocket.onerror = () => console.error("Error")
        this.webSocket.onclose = () => {
            console.warn("Closed")
            runInAction(() => this.state = RoomClientState.disconnected)
        }
        this.webSocket.onmessage = async (event) => {
            const response: RoomResponse = JSON.parse(event.data)
            switch (response.t) {
                case "ice":
                    if (response.iceUsername === this.username) {
                        await this.localPeer?.addIceCandidate(response.iceCandidate)
                    }
                    else {
                        await this.remotePeers[response.iceUsername].addIceCandidate(response.iceCandidate)
                    }
                    break
                case "ack":
                    runInAction(() => this.state = RoomClientState.joined)
                    await this.localPeer?.setRemoteDescription({type: "answer", sdp: response.sdpAnswer})
                    break
                case "info":
                    runInAction(() => this.users = new Set(response.users))
                    for (const username of response.users) {
                        await this.requestMedia(username)
                    }
                    break
                case "media":
                    await this.remotePeers[response.mediaUsername].setRemoteDescription({
                                                                                            type: "answer",
                                                                                            sdp: response.sdpAnswer,
                                                                                        })
                    console.log(this.remotePeers[response.mediaUsername].localDescription)
                    console.log(this.remotePeers[response.mediaUsername].remoteDescription)
                    break
                case "userJoined":
                    this.users.add(response.username)
                    await this.requestMedia(response.username)
                    break
                case "userLeft":
                    delegate.onRemoteMediaStreamRemoved(response.username)
                    this.users.delete(response.username)
                    break
                default:
                    console.warn(`Unknown response from server: ${JSON.stringify(response)}`)
            }
        }
    }

    @action
    public async join() {
        if (this.state !== RoomClientState.connected) {
            console.warn("Not connected")
            return
        }

        this.state = RoomClientState.joining

        this.localStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
        this.delegate.onLocalMediaStreamReady(this.localStream)

        this.localPeer = new RTCPeerConnection()
        this.localPeer.onicecandidate = event => {
            if (event.candidate) {
                this.send("ice", {iceUsername: this.username, iceCandidate: event.candidate})
            }
        }

        this.localStream.getTracks().forEach(track => this.localPeer?.addTrack(track, this.localStream!))

        const offer = await this.localPeer.createOffer({
                                                           offerToReceiveAudio: false,
                                                           offerToReceiveVideo: false,
                                                       })
        await this.localPeer.setLocalDescription(offer)

        this.send("join", {sdpOffer: offer.sdp})
    }

    @action
    public leave() {
        if (this.state === RoomClientState.disconnected) {
            console.warn("Already disconnected")
            return
        }

        this.send("leave")

        this.users = new Set()

        this.localStream?.getTracks().forEach(track => track.stop())

        this.delegate.onLocalMediaStreamRemoved()
        this.state = RoomClientState.connected
    }

    private async requestMedia(username: string) {
        if (username === this.username) {
            return
        }

        let remotePeer = new RTCPeerConnection()
        this.remotePeers[username] = remotePeer
        remotePeer.onicecandidate = event => {
            if (event.candidate) {
                this.send("ice", {iceUsername: username, iceCandidate: event.candidate})
            }
        }
        remotePeer.ontrack = event => {
            this.delegate.onRemoteMediaStreamReady(username, event.streams[0])
        }
        const offer = await remotePeer.createOffer({
                                                       offerToReceiveAudio: true,
                                                       offerToReceiveVideo: true,
                                                   })

        this.send("media", {mediaUsername: username, sdpOffer: offer.sdp})

        await remotePeer.setLocalDescription(offer)
    }

    private send<T>(type: string, data?: T) {
        this.webSocket.send(JSON.stringify({
                                               t: type,
                                               username: this.username,
                                               room: this.room,
                                               ...data,
                                           }))
    }
}
