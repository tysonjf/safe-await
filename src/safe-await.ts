// Types for the result object with a discriminated union
type Success<T> = { data: T; error?: never };
type Failure<E> = { data?: never; error: E };
type Result<T, E> = Success<T> | Failure<E>;

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
	const { onSuccess, onError, timeoutMs } = options || {};

	const timeoutPromise = timeoutMs
		? new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
		  )
		: null;

	try {
		const data = await (timeoutPromise
			? Promise.race([promise, timeoutPromise])
			: promise);

		const transformedData = onSuccess ? await onSuccess(data) : (data as M);
		return { data: transformedData };
	} catch (error) {
		return { error: onError ? onError(error as E) : (error as N) };
	}
}
