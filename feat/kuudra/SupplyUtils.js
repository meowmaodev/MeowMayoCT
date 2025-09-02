import settings from "../../settings";
import {makeTitle} from "../../utils/alert";
import {sendMessage, sendParty} from "../../utils/chat";
import {registerWhen} from "../../utils/RegisterWhen";
import Drawable from "../../utils/DrawWorld";
import {getInKuudra, getPhase, getUnformattedNoLagSplitTime} from "./KuudraTimings";
import {degreesToRadians, radiansToDegrees} from "../../utils/angles";

const CrateLocations = Object.freeze({
    TRIANGLE: { location:[-67.5, 77, -122.5], name: "Triangle" },
    X: { location:[-142.5, 77, -151], name: "X" },
    EQUALS: { location:[-65.5, 76, -87.5], name: "Equals" },
    SLASH: { location:[-113.5, 77, -68.5], name: "Slash" },
    SHOP: { location:[-81, 76, -143], name: "Shop" },
    XCANNON: { location:[-143, 76, -125], name: "xCannon" },
    SQUARE: { location:[-143, 76, -80], name: "Square" }
});

const PreLocations = Object.freeze({
    TRIANGLE: [-94, 79, -106],
    X: [-106, 79, -113],
    EQUALS: [-98, 79, -99],
    SLASH: [-106, 79, -99],
    SHOP: [-98, 79, -113],
    XCANNON: [-110, 79, -106]
});

const SecondLocations = Object.freeze({
    SQUARE: [-138, 79, -90],
    SHOP: [-87, 79, -127],
    XCANNON: [-130, 78, -114]
});

const EntityGiant = Java.type("net.minecraft.entity.monster.EntityGiantZombie");

function getDistance(array1, array2) {
    return Math.abs(Math.hypot(array1[0] - array2[0], array1[1] - array2[1], array1[2] - array2[2]))
}

function getPreLocation() {
    // MASSIVE IF STATEMENT
    let player = [
        Player.getX(),
        Player.getY(),
        Player.getZ()
    ]
    if (getDistance(player, [-73, 79, -135]) <= 5.5) {
        return PreLocations.SHOP
    }
    if (getDistance(player, [-87, 79, -127]) <= 4) {
        return PreLocations.SHOP
    }
    if (getDistance(player, [-67, 77, -122]) <= 5.5) {
        return PreLocations.TRIANGLE
    }
    if (getDistance(player, [-133, 77, -137]) <= 3.5) {
        return PreLocations.X
    }
    if (getDistance(player, [-134, 78, -128]) <= 4.5) {
        return PreLocations.XCANNON
    }
    if (getDistance(player, [-131, 79, -111]) <= 6) {
        return PreLocations.XCANNON
    }
    if (getDistance(player, [-135, 76, -122]) <= 3.5) {
        return PreLocations.XCANNON
    }
    if (getDistance(player, [-112, 77, -69]) <= 3.5) {
        return PreLocations.SLASH
    }
    if (getDistance(player, [-117, 78, -85]) <= 4.5) {
        return PreLocations.SLASH
    }
    if (getDistance(player, [-65, 76, -87]) <= 3.5) {
        return PreLocations.EQUALS
    }
    if (getDistance(player, [-79, 79, -89]) <= 3.5) {
        return PreLocations.EQUALS
    }
    if (getDistance(player, [-140, 77, -88]) <= 4.5) {
        switch (missing) {
            case "slash":
                return PreLocations.SLASH
            case "equals":
                return PreLocations.EQUALS
            case "triangle":
                return PreLocations.TRIANGLE
            case "x":
                return PreLocations.X
            case "shop":
                return PreLocations.SHOP
            default:
                return PreLocations.XCANNON
        }
    }
    return [0,0,0]
}

function getSecondLocation() {
    let player = [
        Player.getX(),
        Player.getY(),
        Player.getZ()
    ]

    if (getDistance(player, [-67, 77, -122]) <= 5.5) {
        return SecondLocations.SHOP
    }
    if (getDistance(player, [-133, 77, -137]) <= 3.5) {
        return SecondLocations.XCANNON
    }
    if (getDistance(player, [-112, 77, -69]) <= 3.5) {
        return SecondLocations.SQUARE
    }
    if (getDistance(player, [-65, 76, -87]) <= 3.5) {
        return SecondLocations.SHOP
    }
    return [0,0,0]
}

let preLoc
let first = false
let second = false
let missing

let grav = 0.05
let eVel = 1.67

