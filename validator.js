export const validator = (input, word) => {
	let inputArray = [];
	let correctLettersArray = [];
	let possibleLetterIndexes = [];

	function populateInputArray() {
		Array.from(input).forEach((letter, index) => {
			inputArray.push({
				index: index,
				letter: letter,
				isPossible: false,
				isUsed: false,
				isFirst: false,
				isLast: false,
				isCorrectOrder: false,
				isInSequence: false,
				isFirstInSequence: false,
				isLastInSequence: false,
				sequenceNumber: null,
			});
		});
	}

	function checkForPossibleLetters() {
		const inputArr = Array.from(input);
		const wordArr = Array.from(word); //used to check if letter is in word even if duplicated
		let wordArrMutable = Array.from(word); //used to get actual unique letters
		inputArr.forEach((letter, index) => {
			if (wordArr.includes(letter)) {
				inputArray[index].isPossible = true;
			}
			if (wordArrMutable.includes(letter)) {
				correctLettersArray.push(letter);
				wordArrMutable.splice(wordArrMutable.indexOf(letter), 1); //remove letter from wordArrMutable to avoid duplicates
			}
		});
	}

	function searchForSequence() {
		inputArray
			.filter(letter => letter.isPossible)
			.forEach(letter => {
				possibleLetterIndexes.push({ l: letter.letter, i: letter.index });
			});

		for (let i = 0; i < possibleLetterIndexes.length; i++) {
			if (
				correctLettersArray.includes(possibleLetterIndexes[i].l) &&
				possibleLetterIndexes[i + 1] &&
				correctLettersArray.includes(possibleLetterIndexes[i + 1].l) &&
				possibleLetterIndexes[i + 1].i - possibleLetterIndexes[i].i === 1
			) {
				let wordArr = Array.from(word);
				let currentLetterWordIndex = wordArr.indexOf(possibleLetterIndexes[i].l);
				// change all letters in wordArr from index 0 to currentLetterWordIndex to '#'
				wordArr.fill('#', 0, currentLetterWordIndex + 1);
				let nextLetterWordIndex = wordArr.indexOf(possibleLetterIndexes[i + 1].l);
				if (currentLetterWordIndex + 1 === nextLetterWordIndex) {
					inputArray[possibleLetterIndexes[i].i].isUsed = true;
					inputArray[possibleLetterIndexes[i].i].isInSequence = true;
					inputArray[possibleLetterIndexes[i].i].sequenceNumber = currentLetterWordIndex;
					inputArray[possibleLetterIndexes[i + 1].i].isUsed = true;
					inputArray[possibleLetterIndexes[i + 1].i].isInSequence = true;
					inputArray[possibleLetterIndexes[i + 1].i].sequenceNumber = nextLetterWordIndex;
					correctLettersArray.splice(correctLettersArray.indexOf(possibleLetterIndexes[i].l), 1);
					if (
						inputArray[possibleLetterIndexes[i].i].index === 0 &&
						inputArray[possibleLetterIndexes[i].i].letter === word[0]
					) {
						inputArray[possibleLetterIndexes[i].i].isFirst = true;
					}
				}
			} else if (inputArray[possibleLetterIndexes[i].i].isInSequence) {
				correctLettersArray.splice(correctLettersArray.indexOf(possibleLetterIndexes[i].l), 1);
				if (
					inputArray[possibleLetterIndexes[i].i].index === inputArray.length - 1 &&
					inputArray[possibleLetterIndexes[i].i].letter === word[word.length - 1]
				) {
					inputArray[possibleLetterIndexes[i].i].isLast = true;
				}
			}
		}
	}

	function checkForFirstLetter() {
		if (inputArray[0].letter === word[0]) {
			inputArray[0].isPossible = true;
			inputArray[0].isUsed = true;
			inputArray[0].isFirst = true;
			inputArray[0].isCorrectOrder = true;
			correctLettersArray.splice(correctLettersArray.indexOf(inputArray[0].letter), 1);
		}
	}

	function checkForLastLetter() {
		if (inputArray[inputArray.length - 1].letter === word[word.length - 1]) {
			inputArray[inputArray.length - 1].isPossible = true;
			inputArray[inputArray.length - 1].isUsed = true;
			inputArray[inputArray.length - 1].isLast = true;
			inputArray[inputArray.length - 1].isCorrectOrder = true;
			correctLettersArray.splice(correctLettersArray.indexOf(inputArray[inputArray.length - 1].letter), 1);
		}
	}

	function checkForRemainingLetters() {
		if (correctLettersArray.length > 0) {
			let remainingLetters = inputArray.filter(letter => letter.isPossible && !letter.isUsed);
			remainingLetters.forEach((letter, index) => {
				if (correctLettersArray.includes(letter.letter)) {
					inputArray[letter.index].isUsed = true;
					correctLettersArray.splice(correctLettersArray.indexOf(letter.letter), 1);
					if (
						inputArray[possibleLetterIndexes[index].i].index === 0 &&
						inputArray[possibleLetterIndexes[index].i].letter === word[0]
					) {
						inputArray[possibleLetterIndexes[index].i].isFirst = true;
					} else if (
						inputArray[possibleLetterIndexes[index].i].index === inputArray.length - 1 &&
						inputArray[possibleLetterIndexes[index].i].letter === word[word.length - 1]
					) {
						inputArray[possibleLetterIndexes[index].i].isLast = true;
					}
				}
			});
		}
	}

	function checkOrder() {
		let checkOrderWord = [...word].join('');
		let usedLettersArray = [];
		let usedIndexesArray = [];
		let tempLetterArray = [];
		let tempIndexArray = [];

		inputArray.forEach(letter => {
			if (letter.isUsed && !letter.isInSequence) {
				if (tempLetterArray.length > 0) {
					usedLettersArray.push(tempLetterArray.join(''));
					usedIndexesArray.push('test');
					tempLetterArray = [];
					tempIndexArray = [];
				}
				usedLettersArray.push(letter.letter);
				usedIndexesArray.push(letter.index);
			} else if (letter.isUsed && letter.isInSequence && !letter.isLastInSequence) {
				tempLetterArray.push(letter.letter);
				console.log('loop 1 letter.index: ', letter.index);
				tempIndexArray.push(letter.index);
			} else if (letter.isUsed && letter.isInSequence && letter.isLastInSequence) {
				tempLetterArray.push(letter.letter);
				usedLettersArray.push(tempLetterArray.join(''));
				tempLetterArray = [];
				console.log('tempIndexArray in loop before push: ', tempIndexArray);
				tempIndexArray.push(letter.index);
				console.log('letter.index in loop: ', letter.index);
				console.log('tempIndexArray in loop: ', tempIndexArray);
				usedIndexesArray.push('test2');
				tempIndexArray = [];
			}
		});
		console.log('usedLettersArray: ', usedLettersArray);
		console.log('checkOrderWord: ', checkOrderWord);
		console.log('usedIndexesArray: ', usedIndexesArray);
		usedLettersArray.forEach((str, i) => {
			let index = checkOrderWord.indexOf(str);
			if (index !== -1) {
				inputArray[usedIndexesArray[i]].isCorrectOrder = true;
				checkOrderWord = checkOrderWord.replace(str, '#');
				console.log('checkOrderWord 2: ', checkOrderWord);
			}
		});

		let currentLetterWordIndex = 0;
		usedLettersArray.forEach(letter => {
			if (checkOrderArray.includes(letter.letter)) {
				currentLetterWordIndex = checkOrderArray.indexOf(letter.letter);
				checkOrderArray = checkOrderArray.splice(currentLetterWordIndex);
				inputArray[letter.index].isCorrectOrder = true;
			}
		});
	}

	function findPositionInSequence() {
		for (let i = 0; i < inputArray.length; i++) {
			if (
				inputArray[i].isInSequence &&
				(!inputArray[i - 1] ||
					!inputArray[i - 1].isInSequence ||
					inputArray[i - 1].sequenceNumber !== inputArray[i].sequenceNumber - 1)
			) {
				inputArray[i].isFirstInSequence = true;
			} else if (
				inputArray[i].isInSequence &&
				(!inputArray[i + 1] ||
					!inputArray[i + 1].isInSequence ||
					inputArray[i + 1].sequenceNumber !== inputArray[i].sequenceNumber + 1)
			) {
				inputArray[i].isLastInSequence = true;
			}
		}
	}

	populateInputArray();
	checkForPossibleLetters();
	console.log('original correctLettersArray: ', correctLettersArray);
	//checkForFirstLetter();
	//console.log('correctLettersArray after first letter: ', correctLettersArray);
	//checkForLastLetter();
	//console.log('correctLettersArray after last letter: ', correctLettersArray);
	searchForSequence();
	console.log('correctLettersArray after sequence: ', correctLettersArray);
	checkForRemainingLetters();
	console.log('correctLettersArray after remaining letters: ', correctLettersArray);
	findPositionInSequence();
	checkOrder();
	console.log('inputArray: ', inputArray);
	return inputArray;
};

//validator('fantastyka', 'migotać');
validator('trele', 'bambetle');
