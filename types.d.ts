export type ConstructorOf<Type> = {
	new(...args: any): Type;
};

/**
 *
 */

export type AttributeFlag = { isAttribute: true; };

export type AttributeNameTest<Instance, AttributeKey extends keyof Instance> =
	Instance[AttributeKey] extends AttributeFlag
	? AttributeKey
	: never;

export type AttributeNameConfig<Instance, AttributeKey extends keyof Instance> =
	Instance[AttributeKey] extends AttributeValue
	? (AttributeKey | {
		key: AttributeKey;
		name?: string;
	})
	: never;

export type AttributeValue =
	| boolean
	| number
	| string;

export type DecoratedComponent<
	Instance,
	AttributeKey extends keyof Instance,
	EventKey extends keyof Instance,
> = {
	new():
		& Instance
		& { [Key in AttributeKey]: AttributeFlag & Instance[Key] }
		& { [Key in EventKey]: EventFlag & Instance[Key] };
	prototype: Instance;
};

export type EventFlag = { isEvent: true; };

export type EventHandlerTest<
	Listener,
	HandlerKey extends keyof Listener,
	EventDetail,
> =
	Listener[HandlerKey] extends (event: CustomEvent<EventDetail>) => void
	? HandlerKey
	: never;

export type EventNameConfig<Instance, EventKey extends keyof Instance> =
	Instance[EventKey] extends () => void
	? (EventKey | [EventKey, string])
	: never;

export type EventNameTest<Instance, EventKey extends keyof Instance> =
	Instance[EventKey] extends EventFlag
	? EventKey
	: never;
