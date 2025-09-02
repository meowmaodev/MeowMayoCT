import settings from "../../settings";
import {makeTitle} from "../../utils/alert";
import {sendParty} from "../../utils/chat";

register("chat", () => {
    if (!settings.invincibilityAnnouncement) return;
    if(settings.bonzoAnnouncement) { sendParty("Bonzo's Mask Procced!") }
    if(settings.bonzoTitle) { makeTitle("Bonzo Popped") }
}).setCriteria("Your${Frag}Bonzo's Mask saved your life!")

register("chat", () => {
    if (!settings.invincibilityAnnouncement) return;
    if(settings.phoenixAnnouncement) { sendParty("Phoenix Pet Procced!") }
    if(settings.phoenixTitle) { makeTitle("Phoenix Popped") }
}).setCriteria("Your Phoenix Pet saved you from certain death!")

register("chat", () => {
    if (!settings.invincibilityAnnouncement) return;
    if(settings.spiritAnnouncement) { sendParty("Spirit Mask Procced!") }
    if(settings.spiritTitle) { makeTitle("Spirit Popped") }
}).setCriteria("Second Wind Activated! Your Spirit Mask saved your life!")

