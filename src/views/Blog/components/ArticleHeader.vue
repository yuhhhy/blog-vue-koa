<script setup>
import { useRoute } from 'vue-router'
import { apiUpdateBlogLikeCount } from '@/api/index.js'
import { useLikeStore } from '@/stores/likeStore.js'

const props = defineProps(['blogData'])
const route = useRoute()
const likeStore = useLikeStore()

const handleLike = () => {
    // 如果没有点过任何赞，或这个文章没点过赞
    if(Object.keys(likeStore.likedInfo).length === 0 || !likeStore.likedInfo[route.params.id]){
        apiUpdateBlogLikeCount(route.params.id).then((data) => {
            props.blogData.likeCount = data.likeCount
        })
        likeStore.like(route.params.id)
    }
}
</script>

<template>
    <div class="article-header">
        <div class="header-left">
            <div class="view-count">
                <span>阅读 {{ blogData.viewCount }}</span>
                <!-- <span>{{ blogData.views || 10 }} 阅读</span> -->
            </div>
        </div>
        <div class="header-right">
            <div class="action-btn like" @click="handleLike">
                <div class="iconfont">&#xe707;</div>
                <span>{{ blogData.likeCount }}</span>
                <!-- <span>{{ blogData.likes || 2 }}</span> -->
            </div>
            <div class="action-btn comment">
                <div class="iconfont">&#xe613;</div>
                <span>{{ 3 }}</span>
                <!-- <span>{{ blogData.comments || 3 }}</span> -->
            </div>
            <div class="action-btn share">
                <div class="iconfont">&#xe65a;</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.article-header {
    padding: 10px 20px 5px 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    background: var(--white);
    border-radius: 8px 8px 0 0;

    .header-left {
        display: flex;
        align-items: center;

        .view-count {
            font-size: 0.875rem;
            color: var(--quote-color);
        }
    }

    .header-right {
        display: flex;
        margin-left: auto;
        gap: 20px;

        .action-btn {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.875rem;
            color: var(--quote-color);
            transition: all 0.3s;

            .iconfont {
                font-size: 18px;
            }

            &.like {
                .iconfont {
                    font-size: 20px !important; // 保持span图标大小不变
                }
            }

            &.like:hover {
                color: var(--red);
            }

            &.comment:hover {
                color: var(--blue);
            }

            &.share:hover {
                color: var(--orange);
            }
        }
    }
}
</style>