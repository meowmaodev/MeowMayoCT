import settings from "../../settings";
import {formatTime} from "../../utils/Formats";
import {stripRank} from "../../utils/StripRank";
import {sendMessage} from "../../utils/chat";
import {getKuudraFlag, getParty, useKuudraFlag} from "../../utils/PartyUtil";
import {arraysEqual} from "../../utils/arrayUtils";

const EntityMagmaCube = Java.type('net.minecraft.entity.monster.EntityMagmaCube');

let splits = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let lagTime = [0, 0, 0, 0, 0, 0, 0, 0];
let currPhase = 0;

let tickCount = 0;
let packetCount = 0;

let currParty = []

let preConsistency = []

let inKuudra = false;

let tickHandler, packetHandler;

let p6Listener, p7Listener;

function registerListener() {
    tickHandler = register("tick", () => {
        tickCount += 50;
    });
    packetHandler = register('packetReceived', () => {
        packetCount += 50;
    }).setFilteredClass(Java.type("net.minecraft.network.play.server.S32PacketConfirmTransaction"));
}

function unregisterListener() {
    if (packetHandler) {
        packetHandler.unregister();
        packetHandler = null;
    }
    if (tickHandler) {
        tickHandler.unregister();
        tickHandler = null;
    }
}

export function getPhase() {
    return currPhase;
}

export function getInKuudra() {
    return inKuudra;
}

export function getSplitTime() {
    return formatTime(Math.max(parseFloat((tickCount/1000).toFixed(2)), 0))
}

export function getUnformattedSplitTime() {
    return Math.max(parseFloat((tickCount/1000).toFixed(2)), 0)
}

export function getNoLagSplitTime() {
    return formatTime(Math.max(parseFloat((packetCount/1000).toFixed(2)), 0))
}

export function getUnformattedNoLagSplitTime() {
    return Math.max(parseFloat((packetCount/1000).toFixed(2)), 0)
}


function clearLag(index) {
    lagTime[index] = Math.max(parseFloat(((tickCount-packetCount) / 1000).toFixed(2)), 0);
    tickCount = 0;
    packetCount = 0;
}

function endRun() {
    inKuudra = false;

    splits = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    lagTime = [0, 0, 0, 0, 0, 0, 0, 0];
    currPhase = 0

    supplies = []

    grabbedPres = []

    freshCount = 0
    freshes = []

    unregisterListener();

    if (p6Listener) {
        p6Listener.unregister();
        p6Listener = null;
    }

    if (p7Listener) {
        p7Listener.unregister();
        p7Listener = null;
    }

    tickCount = 0;
    packetCount = 0;
}

register("worldLoad", () => {
    endRun();
})

register("chat", () => { // Start of run
    endRun() // just in case?
    registerListener() // tick counter

    inKuudra = true;

    if (!settings.kuudraTrack) return;

    if (getKuudraFlag()) {
        const newParty = getParty()
        if (!arraysEqual(newParty, currParty)) {
            if (settings.ktPartyReset) {
                rsKT()
            } // clears at start of new run and only if party has actually changed, prevents false flags on reparty
            currParty = newParty
            if (settings.supplyTrack) {
                preConsistency = []
                for (let i = 0; i < currParty.length; i++) {
                    preConsistency.push([currParty[i],0,0,0]) //member, hit, nospawn, missed
                }
            }
        }
        useKuudraFlag()
    }

    splits[0] = Date.now() / 1000;
}).setCriteria("[NPC] Elle: Okay adventurers, I will go and fish up Kuudra!")

export function getKuudra() {
    let cubes = World.getAllEntitiesOfType(EntityMagmaCube.class)
    return cubes.find((cube) => cube.getWidth().toFixed(1) == 15.3 && cube.getEntity().func_110143_aJ() <= 100000);
}

register("chat", () => { // Crate Spawn
    currPhase = 1
    clearLag(0);

    if (!(settings.kuudraTrack && inKuudra)) return;
    splits[1] = Date.now() / 1000;
}).setCriteria("[NPC] Elle: Not again!")

let supplies = []

