function isLocal() {
    return window.location.host.includes("localhost")
}

export function apiURL(endpoint: string) {
    if (isLocal()) {
        return `http://${window.location.hostname}:8080/${endpoint}`
    }
    else {
        return `https://meetall-back.azurewebsites.net/${endpoint}`
    }
}

export function webURL(endpoint: string) {
    if (isLocal()) {
        return `http://${window.location.hostname}/${endpoint}`
    }
    else {
        return `https://${window.location.hostname}/${endpoint}`
    }
}

export function wsURL() {
    if (isLocal()) {
        return `ws://${window.location.hostname}:8080/ws`
    }
    else {
        return `wss://meetall-back.azurewebsites.net/ws`
    }
}
