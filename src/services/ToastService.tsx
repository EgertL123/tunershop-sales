import toast from 'react-hot-toast'
import {CircleCheck, CircleX} from 'lucide-react'

export const showSuccess = (message: string) => {
    toast.success(message, {
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#009966',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        icon: <CircleCheck className="w-6 h-6" />,
    })
}

export const showError = (message: string) => {
    toast.error(message, {
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#ff6467',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        icon: <CircleX className="w-6 h-6" />,
    })
}