let grabbedPres = []
register("chat", (player, supply) => {
    if (!(settings.kuudraTrack && settings.supplyTrack)) return;
    let lSup = supply.toLowerCase()
    if (lSup === "x" || lSup === "triangle" || lSup === "slash" || lSup === "equals") {
        grabbedPres.push(stripRank(player))
        for (let i = 0; i < preConsistency.length; i++) { // find player in consistency
            if (stripRank(player) === preConsistency[i][0]) {
                preConsistency[i][2]++;
            }
        }
    }
}).setCriteria("Party > ${player}: No ${supply}!")

register("chat", (player) => { // Players have 8 seconds to grab pre before it is considered "failed"
    if (!(settings.kuudraTrack && settings.supplyTrack && getPhase() === 1)) return;
    supplies.push([stripRank(player), getSplitTime()])
    if (getUnformattedNoLagSplitTime() < 8 + settings.preLeeway) {
        grabbedPres.push(stripRank(player))
        for (let i = 0; i < preConsistency.length; i++) { // find player in consistency
            if (stripRank(player) === preConsistency[i][0]) {
                preConsistency[i][1]++;
                break;
            }
        }
    }
}).setCriteria("${player} recovered one of Elle's supplies${*}")

register("chat", () => { // Build Start
    if (getPhase() !== 1) return;
    currPhase = 2

    clearLag(1);

    if (!settings.kuudraTrack) return;
    if (settings.supplyTrack) {
        // find missed pres here! stops it from breaking when a member doesnt place at all (former bug)
        let missed = currParty.length - grabbedPres.length;
        let missedPres = []
        if (missed > 0) { // only search when someone misses
            for (let i = 0; i < currParty.length; i++) {
                if (grabbedPres.includes(currParty[i])) { continue; }
                missedPres.push(currParty[i]);
                for (let k = 0; k < preConsistency.length; k++) { // find player in consistency
                    if (currParty[i] === preConsistency[k][0]) {
                        preConsistency[k][3]++;
                        break;
                    }
                }
            }
        }
        if (settings.missedPre) {
            let presMessage = `Missed Pres:`
            for (let i = 0; i < grabbedPres.length; i++) {
                presMessage += `\n&b&l${grabbedPres[i]} &r&a&lgrabbed &rtheir pre`;
            }
            for (let i = 0; i < missedPres.length; i++) {
                presMessage += `\n&b&l${missedPres[i]} &r&c&lmissed &rtheir pre`;
            }
            sendMessage(presMessage)
        }
        if (settings.supplyTrackMessage) {
            let supplyMessage = `&fSupplies Overview:`
            for (let i = 0; i < supplies.length; i++) {
                supplyMessage += `\n&b&l${supplies[i][0]} &rrecovered a supply at &a&l${supplies[i][1]}`;
            }
            sendMessage(supplyMessage)
        }
    }

    splits[2] = Date.now() / 1000;
}).setCriteria("[NPC] Elle: OMG! Great work collecting my supplies!")

let freshCount = 0
let freshes = []
register("chat", (player) => {
    if (!(settings.kuudraTrack && settings.freshTrack && getPhase() === 2)) return;
    freshCount++;
    freshes.push([stripRank(player), getSplitTime()])
}).setCriteria("Party > ${player}: FRESH")

register("chat", (player) => {
    if (!(settings.kuudraTrack && settings.freshTrack && getPhase() === 2)) return;
    freshCount++;
    freshes.push([stripRank(player), getSplitTime()])
}).setCriteria("Party > ${player}: FRESH${*}") // Accounts for different fresh messages

register("chat", () => { // Build Done
    if (getPhase() !== 2) return;
    currPhase = 3

    clearLag(2);

    if (!settings.kuudraTrack) return;
    if (settings.freshTrack && settings.freshTrackMessage) {
        let freshMessage = `&e&lMeow&f&lMayo &a>&r &a&l${freshCount} &r&ffreshes detected`
        for (let i = 0; i < freshes.length; i++) {
            freshMessage += `\n&b&l${freshes[i][0]} &rFreshed at &a&l${freshes[i][1]}`;
        }
        ChatLib.chat(freshMessage)
    }
    splits[3] = Date.now() / 1000;
}).setCriteria("[NPC] Elle: Phew! The Ballista is finally ready! It should be strong enough to tank Kuudra's blows now!")

