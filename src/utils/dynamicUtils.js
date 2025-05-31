export function resolveDynamic(property, player) {
    if (typeof property === 'function') {
        return property(player);
    }
    return property;
}