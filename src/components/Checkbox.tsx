import {Check} from 'lucide-react'

interface CheckboxProps {
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
}

export default function Checkbox({checked, onChange, disabled = false}: CheckboxProps) {
    return (
        <label className="relative inline-flex cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="sr-only"
            />
            <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                checked
                    ? 'bg-violet-300 border-violet-300'
                    : 'border-zinc-600 bg-zinc-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {checked && (
                    <Check className="w-4 h-4 text-zinc-900" strokeWidth={3}/>
                )}
            </div>
        </label>
    )
}
