/**
 * The result of capturing standard output and error.
 */
export interface CaptureResult {
	stdout: string;
	stderr: string;
	combined: string;
}

/**
 * Capture the standard output and error of a synchronous function.
 * @param fn
 */
export function captureSync(fn: () => void): CaptureResult;

/**
 * Capture the standard output and error of an asynchronous function.
 * @param fn
 */
export function captureAsync(fn: () => Promise<void> | void): Promise<CaptureResult>;
