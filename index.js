/**
 * @template {string} U
 */
export class User {
	/**
	 * @type {U}
	 */
	name;

	/**
	 * @param {U} name
	 */
	constructor(name) {
		this.name = name;
	}

	yellName() {
		return /** @type {Uppercase<U>} */(this.name.toUpperCase());
	}
}

const user = new User(`Steve`);
user.yellName(); // Should be `STEVE`
