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

const attrSuffix = /** @type {const} */(`_attr`);
const eventSuffix = /** @type {const} */(`_event`);

/**
 * @typedef {typeof attrSuffix} AttrSuffix
 * @typedef {typeof eventSuffix} EventSuffix
 */

class CanNotify extends EventTarget {
	/**
	 * @type {Array<string>}
	 * @readonly
	 */
	static observedAttributes = [];

	/**
	 * @template Value
	 * @param {Value} initial
	 * @returns {Value & { attribute: true }}
	 */
	static attribute(initial) {
		console.log(this.attribute);
		return /** @type {Value & { attribute: true }} */(initial);
	}

	/**
	 * @template {keyof this} AttrKey
	 * @param {AttrKey} attrKey
	 * @returns {this}
	 */
	changes(attrKey) {
		return this;
	}

	/**
	 * @template {keyof this} EventKey
	 * @template {EventTarget & Record<EventKey, () => any>} Origin
	 * @template {ReturnType<Origin[EventKey]>} EventDetail
	 * @template Listener
	 * @template {keyof Listener} HandlerKey
	 * @param {EventKey extends `${string}${EventSuffix}` ? EventKey : never} eventKey
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
	get poo_attr() { return 3 }
	set poo_attr(value) {}

	roll_event() {
		 return 1 + Math.round(Math.random() * 5);
	}
}

const prototypeProperties = Object.getOwnPropertyDescriptors(Dice.prototype);
for (const prototypePropertyName in prototypeProperties) {
	if (prototypePropertyName.endsWith(eventSuffix)) { // Brittle AF. At least we can be pretty certain these are methods and not properties bc properties usually aren't defined on prototype?
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

	if (prototypePropertyName.endsWith(attrSuffix)) {
		const attributeName = prototypePropertyName;
		const definition = prototypeProperties[prototypePropertyName];
		Object.defineProperty(Dice.prototype, prototypePropertyName, {
			...definition,
			// get() {
			// 	return this.getAttribute(attributeName);
			// },
			// set(value) {
			// 	if (attributeValueIsEmpty(value)) {
			// 		this.removeAttribute(attributeName);
			// 	} else {
			// 		this.setAttribute(attributeName, value.toString());
			// 	}
			// },
		});
	}
}

const diceCounter = new DiceCounter();
const dice = new Dice()
	.emits(`roll_event`, diceCounter, `onRoll`);

const player1Roll = dice.roll_event();
const player2Roll = dice.roll_event();

console.log(diceCounter.sum, player1Roll, player2Roll);

if (diceCounter.sum !== (player1Roll + player2Roll)) {
	throw new Error(`oh no`);
}
