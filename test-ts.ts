function repeat(
	message: string,
	times: number,
) {
	return Array(times).fill(message).join(` `);
}

/** @type {Parameters<typeof repeat>[0]} */
export const myMessage = `hello`;

/** @type {Parameters<typeof repeat>[1]} */
export const myTimes = 3;
