import settings from "../../settings";
import {sendParty} from "../../utils/chat";
import {getInKuudra, getPhase} from "./KuudraTimings";
import {makeAlert, makeTitle} from "../../utils/alert";

register("chat", (mana) => {
    if (!settings.announceMana) return;
    sendParty(`Used ${mana} Mana!`)
}).setCriteria("Used Extreme Focus! (${mana} Mana)")

// Fresh
register("chat", () => {
    if (!settings.announceFresh) return;
    sendParty(`FRESH!`)
    if (settings.freshTitle) {
        makeTitle("Fresh Tools!")
    }
}).setCriteria("Your Fresh Tools Perk bonus doubles your building speed for the next 10 seconds!")

// final kill!
let finalKills = 0
register("worldLoad", () => {
    if (!(settings.lastAlive)) return;
    finalKills = 0
})

register("chat", () => {
    if (!(settings.lastAlive && getInKuudra())) return;
    finalKills++;
    if (finalKills >= 3) { // set this to be based on party size when pUtil is done
        makeAlert("Last Alive!", "random.bowhit")
        sendParty("You are the last person standing - Solo!")
    }
}).setCriteria("${player} was FINAL KILLED by Kuudra!")

// warnings!
register('step', () => {
    if (!(settings.dangerBlocks && getPhase() === 7)) return;
    if (World.getBlockAt(Math.floor(Player.getX()), Math.floor(Player.getY() - 1), Math.floor(Player.getZ())).getState() == "minecraft:stained_hardened_clay[color=red]") {
        makeAlert("JUMP!", "note.pling")
    }
}).setFps(4)


//               _..----.._    _
//             .'  .--.    "-.(0)_
// '-.__.-'"'=:|   ,  _)_ \__ . c\'-..
//              '''------'---''---'-"