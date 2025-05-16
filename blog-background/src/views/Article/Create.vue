<script setup>
import { ref, onMounted } from 'vue'
import Vditor from 'vditor'
import "~/vditor/src/assets/less/index.less"

const vditorEl = ref()

onMounted(() => {
    vditorEl.value = new Vditor("vditorEl", {
        height: '100%',
        width: '100%',
        blur(value) {
            console.log(value)
        }
    })
})
</script>

<template>
    <div id="vditorEl"></div>
    
</template>

<style scoped>
 
</style>