register("chat", (Player) => { // Eaten
    if (Player === "Elle" || Player.length > 18 || getPhase() !== 3) return
    currPhase = 4

    clearLag(3);

    if (!settings.kuudraTrack) return;
    splits[4] = Date.now() / 1000;
}).setCriteria("${Player} has been eaten by Kuudra!")

function registerP7() {
    p7Listener = register('tick', () => {
        if (Math.round(Player.getY()) > 10) return;
        currPhase = 7

        clearLag(6);

        if (settings.kuudraTrack) {
            splits[7] = Date.now() / 1000;
        }

        if (p7Listener) {
            p7Listener.unregister();
            p7Listener = null;
        }
    })
}

function registerP6() {
    p6Listener = register("tick", () => {
        if (getKuudra() === undefined) return;

        let kuudraHP = getKuudra().getEntity().func_110143_aJ()

        if (settings.stunPing) {
            if (kuudraHP < (settings.pingTime*1000)) {
                makeAlert("THROW PEARL", "random.anvil_land")
            }
        }

        if (kuudraHP > 25001) return;
        currPhase = 6

        clearLag(5);

        registerP7()

        if (settings.kuudraTrack) {
            splits[6] = Date.now() / 1000;
        }

        if (p6Listener) {
            p6Listener.unregister();
            p6Listener = null;
        }
    });
}

register("chat", () => { // Stunned
    if (!(getPhase() === 4 || getPhase() === 3)) return;
    currPhase = 5

    registerP6()


    if (splits[4] === 0) { // Account for messages not sending in order (somehow?)
        clearLag(3);
    } else {
        clearLag(4);
    }

    if (!settings.kuudraTrack) return;
    if (splits[4] === 0) {
        splits[4] = Date.now() / 1000;
    }
    splits[5] = Date.now() / 1000;
}).setCriteria("${Player} destroyed one of Kuudra's pods!")

let stats = {
    "totalRuns": 0,
    "totalComps": 0,
    "totalTime": 0.0,
    "totalCompTime": 0.0,
    "fastest": -1.0,
    "fastestLag": -1.0,
    "fastestSplits": [0, 0, 0, 0, 0, 0, 0, 0],
    "fastestSupplies": [],
    "fastestFreshCount": -1,
    "fastestFresh": [],
    "fastestLagSplits": [0, 0, 0, 0, 0, 0, 0, 0],
    "slowest": -1.0,
    "slowestLag": -1.0,
    "slowestSplits": [0, 0, 0, 0, 0, 0, 0, 0],
    "slowestSupplies": [],
    "slowestFreshCount": -1,
    "slowestFresh": [],
    "slowestLagSplits": [0, 0, 0, 0, 0, 0, 0, 0],
    "compSplitTimes": [0, 0, 0, 0, 0, 0, 0, 0],
    "totalLag": 0.0,
    "compLagTimes": [0, 0, 0, 0, 0, 0, 0, 0]
}

export function getStat(stat) {
    return stats[stat];
}

let globalStats = {
    "totalRuns": 0,
    "totalComps": 0,
    "totalTime": 0.0,
    "totalCompTime": 0.0,
    "fastest": -1.0,
    "fastestLag": -1.0,
    "fastestSplits": [0, 0, 0, 0, 0, 0, 0, 0],
    "fastestSupplies": [],
    "fastestFreshCount": -1,
    "fastestFresh": [],
    "fastestLagSplits": [0, 0, 0, 0, 0, 0, 0, 0],
    "slowest": -1.0,
    "slowestLag": -1.0,
    "slowestSplits": [0, 0, 0, 0, 0, 0, 0, 0],
    "slowestSupplies": [],
    "slowestFreshCount": -1,
    "slowestFresh": [],
    "slowestLagSplits": [0, 0, 0, 0, 0, 0, 0, 0],
    "compSplitTimes": [0, 0, 0, 0, 0, 0, 0, 0],
    "totalLag": 0.0,
    "compLagTimes": [0, 0, 0, 0, 0, 0, 0, 0]
}

export function getGlobalStat(stat) {
    return globalStats[stat];
}

export function getPreData() {
    return preConsistency
}

