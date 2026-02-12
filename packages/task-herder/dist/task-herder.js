const CancelReason = {
	QueueCostLimitExceeded: "Queue cost limit exceeded",
	Aborted: "Task aborted",
	Cancel: "Task cancelled",
	TaskTooExpensive: "Task cost exceeds maximum bucket size"
};
function PromiseWithResolvers() {
	let e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var TaskRecord = class {
	cost;
	promise;
	run;
	cancel;
	constructor(e, n = {}) {
		this.cost = n.cost ?? 1;
		let { promise: r, resolve: i, reject: a } = PromiseWithResolvers();
		this.promise = r, this.cancel = (e) => {
			a(e);
		}, this.run = async () => {
			try {
				i(await e());
			} catch (e) {
				a(e);
			}
		};
	}
}, TaskQueue = class {
	burstLimit;
	sustainRate;
	queueCostLimit;
	concurrencyLimit;
	tokenCount;
	runningTasks = 0;
	pendingTaskRecords = [];
	lastRefillTime = Date.now();
	onTaskAdded = PromiseWithResolvers().resolve;
	onTaskFinished = PromiseWithResolvers().resolve;
	constructor(e) {
		this.burstLimit = e.burstLimit, this.sustainRate = e.sustainRate, this.tokenCount = e.startingTokens ?? e.burstLimit, this.queueCostLimit = e.queueCostLimit ?? Infinity, this.concurrencyLimit = e.concurrency ?? 1, this.runTasks();
	}
	get length() {
		return this.pendingTaskRecords.length;
	}
	get options() {
		return {
			burstLimit: this.burstLimit,
			sustainRate: this.sustainRate,
			startingTokens: this.tokenCount,
			queueCostLimit: this.queueCostLimit,
			concurrency: this.concurrencyLimit
		};
	}
	do(t, r = {}) {
		let i = new TaskRecord(t, r);
		return i.cost > this.burstLimit ? Promise.reject(Error(CancelReason.TaskTooExpensive)) : this.queueCostLimit < Infinity && this.pendingTaskRecords.reduce((e, t) => e + t.cost, i.cost) > this.queueCostLimit ? Promise.reject(Error(CancelReason.QueueCostLimitExceeded)) : (this.pendingTaskRecords.push(i), r.signal?.addEventListener("abort", () => {
			this.cancel(i.promise, Error(CancelReason.Aborted));
		}), this.onTaskAdded(), i.promise);
	}
	cancel(t, n) {
		let r = this.pendingTaskRecords.findIndex((e) => e.promise === t);
		if (r !== -1) {
			let [t] = this.pendingTaskRecords.splice(r, 1);
			return t.cancel(n ?? Error(CancelReason.Cancel)), !0;
		}
		return !1;
	}
	cancelAll(t) {
		let n = this.pendingTaskRecords;
		return this.pendingTaskRecords = [], t ??= Error(CancelReason.Cancel), n.forEach((e) => {
			e.cancel(t);
		}), n.length;
	}
	refillAndSpend(e) {
		return this.refill(), this.spend(e);
	}
	refill() {
		let e = Date.now(), t = e - this.lastRefillTime;
		if (t <= 0) return;
		this.lastRefillTime = e;
		let n = t / 1e3 * this.sustainRate;
		this.tokenCount = Math.min(this.burstLimit, this.tokenCount + n);
	}
	spend(e) {
		return this.tokenCount >= e ? (this.tokenCount -= e, !0) : !1;
	}
	async runTasks() {
		for (;;) {
			let n = this.pendingTaskRecords.shift();
			if (!n) {
				let { promise: e, resolve: n } = PromiseWithResolvers();
				this.onTaskAdded = n, await e;
				continue;
			}
			if (n.cost > this.burstLimit) {
				n.cancel(Error(CancelReason.TaskTooExpensive));
				continue;
			}
			if (this.refillAndSpend(n.cost)) {
				if (this.runningTasks >= this.concurrencyLimit) {
					let { promise: e, resolve: n } = PromiseWithResolvers();
					this.onTaskFinished = n, await e;
				}
				this.runTask(n);
			} else {
				this.pendingTaskRecords.unshift(n);
				let e = Math.max(n.cost - this.tokenCount, 0), t = Math.ceil(1e3 * e / this.sustainRate);
				await new Promise((e) => setTimeout(e, t));
			}
		}
	}
	async runTask(e) {
		this.runningTasks++;
		try {
			await e.run();
		} finally {
			this.runningTasks--, this.onTaskFinished();
		}
	}
}, QueueManager = class {
	queues;
	defaultOptions;
	constructor(e, t) {
		this.queues = new Map(t), this.defaultOptions = e;
	}
	create(e, t = {}) {
		let n = new TaskQueue({
			...this.defaultOptions,
			...t
		});
		return this.queues.set(e, n), n;
	}
	get(e) {
		return this.queues.get(e);
	}
	getOrCreate(e, t = {}) {
		return this.get(e) ?? this.create(e, t);
	}
	options() {
		return { ...this.defaultOptions };
	}
};
export { CancelReason, QueueManager, TaskQueue };
