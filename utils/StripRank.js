export function stripRank(ign) {
    return ign.replace(/\[.{3,8}]/g, "").replace(/\s/g,'');
}