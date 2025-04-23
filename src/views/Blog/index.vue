<script setup>
import { onMounted, ref, watch} from 'vue'
import { useRoute } from 'vue-router'
import { apiFetchBlogData } from '@/api/index.js'
import MarkdownIt from 'markdown-it'

const route = useRoute()

// ref() 参数最好是是 0 或 {}，而不是 null或 undefined
const blogData = ref(0)
const html = ref(0)

const fetchBlogData = async (blogId) => {
    await apiFetchBlogData(blogId)
        .then((data) => {
            // 只处理成功返回的数据
            blogData.value = data
        }).catch((error) => {
            console.error(error)
        })
}

const renderBlogContent = async () => {
    // 获取博客数据
    await fetchBlogData(route.params.id)

    // 使用 Markdown-it 解析器将 Markdown 转换为 HTML
    const md = new MarkdownIt()
    html.value = md.render(blogData.value.content)

    // 监听变化，重新渲染 HTML
    watch(blogData.value, (newBlogData) => {
        html.value = md.render(newBlogData.content)
    }, { immediate: true })
}


// 组件挂载完成后，再渲染数据，实现更快的页面加载
onMounted(() => {
    // 渲染博客内容
    renderBlogContent()

})

// 路由 id 变化时，组件不会重载
// watch(() => route.params.id,
//     (newId) => {
//         // 获取新的博客数据

//     }
// )
</script>

<template>
    <div class="blog-container">
        <!-- 博客头部banner区域 -->
        <div class="blog-header">
            <div class="banner">
                <!-- <img src="@/assets/1260864.jpg" alt="blog-image"> -->
            </div>
            <!-- 遮罩层 -->
            <div class="mask">

            </div>
                <!-- 相关信息 -->
                <div class="blog-title">{{ blogData.title }}</div>
                <div class="blog-info">
                    <div class="blog-date">{{ blogData.date }}</div>
                    <div class="blog-author">作者 {{ blogData.author }}</div>
                    <div class="blog-word-count">字数 {{ blogData.wordCount }}</div>
                </div>
        </div>

        <div class="blog-main">
            <!-- 博客页面文章主体 -->
            <div class="blog-aritcle">

                <!-- 文章上部分交互区域 -->
                <div class="article-header">
                    <div class="header-left">
                        <div id="view">
                            <span>10 阅读</span>
                        </div>
                    </div>
                    <div class="header-right">
                        <div id="like">
                            <div class="iconfont">&#xe707;</div>
                            <span>2</span>
                        </div>
                        <div id="comment">
                            <div class="iconfont">&#xe613;</div>
                            <span>3</span>
                        </div>
                        <div id="share">
                            <div class="iconfont">&#xe65a;</div>
                        </div>
                    </div>
                </div>

                <!-- 文章主体内容区域 -->
                <div class="article-content">
                    <textarea type="text" v-model="blogData.content" style="height: 200px; width: 400px;"></textarea>
                    <div v-html="html"> </div>
                </div>

                <!-- 文章底部相关信息和评论区域 -->
                <div class="artivle-footer">相关信息和评论区域</div>
            </div>


            <!-- 博客页面右侧边栏 -->
            <div class="blog-sidebar">
                <!-- 文章标签区域 -->
                <div class="article-tags">
                    <span class="tag">Vue</span>
                    <span class="tag">JavaScript</span>
                </div> 
                <!-- toc: Table of Content 文章目录 -->
                <div class="toc-header">文章目录</div>
                <div class="toc-content">文章目录内容</div>
            </div>
        </div>
    </div>
</template>

<style module>
img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 20px 0;
}
</style>

<style lang="scss" scoped>
.blog-container {
    background-color: #F5F5FA;
    margin-top: 64px;
    min-height: calc(100vh - 75px);

    .blog-header {
        position: relative;
        color: #fff;

        .banner {
            width: 100%;
            height: 500px;
            background-image: url('@/assets/1260864.jpg');
            background-attachment: fixed;
            background-size: cover;
        }

        .mask {
            width: 100%;
            height: 500px;
            background: linear-gradient(transparent, rgba(0,0,0,0.4) 50%, rgba(0, 0, 0, 0.8));
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .blog-title {
            font-size: 50px;
            font-weight: bold;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);  // 添加这行
            bottom: 120px;
            text-align: center;          // 添加这行
            width: 80%;                  // 添加这行，控制标题宽度
        }
        .blog-info {
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            width: 100%;
            position: absolute;
            bottom: 20px;

            > div {
                height: 30px;
                line-height: 30px;
            }
        }
    }

    .blog-main {
        padding: 40px calc(7vw + 10px);
        display: flex;
        height: 100%;

        .blog-aritcle {
            flex: 1;
            background-color: #fff;
            margin-right: 45px;
            border-radius: 15px;

            .article-header {
                padding: 20px;
                border-bottom: 1px solid #000;
                display: flex;

                .header-left {
                    display: flex;
                    align-items: center;
                }
                .header-right {
                    display: flex;
                    margin-left: auto;
                    gap: 20px;

                    &>div {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }

                    #like .iconfont {
                        cursor: pointer;
                        font-size: 24px;
                        transition: all 0.3s;

                        &:hover {
                            color: #ff0000;
                        }
                    }
                    #comment .iconfont {
                        cursor: pointer;
                        transition: all 0.3s;

                        &:hover {
                            color: #20c4ff;
                        }
                    }
                    #share .iconfont {
                        cursor: pointer;
                        transition: all 0.3s;

                        &:hover {
                            color: #ffb400;
                        }
                    }

                }
            }

            .article-content {
                padding: 20px 40px;
                line-height: 1.6;
                font-size: 28px;

            }
            .artivle-footer {
                padding: 20px;
                border-top: 1px solid #000;
            }
        }

        .blog-sidebar {
            background-color: #D5DEFD;
            min-width: 270px;
            height: 100%;
            border-radius: 30px;

            .article-tags {
                padding: 20px;
                display: flex;
                flex-wrap: wrap;

                .tag {
                    padding: 5px 10px;

                    &::before {
                        content: '#';
                    }
                }
            }
        }
    }
}
</style>