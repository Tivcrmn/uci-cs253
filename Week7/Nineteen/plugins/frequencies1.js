let frequencies_func = word_list => {
    let word_freqs = new Map()
    for (let w of word_list) {
        if (word_freqs.has(w)) {
            word_freqs.set(w, word_freqs.get(w) + 1)
        } else {
            word_freqs.set(w, 1)
        }
    }
    return word_freqs
}

let sort_func = word_freqs => {
    let res = []
    let i = 0
    word_freqs.forEach((val, key) => {
        res[i] = {key, val}
        i++
    })
    res.sort((a, b) => {
        return b.val - a.val
    })
    return res
}

let top25 = word_list => {
    let word_freqs = frequencies_func(word_list)
    let sorted = sort_func(word_freqs)
    return sorted.slice(0, 25)
}

module.exports = {
    top25 : top25
}