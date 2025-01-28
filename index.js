/**
 * @template Input
 * @param {Input} input
 * @returns {Input}
 */
function echo(input) {
	return input;
}

const myString = echo(`hello`);
const myNum = echo(32);
