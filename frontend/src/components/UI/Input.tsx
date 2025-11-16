import React, { forwardRef, ChangeEvent } from "react"
import { InputProps as BaseInputProps } from "../../types"

type Props = BaseInputProps & {
  name?: string
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  min?: string | number
  max?: string | number
  step?: string | number
  pattern?: string
  autoComplete?: string
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  {
    label,
    placeholder,
    type = "text",
    value,
    onChange,
    onBlur,
    error,
    required = false,
    disabled = false,
    className = "",
    name,
    min,
    max,
    step,
    pattern,
    autoComplete,
    startIcon,
    endAdornment,
    ...rest
  },
  ref
) {
  const classes = [
    "input",
    "px-4",
    "py-3",
    startIcon ? "pl-12" : "",
    endAdornment ? "pr-12" : "",
    error
      ? "border-danger-300 focus:border-danger-500 focus:ring-danger-500"
      : "",
    disabled ? "bg-gray-100 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return

    const hasName = typeof name === "string" && name.length > 0
    if (hasName) {
      ;(onChange as (event: ChangeEvent<HTMLInputElement>) => void)(e)
    } else {
      ;(onChange as (value: string) => void)(e.target.value)
    }
  }

  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    type,
    className: classes,
    placeholder,
    onChange: handleChange,
    onBlur,
    required,
    disabled,
    name,
    min,
    max,
    step,
    pattern,
    autoComplete,
    // Disable browser's default password reveal button when we have custom endAdornment
    ...(type === "password" && endAdornment
      ? {
          style: {
            paddingRight: "3rem",
            ...((rest as any).style || {}),
          },
          // Disable autocomplete suggestions that might show password reveal
          autoComplete: autoComplete || "off",
        }
      : {}),
    ...rest,
  }

  if (value !== undefined) {
    inputProps.value = value
  }

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {startIcon && (
          <span
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4"
            style={{ color: "#6B7280", zIndex: 10 }}
          >
            {startIcon}
          </span>
        )}
        <input ref={ref} {...inputProps} />
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {endAdornment}
          </div>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
})

export default Input