register("chat", () => { // Failed
    if (settings.kuudraTrack && inKuudra) {
        stats.totalRuns++;
        globalStats.totalRuns++;
        stats.totalTime += (Date.now() / 1000) - splits[0];
        globalStats.totalTime += (Date.now() / 1000) - splits[0];
        saveGlobalStats()
    }
    endRun()
}).setCriteria("${filler}DEFEAT")

register("chat", () => { // Success
    clearLag(7);

    if (settings.kuudraTrack && inKuudra) {
        splits[8] = Date.now() / 1000

        // TODO: ADD CHECK THAT ALL SPLITS ARE VALID!

        let runTime = parseFloat((splits[8] - splits[0]).toFixed(3))

        stats.totalRuns++;
        globalStats.totalRuns++;
        stats.totalComps++;
        globalStats.totalComps++;
        stats.totalTime += runTime;
        globalStats.totalTime += runTime;
        stats.totalCompTime += runTime;
        globalStats.totalCompTime += runTime;

        let runSplits = [
            parseFloat((splits[1] - splits[0]).toFixed(3)),
            parseFloat((splits[2] - splits[1]).toFixed(3)),
            parseFloat((splits[3] - splits[2]).toFixed(3)),
            parseFloat((splits[4] - splits[3]).toFixed(3)),
            parseFloat((splits[5] - splits[4]).toFixed(3)),
            parseFloat((splits[6] - splits[5]).toFixed(3)),
            parseFloat((splits[7] - splits[6]).toFixed(3)),
            parseFloat((splits[8] - splits[7]).toFixed(3))
        ]

        let runLag = 0

        for (let i = 0; i < 8; i++) {
            stats.compSplitTimes[i] += parseFloat(runSplits[i].toFixed(3));
            globalStats.compSplitTimes[i] += parseFloat(runSplits[i].toFixed(3));
            stats.compLagTimes[i] += parseFloat(lagTime[i].toFixed(3));
            globalStats.compLagTimes[i] += parseFloat(lagTime[i].toFixed(3));
            runLag += parseFloat(lagTime[i].toFixed(3))

            stats.compSplitTimes[i] = parseFloat(stats.compSplitTimes[i].toFixed(3));
            globalStats.compSplitTimes[i] = parseFloat(stats.compSplitTimes[i].toFixed(3));
            stats.compLagTimes[i] = parseFloat(stats.compLagTimes[i].toFixed(3));
            globalStats.compLagTimes[i] = parseFloat(stats.compLagTimes[i].toFixed(3));
        }

        runLag = parseFloat(runLag.toFixed(3));

        if (runTime > stats.slowest || stats.slowest === -1) {
            stats.slowest = runTime;
            stats.slowestLag = runLag;
            stats.slowestSplits = runSplits;
            stats.slowestLagSplits = lagTime;

            stats.slowestSupplies = supplies

            stats.slowestFreshCount = freshCount
            stats.slowestFresh = freshes
        }

        if (runTime > globalStats.slowest || globalStats.slowest === -1) {
            globalStats.slowest = runTime;
            globalStats.slowestLag = runLag;
            globalStats.slowestSplits = runSplits;
            globalStats.slowestLagSplits = lagTime;

            globalStats.slowestSupplies = supplies

            globalStats.slowestFreshCount = freshCount
            globalStats.slowestFresh = freshes
        }

        if (runTime < stats.fastest || stats.fastest === -1) {
            stats.fastest = runTime;
            stats.fastestLag = runLag
            stats.fastestSplits = runSplits;
            stats.fastestLagSplits = lagTime

            stats.fastestSupplies = supplies

            stats.fastestFreshCount = freshCount
            stats.fastestFresh = freshes
        }

        if (runTime < globalStats.fastest || globalStats.fastest === -1) {
            globalStats.fastest = runTime;
            globalStats.fastestLag = runLag;
            globalStats.fastestSplits = runSplits;
            globalStats.fastestLagSplits = lagTime;

            globalStats.fastestSupplies = supplies

            globalStats.fastestFreshCount = freshCount
            globalStats.fastestFresh = freshes
        }


        stats.totalLag += parseFloat(runLag);
        globalStats.totalLag += parseFloat(runLag)

        if (settings.lagMessage) {
            ChatLib.command(`pc ${formatTime(parseFloat(runLag))} Lost to server lag | No Lag Time: ${formatTime(parseFloat((runTime - runLag).toFixed(3)))}`)
        }
        ChatLib.chat(`&e&lMeow&f&lMayo &a>&r &c&l${formatTime(parseFloat(runLag))} &r&fLost to server lag | No Lag Time: &a&l${formatTime(parseFloat((runTime - runLag).toFixed(3)))}`)
        ChatLib.chat(
            `&e&lMeow&f&lMayo &a>&r&f Total Run Time: &a&l${formatTime(parseFloat(runTime))}\n` +
            `&2||&r&f Crates took &a&l${formatTime(parseFloat(runSplits[0]))}&r&f to spawn\n` +
            `&2||==&r&f Lost &c&l${formatTime(parseFloat(lagTime[0]))}&r&f to lag\n` +
            `&2||&r&f Supplies took &a&l${formatTime(parseFloat(runSplits[1]))}&r&f to finish\n` +
            `&2||==&r&f Lost &c&l${formatTime(parseFloat(lagTime[1]))}&r&f to lag\n` +
            `&2||&r&f Build took &a&l${formatTime(parseFloat(runSplits[2]))}&r&f to finish\n` +
            `&2||==&r&f Lost &c&l${formatTime(parseFloat(lagTime[2]))}&r&f to lag\n` +
            `&2||&r&f Cannon took &a&l${formatTime(parseFloat(runSplits[3]))}&r&f to launch\n` +
            `&2||==&r&f Lost &c&l${formatTime(parseFloat(lagTime[3]))}&r&f to lag\n` +
            `&2||&r&f Kuudra took &a&l${formatTime(parseFloat(runSplits[4]))}&r&f to stun\n` +
            `&2||==&r&f Lost &c&l${formatTime(parseFloat(lagTime[4]))}&r&f to lag\n` +
            `&2||&r&f DPS took &a&l${formatTime(parseFloat(runSplits[5]))}&r&f to finish\n` +
            `&2||==&r&f Lost &c&l${formatTime(parseFloat(lagTime[5]))}&r&f to lag\n` +
            `&2||&r&f Skip took &a&l${formatTime(parseFloat(runSplits[6]))}\n` +
            `&2||==&r&f Lost &c&l${formatTime(parseFloat(lagTime[6]))}&r&f to lag\n` +
            `&2||&r&f Final Phase took &a&l${formatTime(parseFloat(runSplits[7]))}\n` +
            `&2||==&r&f Lost &c&l${formatTime(parseFloat(lagTime[7]))}&r&f to lag`
        )

        saveGlobalStats()
    }

    endRun()
}).setCriteria("${filler}KUUDRA DOWN!")

