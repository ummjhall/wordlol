// const readline = require('readline');
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.question('What do you think of Node.js? ', (answer) => {
//   // TODO: Log the answer in a database
//   console.log('Thank you for your valuable feedback:', answer);
//   rl.close();
// });


let correct = [];
let close = [];
let incorrect = [];
let currNumPossible = possibilities.length;


console.log("Words: " + words.length);
console.log("Helpers: " + helpers.length);
console.log("");

const answer = words[1500];
// let guess;


findBestQuack();


function findBestQuack() {
    let min = Infinity;
    let bestWord;

    for (let i = 0; i < helpers.length; i++) {
        let guess = helpers[i];

        check(guess);
        filterP(correct, close, incorrect);

        if (possibilities.length < min) {
            min = possibilities.length;
            bestWord = guess;
        }

        possibilities = [...words];
        correct = [];
        close = [];
        incorrect = [];
    }

    console.log("Best word: " + bestWord);
    console.log("Possibilities reduced to : " + min);
}








function check(guess) {
    // console.log("You guessed: " + guess);

    let hint = '';

    for (let i = 0; i < guess.length; i++) {
        let gChar = guess[i];
        let aChar = answer[i];
        if (gChar === aChar) {
            correct.push([i, gChar])
            hint += gChar.toUpperCase();
        } else if (answer.includes(gChar)) {
            close.push([i, gChar])
            hint += gChar;
        } else {
            incorrect.push(gChar);
            hint += '_';
        }
    }

    // console.log("Here's your hint: " + hint + '\n');
}

function filterP(correct, close, incorrect) {
    possibilities = possibilities.filter(word => {
        for (let i = 0; i < correct.length; i++) {
            let index = correct[i][0];
            let char = correct[i][1];
            if (word[index] !== char) {
                return false;
            }
        }

        for (let i = 0; i < close.length; i++) {
            let index = close[i][0];
            let char = close[i][1];
            let indexRemoved = word.slice(0, index) + word.slice(index + 1);
            if (!indexRemoved.includes(char) || word[index] === char) {
                return false;
            }
        }

        for (let i = 0; i < incorrect.length; i++) {
            let char = incorrect[i];
            if (word.includes(char)) {
                return false;
            }
        }

        return true;
    });

    let numReduced = currNumPossible - possibilities.length;
    currNumPossible = possibilities.length;

    // console.log("Correct: " + correct);
    // console.log("Close: " + close);
    // console.log("Incorrect: " + incorrect + '\n');
    // console.log("Possibilities eliminated: " + numReduced);
    // console.log("Remaining possibilities: " + possibilities.length);
    // console.log("Possible answer: " + possibilities[0]);
}
