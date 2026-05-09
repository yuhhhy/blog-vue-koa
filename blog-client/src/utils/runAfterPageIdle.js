export function runAfterPageIdle(task, delay = 5000) {
    if (typeof window === "undefined") {
        return;
    }

    const run = () => {
        window.setTimeout(() => {
            if ("requestIdleCallback" in window) {
                window.requestIdleCallback(() => task(), { timeout: 3000 });
            } else {
                task();
            }
        }, delay);
    };

    if (document.readyState === "complete") {
        run();
    } else {
        window.addEventListener("load", run, { once: true });
    }
}
