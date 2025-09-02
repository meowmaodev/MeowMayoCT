import settings from "./settings";
import "./feat/party/commands"
import "./feat/kuudra/Kuudra";
import "./feat/kuudra/SupplyUtils";
import "./feat/kuudra/RendDamage";
import "./feat/kuudra/KuudraTimings"
import "./feat/kuudra/KuudraTracker";
import "./feat/general/InvincibilityAnnouncements";
import {fetchGlobalStats} from "./feat/kuudra/KuudraTimings";

register("command", () => {
    settings.openGUI()
}).setName("meowmayo").setAliases("mayo", "meow", "mm");

fetchGlobalStats()