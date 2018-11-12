/*eslint-disable semi */
const fs = require('fs')
arguments = process.argv.splice(2)

const isalnum = require('./helper').isalnum

function* lines(filename) {
    let data = fs.readFileSync(filename, 'utf8')
    let lines = data.split("\r\n")
    for (let i = 0; i < lines.length; i++) {
        yield lines[i]
    }
}

function* characters(line) {
    for (let i = 0; i < line.length; i++) {
        yield line.charAt(i)
    }
}

function* all_words(filename) {
    start_char = true
    word = ""
    for (let line of lines(filename)) {
        for (let c of characters(line)) {
            if (start_char) {
                if (isalnum(c)) {
                    word = c.toLowerCase()
                    start_char = false
                }
            } else {
                if (isalnum(c)) {
                    word += c.toLowerCase()
                } else {
                    start_char = true
                    yield word
                }
            }
        }
    }
}

function extract_words(filename) {
    let words_list = []
    let stop_words = fs.readFileSync('../../stop_words.txt', 'utf8')
    stop_words = stop_words.split(",")
    let stop_words_set = new Set()
    for (let i = 0; i < stop_words.length; i++) {
        stop_words_set.add(stop_words[i])
    }
    for (let w of all_words(filename)) {
        if (!stop_words_set.has(w)) {
            words_list.push(w)
        }
    }
    return words_list
}

module.exports = {
    extract_words : extract_words
}