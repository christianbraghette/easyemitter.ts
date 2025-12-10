import EventEmitter, { EventCall } from ".";

const e = new EventEmitter<'message' | 'open', any>();

let fun: EventCall<'message', any> = ({ data }) => {
    console.log("Message:", data);
}

e.on('open', ({ data, emitter }) => {
    console.log("Open", data);

    emitter.on('message', fun);

    e.emit('message', "Dio");
});

setTimeout(async () => {
    const test = await e.wait('open');
    e.emit('message', test);
}, 0);

setTimeout(async () => {
    fun = ({ data }) => {
        console.log("Message2:", data);
    }
}, 500)

setTimeout(() => e.emit('open', "I'm a good test"), 1000);
