const answers = require('./answers');
const helpers = require('./helpers');
const allWords = [...answers, ...helpers].sort();



// let remaining = filterAnswers(checkGuess('heart', 'ethos'), answers);
// console.log(remaining.length, remaining);


let result = findBestGuess(answers.slice(0, 300), helpers.slice(0, 300));
console.log(result);

// console.log(filterAnswers(checkGuess('aback', 'quack'), ['quack', 'bacon', 'auack', 'sonic']));
// console.log(checkGuess('aback', 'quack'));
// console.log(getExactCounts('aaabb', 'aaccb'));
// console.log(getCharCounts('comic'));

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
            let numRemaining = filterAnswers(guessResults, possibleAnswers);
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

    let sumRemaining = 0;

    for (let i = 0; i < possibleAnswersCopy.length; i++) {
        let word = possibleAnswersCopy[i];

        let passing = true;
        for (char in guessResults.correct) {
            let index = guessResults.correct[char];
            if (word[index] !== char) {
                passing = false;
            }
        }

        for (char in guessResults.close) {
            let index = guessResults.close[char];
            if (!word.includes(char) || word[index] === char) {
                passing = false;
            }
        }

        let wordCounts = getCharCounts(word);
        for (char in guessResults.exactCounts) {
            let count = guessResults.exactCounts[char];
            if (wordCounts[char] !== count) {
                passing = false;
            }
        }

        for (let i = 0; i < guessResults.incorrect; i++) {
            let char = guessResults.incorrect[i];
            if (word.includes(char)) {
                passing = false;
            }
        }

        if (passing) sumRemaining++;
    }

    return sumRemaining;
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
