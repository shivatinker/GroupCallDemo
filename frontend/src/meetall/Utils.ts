export function apiURL(endpoint: string) {
    return `http://${window.location.hostname}:8080/${endpoint}`
}

export function webURL(endpoint: string) {
    return `http://${window.location.hostname}/${endpoint}`
}

export function wsURL() {
    return `ws://${window.location.hostname}:8080/ws`
}
