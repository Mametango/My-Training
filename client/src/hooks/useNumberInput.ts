import { useRef, useCallback } from 'react';

export const useNumberInput = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      const value = input.value;
      
      // 値がある場合は最後の位置にカーソルを移動
      if (value) {
        input.setSelectionRange(value.length, value.length);
      }
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const value = e.target.value;
    
    // 半角数字、小数点、マイナス記号のみを許可
    let filteredValue = value.replace(/[^0-9.-]/g, '');
    
    // 複数の小数点を防ぐ
    const parts = filteredValue.split('.');
    if (parts.length > 2) {
      filteredValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // マイナス記号は最初の文字のみ許可
    if (filteredValue.startsWith('-')) {
      filteredValue = '-' + filteredValue.substring(1).replace(/-/g, '');
    } else {
      filteredValue = filteredValue.replace(/-/g, '');
    }
    
    // フィルタリングされた値のみを渡す
    onChange(filteredValue);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // 許可するキー: 数字、小数点、マイナス、バックスペース、デリート、矢印キー、Tab、Enter
    const allowedKeys = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '.', '-', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Enter', 'Home', 'End'
    ];
    
    // Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X も許可
    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return;
    }
    
    // 許可されていないキーは無効化
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
    
    // マイナス記号は最初の文字のみ許可
    if (e.key === '-' && e.currentTarget.selectionStart !== 0) {
      e.preventDefault();
    }
    
    // 小数点は1つだけ許可
    if (e.key === '.' && e.currentTarget.value.includes('.')) {
      e.preventDefault();
    }
  }, []);

  return {
    inputRef,
    handleFocus,
    handleChange,
    handleKeyDown
  };
}; 