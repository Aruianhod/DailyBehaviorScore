// 简单的前端功能测试脚本
// 在浏览器控制台中运行此脚本

// 测试归档功能可访问性
function testArchiveAccess() {
  console.log('🔍 开始测试归档功能访问...');
  
  // 1. 检查React应用是否正常加载
  const reactRoot = document.getElementById('root');
  if (!reactRoot) {
    console.error('❌ React应用根元素未找到');
    return false;
  }
  console.log('✅ React应用根元素已找到');
  
  // 2. 查找归档功能卡片
  const allDivs = document.querySelectorAll('div');
  let archiveCard = null;
  
  for (let div of allDivs) {
    const text = div.textContent || '';
    if (text.includes('归档功能') && div.style.cursor === 'pointer') {
      archiveCard = div;
      break;
    }
  }
  
  if (!archiveCard) {
    console.error('❌ 归档功能卡片未找到');
    console.log('💡 提示：请确保已登录管理员账号');
    return false;
  }
  console.log('✅ 归档功能卡片已找到');
  
  // 3. 模拟点击归档功能卡片
  try {
    archiveCard.click();
    console.log('✅ 归档功能卡片点击成功');
    
    // 等待一秒后检查是否进入归档页面
    setTimeout(() => {
      const backButton = document.querySelector('button');
      if (backButton && backButton.textContent.includes('返回主页')) {
        console.log('✅ 成功进入归档页面');
        
        // 检查归档管理组件是否渲染
        const pageContent = document.body.textContent;
        if (pageContent.includes('归档管理') || pageContent.includes('归档统计')) {
          console.log('✅ 归档管理组件正常渲染');
        } else {
          console.error('❌ 归档管理组件未正常渲染');
        }
      } else {
        console.error('❌ 未能成功进入归档页面');
      }
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('❌ 点击归档功能时发生错误:', error);
    return false;
  }
}

// 自动运行测试
console.log('📋 前端归档功能测试脚本已加载');
console.log('🚀 使用 testArchiveAccess() 来运行测试');

// 如果在管理员页面，自动运行测试
if (window.location.pathname === '/' || window.location.href.includes('localhost:3000')) {
  setTimeout(() => {
    if (document.body.textContent.includes('管理员功能')) {
      console.log('🎯 检测到管理员页面，自动运行测试...');
      testArchiveAccess();
    }
  }, 2000);
}
