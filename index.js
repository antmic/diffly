import { validator } from './validator.js';

const startBtn = document.getElementById('start-btn');
const enterBtn = document.getElementById('enter-btn');
const input = document.getElementById('input');
const output = document.getElementById('output');
const keyboard = Array.from(document.getElementsByClassName('key'));
const backspace = document.getElementById('backspace-btn');
const switchBtn = document.getElementById('switch-btn');

let word = '';

async function getWord() {
	try {
		const response = await fetch('http://localhost:3000/getword');
		const data = await response.json();
		console.log('Success:', data.word);
		return data.word.toLowerCase();
	} catch (error) {
		console.error('Error:', error);
	}
}

async function checkWord(inputWord) {
	try {
		const response = await fetch('http://localhost:3000/checkword', {
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
	document.getElementById(`${letter.letter}-btn`).classList.add('letter');

	if (letter.isUsed) {
		classList.push('used');
		document.getElementById(`${letter.letter}-btn`).classList.add('used');
	}
	if (letter.isFirst) {
		classList.push('first');
	}
	if (letter.isLast) {
		classList.push('last');
	}
	if (letter.isCorrectOrder) {
		classList.push('correct-order');
		document.getElementById(`${letter.letter}-btn`).classList.add('correct-order');
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

const validate = word => {
	let validatedWord = validator(input.value, word);
	console.log('validatedWord: ', validatedWord);
	if (validatedWord === false) {
		alert(`Gratulacje! Zgadłeś słowo! Hasło to: ${word}`);
		input.value = '';
		return;
	} else {
		let newGuessWord = document.createElement('div');
		newGuessWord.classList.add('guess-word');
		validatedWord.forEach(letter => {
			let newLetter = document.createElement('div');
			addClasses(letter, newLetter);
			newLetter.innerText = letter.letter;
			newGuessWord.appendChild(newLetter);
			output.appendChild(newGuessWord);
			input.value = '';
		});
	}
};

startBtn.addEventListener('click', async () => {
	[switchBtn, input, enterBtn, backspace, ...keyboard].forEach(key => {
		key.removeAttribute('disabled');
	});
	input.value = '';
	output.innerHTML = '';
	clearClasses();
	word = await getWord();
	console.log(word);
	input.focus();
});

keyboard.forEach(key => {
	key.addEventListener('click', () => {
		input.value += key.innerText;
	});
});

backspace.addEventListener('click', () => {
	input.value = input.value.slice(0, -1);
});

switchBtn.addEventListener('click', () => {
	const keyboardLatin = document.getElementById('keyboard-latin');
	keyboardLatin.classList.toggle('qwerty');
});

document.addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		document.querySelector('.enter-btn').click();
	}
});