let pearlTarget = [0.0, 0.0, 0.0]
let pearlTiming = 0

let secondTarget = [0.0, 0.0, 0.0]
let secondTiming = 0

let playerPos = [0.0, 0.0, 0.0]

let isPre = false

let pickingUp = false

let pearlFound = false
let secondFound = false

let locationAt = [0,0,0]
let secondAt = [0,0,0]

let packetHandler
let packetCount = 0

register("chat", () => {
    if (!settings.supplyUtil || !getInKuudra()) return;

    preLoc = null
    first = false
    second = false

    let player = Player.asPlayerMP()
    let dist = []

    dist.push( // get distance to each prespot
        player.distanceTo(-67.5, 77, -122.5),
        player.distanceTo(-142.5, 77, -151),
        player.distanceTo(-65.5, 76, -87.5),
        player.distanceTo(-113.5, 77, -68.5)
    )

    let low = 0

    for (let i = 1; i < 4; i++) { if (dist[i] < dist[low]) { low = i } } // find closest pre

    switch (low) {
        case 0:
            preLoc = CrateLocations.TRIANGLE;
            break;
        case 1:
            preLoc = CrateLocations.X;
            break;
        case 2:
            preLoc = CrateLocations.EQUALS;
            break;
        case 3:
            preLoc = CrateLocations.SLASH;
            break;
    }
}).setCriteria("[NPC] Elle: Head over to the main platform, I will join you when I get a bite!")

register("chat", () => {
    if (!settings.supplyUtil || !getInKuudra()) return;
    if (preLoc == null) { return; } // somehow no pre location is detected, shouldn't be possible but idk

    const crates = World
        .getAllEntitiesOfType(EntityGiant.class)
        .filter(e => e.getEntity().func_70694_bm()?.toString() == "1xitem.skull@3")
        .map(giant => {
            const yaw = giant.getYaw()
            const x = giant.getX() + (3.7 * Math.cos((yaw + 130) * (Math.PI / 180)));
            const z = giant.getZ() + (3.7 * Math.sin((yaw + 130) * (Math.PI / 180)));

            return ([x, 75, z])
        });


    let i = crates.length
    for (const crate of crates) {
        if (getDistance(preLoc.location, crate) < 18) {
            first = true;
        }
        switch (preLoc) {
            case CrateLocations.TRIANGLE:
                if (getDistance(CrateLocations.SHOP.location, crate) < 18) { second = true; }
                break;
            case CrateLocations.X:
                if (getDistance(CrateLocations.XCANNON.location, crate) < 16) { second = true; }
                break;
            case CrateLocations.SLASH:
                if (getDistance(CrateLocations.SQUARE.location, crate) < 20) { second = true; }
                break;
            default:
                second = true;
                break;
        }
        if (first && second) { break; } // break if both have been found
    }

    if (!first) {
        sendParty(`No ${preLoc.name}!`);
    }
    else if (!second) {
        switch (preLoc) {
            case CrateLocations.TRIANGLE:
                sendParty(`No ${CrateLocations.SHOP.name}!`);
                break;
            case CrateLocations.X:
                sendParty(`No ${CrateLocations.XCANNON.name}!`);
                break;
            case CrateLocations.SLASH:
                sendParty(`No ${CrateLocations.SQUARE.name}!`);
                break;
            default:
                break;
        }
    }
    preLoc = null;
    first = false
    second = false
}).setCriteria("[NPC] Elle: Not again!")

let time = `${130-packetCount}`

// Regular
registerWhen(register("renderWorld", () => {
    Drawable.drawBox(pearlTarget[0]+(settings.waypointSize/100)/2, pearlTarget[1]+(settings.waypointSize/100)/2, pearlTarget[2]+(settings.waypointSize/100)/2, (settings.waypointSize/100), (settings.waypointSize/100), (time > pearlTiming ? 1 : 0), (time > pearlTiming ? 0 : 1), 0, 1, true)
}), ()=> pickingUp && getInKuudra() && getPhase() < 2 && settings.prePearls && pearlFound)

registerWhen(register("renderWorld", () => {
    Drawable.drawBox(secondTarget[0]+(settings.waypointSize/100)/2, secondTarget[1]+(settings.waypointSize/100)/2, secondTarget[2]+(settings.waypointSize/100)/2, (settings.waypointSize/100), (settings.waypointSize/100), (time > secondTiming-6 ? 1 : 0), 0, 1, 1, true)
}), ()=> pickingUp && getInKuudra() && getPhase() < 2 && settings.prePearls && settings.secondPearls && secondFound)

