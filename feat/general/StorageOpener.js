import settings from "../../settings";
import {sendMessage} from "../../utils/chat";

let prevAllowed = ""
let BPStatus = []
let BPs = []

register("command", () => {
    if (!settings.storageOpener) return;

    const regex = /^(\d+,)*\d+$/;
    if (!regex.test(settings.allowedBPS)) {
        BPs = []
        sendMessage("Invalid Backpack list entered")
        return;
    }

    BPs = settings.allowedBPS.split(",")

    if (BPs.length !== BPStatus.length || prevAllowed !== settings.allowedBPS) {
        prevAllowed = settings.allowedBPS; // on changes to the allowed bps (this should also load from startup)
        BPStatus = Array(BPs.length).fill(false);
    }

    const status = BPStatus.findIndex(element => element === false);

    if (status === -1) {
        sendMessage("All backpacks are filled")
        return;
    }

    ChatLib.command(`bp ${BPs[status]}`)

}).setName("openstorage").setAliases("mmos", "mmstorage");

let items = []
let inInv = false
let container
let viewing = -1 // this is viewing the index in our list not the bp slot

register('guiOpened', () => {
    Client.scheduleTask(() => {
        container = Player.getContainer()
        const regex = /.*Backpack.*\(Slot #\d+\)/
        if (!regex.test(container.getName())) return
        const sregex = /\d+/
        const slot = container.getName().match(sregex)
        inInv = true;
        viewing = BPs.findIndex(element => element == slot);
    })
})

register('guiClosed', () => {
    Client.scheduleTask(() => {
        viewing = -1
        inInv = false;
    })
})

register("tick", () => {
    if (!inInv || viewing === -1) return;
    items = []
    if(!container) return

    let index = 0
    container.getItems().forEach(item => {
        if(item && index < container.getSize() - 36) items.push(index)
        index++
    })

    BPStatus[viewing] = items.length === container.getSize() - 36;
})
