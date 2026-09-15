const ws = new WebSocket(process.argv[2]);
let sequence = 0;
const pending = new Map();

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
        pending.get(message.id).resolve(message);
        pending.delete(message.id);
    }
};

await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
});

const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
});
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const evaluate = async (expression) => {
    const response = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (response.result.exceptionDetails) throw new Error(response.result.exceptionDetails.text);
    return response.result.result.value;
};
const click = (text) => evaluate(`(() => {
    const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent.trim() === ${JSON.stringify(text)});
    if (!button) throw new Error("Missing button: ${text}");
    button.click();
    return true;
})()`);

await call("Page.enable");
await call("Runtime.enable");
await call("Page.navigate", { url: "http://127.0.0.1:5173/" });
await pause(1800);
console.log("Initial buttons:", await evaluate(`Array.from(document.querySelectorAll("button")).map((item) => item.textContent.trim())`));
await click("Customization");
await pause(400);
const customization = await evaluate(`(() => {
    const screen = document.querySelector(".customization-screen");
    const art = Array.from(document.querySelectorAll(".ship-css-art")).map((node) => {
        const rect = node.getBoundingClientRect();
        const parent = node.parentElement.getBoundingClientRect();
        return {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            fits: rect.width <= parent.width + 1 && rect.height <= parent.height + 1,
        };
    });
    screen.scrollTop = screen.scrollHeight;
    return {
        screenHeight: screen.clientHeight,
        scrollHeight: screen.scrollHeight,
        scrollTop: screen.scrollTop,
        avatarCards: document.querySelectorAll(".avatar-option").length,
        art,
        allArtContained: art.every((item) => item.fits && item.width <= 60 && item.height <= 70),
    };
})()`);

await click("Back");
await pause(200);
await click("Flight settings");
await pause(200);
await click("Login");
await pause(200);
await evaluate(`(() => {
    const input = document.querySelector("input");
    input.value = "T3ster!";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent.trim() === "Enter tester tools");
    button.click();
    return true;
})()`);
await pause(250);

console.log(JSON.stringify({ customization, testerButtons: await evaluate(`Array.from(document.querySelectorAll("button")).map((item) => item.textContent.trim())`) }, null, 2));
ws.close();
