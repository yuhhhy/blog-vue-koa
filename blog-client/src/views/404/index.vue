<script setup>

</script>

<template>
    <div class="container">
        <img src="@/assets/images/404.avif" alt="404_image">
        <p>非常抱歉，您要访问的页面不存在~</p>
        <div>
            <RouterLink to="/home"><span>🏠回首页</span></RouterLink>
            <RouterLink to="/archive"><span>📚去归档页</span></RouterLink>
        </div>
    </div>
</template>

<style scoped>
.container {
    width: 100%;
    height: 100vh;
    background-color: #101010;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 70px;
    color: #fff;
    text-align: center;
    font-family: 'Comic Sans MS', cursive, sans-serif;

    img {
        max-width: 100%;
        height: auto;
        max-height: 30vh;
    }

    p {
        font-size: 1.5em;
        margin: 0;
    }

    a {
        margin: 0 10px;
        font-size: 1.2em;
        &:hover {
            text-decoration: underline;
        }
    }

}
</style>