export function fetchGlobalStats() {
    if (FileLib.exists("MeowMayo", "kuudratimestats.json")) {
        let configData = FileLib.read("MeowMayo", "kuudratimestats.json") // change the whitespace to just remove beforehand lol :D
        // possibly the most disgusting way to validate a json structure?
        const regex = /\{((?:\r?\n)?)\s*"totalRuns"\s*:\s*(-?[0-9]+)\s*,\1\s*"totalComps"\s*:\s*(-?[0-9]+)\s*,\1\s*"totalTime"\s*:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)\s*,\1\s*"totalCompTime"\s*:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)\s*,\1\s*"fastest"\s*:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)\s*,\1\s*"fastestLag"\s*:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)\s*,\1\s*"fastestSplits":\s*\[(?:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)(?:\s*,\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+))*)?\],\1\s*"fastestSupplies":\s*\[(?:\s*(?:\[\s*\"[^"]*\"\s*,\s*\"[^"]*\"\s*\]\s*,\s*)*\s*\[\"[^"]*\"\s*,\s*\"[^"]*\"\]\s*\s*)?\],\1\s*"fastestFreshCount"\s*:\s*(-?[0-9]+)\s*,\1\s*"fastestFresh":\s*\[(?:\s*(?:\[\s*\"[^"]*\"\s*,\s*\"[^"]*\"\s*\]\s*,\s*)*\s*\[\"[^"]*\"\s*,\s*\"[^"]*\"\]\s*\s*)?\],\1\s*"fastestLagSplits":\s*\[(?:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)(?:\s*,\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+))*)?\],\1\s*"slowest"\s*:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)\s*,\1\s*"slowestLag"\s*:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)\s*,\1\s*"slowestSplits":\s*\[(?:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)(?:\s*,\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+))*)?\],\1\s*"slowestSupplies":\s*\[(?:\s*(?:\[\s*\"[^"]*\"\s*,\s*\"[^"]*\"\s*\]\s*,\s*)*\s*\[\"[^"]*\"\s*,\s*\"[^"]*\"\]\s*\s*)?\],\1\s*"slowestFreshCount"\s*:\s*(-?[0-9]+)\s*,\1\s*"slowestFresh":\s*\[(?:\s*(?:\[\s*\"[^"]*\"\s*,\s*\"[^"]*\"\s*\]\s*,\s*)*\s*\[\"[^"]*\"\s*,\s*\"[^"]*\"\]\s*\s*)?\],\1\s*"slowestLagSplits":\s*\[(?:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)(?:\s*,\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+))*)?\],\1\s*"compSplitTimes":\s*\[(?:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)(?:\s*,\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+))*)?\],\1\s*"totalLag"\s*:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)\s*,\1\s*"compLagTimes":\s*\[(?:\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+)(?:\s*,\s*(?:[+-]?(?:[0-9]*[.])?[0-9]+))*)?\],?\1}/;
        if (regex.test(configData)) {
            sendMessage("Successfully Loaded KT Stats")
            globalStats = JSON.parse(configData.match(regex)[0])
        } else {
            sendMessage("Error Loading KT Stats")
            saveGlobalStats()
        }
        return;
    }
    sendMessage("No KT Stats Found")
    saveGlobalStats()
}

