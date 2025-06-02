import React, { useState } from 'react';
import Modal from './Modal';

interface InputDialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (delta: number, reason: string) => void;
  deltaLabel?: string;
  reasonLabel?: string;
  deltaPlaceholder?: string;
  reasonPlaceholder?: string;
}

const InputDialog: React.FC<InputDialogProps> = ({
  isOpen,
  title,
  onClose,
  onConfirm,
  deltaLabel = '分值变动',
  reasonLabel = '原因',
  deltaPlaceholder = '请输入分值变动（正负均可）',
  reasonPlaceholder = '请输入原因'
}) => {
  const [delta, setDelta] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleConfirm = () => {
    setError('');
    
    const deltaValue = Number(delta);
    if (isNaN(deltaValue)) {
      setError('请输入有效的数字');
      return;
    }
    
    if (!reason.trim()) {
      setError('请输入原因');
      return;
    }
    
    onConfirm(deltaValue, reason.trim());
    handleClose();
  };

  const handleClose = () => {
    setDelta('');
    setReason('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        padding: '32px', 
        minWidth: 400,
        maxWidth: 500
      }}>
        <h3 style={{ 
          margin: '0 0 24px 0', 
          fontSize: 20, 
          fontWeight: 600, 
          color: '#1976d2',
          textAlign: 'center'
        }}>
          {title}
        </h3>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontSize: 14, 
            fontWeight: 500, 
            color: '#333' 
          }}>
            {deltaLabel}
          </label>
          <input
            type="number"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder={deltaPlaceholder}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: 8,
              fontSize: 16,
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1976d2'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>
        
        <div style={{ marginBottom: 24 }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontSize: 14, 
            fontWeight: 500, 
            color: '#333' 
          }}>
            {reasonLabel}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: 8,
              fontSize: 16,
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
              outline: 'none',
              resize: 'vertical',
              minHeight: '80px'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1976d2'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>
        
        {error && (
          <div style={{
            background: '#ffebee',
            border: '1px solid #ffcdd2',
            borderRadius: 6,
            padding: '12px 16px',
            marginBottom: 20,
            color: '#c62828',
            fontSize: 14
          }}>
            {error}
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: '12px 24px',
              border: '2px solid #e0e0e0',
              borderRadius: 8,
              background: '#fff',
              color: '#666',
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#bdbdbd';
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.color = '#666';
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '12px 24px',
              border: '2px solid #1976d2',
              borderRadius: 8,
              background: '#1976d2',
              color: '#fff',
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1565c0';
              e.currentTarget.style.borderColor = '#1565c0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1976d2';
              e.currentTarget.style.borderColor = '#1976d2';
            }}
          >
            确认
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InputDialog;
