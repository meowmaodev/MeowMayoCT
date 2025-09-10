import {delay} from "../../utils/delay";

let waiting = false

register("command", () => {
    if (waiting) return
    waiting = true // prevent spam

    let pearls = 0
    let hBar = 0
    let index = 0
    let inv = Player.getInventory()
    inv.getItems().forEach(item => { // count pearls in inv and hbar
        if (!item) {
            index++
            return
        }
        if(item.getID() === 368) {
            pearls += item.getStackSize()
            if (index < 9) {
                hBar += item.getStackSize()
            }
        }
        index++
    })

    if (pearls > 16 || pearls !== hBar) {
        ChatLib.command(`gfs ender pearl ${20 - pearls}`)
        delay(() => {
            ChatLib.command(`gfs ender pearl 16`)
            waiting = false
        }, 2000)
    } else if (pearls === 16) {
        waiting = false
    } else {
        ChatLib.command(`gfs ender pearl ${16 - pearls}`)
        waiting = false
    }
}).setName("getpearls").setAliases("gfspearls");