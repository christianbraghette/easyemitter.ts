import EventEmitter, { EventCallback } from ".";

const e = new EventEmitter<{ 
    message: string,
    data: number
}>();

let fun: EventCallback<string, typeof e> = (data) => {
    console.log("Message:", data);
}

e.on('data', (data, emitter) => {
    console.log("Open", data);

    emitter.on('message', fun);

    emitter.emit('message', "Dio");
});

setTimeout(async () => {
    const test = await e.wait('data');
    e.emit('message', String(test));
}, 0);

setTimeout(async () => {
    fun = (data) => {
        console.log("Message2:", data);
    }
}, 500)

setTimeout(() => e.emit('data', 1), 1000);
