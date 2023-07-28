const answers = require('./answers');
const helpers = require('./helpers');
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
// find the word that reduces solutions the most on average on one guess
function findBestGuess(possibleAnswers, possibleGuesses) {
    let bestWord;
    let minAvg = Infinity;

    // iterate through all possible guesses
    for (let i = 0; i < possibleGuesses.length; i++) {
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
    let possibleAnswersCopy = [...possibleAnswers];

    let reduced = possibleAnswersCopy.filter(word => {
        // eliminate if correct letters not in correct spot
        for (char in guessResults.correct) {
            let index = guessResults.correct[char];
            if (word[index] !== char) {
                return false;
            }
        }

        // eliminate if misplaced letters not present or in same spot
        for (char in guessResults.close) {
            let index = guessResults.close[char];
            if (!word.includes(char) || word[index] === char) {
                return false;
            }
        }

        // eliminate if known char counts incorrect
        let wordCounts = getCharCounts(word);
        for (char in guessResults.exactCounts) {
            let count = guessResults.exactCounts[char];
            if (wordCounts[char] !== count) {
                return false;
            }
        }

        // eliminate if incorrect letters present
        for (let i = 0; i < guessResults.incorrect; i++) {
            let char = guessResults.incorrect[i];
            if (word.includes(char)) {
                return false;
            }
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
// console.log(getCharCounts('comic'));
// console.log(getExactCounts('aaabb', 'aaccb'));
// console.log(checkGuess('aback', 'quack'));
// console.log(filterAnswers(checkGuess('aback', 'quack'), ['quack', 'bacon', 'auack', 'sonic']));
// console.log(findBestGuess(answers.slice(0, 300), allWords.slice(0, 300));
console.log(printResults('ethos', 'heart', 'theme', 'eight', 'ethos'));
