export function makeTitle(text) {
    Client.showTitle(text, "", 0, 20, 20)
}

export function makeAlert(text, sound) {
    Client.showTitle(text, "", 0, 20, 20)
    World.playSound(sound, 100, 10)
}