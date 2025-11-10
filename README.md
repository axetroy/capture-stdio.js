# capture-stdio.js

[![Badge](https://img.shields.io/badge/link-996.icu-%23FF4D5B.svg?style=flat-square)](https://996.icu/#/en_US)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg?style=flat-square)](https://github.com/996icu/996.ICU/blob/master/LICENSE)
![Node](https://img.shields.io/badge/node-%3E=14-blue.svg?style=flat-square)
[![npm version](https://badge.fury.io/js/capture-stdio.js.svg)](https://badge.fury.io/js/capture-stdio.js)

A simple utility to capture stdout and stderr output from synchronous functions in Node.js.

It is typically used in test cases.

## Installation

```bash
npm install capture-stdio.js --save
```

## Usage

```js
import { captureSync } from "capture-stdio.js";

const { stdout, stderr } = captureSync(() => {
	console.log("This is a synchronous log.");
	console.error("This is a synchronous error.");
});

console.log("Synchronous Output:", stdout);
console.log("Synchronous Error:", stderr);
```

## License

The [Anti 996 License](LICENSE)
