// 归档功能调试脚本
// 在浏览器控制台中运行此脚本来调试归档功能

console.log('=== 归档功能调试开始 ===');

// 测试1: 检查React应用是否已加载
function testReactApp() {
    console.log('1. 检查React应用...');
    const reactRoot = document.querySelector('#root');
    if (reactRoot) {
        console.log('✓ React根元素存在');
        console.log('根元素内容:', reactRoot.innerHTML.substring(0, 200) + '...');
    } else {
        console.log('✗ React根元素不存在');
    }
}

// 测试2: 查找归档功能卡片
function testArchiveCard() {
    console.log('2. 查找归档功能卡片...');
    const cards = document.querySelectorAll('div[style*="cursor: pointer"]');
    console.log(`找到 ${cards.length} 个可点击卡片`);
    
    cards.forEach((card, index) => {
        const text = card.textContent;
        console.log(`卡片 ${index + 1}: ${text.substring(0, 50)}...`);
        if (text.includes('归档功能')) {
            console.log(`✓ 找到归档功能卡片 (索引: ${index})`);
            return card;
        }
    });
    
    return null;
}

// 测试3: 模拟点击归档功能
function testArchiveClick() {
    console.log('3. 测试归档功能点击...');
    const cards = document.querySelectorAll('div[style*="cursor: pointer"]');
    
    for (let card of cards) {
        if (card.textContent.includes('归档功能')) {
            console.log('找到归档功能卡片，尝试点击...');
            card.click();
            console.log('点击事件已触发');
            
            // 等待一下检查页面状态
            setTimeout(() => {
                const currentContent = document.querySelector('#root').textContent;
                if (currentContent.includes('归档功能') && currentContent.includes('返回主页')) {
                    console.log('✓ 归档页面加载成功');
                } else {
                    console.log('✗ 归档页面可能未正确加载');
                    console.log('当前页面内容:', currentContent.substring(0, 200));
                }
            }, 500);
            return;
        }
    }
    console.log('✗ 未找到归档功能卡片');
}

// 测试4: 检查网络连接
async function testNetworkConnection() {
    console.log('4. 测试网络连接...');
    try {
        const response = await fetch('http://localhost:3000/api/admin/archive/stats');
        if (response.ok) {
            const data = await response.json();
            console.log('✓ 后端归档API连接正常');
            console.log('归档统计:', data);
        } else {
            console.log('✗ 后端归档API响应异常:', response.status);
        }
    } catch (error) {
        console.log('✗ 后端连接失败:', error.message);
    }
}

// 运行所有测试
async function runAllTests() {
    console.log('开始运行所有测试...');
    testReactApp();
    testArchiveCard();
    testArchiveClick();
    await testNetworkConnection();
    console.log('=== 调试完成 ===');
}

// 立即运行测试
runAllTests();

// 导出函数供手动调用
window.archiveDebug = {
    testReactApp,
    testArchiveCard,
    testArchiveClick,
    testNetworkConnection,
    runAllTests
};

console.log('调试函数已加载到 window.archiveDebug');
console.log('可以手动调用: archiveDebug.testArchiveClick()');
