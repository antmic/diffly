import { validator } from './new_validator.js';

const testCases = [
	{ input: 'fantastyka', word: 'migotać' },
	{ input: 'trelee', word: 'bambetle' },
	{ input: 'ale', word: 'bambetle' },
	{ input: 'pajac', word: 'trajan' },
	{ input: 'klaskała', word: 'ekierka' },
	{ input: 'pingwin', word: 'pininfarina' },
];

testCases.forEach(testCase => {
	let result = validator(testCase.input, testCase.word);
	let show = [];

	result.forEach(element => {
		if (element.isUsed && element.isCorrectOrder && element.isInSequence) {
			if (element.isFirstInSequence) {
				show.push('<(', element.letter.toUpperCase(), ')');
			} else if (element.isLastInSequence) {
				show.push('(', element.letter.toUpperCase(), ')>');
			} else {
				show.push('-(', element.letter.toUpperCase(), ')-');
			}
		} else if (element.isUsed && element.isCorrectOrder) {
			show.push('(', element.letter.toUpperCase(), ')');
		} else if (element.isUsed && element.isInSequence) {
			if (element.isFirstInSequence) {
				show.push('<', element.letter.toUpperCase());
			} else if (element.isLastInSequence) {
				show.push(element.letter.toUpperCase(), '>');
			} else {
				show.push('-', element.letter.toUpperCase(), '-');
			}
		} else if (element.isUsed) {
			show.push(element.letter.toUpperCase());
		} else if (element.isFirstInSequence) {
			show.push('<', element.letter, '');
		} else if (element.isLastInSequence) {
			show.push(element.letter, '>');
		} else if (element.isInSequence) {
			show.push('-', element.letter, '-');
		} else {
			show.push(element.letter);
		}
	});
	console.log(show.join(''));
	//console.log(result);
});
