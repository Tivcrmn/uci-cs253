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

module.exports = {
    transform : transform
}