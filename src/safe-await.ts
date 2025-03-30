// Types for the result object with a discriminated union
type Success<T> = { data: T; error?: never };
type Failure<E> = { data?: never; error: E };
type Result<T, E> = Success<T> | Failure<E>;

/**
 * Custom error class for timeout errors.
 */
export class TimeoutError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'TimeoutError';
		// Set the prototype explicitly (needed for transpiled ES6 classes)
		Object.setPrototypeOf(this, TimeoutError.prototype);
	}
}

/**
 * Safely awaits a promise with optional success and error handlers
 * @param promise The promise to await
 * @param options Optional configuration object
 * @returns A Result object containing the data or error
 */
export async function safeAwait<T, E = Error, M = T, N = E>(
	promise: Promise<T>,
	options?: {
		onSuccess?: (data: T) => M | Promise<M>;
		onError?: (error: E) => N;
		timeoutMs?: number;
	}
): Promise<Result<M, N>> {
	let timeoutId: NodeJS.Timeout | undefined = undefined;
	const { onSuccess, onError, timeoutMs } = options || {};

	const timeoutPromise = timeoutMs
		? new Promise<never>((_, reject) => {
				timeoutId = setTimeout(
					() => reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`)),
					timeoutMs
				);
		  })
		: null;

	try {
		const raceResult = timeoutPromise ? Promise.race([promise, timeoutPromise]) : promise;
		const data = await raceResult;
		if (timeoutId) clearTimeout(timeoutId);
		const transformedData = onSuccess ? await onSuccess(data) : (data as M);
		return { data: transformedData };
	} catch (error) {
		if (timeoutId) clearTimeout(timeoutId);
		if (error instanceof TimeoutError) {
			return { error: error as N };
		}
		return { error: onError ? onError(error as E) : (error as N) };
	}
}
