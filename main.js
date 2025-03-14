// ==UserScript==
// @name         LensFaucet迷宫寻路
// @namespace    https://github.com/fachebot/lens-maze-solver
// @version      0.1
// @description  Lens测试网水龙头迷宫验证码自动寻路
// @author       pan
// @match        https://testnet.lenscan.io/faucet
// @grant        unsafeWindow
// ==/UserScript==

// 定义方向映射
const DIRECTIONS = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1],
};

// 定义每个房间数字对应的可通行方向
const PASSABLE_DIRECTIONS = {
    0: ["up", "down", "left", "right"], // 上下左右都可通行
    1: ["left", "right", "down"], // 左右下可通行
    2: ["left", "up", "down"], // 左上下可通行
    3: ["left", "down"], // 左下可通行
    4: ["left", "right", "up"], // 左右上可通行
    5: ["left", "right"], // 左右可通行
    6: ["left", "up"], // 左上可通行
    7: ["left"], // 只有左可通行
    8: ["up", "down", "right"], // 上下右可通行
    9: ["down", "right"], // 下右可通行
    10: ["up", "down"], // 上下可通行
    11: ["down"], // 只有下可通行
    12: ["up", "right"], // 上右可通行
    13: ["right"], // 只有右可通行
    14: ["up"], // 只有上可通行
};

/**
 * 检查从当前位置向指定方向移动是否有效
 * @param {Array} maze - 二维数组表示的迷宫
 * @param {number} currentRow - 当前位置的行索引
 * @param {number} currentCol - 当前位置的列索引
 * @param {string} direction - 移动方向
 * @returns {boolean} - 如果移动有效返回true，否则返回false
 */
function isValidMove(maze, currentRow, currentCol, direction) {
    const rows = maze.length;
    const cols = maze[0].length;

    // 检查当前房间是否允许向该方向移动
    const roomValue = maze[currentRow][currentCol];
    if (!PASSABLE_DIRECTIONS[roomValue].includes(direction)) {
        return false;
    }

    // 计算移动后的新位置坐标
    const [dr, dc] = DIRECTIONS[direction];
    const newRow = currentRow + dr;
    const newCol = currentCol + dc;

    // 检查新位置是否在迷宫范围内
    if (!(0 <= newRow && newRow < rows && 0 <= newCol && newCol < cols)) {
        return false;
    }

    // 检查新房间是否允许从反方向进入
    const oppositeDirections = {
        up: "down",
        down: "up",
        left: "right",
        right: "left",
    };
    const oppositeDirection = oppositeDirections[direction];
    const newRoomValue = maze[newRow][newCol];

    return PASSABLE_DIRECTIONS[newRoomValue].includes(oppositeDirection);
}

/**
 * 使用广度优先搜索(BFS)寻找从起点到终点的最短路径
 * @param {Array} maze - 二维数组表示的迷宫
 * @param {Array} start - 起点坐标 [行, 列]
 * @param {Array} end - 终点坐标 [行, 列]
 * @returns {Array|null} - 如果找到路径，返回方向列表；否则返回null
 */
function findPath(maze, start, end) {
    const rows = maze.length;
    const cols = maze[0].length;
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;

    // 检查起点和终点是否在迷宫范围内
    if (
        !(
            0 <= startRow &&
            startRow < rows &&
            0 <= startCol &&
            startCol < cols &&
            0 <= endRow &&
            endRow < rows &&
            0 <= endCol &&
            endCol < cols
        )
    ) {
        return null;
    }

    // 初始化BFS队列，使用数组模拟队列
    const queue = [[startRow, startCol, []]];

    // 使用Set记录已访问的位置
    const visited = new Set([`${startRow},${startCol}`]);

    // BFS主循环
    while (queue.length > 0) {
        const [row, col, path] = queue.shift();

        // 如果到达终点，返回路径
        if (row === endRow && col === endCol) {
            return path;
        }

        // 尝试四个方向的移动
        for (const direction of ["up", "down", "left", "right"]) {
            // 检查移动是否有效
            if (isValidMove(maze, row, col, direction)) {
                const [dr, dc] = DIRECTIONS[direction];
                const newRow = row + dr;
                const newCol = col + dc;
                const posKey = `${newRow},${newCol}`;

                // 如果新位置未访问过，则加入队列
                if (!visited.has(posKey)) {
                    const newPath = [...path, direction];
                    queue.push([newRow, newCol, newPath]);
                    visited.add(posKey);
                }
            }
        }
    }

    return null;
}

/**
 * 模拟特定按键的键盘事件
 * @param {string} keyCode - 要模拟的按键方向（'left', 'up', 'right', 'down'）
 * @description 创建并派发模拟的键盘按下事件，用于控制游戏中的移动
 */
function simulateSpecialKey(keyCode) {
    const keyCodes = {
        left: { value: 37, key: "ArrowLeft" },
        up: { value: 38, key: "ArrowUp" },
        right: { value: 39, key: "ArrowRight" },
        down: { value: 40, key: "ArrowDown" },
    };

    const code = keyCodes[keyCode];
    if (!code) {
        return;
    }

    const keyDownEvent = new KeyboardEvent("keydown", {
        isTrusted: true,
        key: code.key,
        keyCode: code.value,
    });
    window.dispatchEvent(keyDownEvent);
}

(function () {
    "use strict";

    let path = null;

    const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
    const originalFetch = win.fetch;
    if (originalFetch && originalFetch.toString().indexOf("native code") > -1) {
        win.fetch = async function (...args) {
            const [resource] = args;
            const url = typeof resource === "string" ? resource : resource.href;

            path = null;
            const response = await originalFetch.apply(this, args);
            if (
                !url.startsWith("https://testnet.lenscan.io/api/trpc/faucet.getMaze")
            ) {
                return response;
            }

            const clonedResponse = response.clone();
            const text = await clonedResponse.text();
            const lines = text.split("\n").filter((line) => line.trim() !== "");
            const mazeInfo = JSON.parse(lines[lines.length - 1])["json"][2][0][0];

            path = findPath(
                mazeInfo.walls,
                [0, 0],
                [mazeInfo.goalPos.row, mazeInfo.goalPos.col]
            );

            return response;
        };
    }

    // 创建按钮元素
    const floatButton = document.createElement("div");
    floatButton.innerHTML = "自动寻路";

    // 设置按钮样式
    floatButton.style.cssText = `
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        background-color: #4CAF50;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

    // 添加点击事件
    floatButton.addEventListener("click", function () {
        if (path) {
            for (const key of path) {
                setTimeout(function () {
                    simulateSpecialKey(key);
                }, 0);
            }
        }
    });

    // 将按钮添加到页面
    document.body.appendChild(floatButton);
})();
