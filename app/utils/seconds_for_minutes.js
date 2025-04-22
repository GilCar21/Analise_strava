export function secondsForMinutes(seconds){
    return parseInt(seconds / 60)+":"+(seconds % 60).toFixed(0)
}