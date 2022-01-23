import React from "react"
import "./App.css"
import {BrowserRouter} from "react-router-dom"
import {Route, Switch} from "react-router"
import RoomPage from "./meetall/room/RoomPage"
import CreateRoomPage from "./meetall/room/CreateRoomPage"

const App = () => {
    return <BrowserRouter>
        <Switch>
            <Route path={"/room/:roomName"} component={RoomPage}/>
            <Route path={"/create"} component={CreateRoomPage}/>
            <Route path="*">
                <h2>
                    404 Not Found
                </h2>
            </Route>
        </Switch>
    </BrowserRouter>
}

export default App
