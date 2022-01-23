import React, {useRef, useState} from "react"
import {observer} from "mobx-react-lite"
import {RoomClient} from "../RoomClient"
import {RouteComponentProps} from "react-router"

interface MatchParams {
    roomName: string
}

export interface RoomPageProps extends RouteComponentProps<MatchParams> {

}

const RoomPage = observer((props: RoomPageProps): JSX.Element => {
    const [roomClient, setRoomClient] = useState<RoomClient | null>(null)

    const usernameInputRef = useRef<HTMLInputElement>(null)
    const localMediaRef = useRef<HTMLVideoElement>(null)
    const remoteMediaRef = useRef<HTMLVideoElement>(null)

    return <div>
        <input type={"text"} placeholder={"Username"} ref={usernameInputRef}/>
        <button onClick={() => {
            if (!!roomClient) {
                roomClient.leave()
            }

            setRoomClient(new RoomClient(usernameInputRef.current!.value,
                                         props.match.params.roomName,
                                         {
                                             onLocalMediaStreamReady: (stream: MediaStream) => {
                                                 localMediaRef.current!.srcObject = stream
                                             },
                                             onRemoteMediaStreamReady: (username, stream) => {
                                                 console.info(`Got for ${username}`)
                                                 remoteMediaRef.current!.srcObject = stream
                                             },
                                         }))
        }}>CONNECT
        </button>
        <button onClick={() => {
            roomClient?.join()
        }}>JOIN
        </button>
        <button onClick={() => {
            roomClient?.leave()
        }}>LEAVE
        </button>
        {roomClient ? <>
            <p>Username: {roomClient.username}</p>
            <p>Room: {roomClient.room}</p>
            <p>State: {roomClient.state}</p>
            <p>Users: {roomClient.users.join(", ")}</p>
        </> : null}
        <video ref={localMediaRef} playsInline autoPlay muted/>
        <video ref={remoteMediaRef} playsInline autoPlay muted/>
    </div>
})

export default RoomPage
