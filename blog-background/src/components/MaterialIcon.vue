<script setup>
defineProps({
    path: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <svg
        class="material-icon"
        viewBox="0 0 24 24"
        role="img"
        :aria-hidden="title ? undefined : 'true'"
        :aria-label="title || undefined"
    >
        <title v-if="title">{{ title }}</title>
        <path :d="path" />
    </svg>
</template>

<style scoped>
.material-icon {
    display: inline-block;
    width: 1em;
    height: 1em;
    flex: none;
    fill: currentColor;
    vertical-align: -0.125em;
}

.material-icon.button-icon {
    margin-right: 6px;
}
</style>
