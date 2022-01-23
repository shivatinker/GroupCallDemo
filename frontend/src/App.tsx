import React from "react"
import "./App.css"
import {BrowserRouter, Redirect} from "react-router-dom"
import {Route, Switch} from "react-router"
import RoomPage from "./meetall/room/RoomPage"
import CreateRoomPage from "./meetall/room/CreateRoomPage"
import {Helmet, HelmetProvider} from "react-helmet-async"

const App = () => {
    return <HelmetProvider>
        <Helmet>
            <title>MeetAll</title>
        </Helmet>
        <BrowserRouter>
            <Switch>
                <Route path={"/room/:roomName"} component={RoomPage}/>
                <Route path={"/create"} component={CreateRoomPage}/>
                <Route path="*">
                    <Redirect to={"/create"}/>
                </Route>
            </Switch>
        </BrowserRouter>
    </HelmetProvider>
}

export default App
