import { TaskQueue, QueueOptions } from './TaskQueue';
/**
 * Manages multiple named task queues with shared or individual configurations. Each queue can be accessed by a
 * unique name or other identifier. For example, this can manage a separate queue for each of several different
 * servers, using the server's DNS name as the key.
 */
export declare class QueueManager<T = string> {
    private readonly queues;
    private readonly defaultOptions;
    /**
     * @param defaultOptions The options that will be used to initialize each queue.
     * These can be overridden later on a per-queue basis.
     * @param iterable An optional iterable of key-value pairs to initialize the manager with existing queues.
     */
    constructor(defaultOptions: QueueOptions, iterable?: Iterable<readonly [T, TaskQueue]> | null);
    /**
     * Create a new task queue with the given identifier. If a queue with that identifier already exists, it will be
     * replaced. If you need to cancel tasks in that queue before replacing it, do so manually first.
     * @param id The identifier for the queue.
     * @param overrides Optional overrides for the default QueueOptions for this specific queue.
     * @returns The newly created TaskQueue.
     */
    create(id: T, overrides?: Partial<QueueOptions>): TaskQueue;
    /**
     * Get the task queue for the given identifier.
     * @param id The identifier for the queue.
     * @returns The TaskQueue associated with the given identifier, or undefined if none exists.
     */
    get(id: T): TaskQueue | undefined;
    /**
     * Get the task queue for the given identifier, creating it if it does not already exist.
     * @param id The identifier for the queue.
     * @param overrides Optional overrides for the default QueueOptions for this specific queue. Only used if the queue
     * did not already exist.
     * @returns The TaskQueue associated with the given identifier.
     */
    getOrCreate(id: T, overrides?: Partial<QueueOptions>): TaskQueue;
    /**
     * @returns A copy of the default queue options. Used primarily for testing and inspection.
     */
    options(): Readonly<QueueOptions>;
}
