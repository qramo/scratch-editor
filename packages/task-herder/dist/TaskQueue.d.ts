import { TaskOptions } from './TaskRecord';
export interface QueueOptions {
    /** The maximum number of tokens in the bucket controls the burst limit */
    burstLimit: number;
    /** Rate at which tokens are added to the bucket (tokens per second) controls the sustained rate */
    sustainRate: number;
    /** Initial number of tokens in the bucket (default to a full bucket) */
    startingTokens?: number;
    /** Reject a task if it would cause the total queue cost to exceed this limit (default: no limit) */
    queueCostLimit?: number;
    /** Number of tasks that can be processed concurrently (default: 1) */
    concurrency?: number;
}
/**
 * Run tasks with rate and concurrency limits.
 * The rate limit is based on the token bucket algorithm. In this algorithm, a "bucket" holds a certain number of
 * tokens, which represent the capacity to perform work. The bucket gradually refills with tokens at a fixed rate, up
 * to a maximum capacity. Each task "costs" a certain number of tokens; if insufficient tokens are available, the task
 * must wait until enough tokens have accumulated.
 * In addition, a concurrency limit controls how many tasks can be run simultaneously. If the concurrency limit is
 * reached, additional tasks must wait until a running task completes even if there are enough tokens available.
 * @see {@link https://en.wikipedia.org/wiki/Token_bucket} for more information about the algorithm.
 */
export declare class TaskQueue {
    private readonly burstLimit;
    private readonly sustainRate;
    private readonly queueCostLimit;
    private readonly concurrencyLimit;
    private tokenCount;
    private runningTasks;
    private pendingTaskRecords;
    private lastRefillTime;
    private onTaskAdded;
    private onTaskFinished;
    constructor(options: QueueOptions);
    /** @returns The number of tasks currently in the queue */
    get length(): number;
    /**
     * @returns The current configuration options of the queue. Used primarily for testing and inspection.
     * Note that the `startingTokens` value returned here reflects the current token count, which is only guaranteed to
     * match the originally configured starting tokens value if no time has passed and no tasks have been processed.
     */
    get options(): Readonly<QueueOptions>;
    /**
     * Adds a task to the queue. The task will first wait until enough tokens are available, then will wait its turn in
     * the concurrency queue.
     * @param task The task to be added to the queue.
     * @param taskOptions Options for queueing the task, such as the task cost.
     * @returns A promise for the task's result.
     */
    do<T>(task: () => T | Promise<T>, taskOptions?: TaskOptions): Promise<T>;
    /**
     * Cancel a task and remove it from the queue.
     * @param taskPromise - The promise of the task to cancel.
     * @param [reason] - The reason for cancellation.
     * @returns True if the task was found and cancelled, false otherwise.
     */
    cancel(taskPromise: Promise<unknown>, reason?: Error): boolean;
    /**
     * Cancel all pending tasks and clear the queue.
     * @param [reason] - The reason for cancellation.
     * @returns The number of tasks that were cancelled.
     */
    cancelAll(reason?: Error): number;
    /**
     * Short-hand for calling refill() followed by spend().
     * @param cost The number of tokens to spend.
     * @returns True if the tokens were successfully spent, false otherwise.
     */
    private refillAndSpend;
    /**
     * Refill the token bucket based on the time elapsed since the last refill.
     */
    private refill;
    /**
     * Attempt to spend tokens from the bucket.
     * @param cost The number of tokens to spend.
     * @returns True if the tokens were successfully spent, false otherwise.
     */
    private spend;
    /**
     * Run tasks from the queue as tokens become available.
     */
    private runTasks;
    /**
     * Run a task record right now, managing the running tasks count.
     * @param taskRecord The task that should run.
     */
    private runTask;
}
