import Link from 'next/link'
import React from 'react'
import Logo from './shared/logo'

const ToolsNavBar = () => {
  return (
       <nav className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
          <Logo/>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/tools" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Free Tools
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-bold bg-primary text-primary-foreground px-4 py-1.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Try Free
            </Link>
          </div>
        </div>
      </nav>
  )
}

export default ToolsNavBar