# EventEmitter TypeScript

A lightweight, type-safe, and async-ready EventEmitter for TypeScript.  
Supports standard event subscriptions, one-time listeners, async `wait()` for events, and full cleanup with `destroy()`.

---

## Features

- Type-safe event identifiers and payloads
- Standard listeners with `on()`
- One-time listeners with `once()`
- Emit events with optional payloads using `emit()`
- Async waiting for an event with optional timeout using `wait()`
- Proper cleanup of listeners and pending waits via `destroy()`
- Prevents memory leaks by tracking active timers and pending promises

---

## Installation

If you're using npm:

```bash
npm install easyemitter.ts
````

Or with yarn:

```bash
yarn add easyemitter.ts
```

> Replace `easyemitter.ts` with the actual package name if you publish it.

---

## Usage

```ts
import { EventEmitter } from "easyemitter.ts";

// Define event types and payloads
type Events = "message" | "ready";

type Payloads = {
  message: { text: string; from: string };
  ready: void;
};

const emitter = new EventEmitter<Events, Payloads>();

// Standard listener
emitter.on("message", (event) => {
  console.log("Message received:", event.data);
});

// One-time listener
emitter.once("ready", (event) => {
  console.log("Emitter is ready!");
});

// Emit events
emitter.emit("message", { text: "Hello", from: "Alice" });
emitter.emit("ready");

// Wait asynchronously for an event
async function waitForMessage() {
  try {
    const data = await emitter.wait("message", 5000); // 5 seconds timeout
    console.log("Received message via wait:", data);
  } catch (err) {
    console.error("Wait timed out:", err);
  }
}

waitForMessage();

// Destroy the emitter
emitter.destroy();
```

---

## API Reference

### `on(type, callFn)`

Registers a listener for a given event type.

* `type` — the event type to listen for
* `callFn` — the callback invoked when the event is emitted

### `once(type, callFn)`

Registers a one-time listener that will be removed after being invoked once.

### `off(type, callFn)`

Removes a previously registered listener for the specified event type.

### `emit(type, data?)`

Emits an event to all listeners registered for the given type.

* `data` is optional payload

### `wait(type, timeout?)`

Returns a promise that resolves with the payload of the first event of the given type.

* `timeout` is optional and rejects the promise if exceeded.

### `destroy()`

Cleans up all listeners, pending waits, and timeouts. All pending `wait()` promises are rejected.

---

## Notes

* Fully type-safe in TypeScript
* Designed to avoid memory leaks with timers and pending `wait()` calls
* `wait()` and `once()` can be used for async flow control

---

## License

MIT License
