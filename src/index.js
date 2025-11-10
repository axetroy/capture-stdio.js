/**
 *
 * @param {Record<string, string>} keyValueMap
 * @returns {() => void} - Function to restore the old environment variable value
 */
function hydrateEnvironmentVariables(keyValueMap) {
	const restoreMap = new Map();

	for (const [key, value] of Object.entries(keyValueMap)) {
		const oldValue = process.env[key];

		if (value === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = value;
		}

		restoreMap.set(key, () => {
			if (oldValue === undefined) {
				delete process.env[key];
			} else {
				process.env[key] = oldValue;
			}
		});
	}

	// Return a function to restore all old values
	return () => {
		for (const restore of restoreMap.values()) {
			restore();
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

	const restoreColor = noColor ? hydrateEnvironmentVariables({ NODE_DISABLE_COLORS: "1", FORCE_COLOR: undefined, COLOR: "0" }) : noop;

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

		restoreColor();
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
