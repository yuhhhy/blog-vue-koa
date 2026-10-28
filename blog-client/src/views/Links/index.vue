<script setup>
import ArticleFooter from "../Blog/components/ArticleFooter.vue"
import { computed, onMounted, ref } from "vue"
import { useLinks } from "@/composables/useLinks.js"

import EmaRack from '@/components/ema/EmaRack.vue'
defineProps({ preview: Boolean })
const loadError = ref(false)
const loading = ref(true)
const { links, loadLinks } = useLinks()
const linkGroups = computed(() => [
    {
        key: 'friend',
        title: '朋友们',
        description: '以下是目前与我互相陪伴的站点，点击绘马即可探索他们的世界～ 如果你也想出现在这里，请继续往下看规则',
        links: links.value.filter((link) => link.category !== 'recommended'),
    },
    {
        key: 'recommended',
        title: '推荐站点',
        description: '这些是我单向推荐、值得一看的站点。',
        links: links.value.filter((link) => link.category === 'recommended'),
    },
].filter((group) => group.links.length))

const fetchLinks = async (force = false) => {
    loading.value = true
    loadError.value = false
    try { await loadLinks({ force }) } catch { loadError.value = true }
    finally { loading.value = false }
}
onMounted(() => fetchLinks())

</script>

<template>
<div class="link-container">
    <div class="links">
        <div class="links-article">
            <!-- 内容区域 -->
            <div class="links-article-content">

                <h4>介绍语</h4>
                <p>很高兴在网络世界的角落里遇见你！这个小小的友链空间，是我用来存放那些在浩瀚信息流中打动过我、带给我灵感或共鸣的地方。</p>
                <p>我珍视真诚的分享、独特的见解和持续创作的坚持。如果你也建立了一个小小的精神角落，记录生活、表达思考、分享热爱，并且你觉得我们有某种契合，欢迎留言和互加友链。</p>
                <p>我会认真拜访你的“空间”，如果感觉有缘分，就会将你加入我的友链列表。即使暂时不互相加为友链，也期待与你成为朋友或交流想法！感谢每一位愿意分享小站的朋友！</p>

                <p v-if="loading" role="status">正在挂上朋友们的绘马…</p>
                <p v-else-if="loadError" role="alert">友链暂时没有加载成功。<button type="button" @click="fetchLinks(true)">重新加载</button></p>
                <p v-else-if="!links.length">木架已备好，静候有缘的小站。</p>
                <section v-for="group in linkGroups" :key="group.key" class="link-group">
                    <h4>{{ group.title }}</h4>
                    <p>{{ group.description }}</p>
                    <EmaRack :links="group.links" :group="group.key" :preview="preview" />
                </section>

                <h4>友链申请规则</h4>
                <ul>
                    <li>您的网站在中国大陆区域能够正常访问（如果使用海外服务器，建议启用CDN加速）</li>
                    <li>您的网站需要需与我的博客主题有一定关联性（如前端技术、个人成长、生活记录），或更新稳定</li>
                    <li>麻烦先为您的网站添加本站友链</li>
                    <li>我会根据内容质量添加友链~谢谢</li>
                    <li>不接受纯商业推广、采集站、或包含敏感内容的站点</li>
                </ul>

                <p>友链申请格式与本站信息如下：</p>
                <ul>
                    <li>Name：一曝十寒</li>
                    <li>Desc：纵使不安彷徨，即便茫然无措，也依然迈步前行</li>
                    <li>Link：https://yuhhhy.cn/</li>
                    <li>Avatar：https://yuhhhy.cn/images/avatar.jpg</li>
                </ul>

                <h4>申请方式</h4>
                <ol>
                    <li>在当前页面评论区评论</li>
                    <address>
                        <li>发送邮件至：<a href="mailto:281423846@qq.com">我的邮箱</a></li>
                    </address>
                </ol>
            </div>
            <!-- 评论区域 -->
            <ArticleFooter :pageId="'0'"></ArticleFooter>
        </div>
    </div>
</div>
</template>

<style lang="scss" scoped>
.link-container {
    background-color: var(--white);
    min-height: calc(100vh - 75px);
    
    .links {
        padding: 40px 0;
        height: 100%;

        .links-article {
            .links-article-content {
                padding-bottom: 30px;
                line-height: 1.8;
                font-family: var(--font-serif);
                color: var(--light-dark);

                h1 {
                    font-size: 2em;
                }

                h2 {
                    font-size: 1.8em;
                }

                h3 {
                    font-size: 1.6em;
                }

                h4 {
                    font-size: 1.4em;
                }

                h5 {
                    font-size: 1.2em;
                }

                h6 {
                    font-size: 1em;
                }

                h1, h2, h3, h4, h5, h6 
                {
                    color: var(--blue);
                    margin: 1.5em 0 0.8em;
                    font-weight: 600;

                    a {
                        display: none;
                    }

                    &:hover {
                        a {
                            display: inline;
                        }
                    }
                }

                p {
                    margin-bottom: 1.2em;
                    font-size: 1rem;
                }

                p[align="center"] {
                    font-size: 0.8rem;
                    color: var(--quote-color);
                }

                b, strong {
                    color: var(--b-color);
                }

                ul, ol {
                    padding-left: 2em;
                    margin: 1em 0;

                    li {
                        margin-bottom: 0.6em;
                        list-style-position: outside;
                    }
                }

                a {
                    color: var(--skyblue);
                    text-decoration: none;
                    word-break: break-word; // 文字折行
                }

                address {
                    font-style: normal;
                }

                blockquote {
                    border-left: 4px solid var(--blue);
                    margin: 1em 0;
                    padding: 0.6em 1em;
                    background: var(--links-background);
                    border-radius: 0 4px 4px 0;

                    ul {
                        margin: 0;
                        padding-left: 0;
                        list-style: none;
                    }
                }
            }
        }
        @media (max-width: 768px) {
            padding: 20px 0;

            .links-article {
                .links-article-content {
                    padding-bottom: 30px;


                }
            }
        }
    }
}
</style>
