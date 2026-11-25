import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const PasswordInput = ({
  value,
  onChange,
  label = 'Password',
  name = 'password',
  placeholder = 'Enter your password',
  autoComplete = 'current-password',
  minLength,
}) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-3 pr-11 text-sm outline-none focus:border-gray-800 transition"
          placeholder={placeholder}
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

export default PasswordInput