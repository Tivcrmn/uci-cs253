const fs = require('fs')
arguments = process.argv.splice(2);

function processTxt(file) {
    let map = new Map();
    let res = [];
    
    let data = fs.readFileSync(file, 'utf8')
    data = data.replace(/[^a-zA-Z]/g," ")  
    let words = data.split(" ")
    
    for (let i = 0; i < words.length; i++) {
        let trans_word = transform(words[i])
        let isInMap = map.get(trans_word)
        if (trans_word.length > 0) {
            if (!isInMap) map.set(trans_word, 1)
            else map.set(trans_word, isInMap + 1)
        }
    }
    
    let i = 0
    map.forEach((val, key) => {
        res[i] = {key, val}
        i++
    })
    res.sort((a, b) => {
        return b.val - a.val
    })
    
    return res
}

function processStopWords() {
    let stop_words = fs.readFileSync('../stop_words.txt', 'utf8')
    stop_words = stop_words.split(",")
    let res = new Set();
    for (let i = 0; i < stop_words.length; i++) {
        res.add(stop_words[i])
    }
    return res
}

function transform(word) {
    if (word.length == 0) return word
    let i = 0, j = word.length - 1
    while (i < word.length) {
        let ch = word.charAt(i)
        if (ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z') break;
        else i++
    }
    while (j >= 0) {
        let ch = word.charAt(j)
        if (ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z') break;
        else j--
    }
    if (i > j) return ""
    let ans = ""
    while (i <= j) {
        const ch = word.charAt(i)
        if (ch >= 'A' && ch <= 'Z') {
            ans += String.fromCharCode(word.charCodeAt(i) + 32)
        } else {
            ans += word.charAt(i)
        }
        i++
    }
    return ans
}

function print(count, words_frequency, stop_words_set) {
    for (let i = 0; i < words_frequency.length; i++) {
        const word = words_frequency[i]
        if (word.key.length > 1 && !stop_words_set.has(word.key)) {
            console.log(word.key + "  -  " + word.val)
            count--;
        }
        if (count == 0) break;
    }
}

let words_frequency = processTxt(arguments[0])

let stop_words_set = processStopWords()

let count = 25

print(count, words_frequency, stop_words_set)

