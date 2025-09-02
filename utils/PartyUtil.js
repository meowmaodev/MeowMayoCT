import {stripRank} from "./StripRank";
import {delay} from "./delay";
import {isSystem} from "./SystemMessage";

// flags for if party has changed before run - used for tracker
let kuudraChange = true
let dungeonChange = true

export function getKuudraFlag() { return kuudraChange }
export function getDungeonFlag() { return dungeonChange }

export function useKuudraFlag() { kuudraChange = false }
export function useDungeonFlag() { dungeonChange = false }

// Party
const name = Player.getName() // player ign, should be unchanging

// store the party
let inParty = false;
let leader = ""
let party = []

export function isLeader() {
    return leader === name
}

export function isInParty() {
    return inParty
}

export function getParty() {
    return party
}

// No party
register("chat", (player) => {
    if (!isSystem(player)) return;

    inParty = false;
    leader = "";
    party = []

    kuudraChange = true;
    dungeonChange = true;
}).setCriteria("${player} has disbanded the party!");

register("chat", () => {
    inParty = false;
    leader = "";
    party = []

    kuudraChange = true;
    dungeonChange = true;
}).setCriteria("The party was disbanded because all invites expired and the party was empty.");

let leaveFlag = false
register("chat", () => {
    leaveFlag = true
    inParty = false;
    leader = "";
    party = []

    kuudraChange = true;
    dungeonChange = true;

    delay(() => leaveFlag = false, 1000)
}).setCriteria("You left the party.");

// Party Remove
register("chat", (player) => {
    if (!isSystem(player)) return;

    if (party.includes(stripRank(player))) {
        party.splice(party.indexOf(stripRank(player)), 1);
    }
    inParty = true;

    kuudraChange = true;
    dungeonChange = true;
}).setCriteria("${player} has been removed from the party.")

register("chat", (player) => {
    if (!isSystem(player)) return;

    if (party.includes(stripRank(player))) {
        party.splice(party.indexOf(stripRank(player)), 1);
    }
    inParty = true;

    kuudraChange = true;
    dungeonChange = true;
}).setCriteria("${player} has left the party.");

register("chat", (newLead, member) => {
    if (leaveFlag) return;
    leader = stripRank(newLead)
    if (party.includes(stripRank(leader))) {
        party.splice(party.indexOf(stripRank(leader)), 1);
    }
    if (party.includes(stripRank(member))) {
        party.splice(party.indexOf(stripRank(member)), 1);
    }
    inParty = true;
}).setCriteria("The party was transferred to ${newLead} because ${member} left");

// Party Add
register("chat", (user, event) => {
    if (!isSystem(player)) return;

    if (!party.includes(stripRank(user))) {
        party.push(stripRank(user));
    }
    inParty = true;

    kuudraChange = true;
    dungeonChange = true;
}).setCriteria("${user} joined the party.");

// Transfer
register("chat", (newLead, member) => {
    leader = stripRank(newLead)
    if (party.includes(stripRank(leader))) {
        party.splice(party.indexOf(stripRank(leader)), 1);
    }
    if (party.includes(stripRank(member))) {
        party.splice(party.indexOf(stripRank(member)), 1);
    }
    inParty = true;
}).setCriteria("The party was transferred to ${newLead} by ${member}");

// PFINDER
register("chat", (user) => {
    if (stripRank(user) === name) {
        getPartyMembers()
        return
    }

    if (!party.includes(stripRank(user))) {
        party.push(stripRank(user));
    }
    inParty = true;

    kuudraChange = true;
    dungeonChange = true;
}).setCriteria("Party Finder > ${user} joined the dungeon group! (${*})");

register("chat", (user) => {
    if (stripRank(user) === name) {
        getPartyMembers()
        return
    }

    if (!party.includes(stripRank(user))) {
        party.push(stripRank(user));
    }
    inParty = true;

    kuudraChange = true;
    dungeonChange = true;
}).setCriteria("Party Finder > ${user} joined the group! (${*})");

// World Load + P list
let finding = false
export function getPartyMembers() {
    finding = true;
    party = []
    delay(() => ChatLib.command("p list"), 500);
    delay(() => finding = false, 1000);
}
register("gameLoad", () => {
    getPartyMembers();
});

register("chat", (lead) => {
    getPartyMembers()
}).setCriteria("You have joined ${lead}'s party!");

register("chat", (membs, event) => {
    party = [] // Clear party when p list is run
    inParty = true;

    kuudraChange = true
    dungeonChange = true;

    if (finding) {
        cancel(event)
    }
}).setCriteria("Party Members (${membs})");

register("chat", (lead, event) => {
    leader = stripRank(lead)
    if (!party.includes(leader)) {
        party.push(leader);
    }
    inParty = true;
    if (finding) {
        cancel(event)
    }
}).setCriteria("Party Leader: ${lead} ●");

register("chat", (event) => {
    leader = ""
    party = []
    inParty = false

    kuudraChange = true
    dungeonChange = true;

    if (finding) {
        cancel(event)
    }
}).setCriteria("You are not currently in a party.")

register("chat", (members, event) => {
    const memberList = members.split(" ● ")
    for (let i = 0; i < memberList.length; i++) {
        if (!party.includes(stripRank(memberList[i]))) {
            party.push(stripRank(memberList[i]));
        }
    }
    if (finding) {
        cancel(event)
    }
}).setCriteria("Party Members:${members}● ");

register("chat", (members, event) => {
    const memberList = members.split(" ● ")
    for (let i = 0; i < memberList.length; i++) {
        if (!party.includes(stripRank(memberList[i]))) {
            party.push(stripRank(memberList[i]));
        }
    }
    if (finding) {
        cancel(event)
    }
}).setCriteria("Party Moderators:${members}● ");

register("chat", (event) => {
    if (finding) {
        cancel(event)
    }
}).setCriteria("----${*}----");
