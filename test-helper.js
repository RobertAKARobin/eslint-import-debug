/**
 * @import {Params} from './types.d';
 */

function repeat(
	/** @type {string} */message,
	/** @type {number} */times,
) {
	return Array(times).fill(message).join(` `);
}

/** @type {Params<typeof repeat>[0]} */
export const myMessage = `hello`;

/** @type {Params<typeof repeat>[1]} */
export const myTimes = 3;
