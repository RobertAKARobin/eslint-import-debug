export type KeysOfType<T extends object, V> = keyof {[K in keyof T as T[K] extends V ? K : never]: unknown};
