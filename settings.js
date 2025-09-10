import {
    @TextProperty,
    @SwitchProperty,
    @SliderProperty,
    @Vigilant,
    @CheckboxProperty
} from '../Vigilance/index';

@Vigilant("MeowMayo", "MeowMayo", {
    getCategoryComparator: () => (a, b) => {
        const categories = ["MEOWMAYO", "General", "Kuudra", "Party Commands"];
        return categories.indexOf(a.name) - categories.indexOf(b.name);
    }
})
class Settings {
// General
    @SwitchProperty({
        name: "Storage Command",
        description: "Allows the usage of a command to open storage",
        category: "General",
        subcategory: "Storage"
    })
    storageOpener = false;

    @TextProperty({
        name: "Allowed Backpacks",
        description: "Backpacks to be opened with command | Separate in order with a comma separated list i.e. \"13,9,18\" - opens in order 13, 9, 18",
        category: "General",
        subcategory: "Storage"
    })
    allowedBPS = "";

    @SwitchProperty({
        name: "Invincibility Announcements",
        description: "Announces when invulnerability items are used",
        category: "General",
        subcategory: "General Items"
    })
    invincibilityAnnouncement = false;

    @CheckboxProperty({
        name: "Bonzo Announcement",
        description: "Announces to Party chat when Bonzo's Mask is used",
        category: "General",
        subcategory: "General Items"
    })
    bonzoAnnouncement = false;

    @CheckboxProperty({
        name: "Bonzo Title",
        description: "Shows a title when Bonzo's Mask is used",
        category: "General",
        subcategory: "General Items"
    })
    bonzoTitle = false;

    @CheckboxProperty({
        name: "Phoenix Announcement",
        description: "Announces to Party chat when Phoenix Pet is used",
        category: "General",
        subcategory: "General Items"
    })
    phoenixAnnouncement = false;

    @CheckboxProperty({
        name: "Phoenix Title",
        description: "Shows a title when Phoenix Pet is used",
        category: "General",
        subcategory: "General Items"
    })
    phoenixTitle = false;

    @CheckboxProperty({
        name: "Spirit Announcement",
        description: "Announces to Party chat when Spirit Mask is used",
        category: "General",
        subcategory: "General Items"
    })
    spiritAnnouncement = false;

    @CheckboxProperty({
        name: "Spirit Title",
        description: "Shows a title when Spirit Mask is used",
        category: "General",
        subcategory: "General Items"
    })
    spiritTitle = false;

// Kuudra
    @SwitchProperty({
        name: "Announce Mana",
        description: "Announces mana used",
        category: "Kuudra",
        subcategory: "Party Chat"
    })
    announceMana = false;

    @SwitchProperty({
        name: "Announce Fresh",
        description: "Announces when Fresh Tools Procs",
        category: "Kuudra",
        subcategory: "Party Chat"
    })
    announceFresh = false;

    @SwitchProperty({
        name: "Track Average Run Time",
        description: "Tracks average run time per session | /kuudratime to view | Refreshes on restarts - /resetkuudratime to force reset",
        category: "Kuudra",
        subcategory: "Run Tracker"
    })
    kuudraTrack = false;

    @SwitchProperty({
        name: "Track Supplies",
        description: "Tracks who supplies and when",
        category: "Kuudra",
        subcategory: "Run Tracker"
    })
    supplyTrack = false;

    @SwitchProperty({
        name: "Supplies Overview",
        description: "Sends a message after supplies containing supplies overview",
        category: "Kuudra",
        subcategory: "Run Tracker"
    })
    supplyTrackMessage = false;

    @SwitchProperty({
        name: "Track Fresh",
        description: "Tracks who freshes and when",
        category: "Kuudra",
        subcategory: "Run Tracker"
    })
    freshTrack = false;

    @SwitchProperty({
        name: "Fresh Overview",
        description: "Sends a message after build containing fresh overview",
        category: "Kuudra",
        subcategory: "Run Tracker"
    })
    freshTrackMessage = false;

    @SwitchProperty({
        name: "Send Lag Timings",
        description: "Sends a message after run in party chat containing Lag info",
        category: "Kuudra",
        subcategory: "Run Tracker"
    })
    lagMessage = false;

    @SwitchProperty({
        name: "Reset tracker on party change",
        description: "Resets tracker when party changes",
        category: "Kuudra",
        subcategory: "Run Tracker"
    })
    ktPartyReset = false;

    @SwitchProperty({
        name: "Missed Pre",
        description: "Attempts to track who misses their pres",
        category: "Kuudra",
        subcategory: "Run Tracker"
    })
    missedPre = false;

    @SliderProperty({
        name: "Pre Leeway",
        description: "The amount of extra time given for pre tracking. Default is 8 seconds.",
        category: "Kuudra",
        subcategory: "Run Tracker",
        min: 0,
        max: 3,
    })
    preLeeway = 0;

    @SwitchProperty({
        name: "Supply Utils",
        description: "Various Supply Related Stuff",
        category: "Kuudra",
        subcategory: "Supplies"
    })
    supplyUtil = false;

    @SwitchProperty({
        name: "No Supply",
        description: "Announces missing Pres",
        category: "Kuudra",
        subcategory: "Supplies"
    })
    noSupply = false;

    @SwitchProperty({
        name: "Custom Supply Timer",
        description: "Custom Tick Based Supply Timer, also has throw timers for prepearls",
        category: "Kuudra",
        subcategory: "Supplies"
    })
    supplyTimer = false;

