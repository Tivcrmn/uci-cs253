#!/usr/bin/env python
import re, sys, operator

# Mileage may vary. If this crashes, make it lower
RECURSION_LIMIT = 1500
# We add a few more, because, contrary to the name,
# this doesn't just rule recursion: it rules the 
# depth of the call stack
sys.setrecursionlimit(RECURSION_LIMIT+10)

def helper_count(word_list, stopwords, wordfreqs):
    word = word_list[0]
    if word not in stopwords:
        if word in wordfreqs:
            wordfreqs[word] += 1
        else:
            wordfreqs[word] = 1
    return True

def helper_wf_print(wordfreq):
    (w, c) = wordfreq[0]
    print w, '-', c
    return True

# Y combinator from https://github.com/crista/EPS-slides/blob/master/lambda.py
Y = lambda F: F(lambda x: Y(F)(x))

# Y combinator for count and wf_print
count = Y(lambda f: lambda word_list: lambda stopwords: lambda wordfreqs:None if word_list == [] else helper_count(word_list, stopwords, wordfreqs) and f(word_list[1:])(stopwords)(wordfreqs))
wf_print = Y(lambda f: lambda wordfreq: None if wordfreq == [] else helper_wf_print(wordfreq) and f(wordfreq[1:]))

stop_words = set(open('../stop_words.txt').read().split(','))
words = re.findall('[a-z]{2,}', open(sys.argv[1]).read().lower())
word_freqs = {}
# Theoretically, we would just call count(words, word_freqs)
# Try doing that and see what happens.
for i in range(0, len(words), RECURSION_LIMIT):
    count(words[i:i+RECURSION_LIMIT])(stop_words)(word_freqs)

wf_print(sorted(word_freqs.iteritems(), key=operator.itemgetter(1), reverse=True)[:25])