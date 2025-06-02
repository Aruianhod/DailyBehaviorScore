import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

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
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        style={{ 
          background: '#fff', 
          borderRadius: 12, 
          padding: showCloseButton ? '24px' : '32px',
          minWidth: 300,
          maxWidth: '90vw',
          maxHeight: '90vh',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)', 
          position: 'relative',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button 
            style={{ 
              position: 'absolute', 
              right: 16, 
              top: 16, 
              fontSize: 20, 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer',
              color: '#666',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            onClick={onClose}
          >
            ×
          </button>
        )}
        
        {title && (
          <h3 style={{ 
            margin: '0 0 20px 0', 
            fontSize: 18, 
            fontWeight: 600, 
            color: '#333',
            paddingRight: showCloseButton ? '40px' : '0'
          }}>
            {title}
          </h3>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default Modal;
