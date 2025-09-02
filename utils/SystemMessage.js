export function isSystem(msg) { // makes sure the message is coming from chat and not a player
    return (!(msg.startsWith("Party >") || msg.startsWith("Guild >") || msg.startsWith("From ") || msg.startsWith("To ")));
}