function count_and_sort(words_list) {
    let freqs = new Map()
    for (let w of words_list) {
        if (freqs.has(w)) {
            freqs.set(w, freqs.get(w) + 1)
        } else {
            freqs.set(w, 1)
        }
    }
    return sort(freqs)
} 

function sort(freqs) {
    let res = []
    let i = 0
    freqs.forEach((val, key) => {
        res[i] = {key, val}
        i++
    })
    res.sort((a, b) => {
        return b.val - a.val
    })
    return res.slice(0, 26)
}

module.exports = {
    top25 : count_and_sort
}