<template>
    <button class="home-corner-return" type="button" aria-label="返回首页">
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <line class="home-corner-return__shaft" x1="19" y1="12" x2="5" y2="12" />
            <polyline class="home-corner-return__head" points="12 5 5 12 12 19" />
        </svg>
    </button>
</template>

<style scoped>
.home-corner-return {
    position: fixed;
    z-index: 20;
    top: 0;
    left: 0;
    width: clamp(42px, 3.5vw, 48px);
    aspect-ratio: 1;
    padding: 0;
    overflow: hidden;
    color: #ffffff;
    background: #263846;
    border: 1px solid #263846;
    border-radius: 0;
    cursor: pointer;
    transform: translate(-50%, -50%) rotate(45deg);
    view-transition-name: home-corner-return;
}

.home-corner-return svg {
    position: absolute;
    top: 50%;
    left: 83.333%;
    width: 21px;
    overflow: visible;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    transform: translate(-50%, -50%);
}

.home-corner-return__shaft,
.home-corner-return__head {
    transform: translateX(-2px) scaleX(1);
    transition: transform 300ms ease-in-out;
}

.home-corner-return:hover .home-corner-return__shaft,
.home-corner-return:focus-visible .home-corner-return__shaft,
.home-corner-return:hover .home-corner-return__head,
.home-corner-return:focus-visible .home-corner-return__head {
    transform: translate(-5px, -1px) scaleX(1);
}

.home-corner-return:focus-visible {
    outline: 2px solid #263846;
    outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
    .home-corner-return__shaft,
    .home-corner-return__head {
        transition-duration: 1ms;
    }
}
</style>
