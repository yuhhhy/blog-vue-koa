<script setup>
import Sidebar from "@/components/Sidebar/index.vue"
import ArticleContent from "../Blog/components/ArticleContent.vue"
import ArticleFooter from "../Blog/components/ArticleFooter.vue"

const htmlContent = `
            <h1>关于我</h1>
            <ul>
                <li>大二生，来自江西，正在长沙上学</li>
                <li>喜欢的音乐：电子音乐、摇滚、VOCALOID、日语流行</li>
                <li>喜欢的运动：羽毛球</li>
                <li>闲暇时会：买很多书，然而并没有读多少</li>
                <li>闲暇时会：关注社会新闻，了解一些政治、历史知识，读过一点马经</li>
                <li>我的技能：会弹一点点吉他，研究一点作曲</li>
                <li>喜欢的电影：《寄生虫》、《情书》</li>
                <li>喜欢的一些书：《变形记》、《卡拉马佐夫兄弟》、契科夫的小说、刘慈欣的小说</li>
                <li>喜欢的番剧：《It's MyGO!!!!!》、《Serial Experiments Lain》、《Just Because!》、《龙与虎》</li>
                <li>玩过的一些游戏：决战平安京、战地5、CS2</li>
                <li>正在看漫画：《火之鸟》</li>
            </ul>
            <h1>博主的话</h1>
                <p>在建立我的个人博客时，我翻看了许多的博客站点，它们有的近期刚刚更新，但是更多的是一两年都没有没有新的内容了，这让我思考博客的意义。因为我知道我是一个对许多事情都三分钟热度的人（我们名字“一曝十寒”大概也因此而起），所以我不想让这个称呼一语成谶，而是希望能够做到坚持不懈，我也最钦佩能坚持不懈把一件事一直做下去的人。我知道这不单单需要热情与冲劲，更需要长远的规划。🤔</p>
                <p>还有一件我意识到的事情是，在互联网这片土地上，有时最珍贵的并不是多么厉害的技术或者知识，而是真实的态度。我希望我的个人博客能够成为一个让我真实地展示自己，或许也与大家分享想法、交流感受的空间！😄</p>
            <h1>关于本站</h1>
                <li>2025.05.02 部署于Vercel</li>
                <li>2025.05.13 进行ICP备案</li>
                <li>2025.05.21 ICP备案通过</li>
            <h2>朋友</h2>
                <li><a href="https://v.douyin.com/h-Lzt62UbIQ/ 3@9.com :3pm" target="_blank">25020jason1728</a></li>

            <h3>可能对我有启发的博客</h3>
                <li><a href="https://idealclover.top/" target="_blank">idealclover</a></li>
                <li><a href="https://blog.fiveth.cc/" target="_blank">fiveth</a></li>
                <li><a href="https://liuyuyang.net/" target="_blank">liuyuyang</a></li>
            `
</script>

<template>
    <div class="about">
        <div class="about-article">
            <ArticleContent :htmlContent="htmlContent"></ArticleContent>
            <ArticleFooter></ArticleFooter>
        </div>
        <Sidebar class="about-sidebar"></Sidebar>
    </div>
</template>

<style lang="scss" scoped>
.about {
    background-color: var(--light);
    margin-top: 64px;
    padding: 40px calc(7vw + 10px);
    display: flex;
    height: 100%;

    .about-article {
        background-color: var(--white);
        border-radius: 10px;
        flex: 1;
    }
    @media (max-width: 768px) {
            padding: 0;
            flex-direction: column;
           .about-aritcle {
                margin-right: 0;
                margin-bottom: 20px;
           }
        }
}
</style>
