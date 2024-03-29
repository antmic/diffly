import { validator } from './validator.js';

const testCases = [
	// { input: 'fantastyka', word: 'migotać' },
	{ input: 'trelee', word: 'bambetle' },
	// { input: 'ale', word: 'bambetle' },
	// { input: 'pajac', word: 'trajan' },
	// { input: 'klaskała', word: 'ekierka' },
	{ input: 'pingwin', word: 'pininfarina' },
	{ input: 'ciocikawskaci', word: 'cimcietka' },
	{ input: 'ciekawska', word: 'metka' },
	{ input: 'telegram', word: 'lemur' },
	{ input: 'zdrowa', word: 'zaprowadzać' },
	{ input: 'tygrysy', word: 'dyplomatyczny' },
	{ input: 'wydatnie', word: 'uwydatnienie' },
	{ input: 'gnie', word: 'uwydatnienie' },
	{ input: 'sklonowanie', word: 'skomplikowanie' },
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

		if (element.isFirst) {
			show.unshift('*');
		}
		if (element.isLast) {
			show.push('*');
		}
	});
	console.log(testCase.word);
	console.log(testCase.input);
	console.log(show.join(''));
	console.log(result);
});
