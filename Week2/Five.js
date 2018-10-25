/*eslint-disable semi */
const fs = require('fs')
args = process.argv.splice(2);

const read_file = file => fs.readFileSync(file, 'utf8')

const filter_chars_and_normalize = data => data.replace(/[^a-zA-Z]/g," ")  

const scan = data => {
    let map = new Map();
    let words = data.split(" ")
    for (let i = 0; i < words.length; i++) {
        let trans_word = transform(words[i])
        let isInMap = map.get(trans_word)
        if (trans_word.length > 0) {
            if (!isInMap) map.set(trans_word, 1)
            else map.set(trans_word, isInMap + 1)
        }
    }
    return map
}

const remove_stop_words = map => {
    return file => {
        let stop_words = fs.readFileSync(file, 'utf8')
        stop_words = stop_words.split(",")
        let stop_words_set = new Set();
        for (let i = 0; i < stop_words.length; i++) {
            stop_words_set.add(stop_words[i])
        }
        stop_words_set.forEach(stop_word => {
            if (map.has(stop_word)) {
                map.delete(stop_word)
            }
        })
        return map
    }
}

const sort = map => {
    let res = []
    let i = 0
    map.forEach((val, key) => {
        res[i] = {key, val}
        i++
    })
    res.sort((a, b) => b.val - a.val)
    return res
}

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

const print = words_frequency => {
    let count = 25
    for (let i = 0; i < words_frequency.length; i++) {
        const word = words_frequency[i]
        if (word.key.length > 1) {
            console.log(word.key + "  -  " + word.val)
            count--;
        }
        if (count == 0) break;
    }
}

// print result
print(sort(remove_stop_words(scan(filter_chars_and_normalize(read_file(args[0])))).call(this, args[1])))

