/*eslint-disable semi */
const fs = require('fs')
arguments = process.argv.splice(2)

const transform = require('./helper').transform
const extract_stop_words = require('./helper').extract_stop_words
const print = require('./helper').print

extract_words = file => {
    let stops = extract_stop_words()
    let data = fs.readFileSync(file, 'utf8')
    data = data.replace(/[^a-zA-Z]/g," ")  
    let words = data.split(" ") 
    let res = []
    for (let w of words) {
        let trans_word = transform(w)
        if (trans_word.length > 1 && !stops.has(trans_word)) {
            res.push(trans_word)
        }
    }
    return res
}

frequencies = word_list => {
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

sort = word_freqs => {
    let res = []
    let i = 0
    word_freqs.forEach((val, key) => {
        res[i] = {key, val}
        i++
    })
    res.sort((a, b) => {
        return b.val - a.val
    })
    return res.slice(0, 25)
}

let profile = f => {
    let profilewrapper = arg => {
        console.time(f.name + '(...) took')
        let res = f(arg)
        console.timeEnd(f.name + '(...) took')
        return res
    }
    return profilewrapper
}

// join points
let tracked_functions = [extract_words, frequencies, sort]
// weaver
for (let func of tracked_functions) {
    global[func.name] = profile(func)
}

top25 = sort(frequencies(extract_words(arguments[0])))

print(top25)