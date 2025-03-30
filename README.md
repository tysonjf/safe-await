# @diemantra/safe-await

[![npm version](https://badge.fury.io/js/%40diemantra%2Fsafe-await.svg)](https://badge.fury.io/js/%40diemantra%2Fsafe-await)

A simple utility function to safely await Promises, providing a consistent way to handle resolved values and errors, inspired by Go's error handling pattern. It also supports optional success/error transformations and timeouts.

## Installation

```bash
npm install @diemantra/safe-await
# or
yarn add @diemantra/safe-await
# or
pnpm add @diemantra/safe-await
```

## Usage

Import the `safeAwait` function:

```typescript
import { safeAwait } from '@diemantra/safe-await';

async function fetchData(url: string): Promise<{ user: string }> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return response.json();
}

async function main() {
	const url = 'https://api.example.com/data';

	// Basic usage
	const { data, error } = await safeAwait(fetchData(url));

	if (error) {
		console.error('Failed to fetch data:', error.message);
		// Handle the error appropriately
		return;
	}

	console.log('Fetched data:', data.user);

	// Usage with success transformation
	const { data: userName, error: fetchError } = await safeAwait(fetchData(url), {
		onSuccess: (result) => `User name is ${result.user}`,
	});

	if (fetchError) {
		console.error('Failed again:', fetchError.message);
		return;
	}
	console.log(userName); // Output: User name is [user's name]

	// Usage with error transformation
	type CustomError = { code: number; message: string };
	const { error: customError } = await safeAwait(fetchData('invalid-url'), {
		onError: (err): CustomError => ({
			code: 500,
			message: `Transformed error: ${err.message}`,
		}),
	});

	if (customError) {
		console.error(`Error Code: ${customError.code}, Message: ${customError.message}`);
	}

	// Usage with timeout
	const { error: timeoutError } = await safeAwait(fetchData(url), {
		timeoutMs: 10, // Very short timeout for demonstration
	});

	if (timeoutError) {
		console.error('Operation timed out:', timeoutError.message);
	}
}

main();
```

## API

### `safeAwait<T, E = Error, M = T, N = E>(promise: Promise<T>, options?: Options): Promise<Result<M, N>>`

- `promise`: The `Promise<T>` to await.
- `options` (optional):
  - `onSuccess?: (data: T) => M | Promise<M>`: An optional function to transform the data if the promise resolves successfully. Can be async.
  - `onError?: (error: E) => N`: An optional function to transform the error if the promise rejects. **Note:** This function _receives_ the error but should _return_ the transformed error value (`N`) to be placed in the `.error` property of the result. It does _not_ re-throw the error.
  - `timeoutMs?: number`: An optional timeout in milliseconds. If the promise doesn't resolve or reject within this time, it will reject with a timeout error.
- Returns: `Promise<Result<M, N>>` where `Result` is an object ` { data: M } | { error: N }`.
# safe-await
# safe-await
