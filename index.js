import { validator } from './validator.js';

function getElement(id) {
	return document.getElementById(id);
}

// elements
const startBtn = getElement('start-btn');
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
const buttons = [
	enterBtn,
	startBtn,
	instructionsBtn,
	closeInstructionsBtn,
	playAgainBtn,
	infoBtn,
	closeInfoBtn,
	backspace,
	...keyboard,
];

//const serverUrl = 'https://diffle-be-lingering-log-9938.fly.dev';
const serverUrl = 'http://localhost:3000';
const renderTimeout = 300;
const errorTimeout = 2000;

let word = '';
let guessWords = [];
let isMobile = false;

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
			output.innerHTML = '';
			guessWords = [];
			localStorage.removeItem('diffle-word');
			localStorage.removeItem('diffle-input');
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

async function restartGame() {
	localStorage.removeItem('diffle-word');
	localStorage.removeItem('diffle-input');
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
		restartGame();
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
		restartGame();
	}
}

function setOutputMaxHeight() {
	const keyboardHeight = getElement('input-keyboard-wrapper').offsetHeight;
	const headerHeight = header.offsetHeight;
	output.style.top = `${headerHeight}px`;
	output.style.maxHeight = `calc(100vh - ${keyboardHeight}px - ${headerHeight}px)`;
}

// event listeners
enterBtn.addEventListener('click', async () => {
	const localInput = input.value.toLowerCase();
	if (!localInput) {
		input.focus();
		return;
	}
	const isWordInDict = await checkWord(localInput);
	if (isWordInDict.message) {
		validate(word);
		input.focus();
	} else {
		errorText.innerHTML = '<p>Słowo "<span id="error-word"></span>" nie występuje w słowniku!</p>';
		getElement('error-word').innerText = localInput;
		errorDialog.showModal();
		setTimeout(() => {
			errorDialog.close();
			input.focus();
		}, errorTimeout);
	}
});

startBtn.addEventListener('click', () => {
	restartGame();
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

if (isMobile) {
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
	restartGame();
	document.removeEventListener('keydown', disableEscapeKey);
	successDialog.close();
});

// init
isMobile = isMobileDevice();
setOutputMaxHeight();
loadFromLocalStorage();
