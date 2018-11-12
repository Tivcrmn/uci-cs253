/*eslint-disable semi */
const fs = require('fs')
arguments = process.argv.splice(2)

const transform = require('./helper').transform
const extract_stop_words = require('./helper').extract_stop_words
const print = require('./helper').print

let stops = extract_stop_words()

function frequencies_imp(word_list) {
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

if (arguments.length > 0) {
    extract_words_func = `file => {
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
    }`
    
    frequencies_func = `w1 => frequencies_imp(w1)`
    
    sort_func = `word_freqs => {
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
    }`
    filename = arguments[0]
} else {
    extract_words_func = `x => []`
    frequencies_func = `x => []`
    sort_func = `x => []`
    filename = ""
}



eval('extract_words = ' + extract_words_func) 
eval('frequencies = ' + frequencies_func) 
eval('sort =' + sort_func)

// main function
let words = extract_words(filename)
let word_freqs = frequencies(words)
let res = sort(word_freqs)

// print result
print(res)

