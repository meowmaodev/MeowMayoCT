import settings from "../../settings";
import { delay } from "../../utils/delay";
import {sendParty} from "../../utils/chat";
import {formatTime} from "../../utils/Formats";
import {getStat} from "../kuudra/KuudraTimings";

let delayed = false;

register("chat", (player, message) => {
    if (!settings.partyCommands) return;
    if (delayed) return;
    let inputs = message.toLowerCase().split(" ")
    switch(inputs[0]) {
        case "basic":
        case "t1":
        case "tier1":
            if (settings.kuudraOption) {
                delayed = true;
                ChatLib.command("joindungeon kuudra_basic");
                delay(() => delayed = false, 1000);
            }
            break;
        case "hot":
        case "t2":
        case "tier2":
            if (settings.kuudraOption) {
                delayed = true;
                ChatLib.command("joindungeon kuudra_hot");
                delay(() => delayed = false, 1000);
            }
            break;
        case "burning":
        case "t3":
        case "tier3":
            if (settings.kuudraOption) {
                delayed = true;
                ChatLib.command("joindungeon kuudra_burning");
                delay(() => delayed = false, 1000);
            }
            break;
        case "fiery":
        case "t4":
        case "tier4":
            if (settings.kuudraOption) {
                delayed = true;
                ChatLib.command("joindungeon kuudra_fiery");
                delay(() => delayed = false, 1000);
            }
            break;
        case "infernal":
        case "t5":
        case "tier5":
            if (settings.kuudraOption) {
                delayed = true;
                ChatLib.command("joindungeon kuudra_infernal");
                delay(() => delayed = false, 1000);
            }
            break;
        case "mm":
        case "meowmayo":
            if (settings.selloutOption) {
                delayed = true;
                sendParty("MeowMayo is a Quality of life mod that offers a ton of quality of life kuudra features!")
                delay(() => sendParty("Download MeowMayo here -> discord.gg/TBtp9rVHhM"), 1000);
                delay(() => delayed = false, 2000);
            }
            break;
        case "kuudratimestats":
        case "kts":
        case "ktstats":
            if (settings.kuudraRTOption) {
                delayed = true;
                if (!settings.kuudraTrack) {
                    sendParty("I am currently not tracking run data!")
                    delay(() => delayed = false, 1000);
                } else if (getStat("totalRuns") === 0) {
                    sendParty("I have no available run data for this session!")
                    delay(() => delayed = false, 1000);
                } else {
                    let totalRuns = getStat("totalRuns")
                    let totalComps = getStat("totalComps")
                    let totalTime = getStat("totalTime")
                    sendParty("MeowMayo > Kuudra Session Stats:");
                    delay(() => sendParty(` | Runs Tracked: ${totalRuns}`), 1000);
                    delay(() => sendParty(` | Average Run Time: ${formatTime(Math.round(totalTime / totalComps))}`), 2000);
                    delay(() => sendParty(` | Total Run Time: ${formatTime(totalTime)}`), 3000);
                    delay(() => sendParty(` | Fastest Run Time: ${formatTime(getStat("fastest"))}`), 4000);
                    delay(() => sendParty(` | Slowest Run Time: ${formatTime(getStat("slowest"))}`), 5000);
                    delay(() => delayed = false, 6000);
                }
            }
            break;
    }
}).setCriteria("Party > ${player}: "+settings.commandPrefix+"${message}")