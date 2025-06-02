// 归档功能前端集成测试
const testArchiveFrontend = () => {
  console.log('🧪 开始测试归档功能前端集成...');
  
  // 模拟点击归档功能卡片
  const archiveCard = document.querySelector('[onclick*="setPage(\'archive\')"]');
  if (archiveCard) {
    console.log('✅ 找到归档功能卡片');
    archiveCard.click();
  } else {
    console.log('❌ 未找到归档功能卡片');
  }
  
  // 检查是否显示归档管理组件
  setTimeout(() => {
    const archiveComponent = document.querySelector('div:contains("归档管理")');
    if (archiveComponent) {
      console.log('✅ 归档管理组件正常显示');
    } else {
      console.log('❌ 归档管理组件未显示');
    }
  }, 1000);
};

// 等待页面加载完成后执行测试
window.addEventListener('load', () => {
  setTimeout(testArchiveFrontend, 2000);
});
