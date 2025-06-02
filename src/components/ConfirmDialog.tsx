import React from 'react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message, 
  confirmText = '确定',
  cancelText = '取消',
  type = 'info'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          iconBg: '#ffebee',
          iconColor: '#d32f2f',
          confirmBg: '#d32f2f'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: '#fff3e0',
          iconColor: '#f57c00',
          confirmBg: '#f57c00'
        };
      default:
        return {
          icon: '❓',
          iconBg: '#e3f2fd',
          iconColor: '#1976d2',
          confirmBg: '#1976d2'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        background: 'rgba(0,0,0,0.5)', 
        zIndex: 1000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div 
        style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: '32px',
          minWidth: 320,
          maxWidth: '90vw',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)', 
          textAlign: 'center'
        }}
      >
        <div style={{
          width: 48,
          height: 48,
          background: styles.iconBg,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <span style={{ fontSize: 20 }}>{styles.icon}</span>
        </div>
        
        {title && (
          <h3 style={{ 
            margin: '0 0 16px 0', 
            fontSize: 18, 
            fontWeight: 600, 
            color: '#333'
          }}>
            {title}
          </h3>
        )}
        
        <p style={{ 
          margin: '0 0 24px 0', 
          fontSize: 16, 
          color: '#666',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap'
        }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              background: '#f5f5f5',
              color: '#666',
              border: '1px solid #e0e0e0',
              borderRadius: 6,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              background: styles.confirmBg,
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
