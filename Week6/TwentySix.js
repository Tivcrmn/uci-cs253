/*eslint-disable semi */
const fs = require('fs')
arguments = process.argv.splice(2);

// transform is just a helper function to process the word, 
// To make the code more readable, I keep it outside.
const transform = require('./helper').transform

function read_file(file) {
    return fs.readFileSync(file, 'utf8')
}

function filter_chars_and_normalize(data = data_stream[0]) {
    return data.replace(/[^a-zA-Z]/g," ")  
}

function scan(data = filtered_data_stream[0]) {
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
    return map
}

function remove_stop_words(map = map1[0]) {
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
    return map
}

function sort(map = filtered_map[0]) {
    let res = []
    let i = 0
    map.forEach((val, key) => {
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

function update(all_cols = all_columns) {
    for (let i = 0; i < all_cols.length; i++) {
        if (all_cols[i][1] != null) {
            all_cols[i][0] = all_cols[i][1]()
        }
    }
}

// The columns. Each column is a data element and a formula.
// The first 2 columns are the input data, so no formulas.

let data_stream = ["", null]
let filtered_data_stream = [null, filter_chars_and_normalize]
let map1 = [null, scan]
let filtered_map = [null, remove_stop_words]
let words_frequency = [null, sort]

// The entire spreadsheet
all_columns = [data_stream, filtered_data_stream, map1, filtered_map, words_frequency]

// Load the fixed data into the first 2 columns
data_stream[0] = read_file(arguments[0])

// Update the columns with formulas
update()

// print result
print(words_frequency[0])

