import { validator } from './validator.js';

function getElement(id) {
	return document.getElementById(id);
}

// elements
const resetBtn = getElement('reset-btn');
const enterBtn = getElement('enter-btn');
const header = getElement('header');
const input = getElement('input');
const output = getElement('output');
const keyboard = Array.from(document.getElementsByClassName('key'));
const backspace = getElement('backspace-btn');
const instructionsDialog = getElement('instructions-dialog');
const instructionsBtn = getElement('instructions-btn');
const closeInstructionsBtn = getElement('close-instructions-btn');
const successDialog = getElement('success-dialog');
const playAgainBtn = getElement('play-again-btn');
const infoDialog = getElement('info-dialog');
const closeInfoBtn = getElement('close-info-btn');
const infoBtn = getElement('info-btn');
const errorDialog = getElement('error-dialog');
const errorText = getElement('error-text');
const inputBubble = getElement('input-bubble');
const buttons = [
	enterBtn,
	resetBtn,
	instructionsBtn,
	closeInstructionsBtn,
	playAgainBtn,
	infoBtn,
	closeInfoBtn,
	backspace,
	...keyboard,
];

const serverUrl = 'https://diffly-be-bun.onrender.com';
const renderTimeout = 300;
const errorTimeout = 2000;

let word = '';
let guessWords = [];
let isMobile = false;
let time = [];

// functions
async function getWord() {
	try {
		const response = await fetch(serverUrl + '/getword');
		const data = await response.json();
		const result = data.word.toLowerCase();
		localStorage.setItem('diffle-word', result);
		word = result;
	} catch (error) {
		console.error('Error:', error);
		errorText.innerText = 'Przepraszam, wystąpił błąd podczas pobierania słowa!';
		errorDialog.showModal();
	}
}

async function checkWord(inputWord) {
	try {
		const response = await fetch(serverUrl + '/checkword', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ word: inputWord }),
		});
		return response.json();
	} catch (error) {
		console.error('Error:', error);
		errorText.innerText = 'Przepraszam, wystąpił błąd podczas sprawdzania słowa!';
		errorDialog.showModal();
	}
}

const addClasses = (letter, newLetter) => {
	const classList = ['letter'];
	getElement(`${letter.letter}-btn`).classList.add('letter');

	if (letter.isUsed) {
		classList.push('used');
		getElement(`${letter.letter}-btn`).classList.add('used');
	}
	if (letter.isFirst) {
		classList.push('first');
	}
	if (letter.isLast) {
		classList.push('last');
	}
	if (letter.isCorrectOrder) {
		classList.push('correct-order');
		getElement(`${letter.letter}-btn`).classList.add('correct-order');
	}
	if (letter.isInSequence && !letter.isFirstInSequence && !letter.isLastInSequence) {
		classList.push('middle-in-sequence');
	}
	if (letter.isFirstInSequence) {
		classList.push('first-in-sequence');
	}
	if (letter.isLastInSequence) {
		classList.push('last-in-sequence');
	}

	newLetter.classList.add(...classList);
};

const clearClasses = () => {
	const keys = Array.from(document.getElementsByClassName('key'));
	keys.forEach(key => {
		key.className = 'key';
	});
};

function conjugateWord(num, word1, word2, word3) {
	if (num === 1) {
		return word1;
	} else if (num >= 10 && num <= 14) {
		return word3;
	} else if (getLastDigit(num) >= 2 && getLastDigit(num) <= 4) {
		return word2;
	} else {
		return word3;
	}
}

function getLastDigit(number) {
	return parseInt(number.toString().slice(-1));
}

const validate = async word => {
	const guess = input.value.toLowerCase();
	const validatedWord = validator(guess, word);
	guessWords.push(validatedWord);
	localStorage.setItem('diffle-input', JSON.stringify(guessWords));
	input.value = '';
	renderWord(validatedWord, renderTimeout);
	if (guess === word) {
		setTimeout(() => {
			const dialog = getElement('success-dialog');
			dialog.showModal();
			getElement('password').innerText = word;
			const scoreWordsCount = getScore()[0];
			const scoreWordsText = conjugateWord(scoreWordsCount, 'słowo', 'słowa', 'słów');
			const scoreLettersCount = getScore()[1];
			const scoreLettersText = conjugateWord(scoreLettersCount, 'litera', 'litery', 'liter');
			const scoreMinutesCount = getScore()[2];
			const scoreMinutesText = conjugateWord(scoreMinutesCount, 'minuta', 'minuty', 'minut');
			const scoreSecondsCount = getScore()[3];
			const scoreSecondsText = conjugateWord(scoreSecondsCount, 'sekunda', 'sekundy', 'sekund');
			getElement(
				'score'
			).innerHTML = `Twój wynik to ${scoreWordsCount} ${scoreWordsText} i ${scoreLettersCount} ${scoreLettersText}<br> w czasie ${scoreMinutesCount} ${scoreMinutesText} i ${scoreSecondsCount} ${scoreSecondsText}!`;
			output.innerHTML = '';
			guessWords = [];
			localStorage.removeItem('diffle-word');
			localStorage.removeItem('diffle-input');
			localStorage.removeItem('diffle-time');
			clearClasses();
			document.addEventListener('keydown', disableEscapeKey);
		}, word.length * renderTimeout + 1000);
	}
};

