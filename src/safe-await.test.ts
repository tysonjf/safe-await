import { describe, expect, it, vi } from 'vitest';
import { safeAwait, TimeoutError } from './safe-await'; // Assuming TimeoutError is exported if you want to test it specifically

// Mock function for delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('safeAwait', () => {
	it('should return data when promise resolves', async () => {
		const promise = Promise.resolve({ id: 1, name: 'Test' });
		const { data, error } = await safeAwait(promise);
		expect(data).toEqual({ id: 1, name: 'Test' });
		expect(error).toBeUndefined();
	});

	it('should return error when promise rejects', async () => {
		const mockError = new Error('Something went wrong');
		const promise = Promise.reject(mockError);
		const { data, error } = await safeAwait(promise);
		expect(data).toBeUndefined();
		expect(error).toBe(mockError);
	});

	it('should apply onSuccess transformation', async () => {
		const promise = Promise.resolve(5);
		const { data, error } = await safeAwait(promise, {
			onSuccess: (result) => `Number is ${result}`,
		});
		expect(data).toBe('Number is 5');
		expect(error).toBeUndefined();
	});

	it('should apply async onSuccess transformation', async () => {
		const promise = Promise.resolve(10);
		const { data, error } = await safeAwait(promise, {
			onSuccess: async (result) => {
				await delay(10);
				return `Async number is ${result}`;
			},
		});
		expect(data).toBe('Async number is 10');
		expect(error).toBeUndefined();
	});

	it('should apply onError transformation', async () => {
		const originalError = new Error('Original');
		const promise = Promise.reject(originalError);
		const { data, error } = await safeAwait(promise, {
			onError: (err) => ({ message: `Transformed: ${err.message}`, code: 500 }),
		});
		expect(data).toBeUndefined();
		expect(error).toEqual({ message: 'Transformed: Original', code: 500 });
	});

	it('should resolve within timeout', async () => {
		const promise = delay(20).then(() => 'Success');
		const { data, error } = await safeAwait(promise, { timeoutMs: 50 });
		expect(data).toBe('Success');
		expect(error).toBeUndefined();
	});

	it('should return TimeoutError when timeout exceeded', async () => {
		// Mock timers for reliable timeout testing
		vi.useFakeTimers();

		const promise = delay(100).then(() => 'Should not resolve');
		const safePromise = safeAwait(promise, { timeoutMs: 50 });

		// Advance time just past the timeout
		await vi.advanceTimersByTimeAsync(51);

		const { data, error } = await safePromise;

		expect(data).toBeUndefined();
		expect(error).toBeInstanceOf(TimeoutError); // Use specific error type if exported
		expect(error?.message).toBe('Operation timed out after 50ms');

		// Restore real timers
		vi.useRealTimers();
	});

	it('should cleanup timeout when promise resolves quickly', async () => {
		vi.useFakeTimers();
		const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

		const promise = Promise.resolve('Fast success');
		const safePromise = safeAwait(promise, { timeoutMs: 100 });

		await vi.advanceTimersByTimeAsync(1); // Allow promise microtask to resolve

		await safePromise; // Wait for safeAwait to finish

		// Check if timeout was cleared
		expect(clearTimeoutSpy).toHaveBeenCalled();

		clearTimeoutSpy.mockRestore();
		vi.useRealTimers();
	});

	it('should cleanup timeout when promise rejects quickly', async () => {
		vi.useFakeTimers();
		const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

		const promise = Promise.reject(new Error('Fast failure'));
		// Need to catch the rejection from safeAwait itself
		const safePromise = safeAwait(promise, { timeoutMs: 100 }).catch(() => {});

		await vi.advanceTimersByTimeAsync(1); // Allow promise microtask to resolve

		await safePromise; // Wait for safeAwait to finish

		// Check if timeout was cleared
		expect(clearTimeoutSpy).toHaveBeenCalled();

		clearTimeoutSpy.mockRestore();
		vi.useRealTimers();
	});
});
