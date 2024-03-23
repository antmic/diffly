import { validator } from './validator.js';

function getElement(id) {
	return document.getElementById(id);
}

const startBtn = getElement('start-btn');
const enterBtn = getElement('enter-btn');
const input = getElement('input');
const output = getElement('output');
const keyboard = Array.from(document.getElementsByClassName('key'));
const backspace = getElement('backspace-btn');
const instructionsDialog = getElement('instructions-dialog');
const instructionsBtn = getElement('instructions-btn');
const closeInstructionsBtn = getElement('close-instructions-btn');
const successDialog = getElement('success-dialog');
const playAgainBtn = getElement('play-again-btn');
const closeSuccessBtn = getElement('close-success-btn');
const infoDialog = getElement('info-dialog');
const closeInfoBtn = getElement('close-info-btn');
const infoBtn = getElement('info-btn');

let word = '';
let guessWords = [];

async function getWord() {
	try {
		const response = await fetch('http://[2a09:8280:1::2f:fe8:0]:3000/getword');
		const data = await response.json();
		console.log('Success:', data.word);
		const result = data.word.toLowerCase();
		localStorage.setItem('diffle-word', result);
		word = result;
	} catch (error) {
		console.error('Error:', error);
	}
}

async function checkWord(inputWord) {
	try {
		const response = await fetch('http://[2a09:8280:1::2f:fe8:0]:3000/checkword', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(inputWord),
		});
		return response.json();
	} catch (error) {
		console.error('Error:', error);
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
	// get all elements with class 'key' and remove all classes except 'key'
	const keys = Array.from(document.getElementsByClassName('key'));
	keys.forEach(key => {
		key.className = 'key';
	});
};

enterBtn.addEventListener('click', async () => {
	const isWordInDict = await checkWord(input.value);
	if (isWordInDict.message) {
		console.log(word);
		validate(word);
	} else {
		alert('Słowo nie występuje w słowniku!');
	}
});

const validate = async word => {
	let validatedWord = validator(input.value, word);
	guessWords.push(validatedWord);
	localStorage.setItem('diffle-input', JSON.stringify(guessWords));
	console.log('validatedWord: ', validatedWord);
	input.value = '';
	if (validatedWord === word) {
		const dialog = getElement('success-dialog');
		dialog.showModal();
		getElement('password').innerText = word;
		output.innerHTML = '';
		guessWords = [];
		localStorage.removeItem('diffle-word');
		localStorage.removeItem('diffle-input');
		clearClasses();
		document.addEventListener('keydown', disableEscapeKey);
	} else {
		renderWord(validatedWord, 300);
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
	input.value = '';
	output.innerHTML = '';
	clearClasses();
	await getWord();
	console.log(word);
	input.focus();
}

startBtn.addEventListener('click', () => {
	enableButtons();
	restartGame();
});

keyboard.forEach(key => {
	key.addEventListener('click', () => {
		input.value += key.innerText;
	});
});

backspace.addEventListener('click', () => {
	input.value = input.value.slice(0, -1);
});

document.addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.enter-btn').click();
	}
});

document.addEventListener('keydown', function (event) {
	let key = event.key.toLowerCase();
	let button = getElement(key + '-btn');
	if (button) {
		button.classList.add('pressed');

		// Remove the class after the animation has completed
		setTimeout(function () {
			button.classList.remove('pressed');
		}, 200);
	}
});

document.addEventListener('click', function (event) {
	let button = event.target;
	if (button) {
		button.classList.add('pressed');

		// Remove the class after the animation has completed
		setTimeout(function () {
			button.classList.remove('pressed');
		}, 200);
	}
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

closeSuccessBtn.addEventListener('click', function () {
	disableButtons();
	document.removeEventListener('keydown', disableEscapeKey);
	successDialog.close();
});

playAgainBtn.addEventListener('click', function () {
	restartGame();
	document.removeEventListener('keydown', disableEscapeKey);
	successDialog.close();
});

function isMobileDevice() {
	const isMobile = typeof window.orientation !== 'undefined' || navigator.userAgent.indexOf('IEMobile') !== -1;
	if (isMobile) {
		input.setAttribute('readonly', 'readonly');
	} else {
		input.removeAttribute('readonly');
	}
}

function disableButtons() {
	[input, enterBtn, backspace, ...keyboard].forEach(key => {
		key.setAttribute('disabled', 'disabled');
	});
}

function enableButtons() {
	[input, enterBtn, backspace, ...keyboard].forEach(key => {
		key.removeAttribute('disabled');
	});
}

function loadFromLocalStorage() {
	const loadedWord = localStorage.getItem('diffle-word');
	if (loadedWord) {
		word = loadedWord;
		enableButtons();
	}

	const loadedInput = localStorage.getItem('diffle-input');
	if (loadedInput) {
		const loadedWords = JSON.parse(loadedInput);
		guessWords = loadedWords;
		input.value = '';
		loadedWords.forEach(word => {
			renderWord(word, 0);
		});
	}
}

function setOutputMaxHeight() {
	const keyboardHeight = getElement('input-keyboard-wrapper').offsetHeight;
	output.style.maxHeight = `calc(100vh - ${keyboardHeight + 60}px)`;
}

(function init() {
	isMobileDevice();
	setOutputMaxHeight();
	loadFromLocalStorage();
})();
