import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import React from 'react'

interface GridProps {
  children: ReactNode
  minWidth?: string
}

export const AutoFillGrid: React.FC<GridProps> = ({ children, minWidth = '250px' }) => {
  return (
    <div
      className="grid-container"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))` }}
    >
      <AnimatePresence>
        {React.Children.map(children, (child, index) => (
          <motion.div key={index} className="grid-item">
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
