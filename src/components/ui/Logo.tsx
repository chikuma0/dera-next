import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  variant?: 'default' | 'small'
  className?: string
}

export function Logo({ variant = 'default', className = '' }: LogoProps) {
  return (
    <Link href="/" className={`block ${className}`}>
      <Image
        src={variant === 'default' ? '/images/dera-logo.png' : '/images/d-logo.png'}
        alt="Dera Logo"
        width={variant === 'default' ? 150 : 40}
        height={variant === 'default' ? 50 : 40}
        priority
      />
    </Link>
  )
}