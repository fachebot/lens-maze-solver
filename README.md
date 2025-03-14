# lens-maze-solver
<img width="1161" alt="3" src="https://github.com/user-attachments/assets/5d8ff76d-04c4-4fcd-bb5f-ace9aa616c2e" />

## 项目简介
这是一个用于自动解决 Lens 测试网水龙头网站迷宫的油猴脚本。通过自动寻路算法，帮助用户快速通过迷宫并获取测试代币。

## 使用教程

### 1. 安装插件
打开 Chrome 应用商店安装 Tampermonkey，地址：
[Tampermonkey - Chrome 网上应用店](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

### 2. 添加脚本
点击浏览器 Tampermonkey 插件按钮，然后点击 "添加新脚本..." 按钮进入编辑器界面。然后将本项目中 [main.js](https://github.com/fachebot/lens-maze-solver/blob/main/main.js) 文件中的所有内容复制到编辑器，按下快捷键 Ctrl+S 进行保存。

### 3. 自动寻路
打开 Lens 测试网领水网站： https://testnet.lenscan.io/faucet
1. 先登录谷歌账号
2. 输入自己的以太坊地址
3. 选择任意迷宫难度
4. 点击右侧绿色的 "自动寻路" 按钮

脚本将自动完成迷宫寻路。

## 功能特点
- 自动识别迷宫结构
- 使用广度优先搜索(BFS)算法寻找最短路径
- 支持不同难度的迷宫
- 一键自动通关

## 免责声明
本脚本仅供学习和研究使用，请遵守相关网站的使用条款。

## 贡献
欢迎提交 Issue 和 Pull Request！

## 许可证
[MIT License](LICENSE)
