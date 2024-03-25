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

	const getAllSubstrings = (input, word, hide) => {
		let useHide = hide;
		let substrings = [];
		let newInput = input.slice();
		let newWord = word.slice();
		(function _getAllSubstrings() {
			let substr1 = longestCommonSubstring(newInput, newWord);
			newInput = newInput.replace(substr1, '');
			if (useHide) {
				newWord = newWord.replace(substr1, '');
			}
			if (substr1.length <= 1) {
				return;
			} else {
				substrings.push(substr1);
				_getAllSubstrings();
			}
		})();
		return substrings;
	};

	const getAllMatches = (string, substring) => {
		let result = [];
		const windowSize = substring.length;
		for (let i = 0; i < string.length - windowSize + 1; i++) {
			let window = string.slice(i, i + windowSize);
			if (window === substring) {
				result.push([i, i + windowSize]);
			}
		}
		return result;
	};

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
		});

		let substrings = getAllSubstrings(input, word, false);

		let uniqueSubstrings = Array.from(new Set(substrings));

		let substringsInInput = new Map();
		uniqueSubstrings.forEach(substring => {
			substringsInInput.set(substring, new Map());
			substringsInInput.get(substring).set('indices', getAllMatches(input, substring));
			substringsInInput.get(substring).set('length', getAllMatches(input, substring).length);
		});

		let substringsInWord = new Map();
		uniqueSubstrings.forEach(substring => {
			substringsInWord.set(substring, new Map());
			substringsInWord.get(substring).set('indices', getAllMatches(word, substring));
			substringsInWord.get(substring).set('length', getAllMatches(word, substring).length);
		});

		let chosenIndices = [];
		substringsInWord.forEach((value, key) => {
			let maxNumberOfMatches = Math.min(
				substringsInWord.get(key).get('length'),
				substringsInInput.get(key).get('length')
			);

			let indicesArr = substringsInInput.get(key).get('indices');

			let ranges = [];
			indicesArr.forEach(index => {
				let range = Array.from({ length: index[1] - index[0] }, (_, i) => i + index[0]);
				if (range.length > 1) {
					let prioritySum = 0;
					range.forEach((index, i) => {
						prioritySum += resultArr[index].priority;
					});
					ranges.push(
						new Map([
							['range', range],
							['prioritySum', prioritySum],
						])
					);
				}
			});

			let topNMatches = ranges.sort((a, b) => {
				return b.get('prioritySum') - a.get('prioritySum');
			});

			let chosenMatches = topNMatches.slice(0, maxNumberOfMatches);
			chosenMatches.forEach(match => {
				chosenIndices.push(match.get('range'));
			});
		});
		console.log('chosenIndices');
		console.log(chosenIndices);

		//todo: check if chosenIndices are overlapping

		chosenIndices.forEach(element => {
			element.forEach((index, i) => {
				if (i === 0) {
					resultArr[index].isFirstInSequence = true;
					resultArr[index].isInSequence = true;
					resultArr[index].priority += 2;
				} else if (i === element.length - 1) {
					resultArr[index].isLastInSequence = true;
					resultArr[index].isInSequence = true;
					resultArr[index].priority += 2;
				} else {
					resultArr[index].isInSequence = true;
					resultArr[index].priority += 2;
				}
			});
		});
	}

	function checkFirstLetter() {
		if (resultArr[0].letter === word[0]) {
			resultArr[0].isFirst = true;
			resultArr[0].priority += 3;
		}
	}

	function checkLastLetter() {
		if (resultArr[resultArr.length - 1].letter === word[word.length - 1]) {
			resultArr[resultArr.length - 1].isLast = true;
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
	checkFirstLetter();
	checkLastLetter();
	checkOrder();
	getSequences();
	getUsedLetters();
	return resultArr;
};
