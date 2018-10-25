/*eslint-disable semi */
const fs = require('fs')
arguments = process.argv.splice(2)

// transform is just a helper function to process the word, 
// To make the code more readable, I keep it outside.
const transform = require('./helper').transform


function read_file(file, func) {
    let data = fs.readFileSync(file, 'utf8')
    func(data, scan)
}

function filter_chars_and_normalize(data, func) {
    data = data.replace(/[^a-zA-Z]/g," ")
    func(data, remove_stop_words)
}

function scan(data, func) {
    let map = new Map();
    let words = data.split(" ")
    for (let i = 0; i < words.length; i++) {
        let trans_word = transform(words[i])
        let isInMap = map.get(trans_word)
        if (trans_word.length > 0) {
            if (!isInMap) map.set(trans_word, 1)
            else map.set(trans_word, isInMap + 1)
        }
    }
    func(map, sort)
}

function remove_stop_words(map, func) {
    let stop_words = fs.readFileSync('../stop_words.txt', 'utf8')
    stop_words = stop_words.split(",")
    let stop_words_set = new Set();
    for (let i = 0; i < stop_words.length; i++) {
        stop_words_set.add(stop_words[i])
    }
    stop_words_set.forEach(stop_word => {
        if (map.has(stop_word)) {
            map.delete(stop_word)
        }
    })
    func(map, print)
}

function sort(map, func) {
    let res = []
    let i = 0
    map.forEach((val, key) => {
        res[i] = {key, val}
        i++
    })
    res.sort((a, b) => {
        return b.val - a.val
    })
    func(res, no_op)
}



function print(words_frequency, func) {
    let count = 25
    for (let i = 0; i < words_frequency.length; i++) {
        const word = words_frequency[i]
        if (word.key.length > 1) {
            console.log(word.key + "  -  " + word.val)
            count--;
        }
        if (count == 0) break;
    }
    func(null)
}

function no_op(func) {
    return
}


read_file(arguments[0], filter_chars_and_normalize)