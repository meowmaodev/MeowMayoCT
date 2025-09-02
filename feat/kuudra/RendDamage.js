import settings from "../../settings";
import {getKuudra, getPhase, getSplitTime} from "./KuudraTimings";
import {delay} from "../../utils/delay";
import {sendMessage} from "../../utils/chat";
import {makeAlert, makeTitle} from "../../utils/alert";

// base rend damage listener taken from chearys

const EntityMagmaCube = Java.type('net.minecraft.entity.monster.EntityMagmaCube');
let cubes = World.getAllEntitiesOfType(EntityMagmaCube.class);

let currentHp = 0;
let health = 24999;
let pull = 1;

function formatDamage(i) { // i love chearys :D
    if ( i >= 2083 && i <= 4166) {
        return "&c&l";
    } // 20M-40M
    if ( i >= 4166 && i <= 7291) {
        return "&e&l";
    } // 40M-80M
    if ( i > 7291 ) {
        return "&a&l";
    } //80M+
    return "&f&l";
}

function formatHealth(value) {
    let n = Number(value);
    if (Number.isNaN(n)) {
        return "0";
    }

    if (n >= 1e9) {
        return (n / 1e9).toFixed(2) + "b";
    }
    if (n >= 1e6) {
        return (n / 1e6).toFixed(2) + "m";
    }
    if (n >= 1e3) {
        return (n / 1e3).toFixed(2) + "k";
    }
    return n.toFixed(2);
}

register("chat", () => {
    if (!settings.rendDmg) return;
    currentHp = 26000
    health = 24999
    pull = 1;

}).setCriteria("[NPC] Elle: POW! SURELY THAT'S IT! I don't think he has any more in him!")

let pulls = 0 // ok this isnt stolen i think
register("SoundPlay", (event) => { // Listening for rend sounds to add confidence to pulls
    if (!(settings.rendDmg && getPhase() === 7)) return;
    pulls++;
    delay(() => pulls = Math.max(pulls - 1, 0), 100);

}).setCriteria("mob.zombie.woodbreak")

function pullConfidence() {
    switch (pulls) {
        case 0:
            pulls = 0;
            return ""
        case 1:
            pulls = 0;
            return "&r| &31h &r- &aSolo Pull"
        case 2:
            pulls = 0;
            return "&r| &32h &r- &eDuo Pull"
        default:
            pulls = 0;
            return "&r| &33+h &r- &cMulti Pull"
    }
}

let playerPull = false
let rendCooldown = false
register("Clicked", (x, y, button, state) => { // should detect if a rend pull is made by the player (idk maybe not)
    if (!(settings.rendDmg && getPhase() === 7)) return;
    if (state && button === 0.0 && !Client.isInGui()) { // only gets left click down (probably)
        let playerItem = Player.getHeldItem();
        if (!playerItem) return; // Check is player is holding an item at all
        if (!playerItem.getName().removeFormatting().toLowerCase().includes("bonemerang")) return; // Check if item is bone
        if (!rendCooldown) {
            sendMessage(`&7Pulled at &b${getSplitTime()}`)
            rendCooldown = true;
            delay(() => rendCooldown = false, 2000);
        }
        playerPull = true;
        delay(() => playerPull = false, 100);
    }
})

function isPlayerPull() {
    if (playerPull) {
        playerPull = false;
        return " &r| &a&lYOUR PULL";
    }
    return "";
}

let throwingBone = false
let boneSlot = 0;
let boneHit = 0
register("Clicked", (x, y, button, state) => {
    if (!(settings.boneHit && !throwingBone && getPhase() === 7)) return;
    if (state && button === 1.0 && !Client.isInGui()) { // only gets right click down (probably)
        let playerItem = Player.getHeldItem();
        if (!playerItem) return; // Check is player is holding an item at all
        if (!playerItem.getName().removeFormatting().toLowerCase().includes("bonemerang") || playerItem.getID() != 352) return; // Check if item is bone
        boneSlot = Player.getHeldItemIndex()
        boneHit = 0;
        throwingBone = true;
    }
})

let waiting = 0
register('tick', () => {
    if (!(settings.boneHit && throwingBone && getPhase() === 7)) return;
    if (Player.getItemInSlot(boneSlot).getID() == 352 || waiting > 100) { // checks if bone is back or 5s has passed
        throwingBone = false;
        waiting = 0;
    } else {
        waiting++;
    }
})

register("SoundPlay", (event) => { // Listening for bone sound
    if (!(settings.boneHit && throwingBone && getPhase() === 7)) return;
    let playerItem = Player.getHeldItem();
    if (!playerItem) return; // Check is player is holding an item at all

    let item = playerItem.getName().removeFormatting().toLowerCase()
    if (item.includes("breath") || item.includes("juju") || item.includes("terminator")) return;

    if (boneHit === 0) {
        boneHit = 1;
        sendMessage(`&7Front bone hit at &b${getSplitTime()} &r| &7Holding - ${playerItem.getName()} &r| &7Wearing - ${Player.armor.getHelmet().getName()}`)
    } else if (boneHit === 1) {
        boneHit = 0;
        sendMessage(`&7Back bone hit at &b${getSplitTime()} &r| &7Holding - ${playerItem.getName()} &r| &7Wearing - ${Player.armor.getHelmet().getName()}`)
        throwingBone = false
        if (settings.rendNow) {
            makeAlert("-=-=-=-=- Rend NOW! -=-=-=-=-", "random.anvil_land")
            delay(() => makeAlert("-=-=-=-=- Rend NOW! -=-=-=-=-", "random.anvil_land"), 10)
            delay(() => makeAlert("-=-=-=-=- Rend NOW! -=-=-=-=-", "random.anvil_land"), 20)
            delay(() => makeAlert("-=-=-=-=- Rend NOW! -=-=-=-=-", "random.anvil_land"), 30)
            delay(() => makeAlert("-=-=-=-=- Rend NOW! -=-=-=-=-", "random.anvil_land"), 40)
        }

    }
}).setCriteria("tile.piston.out")

register("worldLoad", () => {
    if (!settings.boneHit) return;
    throwingBone = false;
    boneHit = 0;
    waiting = 0;
})

register('tick', () => {
    if (!(settings.rendDmg && getPhase() === 7)) return;
    if (getKuudra() !== undefined) {
        currentHp = getKuudra().getEntity().func_110143_aJ();
    } else {
        currentHp = 26000;
    }

    let diff = health - currentHp;
    if (diff > 2083) {
        let rendMessage = `&7Pull number &6${pull} &7hit at &b${getSplitTime()} &7for ${formatDamage(diff)}${formatHealth(diff * 9600)} `
        health = currentHp;
        delay(() => {
            rendMessage += `${pullConfidence()}${isPlayerPull()}` // Registers pulls with 2 ticks of leeway
            sendMessage(rendMessage);
        }, 75);
        pull++;
        return;
    }
    health = currentHp;
})