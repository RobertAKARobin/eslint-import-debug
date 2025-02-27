/**
 * @import { DecoratedInstance } from './types.d.ts';
 */

/**
 * @typedef {{ isEvent: true }} IsEvent
 * @typedef {{ isAttribute: true }} IsAttribute
 * @typedef {string | number | boolean} AttributeValue
 */

/**
 * @typedef {Instance[AttributeKey] extends AttributeValue ? (AttributeKey | [AttributeKey, string]) : never} AttributeNames
 * @template Instance
 * @template {keyof Instance} AttributeKey
 */

/**
 * @typedef {Instance[EventKey] extends () => any ? (EventKey | [EventKey, string]) : never} EventKeys
 * @template Instance
 * @template {keyof Instance} EventKey
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
	 * @template {this[AttrKey]} EventDetail
	 * @template Listener
	 * @template {keyof Listener} HandlerKey
	 * @param {this[AttrKey] extends IsAttribute ? AttrKey : never} attrKey
	 * @param {Listener} listener
	 * @param {Listener[HandlerKey] extends (event: CustomEvent<EventDetail>) => any ? HandlerKey : never} handlerKey
	 * @returns {this}
	 */
	changes(attrKey, listener, handlerKey) {
		return this;
	}

	/**
	 * @template {keyof this} EventKey
	 * @template {EventTarget & Record<EventKey, () => any>} Origin
	 * @template {ReturnType<Origin[EventKey]>} EventDetail
	 * @template Listener
	 * @template {keyof Listener} HandlerKey
	 * @param {this[EventKey] extends IsEvent ? EventKey : never} eventKey
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

	three = 3;

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
 * @template {keyof Instance} AttributeKey
 * @template {keyof Instance} EventKey
 * @param {Base} base
 * @param {object} [options]
 * @param {Array<AttributeNames<Instance, AttributeKey>>} [options.attributes]
 * @param {Array<EventKeys<Instance, EventKey>>} [options.events]
 * @returns {DecoratedInstance<Instance, EventKey, AttributeKey>}
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
	.emits(`roll`, diceCounter, 'onRoll')
	.changes('myNum', diceCounter, 'onRoll');

// const player1Roll = dice.roll_event();
// const player2Roll = dice.roll_event();

// console.log(diceCounter.sum, player1Roll, player2Roll);

// if (diceCounter.sum !== (player1Roll + player2Roll)) {
// 	throw new Error(`oh no`);
// }
