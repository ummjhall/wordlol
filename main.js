const answers = require('./answers');
const helpers = require('./helpers');
const bestGuesses = require('./best-guesses');
const allWords = [...answers, ...helpers].sort();

// print results after knowing the answer
function printResults(answer, ...guesses) {
    let remaining;
    for (let i = 0; i < guesses.length; i++) {
        let guess = guesses[i];
        console.log("Guess: " + guess);
        console.log("Remaining:");
        remaining = filterAnswers(checkGuess(guess, answer), answers);
        console.log(remaining.length, remaining);
    }
    if (remaining.length === 1) return 'Success';
    else return 'Failure';
}
// find best nth guess after knowing the answer
function checkBestNext(answer, ...guesses) {
    let remaining = [...answers];

    for (let i = 0; i < guesses.length; i++) {
        let guess = guesses[i];
        console.log("Guess: " + guess);
        let guessResults = checkGuess(guess, answer);
        // console.log("Guess results:\n" + guessResults);
        remaining = filterAnswers(guessResults, remaining);
        console.log("Number remaining: " + remaining.length);
    }

    if (remaining.length === 1) return remaining[0];
    else return findBestGuesses(remaining, allWords);
}
// find the avg remaining after a predetermined set of guesses
function testGuessSet(possibleAnswers, ...guesses) {
    let sumRemaining = 0;
    let maxRemaining = -Infinity;
    let minRemaining = Infinity;

    for (let i = 0; i < possibleAnswers.length; i++) {
        let answer = possibleAnswers[i];
        let reduced = [...possibleAnswers];

        for (let j = 0; j < guesses.length; j++) {
            let guessResults = checkGuess(guesses[j], answer);
            reduced = filterAnswers(guessResults, reduced);
        }

        sumRemaining += reduced.length;
        if (reduced.length > maxRemaining) {
            maxRemaining = reduced.length;
        }
        if (reduced.length < minRemaining) {
            minRemaining = reduced.length;
        }
    }

    let avgRemaining = sumRemaining / possibleAnswers.length;
    return {avgRemaining: avgRemaining, maxRemaining: maxRemaining, minRemaining: minRemaining};
}
// find the best words or best x num of words
function findBestGuesses(possibleAnswers, possibleGuesses) {
    let bestWords = [];
    // let numBestWords = 10;

    // iterate through all possible guesses
    for (let i = 0; i < possibleGuesses.length; i++) {
        console.clear();
        console.log(i);
        let guess = possibleGuesses[i];
        let sumRemaining = 0;

        // iterate through all possible answers
        for (let j = 0; j < possibleAnswers.length; j++) {
            let answer = possibleAnswers[j];

            // accum number of remaining possibilities after making guess
            let guessResults = checkGuess(guess, answer);
            let reduced = filterAnswers(guessResults, possibleAnswers);
            let numRemaining = reduced.length;
            sumRemaining += numRemaining;
        }

        // find avg and update the best word if better than the current best
        let avgRemaining = sumRemaining / possibleAnswers.length;

        // if (bestWords.length < numBestWords) {
        //     bestWords.push({word: guess, avgRemaining: avgRemaining.toFixed(2)})
        //     bestWords.sort((a, b) => a.avgRemaining - b.avgRemaining);
        // } else if (avgRemaining < bestWords[bestWords.length - 1].avgRemaining) {
        //     bestWords.push({word: guess, avgRemaining: avgRemaining.toFixed(2)})
        //     bestWords.sort((a, b) => a.avgRemaining - b.avgRemaining);
        //     bestWords.pop();
        // }

        bestWords.push({word: guess, avgRemaining: avgRemaining.toFixed(2)});
    }

    bestWords.sort((a, b) => a.avgRemaining - b.avgRemaining);
    return bestWords;
}
// find the word that reduces solutions the most on average on one guess
function findBestGuess(possibleAnswers, possibleGuesses) {
    let bestWord;
    let minAvg = Infinity;

    // iterate through all possible guesses
    for (let i = 0; i < possibleGuesses.length; i++) {
        console.clear();
        console.log(i);
        let guess = possibleGuesses[i];
        let sumRemaining = 0;

        // iterate through all possible answers
        for (let j = 0; j < possibleAnswers.length; j++) {
            let answer = possibleAnswers[j];

            // accum number of remaining possibilities after making guess
            let guessResults = checkGuess(guess, answer);
            let reduced = filterAnswers(guessResults, possibleAnswers);
            let numRemaining = reduced.length;
            sumRemaining += numRemaining;
        }

        // find avg and update the best word if better than the current best
        let avgRemaining = sumRemaining / possibleAnswers.length;
        if (avgRemaining < minAvg) {
            minAvg = avgRemaining;
            bestWord = guess;
        }
    }

    return {bestWord: bestWord, avgRemaining: minAvg};
}
// return remaining solutions after making a guess
function filterAnswers(guessResults, possibleAnswers) {
    let reduced = [...possibleAnswers];

    reduced = reduced.filter(word => {
        // eliminate if correct letters not in correct spot
        // console.log('FIRST FILTER');
        for (char in guessResults.correct) {
            let index = guessResults.correct[char];
            if (word[index] !== char) {
                // console.log("Correct letters ok: false");
                return false;
            }
            // else console.log("Correct letters ok: true");
        }

        // eliminate if misplaced letters not present or in same spot
        // console.log('SECOND FILTER');
        for (char in guessResults.close) {
            let index = guessResults.close[char];
            if (!word.includes(char) || word[index] === char) {
                // console.log("Close letters ok: false");
                return false;
            }
            // else console.log("Close letters ok: true");
        }

        // eliminate if known char counts incorrect
        // console.log('THIRD FILTER');
        let wordCounts = getCharCounts(word);
        for (char in guessResults.exactCounts) {
            let count = guessResults.exactCounts[char];
            if (wordCounts[char] !== count) {
                // console.log("Char counts ok: false");
                return false;
            }
            // else console.log("Char counts ok: true");
        }

        // eliminate if incorrect letters present
        // console.log('FOURTH FILTER');
        for (let i = 0; i < guessResults.incorrect.length; i++) {
            let char = guessResults.incorrect[i];
            if (word.includes(char)) {
                // console.log("Incorrect ok: false");
                return false;
            }
            // else console.log("Incorrect ok: true");
        }

        return true;
    });

    return reduced;
}
// return an object holding guess results
function checkGuess(guess, answer) {
    let guessResults = {
        correct: {},
        close: {},
        exactCounts: {},
        incorrect: []
    }

    for (let i = 0; i < guess.length; i++) {
        let gChar = guess[i];
        let aChar = answer[i];

        if (gChar === aChar) {
            guessResults.correct[gChar] = i;
        } else if (answer.includes(gChar)) {
            guessResults.close[gChar] = i;
        } else {
            guessResults.incorrect.push(gChar);
        }
    }

    guessResults.exactCounts = getExactCounts(guess, answer);

    return guessResults;
}
// if guess has repeating chars numbering more than answer's, return answer's counts
function getExactCounts(guess, answer) {
    let exactCounts = {}
    let guessCounts = getCharCounts(guess);
    let answerCounts = getCharCounts(answer);

    for (char in guessCounts) {
        let count = guessCounts[char];
        if (count > 1 && count > answerCounts[char]) {
            exactCounts[char] = answerCounts[char];
        }
    }

    return exactCounts;
}
// count the chars
function getCharCounts(word) {
    let counts = {};
    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        if (counts[char]) counts[char] += 1;
        else counts[char] = 1;
    }
    return counts;
}

// // testing individual functions
// console.log(printResults('ethos', 'heart', 'theme', 'eight', 'ethos'));
// console.log(checkBestNext('ethos', 'naieo', 'stove'));
// console.log(testGuessSet(answers, 'heart', 'lions', 'pudgy', 'backs', 'femme'));
// console.log(findBestGuesses(answers, allWords));
// console.log(findBestGuess(answers.slice(0, 300), allWords.slice(0, 300));
// console.log(filterAnswers(checkGuess('aback', 'quack'), ['quack', 'bacon', 'auack', 'sonic']));
// console.log(checkGuess('aback', 'quack'));
// console.log(getExactCounts('aaabb', 'aaccb'));
// console.log(getCharCounts('comic'));

// // curiosity
// console.log(bestGuesses.filter(word => word.includes('a') && word.includes('e') && word.includes('i') && word.includes('o')));
// console.log(allWords.filter(word => !word.includes('a') && !word.includes('e') && !word.includes('i') && !word.includes('o') && !word.includes('u')));
// console.log(bestGuesses.filter(word => answers.includes(word)));
