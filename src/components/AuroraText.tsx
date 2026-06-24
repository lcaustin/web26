'use client'

import React, { memo } from 'react'

interface AuroraTextProps {
  children: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
}

// Sera UI "Aurora Text" effect — https://seraui.com/docs/aurora
export const AuroraText = memo(
  ({
    children,
    className = '',
    colors = ['#5C1E2E', '#D4A93C', '#8C2F45', '#D4A93C'],
    speed = 1,
  }: AuroraTextProps) => {
    const gradientStyle: React.CSSProperties = {
      backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      animationDuration: `${10 / speed}s`,
    }

    return (
      <span className={`relative inline-block ${className}`}>
        <span
          className="relative animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent"
          style={gradientStyle}
        >
          {children}
        </span>
      </span>
    )
  },
)

AuroraText.displayName = 'AuroraText'

export default AuroraText
