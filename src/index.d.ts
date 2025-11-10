/**
 * The result of capturing standard output and error.
 */
export interface CaptureResult {
	stdout: string;
	stderr: string;
	combined: string;
}

export interface CaptureOptions {
	/** Whether to echo the captured output to the original streams. Default is true. */
	echo?: boolean;
	/** Whether to disable colors in the captured output. Default is true. */
	noColor?: boolean;
}

/**
 * Capture the standard output and error of a synchronous function.
 * @param fn
 */
export function captureSync(fn: () => void, options?: CaptureOptions): CaptureResult;

/**
 * Capture the standard output and error of an asynchronous function.
 * @param fn
 */
export function captureAsync(fn: () => Promise<void> | void, options?: CaptureOptions): Promise<CaptureResult>;
