<script setup>
import { onMounted, ref } from 'vue'
import { apiGetBlogList } from '@/api/index.js'
import { ElMessage } from 'element-plus'
import Sidebar from '@/views/Sidebar/index.vue'

const blogList = ref([])

onMounted(() => {
    apiGetBlogList().then((data) => {
        console.log('获取博客列表成功', data)
        blogList.value = data
    }).catch((e) => {
        ElMessage.error('获取博客列表失败')
    })
})

</script>

<template>
    <div class="home-container">
        <!-- banner -->
        <div class="home-banner">
            该博客还不知道放点什么
        </div>
        <div class="home-content">
            <!-- 博客列表 -->
            <div class="home-main">
                <RouterLink v-for="blog in blogList" :to="`/blog/${blog._id}`" class="blog">
                    <div class="blog-img"
                        :style="{ 'background-image': `url(${blog.coverImage || '/images/20171227.jpg'})` }">
                    </div>
                    <div class="blog-intro">
                        <div class="blog-tags">
                            <span class="blog-tag" v-for="tag in blog.tags">{{ tag }}</span>
                        </div>
                        <div class="blog-title">{{ blog.title }}</div>
                        <div class="blog-time">{{ blog.date.substring(0, 10) }}</div>
                    </div>
                </RouterLink>
            </div>
            <!-- 个人展示 -->
            <Sidebar></Sidebar>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.home-container {
    display: flex;
    flex-direction: column;
    margin-top: 64px;
    min-height: calc(100vh - 75px);

    .home-banner {
        width: 100%;
        height: 400px;
        background-image: url(../../assets/homeImg.jpg);
        background-size: cover;
        background-position: center;
        color: #FFF;
        font-size: 64px;
        font-weight: 700;
        font-family: "Google Sans", arial, sans-serif;
    }

    .home-content{
        background-color: #F5F5FA;
        padding: 40px 60px;
        display: flex;

        .home-main {
            flex: 1;
            height: 100%;
            margin-right: 40px;
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
    
            .blog {
                flex: 1;
                border-radius: 10px;
                min-height: 300px;
                min-width: 400px;
                overflow: hidden;
                background-color: #fff;
    
                .blog-img {
                    width: 100%;
                    height: 200px;
                    background-size: cover;
                    background-position: center;
                }
    
                .blog-intro {
                    padding: 20px;
    
                    .blog-tags {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 10px;
    
                        .blog-tag {
                            padding: 5px 10px;
    
                            // margin-right: 10px;
                            &::before {
                                content: '# ';
                            }
                        }
                    }
    
                    .blog-title {
                        font-size: 20px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
    
                    .blog-time {
                        font-size: 14px;
                        color: #666;
                    }
    
                }
    
            }
        }
    }
}
</style>
