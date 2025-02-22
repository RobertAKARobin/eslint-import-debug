export type Params<Target extends (...args: any) => any> =
	Target extends (arg0: infer Arg0, arg1: infer Arg1, arg2: infer Arg2) => any
	? [Arg0, Arg1, Arg2]
	: never;
