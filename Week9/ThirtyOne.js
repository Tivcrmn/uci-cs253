/*eslint-disable semi, no-undef*/
const fs = require('fs')
arguments = process.argv.splice(2)

const transform = require('./helper').transform

function partition(data_str, nlines) {
    let lines = data_str.split("\r\n")
    let l = []
    let res = []
    for (let i = 0; i < lines.length; i++) {
        l.push(lines[i])  
        if (i != 0 && i % nlines == 0) {
           res.push(l.join("\n")) 
           l = []
        }
    }
    res.push(l.join("\n")) 
    return res
}

function split_words(data_str) {
    function _scan(str_data) {
        let data = str_data.replace(/[^a-zA-Z]/g," ")  
        let words = data.split(" ")
        let wordsDcit = []
        for (let i = 0; i < words.length; i++) {
            let w = transform(words[i])
            if (w.length > 1) wordsDcit.push(w)
        }
        return wordsDcit
    }
    
    function _remove_stop_words(word_list) {
        let stop_words = fs.readFileSync('../stop_words.txt', 'utf8')
        stop_words = stop_words.split(",")
        let set = new Set();
        for (let i = 0; i < stop_words.length; i++) {
            set.add(stop_words[i])
        }
        let filter = []
        for (let i = 0; i < word_list.length; i++) {
            if (!set.has(word_list[i])) filter.push(word_list[i])
        }
        return filter
    }
    
    let result = []
    let words = _remove_stop_words(_scan(data_str))
    for (let w of words) {
        result.push([w, 1])
    }
    return result
}

function regroup(pairs_list) {
    // a-e, f-j, k-o, p-t, u-z
    let mapping = new Map()
    for (let pairs of pairs_list) {
        for (let p of pairs) {
            if (mapping.has(p[0])) {
                mapping.get(p[0]).push(p)
            } else {
                mapping.set(p[0], [p])
            }
        }
    }
    let trans_map = []
    for (let [key, value] of mapping) {
        trans_map.push([key, value])
    }
    return trans_map
}

function count_words(mapping) {
    let freqs = []
    for (let pair of mapping[1]) {
        freqs.push(pair[1])
    }
    return [mapping[0], freqs.reduce((acc, cur) => (acc + cur))]
}

function read_file(path_to_file) {
    return fs.readFileSync(path_to_file, 'utf8')
}

// main function
let splits = partition(read_file(arguments[0]), 200).map(split_words)
let splits_per_word = regroup(splits)
let word_freqs = splits_per_word.map(count_words).sort((a, b) => b[1] - a[1])

for (let i = 0; i < 25; i++) {
    console.log(word_freqs[i][0] + "  -  " + word_freqs[i][1])
}