import React, {useEffect, useRef, useState} from "react"
import {observer} from "mobx-react-lite"
import {RoomClient} from "../RoomClient"
import {RouteComponentProps} from "react-router"
import axios from "axios"
import {apiURL} from "../Utils"

interface MatchParams {
    roomName: string
}

export interface RoomPageProps extends RouteComponentProps<MatchParams> {

}

enum Status {
    loading,
    ok,
    error
}

const RoomPage = observer((props: RoomPageProps): JSX.Element => {
    const [status, setStatus] = useState<Status>(Status.loading)
    const [roomClient, setRoomClient] = useState<RoomClient | null>(null)

    const usernameInputRef = useRef<HTMLInputElement>(null)
    const localMediaRef = useRef<HTMLVideoElement>(null)
    const remoteMediaRefs = useRef<{ [username: string]: HTMLVideoElement | null }>({})

    const roomName = props.match.params.roomName

    useEffect(() => {
        axios.get(apiURL("get_room"), {
            params: {
                name: roomName,
            },
        })
             .then(() => setStatus(Status.ok))
             .catch(() => setStatus(Status.error))
    }, [roomName])

    if (status === Status.error) {
        return <h1>No such room =(</h1>
    }

    if (status === Status.loading) {
        return <h1>Loading...</h1>
    }

    const remoteMediaVideos = roomClient ?
                              Array.from(roomClient.users)
                                   .filter(user => user !== roomClient.username)
                                   .map(user =>
                                            <div className={"video-box"}>
                                                <span>{user}</span>
                                                <video
                                                    ref={el => {
                                                        remoteMediaRefs.current![user] = el
                                                    }}
                                                    playsInline
                                                    autoPlay
                                                    muted/>
                                            </div>) : null

    return <div>
        <h1>Room: {roomName}</h1>
        <input type={"text"} disabled={!!roomClient} placeholder={"Username"} ref={usernameInputRef}/>
        <button onClick={() => {
            let uname = usernameInputRef.current!.value

            if (!uname || uname.length < 3) {
                return
            }

            if (!!roomClient) {
                roomClient.leave()
            }

            setRoomClient(new RoomClient(uname,
                                         roomName,
                                         {
                                             onLocalMediaStreamReady: (stream: MediaStream) => {
                                                 localMediaRef.current!.srcObject = stream
                                             },
                                             onRemoteMediaStreamReady: (username, stream) => {
                                                 console.info(`Got for ${username}`)
                                                 let ref = remoteMediaRefs.current![username]
                                                 if (ref) {
                                                     ref.srcObject = stream
                                                 }
                                             },
                                             onRemoteMediaStreamRemoved: (username => {
                                                 let ref = remoteMediaRefs.current![username]
                                                 if (ref) {
                                                     ref.srcObject = null
                                                 }
                                             }),
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
            <p>Users: {Array.from(roomClient.users).join(", ")}</p>
        </> : null}
        <div className={"video-box"}>
            <span>YOU</span>
            <video ref={localMediaRef} playsInline autoPlay muted/>
        </div>
        <div className={"remote-box"}>
            {remoteMediaVideos}
        </div>
    </div>
})

export default RoomPage
