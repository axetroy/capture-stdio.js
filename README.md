# capture-stdio.js

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg?style=flat-square)](https://996.icu/#/en_US)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
![Node](https://img.shields.io/badge/node-%3E=14-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/capture-stdio.js.svg)](https://badge.fury.io/js/capture-stdio.js)

A lightweight utility to capture standard output (stdout) and error (stderr) streams in Node.js applications.

It is typically used in test cases to assert console output without polluting test logs.

## Features

- ✨ **Simple API** - Easy to use with both synchronous and asynchronous functions
- 🔍 **Separate Streams** - Captures stdout and stderr separately
- 📝 **Combined Output** - Provides combined output preserving order
- 🎨 **Color Control** - Option to disable color codes in captured output
- 🔇 **Echo Control** - Option to suppress or allow output to original streams
- 📦 **TypeScript Support** - Full TypeScript type definitions included
- 🔄 **Both CJS and ESM** - Supports both CommonJS and ES Modules

## Installation

```bash
npm install capture-stdio.js --save
```

## Usage

### Basic Usage

```js
import { captureSync, captureAsync } from "capture-stdio.js";

// Synchronous capture
const { stdout, stderr } = captureSync(() => {
	console.log("This is a synchronous log.");
	console.error("This is a synchronous error.");
});

console.log("Synchronous Output:", stdout);
// => "This is a synchronous log.\n"
console.log("Synchronous Error:", stderr);
// => "This is a synchronous error.\n"

// Asynchronous capture
(async () => {
	const { stdout, stderr } = await captureAsync(async () => {
		console.log("This is an asynchronous log.");
		console.error("This is an asynchronous error.");
	});

	console.log("Asynchronous Output:", stdout);
	// => "This is an asynchronous log.\n"
	console.log("Asynchronous Error:", stderr);
	// => "This is an asynchronous error.\n"
})();
```

### TypeScript Usage

```typescript
import { captureSync, captureAsync, CaptureResult, CaptureOptions } from "capture-stdio.js";

const result: CaptureResult = captureSync(() => {
	console.log("Hello, TypeScript!");
});
console.log(result.stdout); // => "Hello, TypeScript!\n"

const options: CaptureOptions = {
	echo: false,
	noColor: true
};

const asyncResult: CaptureResult = await captureAsync(async () => {
	console.log("Async TypeScript!");
}, options);
console.log(asyncResult.stdout); // => "Async TypeScript!\n"
```

### Using the Combined Output

The `combined` property contains both stdout and stderr in the order they were written:

```js
const { stdout, stderr, combined } = captureSync(() => {
	console.log("First");
	console.error("Second");
	console.log("Third");
});

console.log(stdout);    // => "First\nThird\n"
console.log(stderr);    // => "Second\n"
console.log(combined);  // => "First\nSecond\nThird\n"
```

### Options

Both `captureSync` and `captureAsync` accept an optional options object:

```js
const options = {
	echo: false,     // Don't print output to console (default: true)
	noColor: true    // Disable color codes in output (default: true)
};

const { stdout, stderr } = captureSync(() => {
	console.log("This won't be printed to the console");
}, options);
```

#### `echo` (default: `true`)

When `true`, captured output is still printed to the original stdout/stderr streams. When `false`, output is only captured and not displayed:

```js
// With echo: true (default)
const result1 = captureSync(() => {
	console.log("Visible in console");
});
// Console shows: "Visible in console"

// With echo: false
const result2 = captureSync(() => {
	console.log("Hidden from console");
}, { echo: false });
// Console shows nothing
```

#### `noColor` (default: `true`)

When `true`, disables color codes in the captured output by setting environment variables (`NODE_DISABLE_COLORS=1`, `COLOR=0`). This is useful for testing when you want clean output without ANSI escape codes:

```js
// With noColor: true (default)
const result1 = captureSync(() => {
	console.log({ msg: 123 });
});
// result1.stdout === "{ msg: 123 }\n"

// With noColor: false
const result2 = captureSync(() => {
	console.log({ msg: 123 });
}, { noColor: false });
// result2.stdout may contain ANSI color codes like "\x1B[33m123\x1B[39m"
```

### When to Use captureSync vs captureAsync

Use `captureSync` for synchronous code:

```js
const { stdout } = captureSync(() => {
	console.log("Immediate output");
	// Synchronous operations only
});
```

Use `captureAsync` for asynchronous code or when you need to wait for promises:

```js
const { stdout } = await captureAsync(async () => {
	await someAsyncOperation();
	console.log("After async operation");
});

// captureAsync also works with synchronous functions
const { stdout } = await captureAsync(() => {
	console.log("Sync code in async capture");
});
```

**Important:** `captureSync` will not capture output from asynchronous operations like `setTimeout`:

```js
// ❌ This won't capture the output
const { stdout } = captureSync(() => {
	setTimeout(() => {
		console.log("This won't be captured");
	}, 100);
});
// stdout === ""

// ✅ Use captureAsync with proper awaiting instead
const { stdout } = await captureAsync(async () => {
	await new Promise(resolve => {
		setTimeout(() => {
			console.log("This will be captured");
			resolve();
		}, 100);
	});
});
```

## API

### `captureSync(fn, options?)`

Captures stdout and stderr during the execution of a synchronous function.

**Parameters:**
- `fn: () => void` - The synchronous function to execute
- `options?: CaptureOptions` - Optional configuration object

**Returns:** `CaptureResult`

**Throws:** Re-throws any error thrown by `fn` after capturing output

### `captureAsync(fn, options?)`

Captures stdout and stderr during the execution of an asynchronous function.

**Parameters:**
- `fn: () => Promise<void> | void` - The function to execute (can be sync or async)
- `options?: CaptureOptions` - Optional configuration object

**Returns:** `Promise<CaptureResult>`

**Rejects:** Rejects with any error thrown by `fn` after capturing output

### `CaptureResult`

```typescript
interface CaptureResult {
	stdout: string;   // Content written to process.stdout
	stderr: string;   // Content written to process.stderr
	combined: string; // Combined output in order of writing
}
```

### `CaptureOptions`

```typescript
interface CaptureOptions {
	echo?: boolean;     // Echo output to original streams (default: true)
	noColor?: boolean;  // Disable color codes (default: true)
}
```

## Use Cases

- **Testing** - Assert console output in unit tests
- **CLI Testing** - Capture command-line tool output
- **Logging Verification** - Verify that logs are written correctly
- **Output Inspection** - Inspect what libraries print to console
- **Silent Execution** - Run code without polluting console output

## License

The [Anti 996 License](LICENSE)
