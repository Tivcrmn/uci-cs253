const fs = require('fs')
arguments = process.argv.splice(2)

// transform is just a helper function to process the word, 
// To make the code more readable, I keep it outside.
const transform = require('./helper').transform

const extract_words = me => {
    return path_to_file => {
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
}

const load_stop_words = me => {
    let stop_words = fs.readFileSync('../stop_words.txt', 'utf8')
    stop_words = stop_words.split(",")
    for (let i = 0; i < stop_words.length; i++) {
        me['_stop_words_set'].add(stop_words[i])
    }
}

const is_stop_word = me => {
    return w => me['_stop_words_set'].has(w)
}

const increment_count = me => {
    return w => {
        if (!me['_word_freqs'].has(w)) me['_word_freqs'].set(w, 1)
        else me['_word_freqs'].set(w, me['_word_freqs'].get(w) + 1)
    }
}

const sorted = me => {
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

const top25 = me => {
    let word_freqs = me['sorted'](me)
    for (let i = 0; i < 25; i++) {
        let w = word_freqs[i]
        console.log(w.key + "  -  " + w.val)
    }
}

let data_storage_obj = {
    '_data' : [],
    'init' : me => extract_words(me),
    'words' : me => me['_data']
}

let stop_words_obj = {
    '_stop_words_set' : new Set(),
    'init' : me => load_stop_words(me),
    'is_stop_word' : me => is_stop_word(me)
}

let word_freqs_obj = {
    '_word_freqs' : new Map(),
    'increment_count' : me => increment_count(me),
    'sorted' : me => sorted(me),
    'top25' : me => top25(me)
}


data_storage_obj['init'](data_storage_obj)(arguments[0])
stop_words_obj['init'](stop_words_obj)

let ws = data_storage_obj['words'](data_storage_obj)

for (let i = 0; i < ws.length; i++) {
    if (!stop_words_obj['is_stop_word'](stop_words_obj)(ws[i])) {
        word_freqs_obj['increment_count'](word_freqs_obj)(ws[i])
    }   
}  

word_freqs_obj['top25'](word_freqs_obj)