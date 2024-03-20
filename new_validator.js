const crypto = require('crypto');

export const validator = (input, word) => {
	let resultArr = [];
	const inputArr = Array.from(input);
	const wordArr = Array.from(word);
	const wordSet = new Set(wordArr);

	function hideLetterFrom(arr, index) {
		arr.splice(index, 1, '#');
	}

	function hideSubstring(str, start, end) {
		let replacement = '#'.repeat(end - start);
		let newStr = str.substring(0, start) + replacement + str.substring(end);
		return newStr;
	}

	function populateResultArr() {
		Array.from(input).forEach((letter, index) => {
			resultArr.push({
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
				sequenceNumber: [],
				matchingIndices: new Set(),
				priority: 0,
			});
		});
	}

	function getPossibleLetters() {
		const result = inputArr.filter((letter, index) => {
			if (wordSet.has(letter)) {
				resultArr[index].isPossible = true;
				return true;
			}
		});
		return result;
	}

	function getPossibleUniqueLetters(possibleLetters) {
		const localWordArr = wordArr.slice();
		const result = possibleLetters.filter(letter => {
			if (localWordArr.indexOf(letter) !== -1) {
				localWordArr.splice(localWordArr.indexOf(letter), 1);
				return true;
			}
		});
		return result;
	}

	function getMatchingIndices(letter, arr) {
		const indices = arr.reduce((acc, l, index) => {
			if (l === letter) {
				acc.push(index);
			}
			return acc;
		}, []);
		return indices;
	}

	function longestCommonSubstring(str1, str2) {
		let matrix = Array(str1.length + 1)
			.fill(null)
			.map(() => Array(str2.length + 1).fill(0));
		let maxLength = 0;
		let end = 0;

		for (let i = 1; i <= str1.length; i++) {
			for (let j = 1; j <= str2.length; j++) {
				if (str1[i - 1] === str2[j - 1]) {
					matrix[i][j] = matrix[i - 1][j - 1] + 1;
					if (matrix[i][j] > maxLength) {
						maxLength = matrix[i][j];
						end = i - 1;
					}
				}
			}
		}

		return str1.slice(end - maxLength + 1, end + 1);
	}

	function matchStrings(str, substring) {
		let startIndex = str.indexOf(substring);
		if (startIndex !== -1) {
			let endIndex = startIndex + substring.length;
			return [startIndex, endIndex];
		} else {
			return null;
		}
	}

	function getSequences() {
		resultArr.forEach(element => {
			const nextLetter = resultArr[element.index + 1]?.letter;
			const previousLetter = resultArr[element.index - 1]?.letter;
			const wordIndices = getMatchingIndices(element.letter, wordArr);
			wordIndices.forEach(i => {
				if (wordArr[i - 1] === previousLetter) {
					element.matchingIndices.add(i);
				}
				if (wordArr[i + 1] === nextLetter) {
					element.matchingIndices.add(i);
				}
			});
			console.log('element ', element.index, element.letter, ' indexes: ', ...element.matchingIndices);
		});

		let substrings = [];
		let newInput = input.slice();
		let newWord = word.slice();
		(function getAllSubstrings() {
			let substr1 = longestCommonSubstring(newInput, newWord);
			console.log('substr1: ', substr1);
			newInput = newInput.replace(substr1, '');
			newWord = newWord.replace(substr1, '');
			if (!substr1) {
				return;
			} else {
				substrings.push(substr1);
				getAllSubstrings();
			}
		})();

		console.log('substrings: ', substrings);

		let localInput = input.slice();
		let indices = [];

		substrings.forEach((substring, i) => {
			indices.push(matchStrings(localInput, substring));
			console.log('indices: ', indices);
			localInput = hideSubstring(localInput, indices[i][0], indices[i][1]);
			console.log('localInput: ', localInput);
		});

		indices.forEach(index => {
			let range = Array.from({ length: index[1] - index[0] }, (_, i) => i + index[0]);
			console.log('range: ', range);
			//let elements = [];
			if (range.length > 1) {
				range.forEach((index, i) => {
					if (i === 0) {
						resultArr[index].isFirstInSequence = true;
						resultArr[index].isInSequence = true;
					} else if (i === range.length - 1) {
						resultArr[index].isLastInSequence = true;
						resultArr[index].isInSequence = true;
					} else {
						resultArr[index].isInSequence = true;
					}
					//elements.push(resultArr.find(element => element.index === index));
				});
			}
			//console.log('elements: ', elements);
		});
	}

	function checkFirstLetter() {
		if (resultArr[0].letter === word[0]) {
			resultArr[0].isFirst = true;
			//resultArr[0].isCorrectOrder = true;
			resultArr[0].priority += 3;
		}
	}

	function checkLastLetter() {
		if (resultArr[resultArr.length - 1].letter === word[word.length - 1]) {
			resultArr[resultArr.length - 1].isLast = true;
			//resultArr[resultArr.length - 1].isCorrectOrder = true;
			resultArr[resultArr.length - 1].priority += 3;
		}
	}

	function checkOrder() {
		const usedLettersArray = resultArr.filter(letter => letter.isUsed);
		let tempWordArray = wordArr.slice();
		usedLettersArray.forEach(element => {
			if (tempWordArray.indexOf(element.letter) !== -1) {
				resultArr[element.index].isCorrectOrder = true;
				resultArr[element.index].priority += 1;
				tempWordArray = tempWordArray.slice(tempWordArray.indexOf(element.letter) + 1);
			}
		});
	}

	function getUsedLetters() {
		possibleUniqueLetters.forEach(letter => {
			const indices = getMatchingIndices(letter, inputArr);
			const sortedIndices = indices.sort((a, b) => {
				return resultArr[b].priority - resultArr[a].priority;
			});
			resultArr[sortedIndices[0]].isUsed = true;
			hideLetterFrom(inputArr, sortedIndices[0]);
		});
	}

	populateResultArr();
	const possibleLetters = getPossibleLetters();
	const possibleUniqueLetters = getPossibleUniqueLetters(possibleLetters);
	getSequences();
	checkFirstLetter();
	checkLastLetter();
	getUsedLetters();
	checkOrder();
	console.log(word);
	return resultArr;
};
