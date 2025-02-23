/**
 * `click = Component.event(() => {})` doesnt work because
 * 	-	instance methods are inefficient vs prototype methods
 * 	- cant iterate over instance methods without creating an instance, so cant find event name
 */

/**
 * @typedef {Fun & { eventName: string }} Decorated
 * @template {() => any} Fun
 */

class CanNotify extends EventTarget {
	/**
	 * @template Value
	 * @template {(this: EventTarget) => Value} DoWhat
	 * @param {DoWhat} doWhat
	 * @returns {Decorated<DoWhat>}
	 */
	static event(doWhat) {
		const intercepted = /** @type {Decorated<DoWhat>} */(function() {
			const value = doWhat.call(this);
			const event = new CustomEvent(`poo`, { detail: value});
			this.dispatchEvent(event);
			return value;
		});
		Object.assign(intercepted, {
			eventName: ``,
		});
		return intercepted;
	}

	/**
	 * @template {keyof this} EventKey
	 * @template {EventTarget & Record<EventKey, Decorated<() => any>>} Origin
	 * @template {ReturnType<Origin[EventKey]>} EventDetail
	 * @template {string} HandlerKey
	 * @template {(event: CustomEvent<EventDetail>) => any} Handler
	 * @template {Record<HandlerKey, Handler>} Listener
	 * @param {EventKey} eventKey
	 * @param {Listener} listener
	 * @param {HandlerKey} handlerKey
	 * @returns {Origin}
	 * @this {Origin}
	 */
	notify(eventKey, listener, handlerKey) {
		this.addEventListener(
			// /** @type {string} */(eventKey),
			`poo`,
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
	roll = CanNotify.event(() => 1 + Math.round(Math.random() * 5));
}

for (const propertyName in Object.getOwnPropertyDescriptors(Dice.prototype)) {
	console.log(propertyName);
}

const diceCounter = new DiceCounter();
const dice = new Dice()
	.notify(`roll`, diceCounter, `onRoll`);
const dice2 = new Dice();

const player1Roll = dice.roll();
const player2Roll = dice.roll();

if (diceCounter.sum !== (player1Roll + player2Roll)) {
	throw new Error(`oh no`);
}
