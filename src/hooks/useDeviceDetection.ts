import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  platform: string;
  userAgent: string;
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    platform: navigator.platform,
    userAgent: navigator.userAgent
  });

  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // 移动设备检测规则
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const tabletRegex = /ipad|android(?!.*mobi)|tablet/i;
    
    // 基于用户代理字符串的检测
    const isMobileByUA = mobileRegex.test(userAgent) && !tabletRegex.test(userAgent);
    const isTabletByUA = tabletRegex.test(userAgent);
    
    // 基于屏幕尺寸的检测（作为备用方案）
    const isMobileBySize = screenWidth <= 768;
    const isTabletBySize = screenWidth > 768 && screenWidth <= 1024;
    
    // 综合判断
    const isMobile = isMobileByUA || (!isTabletByUA && isMobileBySize);
    const isTablet = isTabletByUA || (!isMobileByUA && isTabletBySize);
    const isDesktop = !isMobile && !isTablet;
    
    const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
    
    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop,
      screenWidth,
      screenHeight,
      orientation,
      platform: navigator.platform,
      userAgent: navigator.userAgent
    });
  };

  useEffect(() => {
    // 初始检测
    detectDevice();
    
    // 监听窗口大小变化
    const handleResize = () => {
      detectDevice();
    };
    
    // 监听设备方向变化
    const handleOrientationChange = () => {
      // 延迟检测，等待屏幕旋转完成
      setTimeout(detectDevice, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
};

export default useDeviceDetection;