    @SwitchProperty({
        name: "Pearl Waypoints",
        description: "Shows where to throw pearls to land places | Red -> Turns Green when you should throw",
        category: "Kuudra",
        subcategory: "Supplies"
    })
    prePearls = false;

    @SliderProperty({
        name: "Waypoint Size",
        description: "Pearl Waypoint Size",
        category: "Kuudra",
        subcategory: "Supplies",
        min: 1,
        max: 20,
    })
    waypointSize = 8;

    @SwitchProperty({
        name: "Second Pearl Waypoints",
        description: "Shows where to throw pearls to land places again | Purple -> Turns Blue when you should throw",
        category: "Kuudra",
        subcategory: "Supplies"
    })
    secondPearls = false;

    @SwitchProperty({
        name: "Fresh Title",
        description: "Displays a title when Fresh Tools Activates",
        category: "Kuudra",
        subcategory: "Displays"
    })
    freshTitle = false;

    @SwitchProperty({
        name: "Danger Block Warning",
        description: "Attempts to warn you when standing on a dangerous block in final phase",
        category: "Kuudra",
        subcategory: "Displays"
    })
    dangerBlocks = false;

    @SwitchProperty({
        name: "Last Alive",
        description: "Warns you & party when last alive",
        category: "Kuudra",
        subcategory: "Displays"
    })
    lastAlive = false;

    @SwitchProperty({
        name: "Stun Ping",
        description: "Tells you when to throw pearl for stun",
        category: "Kuudra",
        subcategory: "Displays"
    })
    stunPing = false;

    @SliderProperty({
        name: "Stun Ping HP",
        description: "What Percent HP to ping on",
        category: "Kuudra",
        subcategory: "Displays",
        min: 30,
        max: 80
    })
    pingTime = 30;

    @SwitchProperty({
        name: "Rend Damage",
        description: "Shows How much rend damage is done | Requires track runs to be enabled",
        category: "Kuudra",
        subcategory: "Rend"
    })
    rendDmg = false;

    @SwitchProperty({
        name: "Bone Hits",
        description: "Tells when bonemerang hits while rending",
        category: "Kuudra",
        subcategory: "Rend"
    })
    boneHit = false;

    @SwitchProperty({
        name: "Rend Alert",
        description: "Pops up a title on when to rend",
        category: "Kuudra",
        subcategory: "Rend"
    })
    rendNow = false;

    // Party Comms
    @SwitchProperty({
        name: "Party Commands",
        description: "Party Chat Commands",
        category: "Party Commands",
        subcategory: "! General !"
    })
    partyCommands = false;

    @TextProperty({
        name: "Party Command Prefix",
        description: "Sets pCommand Prefix | Requires A Reload",
        category: "Party Commands",
        subcategory: "! General !"
    })
    commandPrefix = "!";

    @CheckboxProperty({
        name: "Sellout Command",
        description: "Plugs MeowMayo. Thanks for being a MeowMayo User!",
        category: "Party Commands",
        subcategory: "! General !"
    })
    selloutOption = false;

    @SwitchProperty({
        name: "Kuudra Party Commands Options",
        description: "Click to show Kuudra Party Commands",
        category: "Party Commands",
        subcategory: "!!! Kuudra Commands !!!"
    })
    kuudraCommandsOption = false;

    @CheckboxProperty({
        name: "Kuudra Commands",
        description: "Toggles Kuudra Entrance Commands",
        category: "Party Commands",
        subcategory: "!!! Kuudra Commands !!!"
    })
    kuudraOption = false;

    @CheckboxProperty({
        name: "Kuudra Runtime Commands",
        description: "Toggles Kuudra Run Time Commands | Requires Track Run Average",
        category: "Party Commands",
        subcategory: "!!! Kuudra Commands !!!"
    })
    kuudraRTOption = false;

    // const
    constructor() {
        this.initialize(this);
        this.setCategoryDescription("MEOWMAYO", "meow :3");
        this.setCategoryDescription("General", "dungeon gag generl");
        this.setCategoryDescription("Kuudra", "koodar");
        this.setCategoryDescription("Party Commands", "uhuh");

        // General
        this.addDependency("Bonzo Announcement", "Invincibility Announcements")
        this.addDependency("Bonzo Title", "Invincibility Announcements")
        this.addDependency("Phoenix Announcement", "Invincibility Announcements")
        this.addDependency("Phoenix Title", "Invincibility Announcements")
        this.addDependency("Spirit Announcement", "Invincibility Announcements")
        this.addDependency("Spirit Title", "Invincibility Announcements")

        // Kuudra
        this.addDependency("Reset tracker on party change", "Track Average Run Time")
        this.addDependency("Track Supplies", "Track Average Run Time")
        this.addDependency("Supplies Overview", "Track Average Run Time")
        this.addDependency("Track Fresh", "Track Average Run Time")
        this.addDependency("Fresh Overview", "Track Average Run Time")

        this.addDependency("Rend Alert", "Bone Hits")

        this.addDependency("Waypoint Size", "Pearl Waypoints")

        this.addDependency("Stun Ping HP", "Stun Ping")

        // Party
        this.addDependency("Party Command Prefix", "Party Commands");

        this.addDependency("Kuudra Commands", "Kuudra Party Commands Options")
        this.addDependency("Kuudra Runtime Commands", "Kuudra Party Commands Options")
    }
}

export default new Settings
