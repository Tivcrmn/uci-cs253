const fs = require('fs')
arguments = process.argv.splice(2)

// transform is just a helper function to process the word, 
// To make the code more readable, I keep it outside.
const transform = require('./helper').transform

let DataStorageManager = class {
    constructor() {
        this._data
        this._wordsDcit = []
    }
    
    dispatch(message) {
        if (message[0] == 'init') return this._init(message[1])
        else if (message[0] == 'words') return this._words()
        else throw "Message not understood " + message[0];
    }
    
    _init(path_to_file) {
        this._data = fs.readFileSync(path_to_file, 'utf8')
        this._data = this._data.replace(/[^a-zA-Z]/g," ")  
    }
    
    _words() {
        let words = this._data.split(" ")
        for (let i = 0; i < words.length; i++) {
            let w = transform(words[i])
            if (w.length > 1) this._wordsDcit.push(w)
        }
        return this._wordsDcit
    }
}

let StopWordManager = class {
    constructor() {
        this.stop_words_set = new Set()
    }
    
    dispatch(message) {
        if (message[0] == 'init') this._init()
        else if (message[0] == 'is_stop_word') return this._is_stop_word(message[1])
        else throw "Message not understood " + message[0]
    }
    
    _init() {
        let stop_words = fs.readFileSync('../stop_words.txt', 'utf8')
        stop_words = stop_words.split(",")
        for (let i = 0; i < stop_words.length; i++) {
            this.stop_words_set.add(stop_words[i])
        }
    }
    
    _is_stop_word(w) {
        return this.stop_words_set.has(w)
    }
}

let WordFrequencyManager = class {
    constructor() {
        this._word_freqs = new Map()
    }
    
    dispatch(message) {
        if (message[0] == 'increment_count') this._increment_count(message[1])
        else if (message[0] == 'sorted') return this._sorted()
        else throw "Message not understood " + message[0]
    }
    
    _increment_count(w) {
        if (!this._word_freqs.has(w)) this._word_freqs.set(w, 1)
        else this._word_freqs.set(w, this._word_freqs.get(w) + 1)
    }
    
    _sorted() {
        let res = []
        let i = 0
        this._word_freqs.forEach((val, key) => {
            res[i] = {key, val}
            i++
        })
        res.sort((a, b) => {
            return b.val - a.val
        })
        return res
    }
}
let WordFrequencyController = class {
    constructor() {
        this._storage_manager
        this._stop_word_manager
        this._word_freq_manager
    }
    
    dispatch(message) {
        if (message[0] == 'init') return this._init(message[1])
        else if (message[0] == 'run') return this._run()
        else throw "Message not understood " + message[0];
    }
    
    _init(path_to_file) {
        this._storage_manager = new DataStorageManager()
        this._stop_word_manager = new StopWordManager()
        this._word_freq_manager = new WordFrequencyManager()
        this._storage_manager.dispatch(['init', path_to_file])
        this._stop_word_manager.dispatch(['init'])
    }
    
    _run() {
        let ws = this._storage_manager.dispatch(['words'])
        for (let i = 0; i < ws.length; i++) {
            if (!this._stop_word_manager.dispatch(['is_stop_word', ws[i]]))
                this._word_freq_manager.dispatch(['increment_count', ws[i]])
        }
            
        let word_freqs = this._word_freq_manager.dispatch(['sorted'])
        for (let i = 0; i < 25; i++) {
            let w = word_freqs[i]
            console.log(w.key + "  -  " + w.val)
        }
    }
}

let wfcontroller = new WordFrequencyController()
wfcontroller.dispatch(['init', arguments[0]])
wfcontroller.dispatch(['run'])
