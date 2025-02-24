/**
 * `click = Component.event(() => {})` doesnt work because
 * 	-	instance methods are inefficient vs prototype methods
 * 	- cant iterate over instance methods without creating an instance, so cant find event name
 *
 * `static events = []`
 * 	- static properties don't know about `this` so can't enforce correct typing
 *
 * classSubclass { foo() {} }, Component.define(Subclass, { events: [`foo`] })
 * 	-	Can't enforce typing because would need methods to return an event but want them to return a value
 *
 * Want
 * 	- When method is called, dispatches an event
 * 	- Method returns original value, not an event
 */

/**
 * @typedef {Fun & { eventName: string }} Decorated
 * @template {() => any} Fun
 */

const suffix = /** @type {const} */(`Event`);

/**
 * @typedef {typeof suffix} Suffix
 */

class CanNotify extends EventTarget {
	/**
	 * @template {keyof this} EventKey
	 * @template {EventTarget & Record<EventKey, () => any>} Origin
	 * @template {ReturnType<Origin[EventKey]>} EventDetail
	 * @template Listener
	 * @template {keyof Listener} HandlerKey
	 * @param {EventKey extends `${string}${Suffix}` ? EventKey : never} eventKey
	 * @param {Listener} listener
	 * @param {Listener[HandlerKey] extends ((event: CustomEvent<EventDetail>) => any) ? HandlerKey : never} handlerKey
	 * @returns {Origin}
	 * @this {Origin}
	 */
	emits(eventKey, listener, handlerKey) {
		this.addEventListener(
			/** @type {string} */(eventKey),
			// @ts-expect-error Reports because addEventListener doesn't like CustomEvents
			listener[handlerKey].bind(listener),
		);
		return this;
	}
}

class DiceCounter {
	sum = 0;

	/**
	 * @param {CustomEvent<number>} event
	 */
	onRoll(event) {
		this.sum += event.detail;
	}
}

class Dice extends CanNotify {
	rollEvent() {
		 return 1 + Math.round(Math.random() * 5);
	}
}

const prototypeProperties = Object.getOwnPropertyDescriptors(Dice.prototype);
for (const prototypePropertyName in prototypeProperties) {
	if (prototypePropertyName.endsWith(suffix) === false) { // Brittle AF. At least we can be pretty certain these are methods and not properties bc properties usually aren't defined on prototype?
		continue;
	}

	// @ts-expect-error We know this funciton exists
	const fun = Dice.prototype[prototypePropertyName];
	Object.assign(Dice.prototype, {
		/**
		 * @this {CanNotify}
		 */
		[prototypePropertyName](/** @type {any} */...args) {
			const detail = fun.apply(this, args);
			this.dispatchEvent(new CustomEvent(prototypePropertyName, { detail }));
			return detail;
		},
	});
}

const diceCounter = new DiceCounter();
const dice = new Dice()
	.emits(`rollEvent`, diceCounter, `onRoll`);

const player1Roll = dice.rollEvent();
const player2Roll = dice.rollEvent();

console.log(diceCounter.sum, player1Roll, player2Roll);

if (diceCounter.sum !== (player1Roll + player2Roll)) {
	throw new Error(`oh no`);
}
