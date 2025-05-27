<script setup>
    defineProps(['tags'])
</script>

<template>
    <div class="blog-tags">
        <div class="blog-tags-header">文章标签</div>
        <RouterLink 
            v-for="tag in tags" 
            :key="tag" 
            :to="`/archive/${tag}`">
            <button>
                <span class="tag" >{{ tag }}</span>
                <span class="go iconfont">&#xe600;</span>
            </button>
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

    &:hover {
        box-shadow: 2px 2px 5px var(--dark);
        transition: 0.4s;
    }

    .blog-tags-header{
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 10px;
        width: 100%;
    }
    
    button {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 2px 10px;
        color: var(--black);
        text-transform: uppercase;
        cursor: pointer;
        letter-spacing: 1px;
        font-weight: 600;
        font-size: 1rem;
        border-radius: 50px;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        margin-right: 6px;
    }

    .tag {
        transition: all 0.3s ease;
        transition-delay: 100ms;
        &::before {
            content: '# ';
        }
    }

    .go {
        position: absolute;
        left: 0;
        transform: translateX(-100%);
        transition: all 0.3s ease;
        z-index: 2;
    }

    button:hover .go {
        transform: translateX(30px);
        transition-delay: 100ms;
    }

    button:hover .tag {
        transform: translateX(200%);
        transition-delay: 100ms;
    }
}
</style>