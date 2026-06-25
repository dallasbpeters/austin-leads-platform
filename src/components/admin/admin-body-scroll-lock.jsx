'use client'

import { useEffect } from 'react'

export default function AdminBodyScrollLock() {
  useEffect(() => {
    document.body.classList.add('admin-body-locked')
    document.documentElement.classList.add('admin-html-locked')

    return () => {
      document.body.classList.remove('admin-body-locked')
      document.documentElement.classList.remove('admin-html-locked')
    }
  }, [])

  return null
}