function disableEscapeKey() {
	if (event.key === 'Escape') {
		event.preventDefault();
	}
}

function renderWord(word, timeout) {
	let newGuessWord = document.createElement('div');
	newGuessWord.classList.add('guess-word');
	output.appendChild(newGuessWord);
	word.forEach((letter, index) => {
		setTimeout(function () {
			let newLetter = document.createElement('div');
			addClasses(letter, newLetter);
			newLetter.innerText = letter.letter;
			newGuessWord.appendChild(newLetter);
			output.scrollTop = output.scrollHeight;
		}, index * timeout);
	});
}

async function resetGame() {
	localStorage.removeItem('diffle-word');
	localStorage.removeItem('diffle-input');
	localStorage.removeItem('diffle-time');
	time = [];
	input.value = '';
	output.innerHTML = '';
	clearClasses();
	await getWord();
	input.focus();
}

function isMobileDevice() {
	const isMobile = typeof window.orientation !== 'undefined' || navigator.userAgent.indexOf('IEMobile') !== -1;
	if (isMobile) {
		input.setAttribute('readonly', 'readonly');
	} else {
		input.removeAttribute('readonly');
	}
}

function loadFromLocalStorage() {
	const loadedWord = localStorage.getItem('diffle-word');
	if (loadedWord) {
		word = loadedWord;
	} else {
		resetGame();
	}

	const loadedInput = localStorage.getItem('diffle-input');
	if (loadedInput) {
		const loadedWords = JSON.parse(loadedInput);
		guessWords = loadedWords;
		input.value = '';
		loadedWords.forEach(word => {
			renderWord(word, 0);
		});
	} else {
		resetGame();
	}

	const loadedTime = localStorage.getItem('diffle-time');
	if (loadedTime) {
		time = JSON.parse(loadedTime);
	} else {
		time = [];
	}
}

function setOutputMaxHeight() {
	const keyboardHeight = getElement('input-keyboard-wrapper').offsetHeight;
	const headerHeight = header.offsetHeight;
	output.style.top = `${headerHeight}px`;
	output.style.maxHeight = `calc(100dvh - ${keyboardHeight}px - ${headerHeight}px)`;
}

function getScore() {
	const scoreWords = guessWords.length;
	const scoreLetters = guessWords.reduce((acc, word) => acc + word.length, 0);
	const timeInSeconds = Math.round((time[time.length - 1] - time[0]) / 1000);
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = timeInSeconds % 60;
	return [scoreWords, scoreLetters, minutes, seconds];
}

function saveTime(time) {
	time.push(new Date().getTime());
	localStorage.setItem('diffle-time', JSON.stringify(time));
}

// event listeners
enterBtn.addEventListener('click', async () => {
	const localInput = input.value.toLowerCase();
	if (!localInput) {
		input.focus();
		return;
	}
	saveTime(time);
	const isWordInDict = await checkWord(localInput);
	if (isWordInDict.message) {
		validate(word);
		input.focus();
	} else {
		inputBubble.innerHTML = '<p>Słowo "<span id="unknown-word"></span>" nie występuje w słowniku!</p>';
		getElement('unknown-word').innerText = localInput;
		inputBubble.classList.add('visible');
		setTimeout(() => {
			inputBubble.classList.remove('visible');
			inputBubble.innerHTML = '';
			input.focus();
		}, errorTimeout);
	}
});

resetBtn.addEventListener('click', () => {
	resetGame();
});

keyboard.forEach(key => {
	key.addEventListener('click', () => {
		input.value += key.innerText;
		input.focus();
	});
});

backspace.addEventListener('click', () => {
	input.value = input.value.slice(0, -1);
	input.focus();
});

document.addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.enter-btn').click();
	}
});

if (!isMobile) {
	document.addEventListener('keydown', function (event) {
		let key = event.key?.toLowerCase();
		let button = getElement(key + '-btn');
		if (button) {
			button.classList.add('pressed');
			setTimeout(function () {
				button.classList.remove('pressed');
			}, 200);
		}
	});
}

buttons.forEach(btn => {
	btn.addEventListener('click', event => {
		const button = event.target;
		if (button) {
			button.classList.add('pressed');
			setTimeout(function () {
				button.classList.remove('pressed');
			}, 200);
		}
	});
});

instructionsBtn.addEventListener('click', function () {
	instructionsDialog.classList.add('show');
});

closeInstructionsBtn.addEventListener('click', function () {
	instructionsDialog.classList.remove('show');
});

infoBtn.addEventListener('click', function () {
	infoDialog.classList.add('show');
});

closeInfoBtn.addEventListener('click', function () {
	infoDialog.classList.remove('show');
});

playAgainBtn.addEventListener('click', function () {
	resetGame();
	document.removeEventListener('keydown', disableEscapeKey);
	successDialog.close();
});

// init
isMobile = isMobileDevice();
setOutputMaxHeight();
loadFromLocalStorage();
