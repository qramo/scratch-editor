/**
 * Equivalent to `Promise.withResolvers`, which is not yet widely available.
 * @todo Remove this function when `Promise.withResolvers` is widely available, likely around September 2026.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers}
 * @returns An object containing the promise along with its resolve and reject functions.
 */
export declare function PromiseWithResolvers<T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
};
