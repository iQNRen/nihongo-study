# Nihongo Study

一个简洁优雅的日语学习 Web 应用。纯前端实现，零依赖，无需构建工具。

## 功能

- **五十音图** — 完整的平假名/浊音/拗音表，点击即可发音
- **单词学习** — 按分类浏览日语单词，支持搜索、分页和收藏
- **句子练习** — 按场景分类的日语句子，支持搜索、分页和收藏
- **五种测试模式**
  - 看日选中 — 看日语单词，选中文意思
  - 看中选日 — 看中文意思，选日语单词
  - 听音选词 — 听发音，选出正确的日语单词
  - 假名识读 — 看假名，选正确的罗马音读法
  - 拼写挑战 — 根据中文意思，拼出日语单词
- **错题本** — 自动记录答错的题目，支持清空和回顾

## 使用方式

项目使用 ES Modules，需要通过本地 HTTP 服务器启动（直接双击打开会因 CORS 限制导致模块加载失败）。

```bash
# 使用 npx（无需全局安装）
npx http-server . -p 3000 -c-1

# 或使用 Python 内置服务器
python3 -m http.server 3000

# 或使用 VS Code 的 Live Server 插件
```

然后访问 `http://localhost:3000` 即可。

## 项目结构

```
├── index.html                  # 入口页面
├── README.md
└── src/
    ├── css/
    │   └── style.css           # 全局样式（和风配色主题）
    └── js/
        ├── core.js             # 应用入口、Tab 路由、暗色模式、粒子特效
        ├── modules/
        │   ├── gojuon.js       # 五十音图渲染
        │   ├── words.js        # 单词浏览（搜索/分页/收藏）
        │   ├── sentences.js    # 句子浏览（搜索/分页/收藏）
        │   ├── quiz.js         # 测试（5 种模式 + 错题本）
        │   └── speech.js       # 语音合成（Google TTS + Web Speech API）
        └── data/
            ├── words/          # 单词数据
            │   ├── index.js    # 汇总导出
            │   ├── food.js     # 食物
            │   ├── animals.js  # 动物
            │   ├── family.js   # 家庭
            │   ├── verbs.js    # 动词
            │   └── ...         # 共 18 个分类
            └── sentences/      # 句子数据
                ├── index.js    # 汇总导出
                ├── greetings.js # 问候
                ├── daily.js    # 日常
                ├── travel.js   # 旅行
                └── ...         # 共 9 个场景
```

## 特性

- 零依赖，纯 HTML / CSS / JS，ES Modules 架构
- 响应式设计，适配手机和桌面
- 暗色模式，一键切换
- Google TTS 发音 + Web Speech API 备用
- CSS 自定义属性主题系统（和风配色）
- 鼠标粒子特效
- 回到顶部按钮
- 数据驱动，易于扩展内容

## License

MIT
