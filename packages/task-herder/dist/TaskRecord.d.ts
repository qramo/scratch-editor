export interface TaskOptions {
    /** Cost of the task in tokens (default: 1) */
    cost?: number;
    /** If set, the task will be aborted if this signal is triggered */
    signal?: AbortSignal;
}
export declare class TaskRecord<T> {
    /** The cost of the task in tokens */
    readonly cost: number;
    /** The promise wrapping the task */
    readonly promise: Promise<T>;
    /** Run the task and settle the promise */
    readonly run: () => Promise<void>;
    /** Cancel the task and reject the promise */
    readonly cancel: (e: Error) => void;
    /**
     * @param task The task to wrap.
     * @param options The options for the task.
     */
    constructor(task: () => T | Promise<T>, options?: TaskOptions);
}
