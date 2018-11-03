const fs = require('fs')
arguments = process.argv.splice(2)

// transform is just a helper function to process the word, 
// To make the code more readable, I keep it outside.
const transform = require('./helper').transform

let TFQuarantine = class {
    constructor(func) {
        this._func = [func]
    }
    
    bind(func) {
        this._func.push(func)
        return this
    }
    
    execute() {
        let guard_callable = v => typeof v == 'function' ? v() : v
        let value = () => null
        for (let i = 0; i < this._func.length; i++) {
            let func = this._func[i]
            value = func(guard_callable(value))
        }
    }
}

function get_input(arguments) {
    let arg = arguments
    function _f() {
        return arg[0]
    }
    return _f
}

function extract_words(path_to_file) {
    function _f() {
        let data = fs.readFileSync(path_to_file, 'utf8')
        data = data.replace(/[^a-zA-Z]/g," ")  
        let words = data.split(" ")
        let wordsDcit = []
        for (let i = 0; i < words.length; i++) {
            let w = transform(words[i])
            if (w.length > 1) wordsDcit.push(w)
        }
        return wordsDcit
    }
    return _f
}

function remove_stop_words(word_list) {
    function _f() {
        let stop_words = fs.readFileSync('../stop_words.txt', 'utf8')
        stop_words = stop_words.split(",")
        let stop_words_set = new Set()
        for (let i = 0; i < stop_words.length; i++) {
            stop_words_set.add(stop_words[i])
        }
        let filter_words = []
        for (let i = 0; i < word_list.length; i++) {
            let w = word_list[i]
            if (!stop_words_set.has(w)) {
                filter_words.push(word_list[i])
            }
        }
        return filter_words
    }
    return _f
}

function frequencies(word_list) {
    let word_freqs = new Map()
    for (let i = 0; i < word_list.length; i++) {
        let w = word_list[i]
        if (!word_freqs.has(w)) word_freqs.set(w, 1)
        else word_freqs.set(w, word_freqs.get(w) + 1)
    }
    return word_freqs
}

function sort(word_freqs) {
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

function top25_freqs(word_freqs) {
    let top25 = ""
    for (let i = 0; i < 25; i++) {
        let w = word_freqs[i]
        console.log(w.key + "  -  " + w.val)
    }
}


// The main function

let tfq = new TFQuarantine(get_input(arguments))
tfq.bind(extract_words)
.bind(remove_stop_words)
.bind(frequencies)
.bind(sort)
.bind(top25_freqs)
.execute()