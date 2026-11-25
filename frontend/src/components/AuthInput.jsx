
const AuthInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = true,
  autoComplete,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm outline-none focus:border-gray-800 transition"
      />
    </div>
  )
}

export default AuthInput
