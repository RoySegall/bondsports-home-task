import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { classNames } from '../../lib/classNames'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  children: ReactNode
}

// Shared button primitive.
export function Button({ variant = 'primary', className, children, ...rest }: ButtonProps) {
  return (
    <button className={classNames(styles.button, styles[variant], className)} {...rest}>
      {children}
    </button>
  )
}
