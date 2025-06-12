import type React from "react"

interface GlobalInputProps {
	label?: string
	placeholder?: string
	type?: string
	required?: boolean
	value?: string
	defaultValue?: string
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
	className?: string
	disabled?: boolean
	id?: string
	name?: string
	error?: string
	helperText?: string
	autoComplete?: string
	"aria-label"?: string
	"aria-describedby"?: string
}

const GlobalInput: React.FC<GlobalInputProps> = ({
	label,
	placeholder,
	type = "text",
	required = false,
	value,
	defaultValue,
	onChange,
	className = "",
	disabled = false,
	id,
	name,
	error,
	helperText,
	autoComplete,
	"aria-label": ariaLabel,
	"aria-describedby": ariaDescribedBy,
	...props
}) => {
	const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`
	const errorId = `${inputId}-error`
	const helperTextId = `${inputId}-helper`
	const hasError = Boolean(error)

	// Build aria-describedby string
	const describedBy =
		[ariaDescribedBy, hasError ? errorId : undefined, helperText && !hasError ? helperTextId : undefined]
			.filter(Boolean)
			.join(" ") || undefined

	return (
		<div className={`flex flex-col space-y-1 ${className}`}>
			{label && (
				<label htmlFor={inputId} className="font-medium text-gray-700 text-sm">
					{label}
					{required && (
						<span className="ml-1 text-red-500" aria-label="required">
							*
						</span>
					)}
				</label>
			)}

			<input
				id={inputId}
				name={name}
				type={type}
				placeholder={placeholder}
				value={value}
				defaultValue={defaultValue}
				onChange={onChange}
				disabled={disabled}
				required={required}
				autoComplete={autoComplete}
				aria-label={ariaLabel}
				aria-describedby={describedBy}
				className={`rounded-md border px-3 py-2 text-sm transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${
					hasError
						? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
						: "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
				}
        `
					.trim()
					.replace(/\s+/g, " ")}
				{...props}
			/>

			{/* Error Message */}
			{hasError && (
				<p id={errorId} className="flex items-center text-red-600 text-sm" role="alert" aria-live="polite">
					<svg className="mr-1 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
						<path
							fillRule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
							clipRule="evenodd"
						/>
					</svg>
					{error}
				</p>
			)}

			{/* Helper Text (only show if no error) */}
			{helperText && !hasError && (
				<p id={helperTextId} className="text-gray-500 text-sm">
					{helperText}
				</p>
			)}
		</div>
	)
}

export default GlobalInput
