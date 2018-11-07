/*eslint-disable semi */
const fs = require('fs')
arguments = process.argv.splice(2)

const isalnum = require('./helper').isalnum

function* lines(filename) {
    let data = fs.readFileSync(filename, 'utf8')
    let lines = data.split("\r\n")
    for (let i = 0; i < lines.length; i++) {
        yield lines[i]
    }
}

function* characters(line) {
    for (let i = 0; i < line.length; i++) {
        yield line.charAt(i)
    }
}

function* all_words(filename) {
    start_char = true
    word = ""
    for (let line of lines(filename)) {
        for (let c of characters(line)) {
            if (start_char) {
                if (isalnum(c)) {
                    word = c.toLowerCase()
                    start_char = false
                }
            } else {
                if (isalnum(c)) {
                    word += c.toLowerCase()
                } else {
                    start_char = true
                    yield word
                }
            }
        }
    }
}

function* non_stop_words(filename) {
    let stop_words = fs.readFileSync('../stop_words.txt', 'utf8')
    stop_words = stop_words.split(",")
    let stop_words_set = new Set();
    for (let i = 0; i < stop_words.length; i++) {
        stop_words_set.add(stop_words[i])
    }
    for (let w of all_words(filename)) {
        if (!stop_words_set.has(w)) {
            yield w
        }
    }
}

function* count_and_sort(filename) {
    let freqs = new Map()
    let i = 1
    for (let w of non_stop_words(filename)) {
        if (freqs.has(w)) {
            freqs.set(w, freqs.get(w) + 1)
        } else {
            freqs.set(w, 1)
        }
        if (i % 5000 == 0) {
            yield sort(freqs)
        }
        i++
    }
    yield sort(freqs)
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
    return res
}

function print(words_frequency) {
    let count = 25
    for (let i = 0; i < words_frequency.length; i++) {
        const word = words_frequency[i]
        if (word.key.length > 1) {
            console.log(word.key + "  -  " + word.val)
            count--;
        }
        if (count == 0) break;
    }
}

// main function
for (let word_freqs of count_and_sort(arguments[0])) {
    console.log("-----------------------------")
    print(word_freqs)
}

