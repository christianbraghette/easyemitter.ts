/**
 * Copyright 2025 Christian Braghette
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files 
 * (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, 
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */

/** */
type EventType = string | number;

/**
 * Represents an event dispatched by an {@link EventEmitter}.
 *
 * @template T The type used to identify events.
 * @template Emitter The payload associated with the event.
 */
/*export type EventData<T extends O, O extends EventType, E> = {
    type: T;
    data?: E;
    emitter: EventEmitter<O, E>;
};*/

/**
 * The callback function invoked when an event of type `T` is emitted.
 *
 * @template Data The event data type.
 * @template Emitter The event payload type.
 * @param event The event metadata and optional payload.
 */
export type EventCallback<Data, Emitter> = (data: Data, emitter: Emitter) => void;


/**
 * A lightweight and type-safe event emitter.
 *
 * Supports standard subscription (`on`), one-time listeners (`once`),
 * event emission (`emit`), async waiting for events (`wait`), and
 * full cleanup (`destroy`).
 *
 * @template T The event identifier type.
 * @template E The event payload type.
 */
export class EventEmitter<T extends EventType, E> {
    #waiters = new Set<(reason?: any) => void>()
    #calls = new Map<T, Set<EventCallback<any, this>>>();
    #timeouts = new Set<number>();

    /**
     * Registers a listener for a given event type.
     *
     * @param type The event type to listen for.
     * @param callbackFn The callback invoked when the event is emitted.
     */
    public on<K extends T, D extends E>(type: K, callbackFn: EventCallback<D, this>): void {
        if (!this.#calls.has(type))
            this.#calls.set(type, new Set());
        this.#calls.get(type)?.add(callbackFn);
    }

    /**
     * Registers a one-time listener for a given event type.
     * The callback will be removed automatically after being invoked once.
     *
     * @param type The event type to listen for.
     * @param callbackFn The callback invoked once when the event is emitted.
     */
    public once<K extends T, D extends E>(type: K, callbackFn: EventCallback<D, this>): void {
        const wrapper: EventCallback<D, this> = (event) => {
            callbackFn(event, this);
            this.off(type, wrapper);
        };
        this.on(type, wrapper);
    }

    /**
     * Removes a previously registered listener for the given event type.
     *
     * @param type The event type whose listener should be removed.
     * @param callbackFn The callback function to unregister.
     */
    public off<K extends T, D extends E>(type: K, callbackFn: EventCallback<D, this>): void {
        this.#calls.get(type)?.delete(callbackFn);
    }

    /**
     * Emits an event, invoking all listeners registered for that event type.
     *
     * @param type The event type to emit.
     * @param data Optional payload associated with the event.
     */
    public emit<D extends E>(type: T, data?: D): void {
        for (const callFn of this.#calls.get(type) ?? [])
            callFn(data, this);
    }

    /**
     * Waits asynchronously for an event of the specified type.
     * Optionally rejects the promise if a timeout is provided and expires.
     *
     * @param type The event type to wait for.
     * @param timeout Optional timeout (in ms). If exceeded, the promise rejects.
     * @returns A promise that resolves with the event's payload.
     */
    public wait<K extends T, D extends E>(type: K, timeout?: number): Promise<D | undefined> {
        return new Promise((resolve, reject) => {
            this.#waiters.add(reject);

            let t: number | undefined;
            if (timeout) {
                t = setTimeout(() => {
                    if (t !== undefined)
                        this.#timeouts.delete(t);
                    reject("Event timed out");
                }, timeout);
                this.#timeouts.add(t);
            }

            this.once<K, D>(type, (data) => {
                clearTimeout(t);
                this.#waiters.delete(reject);
                resolve(data);
            });
        })
    }

    /**
     * Cleans up all active listeners, pending waits, and timeouts.
     * All pending `wait()` promises are rejected with `"EventEmitter destroyed"`.
     *
     * This is useful when disposing of an emitter to avoid memory leaks.
     */
    public destroy() {
        for (const reject of this.#waiters)
            reject("EventEmitter destroyed");
        for (const timeout of this.#timeouts)
            clearTimeout(timeout);
        for (const set of this.#calls)
            set[1].clear();
        this.#calls.clear();
    }

}

export default EventEmitter;