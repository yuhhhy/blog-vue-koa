import { runAfterPageIdle } from "./runAfterPageIdle.js";

export function loadCjkFontWhenIdle() {
    if (typeof document === "undefined" || !("fonts" in document)) {
        return;
    }

    const loadFont = () => {
        document.fonts
            .load('1em "Source Han Serif SC VF Local"', "的是笑仅舟")
            .then((fonts) => {
                if (fonts.length > 0) {
                    document.documentElement.classList.add("fonts-loaded");
                }
            })
            .catch(() => {});
    };

    runAfterPageIdle(loadFont, 7000);
}
