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
 * const Class = define(class {}, { events: [] })
 * 	-	Can decorate events/attributes but results in a really complex type that's super gross
 *
 * Want
 * 	- When method is called, dispatches an event
 * 	- Method returns original value, not an event
 */

/**
 * @typedef {Base & Record<Property, Base[Property] & Extension>} Augment
 * @template Base
 * @template {keyof Base} Property
 * @template {object} Extension
 */

/**
 * @typedef {{ isEvent: true }} IsEvent
 * @typedef {{ isAttribute: true }} IsAttribute
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
	 * @param {this[AttrKey] extends IsAttribute ? AttrKey : never} attrKey
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
	 * @param {Origin[EventKey] extends IsEvent ? EventKey : never} eventKey
	 * @param {Listener} listener
	 * @param {Listener[HandlerKey] extends (event: CustomEvent<EventDetail>) => any ? HandlerKey : never} handlerKey
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
	get myNum() { return 3 }
	set myNum(value) {}

	isBoolean = false;

	name = `true`;

	sayHi() {
		return true;
	}

	roll() {
		 return 1 + Math.round(Math.random() * 5);
	}
}

/**
 * @template {{ new(): unknown }} Base
 * @template {InstanceType<Base>} Instance
 * @template {keyof Instance} EventName
 * @template {keyof Instance} AttributeName
 * @param {Base} base
 * @param {object} [options]
 * @param {Array<Instance[EventName] extends () => any ? (EventName | [EventName, string]) : never>} [options.events]
 * @param {Array<Instance[AttributeName] extends string | number ? (AttributeName | [AttributeName, string]) : never>} [options.attributes]
 * @returns {{ new(): Augment<Instance, EventName, IsEvent> & Augment<Instance, AttributeName, IsAttribute>}}
 */
function define(base, options = {}) {
	// @ts-ignore
	return base;
}

const Decorated = define(Dice, {
	events: ['roll', ['sayHi', 'poo']],
	attributes: ['name', 'myNum'],
});

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
const dice = new Decorated()
	.emits(`roll`, diceCounter, 'onRoll');

// const player1Roll = dice.roll_event();
// const player2Roll = dice.roll_event();

// console.log(diceCounter.sum, player1Roll, player2Roll);

// if (diceCounter.sum !== (player1Roll + player2Roll)) {
// 	throw new Error(`oh no`);
// }
