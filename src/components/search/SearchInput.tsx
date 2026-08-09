import { memo, useCallback, useRef } from 'react';

export interface ISearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = memo(function SearchInput({
  value,
  onChange,
  placeholder = '搜索奶茶或品牌...',
}: ISearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className="search-input">
      {/* 搜索图标 */}
      <svg
        className="search-input__icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>

      <input
        ref={inputRef}
        className="search-input__field"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="搜索"
      />

      {/* 清除按钮 */}
      {value && (
        <button
          className="search-input__clear"
          onClick={handleClear}
          aria-label="清除搜索"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
});
