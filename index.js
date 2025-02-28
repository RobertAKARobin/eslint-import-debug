/**
 * @import { AttributeFlag, AttributeNameConfig, AttributeNameTest, DecoratedComponent, EventFlag, EventHandlerTest, EventNameConfig, EventNameTest } from './types.d';
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
 * @param {Array<EventNameConfig<Instance, EventKey>>} [options.events]
 * @returns {DecoratedComponent<Instance, AttributeKey, EventKey>}
 */
function define(base, options = {}) {
	const descriptions = Object.getOwnPropertyDescriptors(base.prototype);

	if (options.events !== undefined) {
		for (const event of options.events) {
			if (typeof event === `string`) {
				const description = descriptions[event];
				Object.defineProperty(base.prototype, event, {
					/**
					 * @param {any[]} args
					 */
					value(...args) {
						const detail = description.value(...args);
						this.dispatchEvent(new CustomEvent(event, { detail }));
						return detail;
					},
				});
			}
		}
	}
	// @ts-ignore
	return base;
}

const Decorated = define(Dice, {
	attributes: ['myNum'],
	events: ['roll'],
});

const diceCounter = new DiceCounter();
const dice = new Decorated()
	.onEvent(`roll`, diceCounter, 'onRoll')
	.onChange('myNum', diceCounter, 'onRoll');

const player1Roll = dice.roll();
const player2Roll = dice.roll();

console.log(diceCounter.sum, player1Roll, player2Roll);

if (diceCounter.sum !== (player1Roll + player2Roll)) {
	throw new Error(`oh no`);
}
