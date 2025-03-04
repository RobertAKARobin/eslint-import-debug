import { JSDOM } from 'jsdom';

const dom = new JSDOM();
const Element = dom.window.Element;

/**
 * @import { KeysOfType } from './types.d';
 */

/**
 * @typedef {{ attribute?: true }} IsAttr
 */

/**
 * @template {object} Self
 */
class Component extends Element {
	/**
	 * @type {Array<string>}
	 * @readonly
	 */
	static observedAttributes = [];

	/**
	 * @param {KeysOfType<Self, IsAttr>} attributeKey
	 */
	onChange(attributeKey) {
		return this;
	}

	// /**
	//  * @template {keyof this} EventKey
	//  * @template {EventTarget & Record<EventKey, () => any>} Origin
	//  * @template {ReturnType<Origin[EventKey]>} EventDetail
	//  * @template Listener
	//  * @template {keyof Listener} HandlerKey
	//  * @param {EventNameTest<this, EventKey>} eventKey
	//  * @param {Listener} listener
	//  * @param {EventHandlerTest<Listener, HandlerKey, EventDetail>} handlerKey
	//  * @returns {Origin}
	//  * @this {Origin}
	//  */
	// onEvent(eventKey, listener, handlerKey) {
	// 	this.addEventListener(
	// 		/** @type {string} */(eventKey),
	// 		// @ts-expect-error Reports because addEventListener doesn't like CustomEvents
	// 		listener[handlerKey].bind(listener),
	// 	);
	// 	return this;
	// }

	set() {

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

/**
 * @extends Component<Dice>
 */
class Dice extends Component {
	isBoolean = false;

	three = 3;

	sayHi() {
		this.onChange('href')
		this.myNum = 4;
		return true;
	}

	roll() {
		 return 1 + Math.round(Math.random() * 5);
	}
}

const instance = Object.create(Dice.prototype);
const descriptors = Object.getOwnPropertyDescriptors(Dice.prototype);
for (const propertyName in descriptors) {
	const property = descriptors[propertyName];

	if (property.get === undefined) {
		continue;
	}

	let flag;
	try {
		property.get.call(instance);
	} catch (error) {
		flag = error;
	}

	if (flag !== `poo`) {
		continue;
	}

	Object.defineProperty(Dice.prototype, propertyName, {
		get() {
			return this.getAttribute(propertyName);
		},
	});
}

// const diceCounter = new DiceCounter();
// const dice = new Dice()
// 	// .onEvent(`roll`, diceCounter, 'onRoll')
// 	.onChange('href');

// const player1Roll = dice.roll();
// const player2Roll = dice.roll();

// console.log(diceCounter.sum, player1Roll, player2Roll);

// if (diceCounter.sum !== (player1Roll + player2Roll)) {
// 	throw new Error(`oh no`);
// }
