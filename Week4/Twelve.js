const fs = require('fs')
arguments = process.argv.splice(2)

// transform is just a helper function to process the word, 
// To make the code more readable, I keep it outside.
const transform = require('./helper').transform

function extract_words(path_to_file) {
    let me = this
    me['_data'] = fs.readFileSync(path_to_file, 'utf8')
    me['_data'] = me['_data'].replace(/[^a-zA-Z]/g," ")  
    let words = me['_data'].split(" ")
    let wordsDcit = []
    for (let i = 0; i < words.length; i++) {
        let w = transform(words[i])
        if (w.length > 1) wordsDcit.push(w)
    }
    me['_data'] = wordsDcit 
}

function words() {
    let me = this
    return me['_data']
}

function load_stop_words() {
    let me = this
    let stop_words = fs.readFileSync('../stop_words.txt', 'utf8')
    stop_words = stop_words.split(",")
    for (let i = 0; i < stop_words.length; i++) {
        me['_stop_words_set'].add(stop_words[i])
    }
}

function is_stop_word(w) {
    let me = this
    return me['_stop_words_set'].has(w)
}

function increment_count(w) {
    let me = this
    if (!me['_word_freqs'].has(w)) me['_word_freqs'].set(w, 1)
    else me['_word_freqs'].set(w, me['_word_freqs'].get(w) + 1)
}

function sorted() {
    let me = this
    let res = []
    let i = 0
    me['_word_freqs'].forEach((val, key) => {
        res[i] = {key, val}
        i++
    })
    res.sort((a, b) => {
        return b.val - a.val
    })
    return res
}

function top25() {
    let me = this
    let word_freqs = me['sorted'].call(me)
    for (let i = 0; i < 25; i++) {
        let w = word_freqs[i]
        console.log(w.key + "  -  " + w.val)
    }
}

let data_storage_obj = {
    '_data' : [],
    'init' : extract_words,
    'words' : words
}

let stop_words_obj = {
    '_stop_words_set' : new Set(),
    'init' : load_stop_words,
    'is_stop_word' : is_stop_word
}

let word_freqs_obj = {
    '_word_freqs' : new Map(),
    'increment_count' : increment_count,
    'sorted' : sorted,
    'top25' : top25
}


data_storage_obj['init'].call(data_storage_obj, arguments[0])
stop_words_obj['init'].call(stop_words_obj)

let ws = data_storage_obj['words'].call(data_storage_obj)

for (let i = 0; i < ws.length; i++) {
    if (!stop_words_obj['is_stop_word'].call(stop_words_obj, ws[i])) {
        word_freqs_obj['increment_count'].call(word_freqs_obj, ws[i])
    }   
}  

word_freqs_obj['top25'].call(word_freqs_obj)