let throwTimer = new Text('')
throwTimer.setScale(3)
let pickupTimer = new Text('')
pickupTimer.setScale(3)

registerWhen(register("renderOverlay", () => {
    throwTimer.setString(`${time > pearlTiming ? time-pearlTiming : "THROW!!!"}`)
    throwTimer.draw(
        Renderer.screen.getWidth() / 2 - throwTimer.getWidth() / 2,
        Renderer.screen.getHeight() / 3 - throwTimer.getHeight()/3
    )
    pickupTimer.setString(`${time}`)
    pickupTimer.draw(
        Renderer.screen.getWidth() / 2 - pickupTimer.getWidth() / 2,
        Renderer.screen.getHeight()*2 / 3 - throwTimer.getHeight()*2/3
    )
}), ()=> pickingUp && getInKuudra() && getPhase() < 2 && settings.supplyTimer && pearlFound)

registerWhen(register("renderOverlay", () => {
    pickupTimer.setString(`${time}`)
    pickupTimer.draw(
        Renderer.screen.getWidth() / 2 - pickupTimer.getWidth() / 2,
        Renderer.screen.getHeight()*2 / 5
    )
}), ()=> pickingUp && getInKuudra() && getPhase() < 2 && settings.supplyTimer && !pearlFound)

registerWhen(register('step', () => {
    const dx = Player.getX() - playerPos[0];
    const dy = Player.getY() - playerPos[1];
    const dz = Player.getZ() - playerPos[2];
    if (dx !== 0 || dy !== 0 || dz !== 0) {
        playerPos = [Player.getX(), Player.getY(), Player.getZ()]

        if (locationAt[0] === 0) {
            sendMessage("An error has occurred determining your Supply Location.")
            return;
        }

        let pearlPos = calculatePearl(locationAt) // pass the actual place to go to

        if (pearlPos[0][0] === 0.0) {
            sendMessage(`An error has occurred calculating Pearl Trajectory. | Error: ${pearlPos[0][1]}`)
            return
        }

        pearlTarget = pearlPos[0]
        pearlTiming = pearlPos[1]

        pearlFound = true
    }
}).setFps(10), ()=> pickingUp && getInKuudra() && getPhase() < 2 && settings.prePearls && !isPre)

registerWhen(register('step', () => {
    const dx = Player.getX() - playerPos[0];
    const dy = Player.getY() - playerPos[1];
    const dz = Player.getZ() - playerPos[2];
    if (dx !== 0 || dy !== 0 || dz !== 0) {
        playerPos = [Player.getX(), Player.getY(), Player.getZ()]

        if (locationAt[0] === 0) {
            sendMessage("An error has occurred determining your Supply Location.")
            return
        }

        if (secondAt[0] === 0) {
            sendMessage("An error has occurred determining your Second Location. You likely are not at a real pre.")
            playerPos[0] = 0.0; // force recheck due to movement
            isPre = false;
            return
        }

        let pearlPos = calculatePearl(locationAt) // pass the actual place to go to

        if (pearlPos[0][0] === 0.0) {
            sendMessage(`An error has occurred calculating Pearl Trajectory. | Error: ${pearlPos[0][1]}`)
            return
        }

        pearlTarget = pearlPos[0]
        pearlTiming = pearlPos[1]

        pearlFound = true

        let secondPos = calculatePearl(secondAt) // pass the actual place to go to

        if (secondPos[0][0] === 0.0) {
            sendMessage(`An error has occurred calculating Second Pearl Trajectory. | Error: ${secondPos[0][1]}`)
            return
        }

        secondTarget = secondPos[0]
        secondTiming = secondPos[1]

        secondFound = true
    }
}).setFps(10), ()=> pickingUp && getInKuudra() && getPhase() < 2 && settings.prePearls && isPre)

register("renderTitle", (title, subTitle, event) => { // god is dead and i killed him
    if (!(settings.prePearls || settings.supplyTimer) || !getInKuudra() || !(getPhase() < 2)) return;
    if (/\[\|+]\s?\d{1,3}%/.test(title.replace(/§./g, ""))) {
        let int = parseInt(title.replace(/§./g, "").match(/\d+/), 10)
        if (int === 0 && !pickingUp) {
            isPre = false
            if (settings.prePearls) {
                locationAt = getPreLocation()
                if (settings.secondPearls && getUnformattedNoLagSplitTime() < 7.0) {
                    isPre = true
                    secondAt = getSecondLocation()
                }
            }
            pickingUp = true
            packetHandler = register('packetReceived', () => {
                packetCount += 1;
                time = `${130-packetCount}`
                if (packetCount > 135) {
                    endGrab() // safety clause
                }
            }).setFilteredClass(Java.type("net.minecraft.network.play.server.S32PacketConfirmTransaction"));
        }
        if (int === 100 && pickingUp) {
            endGrab()
        }
        if (pickingUp && settings.supplyTimer) { // we only cancel if we are SURE we are rendering custom timer
            cancel(event)
        }
    }
})

