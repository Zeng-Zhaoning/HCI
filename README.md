# knowledgegraph

请使用 latest_zzn 分支，那里是最新的。后端地址：https://github.com/owenrrr/HCI_BackEnd.git

1、不要 npm install ！不要 npm install ！不要 npm install ！
也尽量不要引用新库。
直接 npm run serve 即可启动项目
2、技术栈：js、vue

3、目录结构
|--public
   |--icons 图标。格式可以为png、gif、svg、jpeg等。
   |--static_ref/data 存放了示例图谱的json。

src
|--assets 整个页面通用的css和颜色
|--components 组成页面的组件
   |--EditBar 右边的编辑栏
   |--Tools 存放一些比较通用的工具组件
   |--Cytoscape.vue 知识图谱（应该不会改到）
   |--SideBar.vue 左边栏
   |--WorkSpace 工作区，包括了图谱、左下角的按钮、右边操作栏等。Workspace与左边栏共同组成整个页面。
   |--TypesetGraph 排版时的工作区（不会改到）
|
|--router 路由：定义了url和页面/组件的显示关系。登陆页面、项目列表页、项目详情页之间的跳转需要在这里添加路由。
|
|--store 数据仓库：多个组件/页面互通的数据可以放到这里统一管理，方便实现跨组件、跨页面数据沟通。
   这里用的是Vuex，可以看官网：https://vuex.vuejs.org/zh/，“核心概念”这部分。
   index.js 里面放了页面的的基本数据。用户相关数据也可以放到这里。
   workspace.js 工作区用到的数据。基本都是跟图谱有关的，可以不用管。
|
|--views：存放各种页面，登录页、详情页等可以放在这个文件夹
   |--Home.vue 主页面
