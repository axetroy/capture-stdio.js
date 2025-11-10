import { describe, it } from "node:test";
import assert from "node:assert";
import { captureSync, captureAsync } from "./index.js";

/**
 * SQLBuilder 单元测试
 */
describe("capture", () => {
	describe("sync", () => {
		it("print hello world", () => {
			const result = captureSync(() => {
				console.log("hello world");
				console.error("hello world error");
			});

			assert.strictEqual(result.stdout, "hello world\n");
			assert.strictEqual(result.stderr, "hello world error\n");
			assert.strictEqual(result.combined, "hello world\nhello world error\n");
		});

		it("print object", () => {
			const result = captureSync(() => {
				console.log({ message: "hello world" });
			});

			assert.strictEqual(result.stdout, "{ message: 'hello world' }\n");
			assert.strictEqual(result.stderr, "");
			assert.strictEqual(result.combined, "{ message: 'hello world' }\n");
		});

		it("throw error", () => {
			assert.throws(() => {
				captureSync(() => {
					throw new Error("test error");
				});
			}, /test error/);
		});

		it("do async task in sync capture", () => {
			const result = captureSync(() => {
				setTimeout(() => {
					console.log("hello from timeout");
				});
			});

			// The async log should not be captured
			assert.strictEqual(result.stdout, "");
			assert.strictEqual(result.stderr, "");
			assert.strictEqual(result.combined, "");
		});
	});

	describe("async", () => {
		it("print hello world", async () => {
			const result = await captureAsync(async () => {
				console.log("hello world");
				console.error("hello world error");
			});

			assert.strictEqual(result.stdout, "hello world\n");
			assert.strictEqual(result.stderr, "hello world error\n");
			assert.strictEqual(result.combined, "hello world\nhello world error\n");
		});

		it("print object", async () => {
			const result = await captureAsync(async () => {
				console.log({ message: "hello world" });
			});

			assert.strictEqual(result.stdout, "{ message: 'hello world' }\n");
			assert.strictEqual(result.stderr, "");
			assert.strictEqual(result.combined, "{ message: 'hello world' }\n");
		});

		it("throw error", async () => {
			await assert.rejects(async () => {
				await captureAsync(async () => {
					throw new Error("test error");
				});
			}, /test error/);
		});

		it("throw error in sync function", async () => {
			await assert.rejects(async () => {
				await captureAsync(() => {
					throw new Error("sync test error");
				});
			}, /sync test error/);
		});

		it("do sync task in async capture", async () => {
			const result = await captureAsync(() => {
				console.log("hello from async");
			});

			assert.strictEqual(result.stdout, "hello from async\n");
			assert.strictEqual(result.stderr, "");
			assert.strictEqual(result.combined, "hello from async\n");
		});
	});

	describe("options - noColor", () => {
		it("noColor option: false", async () => {
			const result = await captureAsync(
				() => {
					console.log({ msg: 123 });
				},
				{ noColor: false }
			);

			// Check the output based on the COLOR environment variable
			// The CI environment may have COLOR=0 set
			if (process.env.COLOR === "0") {
				assert.strictEqual(result.stdout, "{ msg: 123 }\n");
			} else {
				assert.strictEqual(result.stdout, "{ msg: \x1B[33m123\x1B[39m }\n");
			}
		});

		it("noColor option: true", async () => {
			const result = await captureAsync(
				() => {
					console.log({ msg: 123 });
				},
				{ noColor: true }
			);

			assert.strictEqual(result.stdout, "{ msg: 123 }\n");
		});

		it("noColor option with defaults", async () => {
			const result = await captureAsync(() => {
				console.log({ msg: 123 });
			});

			assert.strictEqual(result.stdout, "{ msg: 123 }\n");
		});
	});
});
