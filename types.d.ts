export type DecoratedInstance<
	Instance,
	EventKey extends keyof Instance,
	AttributeKey extends keyof Instance
> = {
	new():
		& Instance
		& { [Key in AttributeKey]: Instance[Key] & IsAttribute }
		& { [Key in EventKey]: Instance[Key] & IsEvent };
};
