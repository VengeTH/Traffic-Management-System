import React from 'react';
import { InputProps } from '../../types';

interface ExtendedInputProps extends Omit<InputProps, 'onChange'> {
  name?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  ref?: React.RefCallback<HTMLInputElement>;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  pattern?: string;
  autoComplete?: string;
  onChange?: ((value: string) => void) | ((event: React.ChangeEvent<HTMLInputElement>) => void);
}

const Input: React.FC<ExtendedInputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  ref,
  error,
  required = false,
  disabled = false,
  className = '',
  name,
  min,
  max,
  step,
  pattern,
  autoComplete,
  ...rest
}) => {
  const inputClasses = `
    input
    ${error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : ''}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      // Check if onChange expects a string (controlled input) or event (react-hook-form)
      if (onChange.length === 1) {
        (onChange as (value: string) => void)(e.target.value);
      } else {
        (onChange as (event: React.ChangeEvent<HTMLInputElement>) => void)(e);
      }
    }
  };

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        ref={ref}
        required={required}
        disabled={disabled}
        name={name}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        autoComplete={autoComplete}
        {...rest}
      />
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
};

export default Input;

