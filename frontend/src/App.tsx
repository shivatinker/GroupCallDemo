import React from "react"
import "./App.css"
import {BrowserRouter} from "react-router-dom"
import {Route, Switch} from "react-router"
import RoomPage from "./meetall/room/RoomPage"

const App = () => {
    return <BrowserRouter>
        <Switch>
            <Route path={"/room/:roomName"} component={RoomPage}/>
            <Route path="*">
                <h2>
                    404 Not Found
                </h2>
            </Route>
        </Switch>
    </BrowserRouter>
}

export default App
