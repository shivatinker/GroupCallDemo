import React, {useState} from "react"
import axios from "axios"
import {apiURL, webURL} from "../Utils"

export interface CreateRoomPageProps {

}

enum State {
    ready,
    creating,
    success,
    error
}

const CreateRoomPage = (props: CreateRoomPageProps): JSX.Element => {
    const [state, setState] = useState<State>(State.ready)
    const [roomName, setRoomName] = useState<string | null>(null)

    switch (state) {
        case State.ready:
            return <button onClick={() => {
                setState(State.creating)
                axios.post(apiURL("create_room"))
                     .then(response => {
                         if (response.data.roomName) {
                             setRoomName(response.data.roomName)
                             setState(State.success)
                         }
                         else {
                             setState(State.error)
                         }
                     })
                     .catch(() => setState(State.error))
            }}>Create room</button>
        case State.creating:
            return <h1>Creating room...</h1>
        case State.success:
            let url = webURL(`room/${roomName}`)
            return <h1>Room link: <a href={url}>{url}</a></h1>
        case State.error:
            return <h1>Error =(</h1>

    }
}

export default CreateRoomPage
