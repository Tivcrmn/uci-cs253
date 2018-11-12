/*eslint-disable semi */
const fs = require('fs')
arguments = process.argv.splice(2)

const transform = require('./helper').transform
const extract_stop_words = require('./helper').extract_stop_words

let stops = extract_stop_words()

let extract_words_func = file => {
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

module.exports = {
    extract_words : extract_words_func
}
