import {getStat, getGlobalStat, saveGlobalStats, rsGlobalKT, rsKT, getPreData} from "./KuudraTimings";
import settings from "../../settings";
import {sendMessage} from "../../utils/chat";
import {formatTime} from "../../utils/Formats";

register("command", (...args) => {
    if (args[0] === "global") {
        rsGlobalKT()
        ChatLib.chat("&e&lMeow&f&lMayo &a>&r Cleared Globally Tracked Runs")
        return;
    }
    rsKT()
    ChatLib.chat("&e&lMeow&f&lMayo &a>&r Cleared Tracked Runs")
}).setName("resetkuudratime").setAliases("rskt", "resetkt")

register("command", (...args) => {
    if (!settings.kuudraTrack) {
        sendMessage("You are currently not tracking run data")
        return
    }
    if (args[0] === "global") {
        if (getGlobalStat("totalRuns") === 0) {
            sendMessage("No global run data is available")
            return
        }

        switch (args[1]) {
            case "help":
                ChatLib.chat("&e&lMeow&f&lMayo &a>&r Kuudra Global Run Tracker:")
                ChatLib.chat(`&2=&r View General stats with /kuudratime global`)
                ChatLib.chat(`&2=&r View Fastest Run Splits with /kuudratime global fastest`)
                ChatLib.chat(`&2=&r View Slowest Run Splits with /kuudratime global slowest`)
                ChatLib.chat(`&2=&r View Total Run Split times with /kuudratime global total`)
                ChatLib.chat(`&2=&r View Total times lost to lag with /kuudratime global lag`)
                return;
            case "fastest":
                ChatLib.chat(
                    "&e&lMeow&f&lMayo &a>&r &4Kuudra &r&fFastest Run Stats:\n" +
                    `&r&2|| &r&fCompletion Time: &a&l${formatTime(getGlobalStat("fastest"))}\n` +
                    `&r&2|| &r&fLag Time Loss: &c&l${formatTime(getGlobalStat("fastestLag"))}`
                )
                let fastestMessage = `&r&2|| --==-- &f&lSplit Breakdown &r&2--==--\n` +
                    `&2||&r&f Crates took &a&l${formatTime(parseFloat(getGlobalStat("fastestSplits")[0]))}&r&f to spawn\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("fastestLagSplits")[0]))}&r&f to lag\n` +
                    `&2||&r&f Supplies took &a&l${formatTime(parseFloat(getGlobalStat("fastestSplits")[1]))}&r&f to finish\n`;

                if (getGlobalStat("fastestSupplies").length === 6) {
                    fastestMessage += `&2||=&r&f Supplies retrieved at: &a&l${getGlobalStat("fastestSupplies")[0][1]} &a&l${getGlobalStat("fastestSupplies")[1][1]} &a&l${getGlobalStat("fastestSupplies")[2][1]} &a&l${getGlobalStat("fastestSupplies")[3][1]} &a&l${getGlobalStat("fastestSupplies")[4][1]} &a&l${getGlobalStat("fastestSupplies")[5][1]}\n`;
                }

                fastestMessage += `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("fastestLagSplits")[1]))}&r&f to lag\n&2||&r&f Build took &a&l${formatTime(parseFloat(getGlobalStat("fastestSplits")[2]))}&r&f to finish\n`;

                if (getGlobalStat("fastestFreshCount") > 0) {
                    fastestMessage += `&2||=&r&f Freshed ${getGlobalStat("fastestFreshCount")} times:`;
                    for (let i = 0; i < getGlobalStat("fastestFresh").length; i++) {
                        fastestMessage += ` &a&l${getGlobalStat("fastestFresh")[i][1]}`
                    }
                }

                fastestMessage += (
                    `\n&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("fastestLagSplits")[2]))}&r&f to lag\n` +
                    `&2||&r&f Cannon took &a&l${formatTime(parseFloat(getGlobalStat("fastestSplits")[3]))}&r&f to launch\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("fastestLagSplits")[3]))}&r&f to lag\n` +
                    `&2||&r&f Kuudra took &a&l${formatTime(parseFloat(getGlobalStat("fastestSplits")[4]))}&r&f to stun\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("fastestLagSplits")[4]))}&r&f to lag\n` +
                    `&2||&r&f DPS took &a&l${formatTime(parseFloat(getGlobalStat("fastestSplits")[5]))}&r&f to finish\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("fastestLagSplits")[5]))}&r&f to lag\n` +
                    `&2||&r&f Skip took &a&l${formatTime(parseFloat(getGlobalStat("fastestSplits")[6]))}\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("fastestLagSplits")[6]))}&r&f to lag\n` +
                    `&2||&r&f Final Phase took &a&l${formatTime(parseFloat(getGlobalStat("fastestSplits")[7]))}\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("fastestLagSplits")[7]))}&r&f to lag`
                )

                ChatLib.chat(fastestMessage)
                return;
            case "slowest":
                ChatLib.chat(
                    "&e&lMeow&f&lMayo &a>&r &4Kuudra &r&fSlowest Run Stats:\n" +
                    `&r&2|| &r&fCompletion Time: &a&l${formatTime(getGlobalStat("slowest"))}\n` +
                    `&r&2|| &r&fLag Time Loss: &c&l${formatTime(getGlobalStat("slowestLag"))}`
                )
                let slowestMessage = `&r&2|| --==-- &f&lSplit Breakdown &r&2--==--\n` +
                    `&2||&r&f Crates took &a&l${formatTime(parseFloat(getGlobalStat("slowestSplits")[0]))}&r&f to spawn\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("slowestLagSplits")[0]))}&r&f to lag\n` +
                    `&2||&r&f Supplies took &a&l${formatTime(parseFloat(getGlobalStat("slowestSplits")[1]))}&r&f to finish\n`;

                if (getGlobalStat("slowestSupplies").length === 6) {
                    slowestMessage += `&2||=&r&f Supplies retrieved at: &a&l${getGlobalStat("slowestSupplies")[0][1]} &a&l${getGlobalStat("slowestSupplies")[1][1]} &a&l${getGlobalStat("slowestSupplies")[2][1]} &a&l${getGlobalStat("slowestSupplies")[3][1]} &a&l${getGlobalStat("slowestSupplies")[4][1]} &a&l${getGlobalStat("slowestSupplies")[5][1]}\n`
                }

                slowestMessage += `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("slowestLagSplits")[1]))}&r&f to lag\n&2||&r&f Build took &a&l${formatTime(parseFloat(getGlobalStat("slowestSplits")[2]))}&r&f to finish\n`;

                if (getGlobalStat("slowestFreshCount") > 0) {
                    slowestMessage += `&2||=&r&f Freshed ${getGlobalStat("slowestFreshCount")} times:`;
                    for (let i = 0; i < getGlobalStat("slowestFresh").length; i++) {
                        slowestMessage += ` &a&l${getGlobalStat("slowestFresh")[i][1]}`
                    }
                }

                slowestMessage += (
                    `\n&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("slowestLagSplits")[2]))}&r&f to lag\n` +
                    `&2||&r&f Cannon took &a&l${formatTime(parseFloat(getGlobalStat("slowestSplits")[3]))}&r&f to launch\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("slowestLagSplits")[3]))}&r&f to lag\n` +
                    `&2||&r&f Kuudra took &a&l${formatTime(parseFloat(getGlobalStat("slowestSplits")[4]))}&r&f to stun\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("slowestLagSplits")[4]))}&r&f to lag\n` +
                    `&2||&r&f DPS took &a&l${formatTime(parseFloat(getGlobalStat("slowestSplits")[5]))}&r&f to finish\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("slowestLagSplits")[5]))}&r&f to lag\n` +
                    `&2||&r&f Skip took &a&l${formatTime(parseFloat(getGlobalStat("slowestSplits")[6]))}\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("slowestLagSplits")[6]))}&r&f to lag\n` +
                    `&2||&r&f Final Phase took &a&l${formatTime(parseFloat(getGlobalStat("slowestSplits")[7]))}\n` +
                    `&2||==&r&f Lost &c&l${formatTime(parseFloat(getGlobalStat("slowestLagSplits")[7]))}&r&f to lag`
                )

                ChatLib.chat(slowestMessage)
                return;
            case "total":
                ChatLib.chat(
                    `Total Time Per Split\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compSplitTimes")[0]))} &r&fspent waiting for crates\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compSplitTimes")[1]))} &r&fspent fishing up supplies\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compSplitTimes")[2]))} &r&fspent building the ballista\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compSplitTimes")[3]))} &r&fspent launching stunners\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compSplitTimes")[4]))} &r&fspent beating up pods\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compSplitTimes")[5]))} &r&fspent firing at the C U B E\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compSplitTimes")[6]))} &r&fspent missing skip (not really)\n` +
                    `&2\\ &a&l${formatTime(parseFloat(getGlobalStat("compSplitTimes")[7]))} &r&fspent forgetting how to rend\n`
                )
                return;
            case "lag":
                ChatLib.chat(
                    `Total Time Lost to Lag\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compLagTimes")[0]))} &r&fbefore crates\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compLagTimes")[1]))} &r&fduring supplies\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compLagTimes")[2]))} &r&fduring build\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compLagTimes")[3]))} &r&fduring cannon\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compLagTimes")[4]))} &r&fduring stun\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compLagTimes")[5]))} &r&fduring DPS\n` +
                    `&2|| &a&l${formatTime(parseFloat(getGlobalStat("compLagTimes")[6]))} &r&fduring skip\n` +
                    `&2\\ &a&l${formatTime(parseFloat(getGlobalStat("compLagTimes")[7]))} &r&fduring final phase\n`
                )
                return;
            default:
                ChatLib.chat("&e&lMeow&f&lMayo &a>&r &4Kuudra Total Run Stats:")
                ChatLib.chat(` &2| &r&fRuns Tracked: &a&l${getGlobalStat("totalRuns")}`)
                ChatLib.chat(` &2| &r&fRuns Completed: &a&l${getGlobalStat("totalComps")}`)
                ChatLib.chat(` &2| &r&fAverage Comp Time: &a&l${formatTime(Math.round(getGlobalStat("totalCompTime") / getGlobalStat("totalComps")))}`)
                ChatLib.chat(` &2| &r&fTotal Comp Time: &a&l${formatTime(getGlobalStat("totalCompTime"))}`)
                ChatLib.chat(` &2| &r&fTotal Lag Time: &c&l${formatTime(getGlobalStat("totalLag"))}`)
                ChatLib.chat(` &2| &r&fFailed Run Wasted Time: &c&l${formatTime(getGlobalStat("totalTime") - getGlobalStat("totalCompTime"))}`)
                ChatLib.chat(` &2| &r&fAverage Run Time: &a&l${formatTime(Math.round(getGlobalStat("totalTime") / getGlobalStat("totalRuns")))}`)
                ChatLib.chat(` &2| &r&fFastest Run Time: &a&l${formatTime(getGlobalStat("fastest"))}`)
                ChatLib.chat(` &2| &r&fSlowest Run Time: &c&l${formatTime(getGlobalStat("slowest"))}`)
                return;
        }
        return
    }
    if (getStat("totalRuns") === 0) {
        ChatLib.chat("&e&lMeow&f&lMayo &a>&r No run data for this session is available")
        return
    }

    switch (args[0]) {
        case "help":
            ChatLib.chat("&e&lMeow&f&lMayo &a>&r Kuudra Run Tracker:")
            ChatLib.chat(`&2=&r View General stats with /kuudratime`)
            ChatLib.chat(`&2=&r View Fastest Run Splits with /kuudratime fastest`)
            ChatLib.chat(`&2=&r View Slowest Run Splits with /kuudratime slowest`)
            ChatLib.chat(`&2=&r View Total Run Split times with /kuudratime total`)
            ChatLib.chat(`&2=&r View Total times lost to lag with /kuudratime lag`)
            ChatLib.chat(`&2=&r View Pre Consistency with /kuudratime pres - (Requires supplyTrack to be enabled)`)
            ChatLib.chat(`&2=&r View Overall Stats with /kuudratime global`)
            return;
        case "fastest":
            ChatLib.chat(
                "&e&lMeow&f&lMayo &a>&r &4Kuudra &r&fFastest Run Stats:\n" +
                `&r&2|| &r&fCompletion Time: &a&l${formatTime(getStat("fastest"))}\n` +
                `&r&2|| &r&fLag Time Loss: &c&l${formatTime(getStat("fastestLag"))}`
            )
            let fastestMessage = `&r&2|| --==-- &f&lSplit Breakdown &r&2--==--\n` +
                `&2||&r&f Crates took &a&l${formatTime(parseFloat(getStat("fastestSplits")[0]))}&r&f to spawn\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("fastestLagSplits")[0]))}&r&f to lag\n` +
                `&2||&r&f Supplies took &a&l${formatTime(parseFloat(getStat("fastestSplits")[1]))}&r&f to finish\n`;

            if (getStat("fastestSupplies").length === 6) {
                fastestMessage += `&2||=&r&f Supplies retrieved at: &a&l${getStat("fastestSupplies")[0][1]} &a&l${getStat("fastestSupplies")[1][1]} &a&l${getStat("fastestSupplies")[2][1]} &a&l${getStat("fastestSupplies")[3][1]} &a&l${getStat("fastestSupplies")[4][1]} &a&l${getStat("fastestSupplies")[5][1]}\n`;
            }

            fastestMessage += `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("fastestLagSplits")[1]))}&r&f to lag\n&2||&r&f Build took &a&l${formatTime(parseFloat(getStat("fastestSplits")[2]))}&r&f to finish\n`;

            if (getStat("fastestFreshCount") > 0) {
                fastestMessage += `&2||=&r&f Freshed ${getStat("fastestFreshCount")} times:`;
                for (let i = 0; i < getStat("fastestFresh").length; i++) {
                    fastestMessage += ` &a&l${getStat("fastestFresh")[i][1]}`
                }
            }

            fastestMessage += (
                `\n&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("fastestLagSplits")[2]))}&r&f to lag\n` +
                `&2||&r&f Cannon took &a&l${formatTime(parseFloat(getStat("fastestSplits")[3]))}&r&f to launch\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("fastestLagSplits")[3]))}&r&f to lag\n` +
                `&2||&r&f Kuudra took &a&l${formatTime(parseFloat(getStat("fastestSplits")[4]))}&r&f to stun\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("fastestLagSplits")[4]))}&r&f to lag\n` +
                `&2||&r&f DPS took &a&l${formatTime(parseFloat(getStat("fastestSplits")[5]))}&r&f to finish\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("fastestLagSplits")[5]))}&r&f to lag\n` +
                `&2||&r&f Skip took &a&l${formatTime(parseFloat(getStat("fastestSplits")[6]))}\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("fastestLagSplits")[6]))}&r&f to lag\n` +
                `&2||&r&f Final Phase took &a&l${formatTime(parseFloat(getStat("fastestSplits")[7]))}\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("fastestLagSplits")[7]))}&r&f to lag`
            )

            ChatLib.chat(fastestMessage)
            return;
        case "slowest":
            ChatLib.chat(
                "&e&lMeow&f&lMayo &a>&r &4Kuudra &r&fSlowest Run Stats:\n" +
                `&r&2|| &r&fCompletion Time: &a&l${formatTime(getStat("slowest"))}\n` +
                `&r&2|| &r&fLag Time Loss: &c&l${formatTime(getStat("slowestLag"))}`
            )
            let slowestMessage = `&r&2|| --==-- &f&lSplit Breakdown &r&2--==--\n` +
                `&2||&r&f Crates took &a&l${formatTime(parseFloat(getStat("slowestSplits")[0]))}&r&f to spawn\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("slowestLagSplits")[0]))}&r&f to lag\n` +
                `&2||&r&f Supplies took &a&l${formatTime(parseFloat(getStat("slowestSplits")[1]))}&r&f to finish\n`;

            if (getStat("slowestSupplies").length === 6) {
                slowestMessage += `&2||=&r&f Supplies retrieved at: &a&l${getStat("slowestSupplies")[0][1]} &a&l${getStat("slowestSupplies")[1][1]} &a&l${getStat("slowestSupplies")[2][1]} &a&l${getStat("slowestSupplies")[3][1]} &a&l${getStat("slowestSupplies")[4][1]} &a&l${getStat("slowestSupplies")[5][1]}\n`
            }

            slowestMessage += `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("slowestLagSplits")[1]))}&r&f to lag\n&2||&r&f Build took &a&l${formatTime(parseFloat(getStat("slowestSplits")[2]))}&r&f to finish\n`;

            if (getStat("slowestFreshCount") > 0) {
                slowestMessage += `&2||=&r&f Freshed ${getStat("slowestFreshCount")} times:`;
                for (let i = 0; i < getStat("slowestFresh").length; i++) {
                    slowestMessage += ` &a&l${getStat("slowestFresh")[i][1]}`
                }
            }

            slowestMessage += (
                `\n&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("slowestLagSplits")[2]))}&r&f to lag\n` +
                `&2||&r&f Cannon took &a&l${formatTime(parseFloat(getStat("slowestSplits")[3]))}&r&f to launch\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("slowestLagSplits")[3]))}&r&f to lag\n` +
                `&2||&r&f Kuudra took &a&l${formatTime(parseFloat(getStat("slowestSplits")[4]))}&r&f to stun\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("slowestLagSplits")[4]))}&r&f to lag\n` +
                `&2||&r&f DPS took &a&l${formatTime(parseFloat(getStat("slowestSplits")[5]))}&r&f to finish\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("slowestLagSplits")[5]))}&r&f to lag\n` +
                `&2||&r&f Skip took &a&l${formatTime(parseFloat(getStat("slowestSplits")[6]))}\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("slowestLagSplits")[6]))}&r&f to lag\n` +
                `&2||&r&f Final Phase took &a&l${formatTime(parseFloat(getStat("slowestSplits")[7]))}\n` +
                `&2||==&r&f Lost &c&l${formatTime(parseFloat(getStat("slowestLagSplits")[7]))}&r&f to lag`
            )

            ChatLib.chat(slowestMessage)
            return;
        case "total":
            ChatLib.chat(
                `Total Time Per Split\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compSplitTimes")[0]))} &r&fspent waiting for crates\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compSplitTimes")[1]))} &r&fspent fishing up supplies\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compSplitTimes")[2]))} &r&fspent building the ballista\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compSplitTimes")[3]))} &r&fspent launching stunners\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compSplitTimes")[4]))} &r&fspent beating up pods\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compSplitTimes")[5]))} &r&fspent firing at the C U B E\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compSplitTimes")[6]))} &r&fspent missing skip (not really)\n` +
                `&2\\ &a&l${formatTime(parseFloat(getStat("compSplitTimes")[7]))} &r&fspent forgetting how to rend\n`
            )
            return;
        case "lag":
            ChatLib.chat(
                `Total Time Lost to Lag\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compLagTimes")[0]))} &r&fbefore crates\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compLagTimes")[1]))} &r&fduring supplies\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compLagTimes")[2]))} &r&fduring build\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compLagTimes")[3]))} &r&fduring cannon\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compLagTimes")[4]))} &r&fduring stun\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compLagTimes")[5]))} &r&fduring DPS\n` +
                `&2|| &a&l${formatTime(parseFloat(getStat("compLagTimes")[6]))} &r&fduring skip\n` +
                `&2\\ &a&l${formatTime(parseFloat(getStat("compLagTimes")[7]))} &r&fduring final phase\n`
            )
            return;
        case "pres":
            let preMessage = `Pre Overview:\n`
            let pres = getPreData()
            for (let i = 0; i < pres.length; i++) {
                preMessage += `&b&l${pres[i][0]} &r- &e&l${((pres[i][1]/(pres[i][1]+pres[i][3]))*100).toFixed(2)}% grab rate\n`
                preMessage += `&a&l${pres[i][1]} &rpres hit | &c&l${pres[i][3]} &rpres missed | &e&l${pres[i][2]} &rpres not spawned\n`
            }
            ChatLib.chat(preMessage)
            return;
        default:
            ChatLib.chat("&e&lMeow&f&lMayo &a>&r &4Kuudra Session Run Stats:")
            ChatLib.chat(` &2| &r&fRuns Tracked: &a&l${getStat("totalRuns")}`)
            ChatLib.chat(` &2| &r&fRuns Completed: &a&l${getStat("totalComps")}`)
            ChatLib.chat(` &2| &r&fAverage Comp Time: &a&l${formatTime(Math.round(getStat("totalCompTime") / getStat("totalComps")))}`)
            ChatLib.chat(` &2| &r&fTotal Comp Time: &a&l${formatTime(getStat("totalCompTime"))}`)
            ChatLib.chat(` &2| &r&fTotal Lag Time: &c&l${formatTime(getStat("totalLag"))}`)
            ChatLib.chat(` &2| &r&fFailed Run Wasted Time: &c&l${formatTime(getStat("totalTime") - getStat("totalCompTime"))}`)
            ChatLib.chat(` &2| &r&fAverage Run Time: &a&l${formatTime(Math.round(getStat("totalTime") / getStat("totalRuns")))}`)
            ChatLib.chat(` &2| &r&fFastest Run Time: &a&l${formatTime(getStat("fastest"))}`)
            ChatLib.chat(` &2| &r&fSlowest Run Time: &c&l${formatTime(getStat("slowest"))}`)
            return;
    }
}).setName("kuudratime").setAliases("kt");
