// it is just a helper function to process the word, to make the code more readable, 
// I keep it outside.
const fs = require('fs')
arguments = process.argv.splice(2)

const transform = word => {
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

const extract_stop_words = () => {
    let stop_words = fs.readFileSync('../stop_words.txt', 'utf8')
    stop_words = stop_words.split(",")
    let stop_words_set = new Set();
    for (let i = 0; i < stop_words.length; i++) {
        stop_words_set.add(stop_words[i])
    }
    return stop_words_set
}

const print = res => {
    let count = 25
    for (let i = 0; i < res.length; i++) {
        const word = res[i]
        if (word.key.length > 1) {
            console.log(word.key + "  -  " + word.val)
            count--;
        }
        if (count == 0) break;
    }
}

module.exports = {
    transform : transform,
    extract_stop_words : extract_stop_words,
    print : print
}