import {Client as StompJSClient, IMessage, StompSubscription} from "@stomp/stompjs"
import {RoomResponse} from "./Api"
import {action, makeObservable, observable, runInAction} from "mobx"

export const enum RoomClientState {
    connected = "connected",
    disconnected = "disconnected",
}

export class RoomClient {
    @observable users: string[] = []
    @observable state: RoomClientState = RoomClientState.disconnected

    private readonly wsClient: StompJSClient
    private wsSubscriptions: StompSubscription[] = []

    constructor(public readonly username: string,
                public readonly room: string)
    {
        makeObservable(this)
        console.log(`Create client ${username}@${room}`)
        this.wsClient = new StompJSClient({
                                              brokerURL: "ws://localhost:8080/ws",
                                              reconnectDelay: 1000,
                                              onConnect: () => console.log("Connected"),
                                              onWebSocketClose: () => console.log("Disconnected"),
                                          })
        this.wsClient.activate()
    }

    @action
    public join() {
        if (this.state === RoomClientState.connected) {
            console.warn("Already connected")
            return
        }

        this.send("join")
        let handler = (message: IMessage) => {
            const response: RoomResponse = JSON.parse(message.body)
            switch (response.t) {
                case "users":
                    runInAction(() => {
                        this.users = response.users
                    })
                    break
                default:
                    console.warn(`Unknown response from server: ${JSON.stringify(response)}`)
            }
        }
        this.wsSubscriptions = [
            this.wsClient.subscribe(`/room/${this.room}`, handler),
            this.wsClient.subscribe(`/user/room/${this.room}`, handler),
        ]
        this.state = RoomClientState.connected
    }

    @action
    public leave() {
        if (this.state === RoomClientState.disconnected) {
            console.warn("Already disconnected")
            return
        }

        this.send("leave")

        for (const subscription of this.wsSubscriptions) {
            subscription.unsubscribe()
        }

        this.wsSubscriptions = []
        this.users = []
        this.state = RoomClientState.disconnected
    }

    private send<T>(type: string, data?: T) {
        this.wsClient.publish({
                                  destination: "/room",
                                  body: JSON.stringify({
                                                           t: type,
                                                           username: this.username,
                                                           room: this.room,
                                                           ...data,
                                                       }),
                              })
    }
}
