<script setup>
    defineProps(['tags'])
</script>

<template>
    <div class="blog-tags">
        <div class="blog-tags-header">文章标签</div>
        <RouterLink v-for="tag in tags" :key="tag" :to="`/archive?tag=${tag}`">
            <div class="tag">
                {{ tag }}
            </div>
        </RouterLink>
    </div>
</template>

<style lang="scss" scoped>
.blog-tags {
    background-color: var(--white);
    color: var(--dark);
    padding: 20px;
    display: flex;
    flex-wrap: wrap;
    border-radius: 10px;
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
    }

    .blog-tags-header{
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 10px;
        width: 100%;
    }


    .tag {
        border-radius: 8px;
        padding: 6px;
        transition: all 0.3s;
        padding-left: 14px;
        padding-right: 14px;

        &:hover {
            color: var(--blue);
            background-color: #E2F0FF;
        }
    }

}
</style>