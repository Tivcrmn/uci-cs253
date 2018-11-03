const fs = require('fs')
arguments = process.argv.splice(2)

// transform is just a helper function to process the word, 
// To make the code more readable, I keep it outside.
const transform = require('./helper').transform

let EventManager = class {
    constructor() {
        this._subscriptions = {}
    }
    
    subscribe(event_type, handler) {
        if (this._subscriptions.hasOwnProperty(event_type)) {
            this._subscriptions[event_type].push(handler)
        } else {
            this._subscriptions[event_type] = [handler]
        }
    }
    publish(event) {
        let event_type = event[0]
        if (this._subscriptions.hasOwnProperty(event_type)) {
            for (let i = 0; i < this._subscriptions[event_type].length; i++){
                let h = this._subscriptions[event_type][i]
                h(event)
            } 
        }    
    }
}
        
let DataStorage = class {
    constructor(event_manager) {
        this._event_manager = event_manager
        this._event_manager.subscribe('load', this.load.bind(this))
        this._event_manager.subscribe('start', this.produce_words.bind(this))
        this._data = ""
    }
    
    load(event) {
        let path_to_file = event[1]
        this._data = fs.readFileSync(path_to_file, 'utf8')
        this._data = this._data.replace(/[^a-zA-Z]/g," ")  
        let words = this._data.split(" ")
        let wordsDcit = []
        for (let i = 0; i < words.length; i++) {
            let w = transform(words[i])
            if (w.length > 1) wordsDcit.push(w)
        }
        this._data = wordsDcit
    }
    
    produce_words(event) {
        for (let i = 0; i < this._data.length; i++) {
            let w = this._data[i]
            this._event_manager.publish(['word', w])
        }
        this._event_manager.publish(['eof', null])
    }
}

let StopWordFilter = class {
            
    constructor(event_manager) {
        this.stop_words_set = new Set()
        this._event_manager = event_manager
        this._event_manager.subscribe('load', this.load.bind(this))
        this._event_manager.subscribe('word', this.is_stop_word.bind(this))
    }
    
    load(event) {
        let stop_words = fs.readFileSync('../stop_words.txt', 'utf8')
        stop_words = stop_words.split(",")
        for (let i = 0; i < stop_words.length; i++) {
            this.stop_words_set.add(stop_words[i])
        }
    }
    
    is_stop_word(event) {
        let word = event[1]
        if (!this.stop_words_set.has(word)) {
            this._event_manager.publish(['valid_word', word])
        }
    }
}

let WordFrequencyCounter = class {
    
    constructor(event_manager) {
        this._word_freqs = new Map()
        this._event_manager = event_manager
        this._event_manager.subscribe('valid_word', this.increment_count.bind(this))
        this._event_manager.subscribe('print', this.print_freqs.bind(this))
    }
    
    increment_count(event) {
        let w = event[1]
        if (!this._word_freqs.has(w)) this._word_freqs.set(w, 1)
        else this._word_freqs.set(w, this._word_freqs.get(w) + 1)
    }
    
    print_freqs(event) {
        let res = []
        let i = 0
        this._word_freqs.forEach((val, key) => {
            res[i] = {key, val}
            i++
        })
        res.sort((a, b) => {
            return b.val - a.val
        })
        for (let i = 0; i < 25; i++) {
            let w = res[i]
            console.log(w.key + "  -  " + w.val)
        }
        this._event_manager.publish(['printz', res])
    }
}

let WordFrequencyApplication = class {
    constructor(event_manager) {
        this._event_manager = event_manager
        this._event_manager.subscribe('run', this.run.bind(this))
        this._event_manager.subscribe('eof', this.stop.bind(this))
    }
    
    run(event) {
        let path_to_file = event[1]
        this._event_manager.publish(['load', path_to_file])
        this._event_manager.publish(['start', null])
    }
    
    stop(event) {
        this._event_manager.publish(['print', null])
    }
}

let printNonStopWordWithZ = class {
    constructor(event_manager) {
        this._event_manager = event_manager
        event_manager.subscribe('printz', this.printz.bind(this))
    }
    
    printz(event) {
        let word_dict = event[1]
        let count = 0
        for (let i = 0; i < word_dict.length; i++) {
            let pair = word_dict[i]
            if (pair.key.indexOf('z') != -1) count++;
        }
        console.log('\n', "the number of non-stop words(without duplicates) with the letter z is", count, '\n')
    }
}


// The main function

let em = new EventManager()
let ds = new DataStorage(em)
let sw = new StopWordFilter(em)
// new added class for print the number of non-stop words(without duplicates) with the letter z
let pz = new printNonStopWordWithZ(em)
let wfc = new WordFrequencyCounter(em)
let wfa = new WordFrequencyApplication(em)
em.publish(['run', arguments[0]])