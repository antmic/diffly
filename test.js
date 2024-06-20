import { validator } from './validator.js';

const testCases = [
	{ input: 'fantastyka', word: 'migotać', shouldBe: 'fan<(T)(A)>styka' },
	{ input: 'trelee', word: 'bambetle', shouldBe: '(T)re<(L)E>(E)*' },
	{ input: 'ale', word: 'bambetle', shouldBe: '(A)<(L)(E)>*' },
	{ input: 'pajac', word: 'trajan', shouldBe: 'p<(A)-(J)-(A)>c' },
	{ input: 'klaskała', word: 'ekierka', shouldBe: '(K)las<(K)a>ł(A)*' },
	{ input: 'pingwin', word: 'pininfarina', shouldBe: '*<(P)-(I)-(N)>gw<(I)(N)>' },
	{ input: 'ciekawska', word: 'metka', shouldBe: 'ci(E)kaws<(K)(A)>*' },
	{ input: 'telegram', word: 'lemur', shouldBe: 'te<(L)(E)>g(R)aM' },
	{ input: 'zdrowa', word: 'zaprowadzać', shouldBe: '*(Z)(D)<R-O--W-A>' },
	{ input: 'tygrysy', word: 'dyplomatyczny', shouldBe: '<(T)(Y)>grYs(Y)*' },
	{ input: 'wydatnie', word: 'uwydatnienie', shouldBe: '<(W)-(Y)--(D)--(A)--(T)--(N)--(I)-(E)>' },
	{ input: 'gnie', word: 'uwydatnienie', shouldBe: 'g<(N)-(I)-(E)>*' },
	{ input: 'sklonowanie', word: 'skomplikowanie', shouldBe: '*<(S)(K)>(L)On<(O)-(W)--(A)--(N)--(I)-(E)>*' },
	{ input: 'emanacja', word: 'abstynencja', shouldBe: '(E)mA(N)a<(C)-(J)-(A)>*' },
];

let failCount = 0;

// Legend:
// lowercase - incorrect letter
// uppercase - correct letter
// () - letter in correct order
// * - first or last letter
// < - first letter in sequence
// > - last letter in sequence
// -X- - letter in sequence

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
	console.log('word: ', testCase.word);
	console.log('input: ', testCase.input);
	console.log('result: ', show.join(''));
	console.log('should: ', testCase.shouldBe);
	if (show.join('') === testCase.shouldBe) {
		console.log('OK');
	} else {
		failCount++;
		console.error('FAIL');
	}
	console.log('----------------------------------');

	//console.log(result);
});

if (failCount === 0) {
	console.log('All tests passed.');
} else {
	console.error(`${failCount}/${testCases.length} tests failed.`);
}
