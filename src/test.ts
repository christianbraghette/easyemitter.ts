import EventEmitter from ".";

const e = new EventEmitter<'message' | 'open', any>();

e.on('open', ({ data, emitter }) => {
    console.log("Open", data);

    emitter.on('message', ({ data }) => {
        console.log("Message:", data);
    })
});

setTimeout(async () => {
    const test = await e.wait('open');
    e.emit('message', test);
}, 0)

setTimeout(() => e.emit('open', "I'm a good test"), 1000);