export function saveGlobalStats() {
    FileLib.write("MeowMayo", "kuudratimestats.json", JSON.stringify(globalStats));
}

export function rsKT() {
    stats.totalRuns = 0;
    stats.totalComps = 0
    stats.totalTime = 0.0;
    stats.totalCompTime = 0.0;
    stats.fastest = -1.0;
    stats.fastestLag = -1.0;
    stats.fastestSplits = [0, 0, 0, 0, 0, 0, 0, 0];
    stats.fastestSupplies = []
    stats.fastestFreshCount = -1;
    stats.fastestFresh = []
    stats.fastestLagSplits  = [0, 0, 0, 0, 0, 0, 0, 0];
    stats.slowest = -1.0;
    stats.slowestLag = -1.0;
    stats.slowestSplits = [0, 0, 0, 0, 0, 0, 0, 0];
    stats.slowestSupplies = []
    stats.slowestFreshCount = -1;
    stats.slowestFresh = []
    stats.slowestLagSplits  = [0, 0, 0, 0, 0, 0, 0, 0];
    stats.compSplitTimes = [0, 0, 0, 0, 0, 0, 0, 0];
    stats.totalLag = 0.0
    stats.compLagTimes = [0, 0, 0, 0, 0, 0, 0, 0];
}

export function rsGlobalKT() {
    globalStats.totalRuns = 0;
    globalStats.totalComps = 0
    globalStats.totalTime = 0.0;
    globalStats.totalCompTime = 0.0;
    globalStats.fastest = -1.0;
    globalStats.fastestLag = -1.0;
    globalStats.fastestSplits = [0, 0, 0, 0, 0, 0, 0, 0];
    globalStats.fastestSupplies = []
    globalStats.fastestFreshCount = -1;
    globalStats.fastestFresh = []
    globalStats.fastestLagSplits  = [0, 0, 0, 0, 0, 0, 0, 0];
    globalStats.slowest = -1.0;
    globalStats.slowestLag = -1.0;
    globalStats.slowestSplits = [0, 0, 0, 0, 0, 0, 0, 0];
    globalStats.slowestSupplies = []
    globalStats.slowestFreshCount = -1;
    globalStats.slowestFresh = []
    globalStats.slowestLagSplits  = [0, 0, 0, 0, 0, 0, 0, 0];
    globalStats.compSplitTimes = [0, 0, 0, 0, 0, 0, 0, 0];
    globalStats.totalLag = 0.0
    globalStats.compLagTimes = [0, 0, 0, 0, 0, 0, 0, 0];
    saveGlobalStats()
}
