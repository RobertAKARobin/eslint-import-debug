/**
 * @import { AttributeFlag, AttributeNameConfig, AttributeNameTest, DecoratedComponent, EventFlag, EventHandlerTest, EventNameConfig, EventNameTest } from './types.d';
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

class CanNotify extends HTMLAnchorElement {
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
	 * @template {keyof this} AttributeKey
	 * @template {this[AttributeKey]} EventDetail
	 * @template Listener
	 * @template {keyof Listener} HandlerKey
	 * @param {AttributeNameTest<this, AttributeKey>} attributeKey
	 * @param {Listener} listener
	 * @param {Listener[HandlerKey] extends (event: CustomEvent<EventDetail>) => any ? HandlerKey : never} handlerKey
	 * @returns {this}
	 */
	onChange(attributeKey, listener, handlerKey) {
		return this;
	}

	/**
	 * @template {keyof this} EventKey
	 * @template {EventTarget & Record<EventKey, () => any>} Origin
	 * @template {ReturnType<Origin[EventKey]>} EventDetail
	 * @template Listener
	 * @template {keyof Listener} HandlerKey
	 * @param {EventNameTest<this, EventKey>} eventKey
	 * @param {Listener} listener
	 * @param {EventHandlerTest<Listener, HandlerKey, EventDetail>} handlerKey
	 * @returns {Origin}
	 * @this {Origin}
	 */
	onEvent(eventKey, listener, handlerKey) {
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
	myNum = 3;

	isBoolean = false;

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
 * @param {Array<AttributeNameConfig<Instance, AttributeKey>>} [options.attributes]
 * @param {Array<EventKeys<Instance, EventKey>>} [options.events]
 * @returns {DecoratedComponent<Instance, AttributeKey, EventKey>}
 */
function define(base, options = {}) {
	// @ts-ignore
	return base;
}

const Decorated = define(Dice, {
	attributes: ['href', 'name', 'myNum'],
	events: ['roll', ['sayHi', 'poo']],
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
	.onEvent(`roll`, diceCounter, 'onRoll')
	.onChange('myNum', diceCounter, 'onRoll');

// const player1Roll = dice.roll_event();
// const player2Roll = dice.roll_event();

// console.log(diceCounter.sum, player1Roll, player2Roll);

// if (diceCounter.sum !== (player1Roll + player2Roll)) {
// 	throw new Error(`oh no`);
// }
