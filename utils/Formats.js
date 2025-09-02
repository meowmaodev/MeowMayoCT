export function formatTime(seconds) {
    if (seconds < 60.0) { return `${seconds.toFixed(2)}s`; }
    let secs = seconds%60
    let minutes = Math.floor(seconds / 60)
    if (minutes > 60) {
        let hours = Math.floor(minutes / 60)
        minutes %= 60;
        if (hours > 24) {
            let days = Math.floor(hours / 24);
            hours %= 24;
            return `${days}d ${hours}h ${minutes}m ${secs.toFixed(2)}s`
        }
        return `${hours}h ${minutes}m ${secs.toFixed(2)}s`;
    }
    return `${minutes}m ${secs.toFixed(2)}s`;
}