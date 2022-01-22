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

    return <div>
        <input type={"text"} placeholder={"Username"} ref={usernameInputRef}/>
        <button onClick={() => {
            if (!!roomClient) {
                roomClient.leave()
            }

            setRoomClient(new RoomClient(usernameInputRef.current!.value, props.match.params.roomName))
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
    </div>
})

export default RoomPage