register("chat", () => {
    endGrab()
}).setCriteria("You moved and the Chest slipped out of your hands!")

register("chat", () => {
    missing = null

    endGrab()
}).setCriteria("[NPC] Elle: OMG! Great work collecting my supplies!")

register("worldLoad", () => {
    missing = null

    endGrab()
})

function calculatePearl(target) {
    const playerX = Player.getX();
    const playerY = Player.getY();
    const playerZ = Player.getZ();

    const offX = target[0] - playerX;
    const offY = target[1] - (playerY + 1.62);
    const offZ = target[2] - playerZ;
    const offHor = Math.hypot(offX, offZ);

    const vSq = eVel * eVel;
    const term1 = (grav * offHor * offHor) / (2 * vSq);
    const discrim = vSq - grav * (term1 - offY);

    if (discrim < 0) {
        return [[0.0, 9.0, 0.0], 0];
    }

    const sqrtDiscrim = Math.sqrt(discrim);
    const atanFactor = grav * offHor;
    const angle1 = radiansToDegrees(Math.atan((vSq + sqrtDiscrim) / atanFactor));
    const angle2 = radiansToDegrees(Math.atan((vSq - sqrtDiscrim) / atanFactor));

    let angle = angle1 >= 45.0 ? angle1 : angle2 >= 45.0 ? angle2 : null;
    if (!angle) {
        return [[0.0, 10.0, 0.0], 0];
    }

    let dragAng = 1.0
    if (offHor < 45 && offHor > 36 ) {
        dragAng = 0.982
    } else if (offHor < 10) {
        dragAng = 1.0
    } else if (offHor < 40 && offHor >= 28) {
        dragAng = 1.033 + (((offHor - 28) / (12)) * (-0.033))
    } else if (offHor < 28) { // magic numbers that adjust the calculation to pseudo account for other issues (meth)
        dragAng = 1.026 + (((offHor - 10) / (18)) * (-0.017))
    } else {
        dragAng = 1.0 + (((offHor - 40) / (15)) * (-0.12))
    }
    angle *= dragAng;

    const pitch = -angle;
    const radP = degreesToRadians(pitch);
    const radY = -Math.atan2(offX, offZ);

    const vY = eVel * Math.sin(degreesToRadians(angle));
    const flightTimeFactor = Math.pow(1.0015, Math.max(offHor / 15, 1)) * 0.8;
    let fT = (vY + Math.sqrt(vY * vY + 2 * grav * (playerY + 1.62 - target[1]))) / grav;
    let timing = Math.floor((fT / Math.pow(0.992, fT)) * flightTimeFactor) - 2; // subtract 2 ticks to account for pearl randomness????

    const cosRadP = Math.cos(radP);
    const fX = cosRadP * Math.sin(radY);
    const fY = -Math.sin(radP);
    const fZ = cosRadP * Math.cos(radY);

    let targetX = playerX - fX * 10;
    let targetY = playerY + fY * 10;
    let targetZ = playerZ + fZ * 10;

    return [[targetX, targetY, targetZ], timing]
}

function endGrab() {
    pearlFound = false
    secondFound = false

    isPre = false

    playerPos = [0.0,0.0,0.0]

    pearlTarget = [0.0, 0.0, 0.0]
    pearlTiming = 0

    secondTarget = [0.0, 0.0, 0.0]
    secondTiming = 0

    locationAt = [0,0,0]
    secondAt = [0,0,0]

    pearlFound = false // fixes for any race conditions
    secondFound = false

    endTimer()
}

function endTimer() {
    if (packetHandler) {
        packetHandler.unregister();
        packetHandler = null;
    }
    packetCount = 0
    pickingUp = false
}

register("chat", (supply) => {
    missing = supply.toLowerCase()
    if (!settings.noSupply) return;
    makeTitle(`Missing: ${supply}`)
}).setCriteria("Party > ${*}: No ${supply}!")
