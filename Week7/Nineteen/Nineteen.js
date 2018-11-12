/*eslint-disable semi */
const fs = require('fs')
arguments = process.argv.splice(2)

const print = require('./plugins/helper').print

let tfwords = null
let tffreqs = null

function load_plugins() {
    let config = require('./config.json')
    words_plugin = config.words
    frequencies_plugin = config.frequencies
    tfwords = require(words_plugin)
    tffreqs = require(frequencies_plugin)
}

load_plugins()

res = tffreqs.top25(tfwords.extract_words(arguments[0]))

print(res)