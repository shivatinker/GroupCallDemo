import React, {useEffect, useRef, useState} from "react"
import {observer} from "mobx-react-lite"
import {RoomClient, RoomClientState} from "../RoomClient"
import {RouteComponentProps} from "react-router"
import axios from "axios"
import {apiURL} from "../Utils"
import {Link} from "react-router-dom"
import {Helmet} from "react-helmet-async"

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
        return <div>
            <h1>No such room =(</h1>
            <h2><Link to={"/create"}>Create one!</Link></h2>
        </div>
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
                                                    autoPlay/>
                                            </div>) : null

    return <div className={"content"}>
        <Helmet>
            <title>Room {roomName} | MeetAll</title>
        </Helmet>
        <h1>Room: {roomName}</h1>
        <div className={"controls"}>
            <input type={"text"} disabled={!!roomClient} placeholder={"Username"} ref={usernameInputRef}/>
            <button disabled={!!roomClient}
                    onClick={() => {
                        let uname = usernameInputRef.current!.value

                        if (!uname || uname.length < 3) {
                            alert("Not enough symbols in username")
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
                                                         onLocalMediaStreamRemoved: () => {
                                                             localMediaRef.current!.srcObject = null
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
            <button disabled={roomClient?.state !== RoomClientState.connected}
                    onClick={() => {
                        roomClient?.join()
                    }}>JOIN
            </button>
            <button disabled={roomClient?.state !== RoomClientState.joined}
                    onClick={() => {
                        roomClient?.leave()
                    }}>LEAVE
            </button>
        </div>
        {roomClient ? <>
            <div className={"info"}>
                <span>Username: {roomClient.username}</span>
                <span>Room: {roomClient.room}</span>
                <span style={{
                    color: (() => {
                        switch (roomClient!.state) {
                            case RoomClientState.joined:
                                return "green"
                            case RoomClientState.connected:
                                return "cyan"
                            case RoomClientState.disconnected:
                                return "red"
                            case RoomClientState.joining:
                                return "yellow"
                            default:
                                return "white"
                        }
                    })(),
                }}>State: {roomClient.state}</span>
                <span>Users: {Array.from(roomClient.users).join(", ")}</span>
            </div>
            {roomClient.state === RoomClientState.joined ?
             <>
                 <button onClick={() => {
                     roomClient!.setOutboundAudioEnabled(!roomClient!.isAudioEnabled)
                 }}>{roomClient.isAudioEnabled ? "Mute" : "Unmute"}
                 </button>
                 <button onClick={() => {
                     roomClient!.setOutboundVideoEnabled(!roomClient!.isVideoEnabled)
                 }}>{roomClient.isVideoEnabled ? "Disable camera" : "Enable camera"}
                 </button>
             </> : null
            }
            <div className={"video-box local-video"}>
                <span>YOU ({roomClient.username})</span>
                <video ref={localMediaRef} playsInline autoPlay muted/>
            </div>
            <div className={"remote-box"}>
                {remoteMediaVideos}
            </div>
        </> : null}
    </div>
})

export default RoomPage
