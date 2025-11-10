/**
 *
 * @param {string} key - The environment variable key
 * @param {string | undefined} value - The value to set for the environment variable
 * @returns {() => void} - Function to restore the old environment variable value
 */
function hydrateEnvironmentVariables(key, value) {
	const oldValue = process.env[key];

	process.env[key] = value;

	// Return a function to restore the old value
	return () => {
		if (oldValue === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = oldValue;
		}
	};
}

const noop = () => {};

/**
 * Spies on stdout and stderr during the execution of the provided function.
 * @param {Function} fn
 * @param {SpyStdioCallback} callback
 * @param {object} [options]
 * @param {boolean} [synchronous=true]
 * @returns
 */
function capture(fn, callback, { echo = true, noColor = true } = {}, synchronous = true) {
	let stdout = "";
	let stderr = "";
	let combined = "";

	const originalStdoutWrite = process.stdout.write;
	const originalStderrWrite = process.stderr.write;
	const restore_NODE_DISABLE_COLORS = noColor ? hydrateEnvironmentVariables("NODE_DISABLE_COLORS", "1") : noop;
	const restore_FORCE_COLOR = noColor ? hydrateEnvironmentVariables("FORCE_COLOR", undefined) : noop;

	process.stdout.write = (chunk) => {
		stdout += chunk;
		combined += chunk;
		echo && originalStdoutWrite.call(process.stdout, chunk);
	};
	process.stderr.write = (chunk) => {
		stderr += chunk;
		combined += chunk;
		echo && originalStderrWrite.call(process.stderr, chunk);
	};

	const restore = () => {
		process.stdout.write = originalStdoutWrite;
		process.stderr.write = originalStderrWrite;

		restore_NODE_DISABLE_COLORS();
		restore_FORCE_COLOR();
	};

	if (synchronous === true) {
		try {
			fn();
			restore();
			callback({ stdout, stderr, combined });
		} catch (error) {
			restore();
			callback({ stdout, stderr, combined });
			throw error;
		}

		return;
	}

	try {
		const result = fn();

		const promiseObj = typeof result?.then === "function" ? result : Promise.resolve();

		promiseObj
			.then(() => {
				restore();
				callback({ stdout, stderr, combined });
			})
			.catch((error) => {
				restore();
				callback({ stdout, stderr, combined }, error);
			});
	} catch (error) {
		restore();
		callback({ stdout, stderr, combined }, error);
		return;
	}
}

/**
 * Spies on stdout and stderr during the execution of the provided synchronous function.
 * @param {Function} fn
 * @returns {SpyStdioResult}
 */
export function captureSync(fn, options) {
	let result;

	capture(
		fn,
		(result_) => {
			result = result_;
		},
		options,
		true
	);

	return result;
}

/**
 * Spies on stdout and stderr during the execution of the provided async function.
 * @param {Function} fn
 * @returns {Promise<SpyStdioResult>}
 */
export function captureAsync(fn, options) {
	return new Promise((resolve, reject) => {
		capture(fn, (result, error) => (error ? reject(error) : resolve(result)), options, false);
	});
}
