# Nihongo Study

一个简洁优雅的日语学习 Web 应用。纯前端实现，零依赖，无需构建工具或服务器。

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

直接在浏览器中打开 `index.html` 即可，无需安装任何依赖。

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

## 项目结构

```
├── index.html                # 入口页面
├── src/
│   ├── css/
│   │   └── style.css         # 样式（CSS 变量主题）
│   └── js/
│       ├── core.js           # 应用入口、状态管理、鼠标粒子特效
│       ├── modules/
│       │   ├── gojuon.js     # 五十音图模块
│       │   ├── words.js      # 单词模块
│       │   ├── sentences.js  # 句子模块
│       │   ├── quiz.js       # 测试模块
│       │   └── speech.js     # 语音合成模块
│       └── data/
│           ├── words/        # 单词数据（按分类）
│           └── sentences/    # 句子数据（按场景）
└── README.md
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
