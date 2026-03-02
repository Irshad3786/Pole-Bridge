'use client'
import React, { useState, useEffect } from 'react'
import Logo from './Logo'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#060014]/80 backdrop-blur-xl border-b border-purple-500/10 shadow-lg shadow-purple-900/20 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className='max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6'>
        <div className='flex items-center gap-2 md:gap-3'>
          <Logo />
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className='hidden sm:inline-flex items-center gap-1 bg-purple-500/10 px-3 py-1 rounded-full text-sm font-semibold text-purple-300 border border-purple-500/20 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="currentColor" d="m9.96 9.137l.886-3.099c.332-1.16 1.976-1.16 2.308 0l.885 3.099a1.2 1.2 0 0 0 .824.824l3.099.885c1.16.332 1.16 1.976 0 2.308l-3.099.885a1.2 1.2 0 0 0-.824.824l-.885 3.099c-.332 1.16-1.976 1.16-2.308 0l-.885-3.099a1.2 1.2 0 0 0-.824-.824l-3.099-.885c-1.16-.332-1.16-1.976 0-2.308l3.099-.885a1.2 1.2 0 0 0 .824-.824m8.143 7.37c.289-.843 1.504-.844 1.792 0l.026.087l.296 1.188l1.188.297c.96.24.96 1.602 0 1.842l-1.188.297l-.296 1.188c-.24.959-1.603.959-1.843 0l-.297-1.188l-1.188-.297c-.96-.24-.96-1.603 0-1.842l1.188-.297l.297-1.188zm.896 2.29a1 1 0 0 1-.203.203a1 1 0 0 1 .203.203a1 1 0 0 1 .203-.203a1 1 0 0 1-.203-.204M4.104 2.506c.298-.871 1.585-.842 1.818.087l.296 1.188l1.188.297c.96.24.96 1.602 0 1.842l-1.188.297l-.296 1.188c-.24.959-1.603.959-1.843 0l-.297-1.188l-1.188-.297c-.96-.24-.96-1.603 0-1.842l1.188-.297l.297-1.188zM5 4.797a1 1 0 0 1-.203.202A1 1 0 0 1 5 5.203a1 1 0 0 1 .203-.204A1 1 0 0 1 5 4.796"/>
            </svg>
            AI
          </motion.span>
        </div>

        <div className='hidden md:flex items-center gap-8'>
          <a href='#home' className='text-slate-300 hover:text-white font-medium transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'>Home</a>
          <a href='#about' className='text-slate-300 hover:text-white font-medium transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'>About</a>
          <a href='#contact' className='text-slate-300 hover:text-white font-medium transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'>Contact</a>
        </div>

        <div className='hidden md:flex items-center gap-4'>
          <Link href={"/login"}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.6)] transition-all'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
              <path fill="#fff" fillRule="evenodd" d="m6.547 10.263l-2.81-2.81c.309-.517.617-1.052.922-1.584c1.016-1.766 2.008-3.49 2.938-4.387c2.524-2.524 5.981-1.06 5.981-1.06s1.464 3.457-1.06 5.981c-.89.922-2.587 1.9-4.34 2.908c-.546.315-1.097.632-1.631.952m2.14-6.532a1.582 1.582 0 1 1 3.164 0a1.582 1.582 0 0 1-3.163 0m-4.09-.232C3.18 3.122 1.849 3.82.668 4.903a.48.48 0 0 0 .089.765l1.905 1.148l.002-.004c.275-.46.582-.993.894-1.533c.355-.617.716-1.243 1.04-1.78m2.587 7.84l1.148 1.905a.48.48 0 0 0 .765.088c1.083-1.18 1.782-2.512 1.404-3.93c-.522.314-1.07.63-1.613.943l-.083.048c-.548.316-1.091.628-1.616.943zM2.622 9.343a2 2 0 0 1 1.402 3.46c-.222.212-.569.379-.89.506a11 11 0 0 1-1.1.358c-.367.1-.717.18-.982.233a6 6 0 0 1-.336.059q-.066.009-.133.013a.5.5 0 0 1-.198-.022a.5.5 0 0 1-.241-.156a.5.5 0 0 1-.11-.22a.6.6 0 0 1-.012-.176c.003-.04.009-.086.015-.128c.013-.088.033-.203.06-.334c.053-.264.135-.612.235-.977c.1-.364.222-.754.359-1.095c.128-.321.294-.667.506-.888a2 2 0 0 1 1.425-.633" clipRule="evenodd"/>
            </svg>
            Let's Start
          </motion.button>
          </Link>
        </div>

        <button title='openandclose' onClick={() => setIsOpen(!isOpen)} className='md:hidden p-2 text-slate-300 hover:text-white rounded-lg transition-colors'>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden bg-[#0a0515]/95 backdrop-blur-xl border-t border-purple-500/10 overflow-hidden'
          >
            <div className='flex flex-col gap-4 px-4 py-6'>
              <a href='#home' onClick={() => setIsOpen(false)} className='text-slate-300 hover:text-purple-400 font-medium transition py-2 text-lg'>Home</a>
              <a href='#about' onClick={() => setIsOpen(false)} className='text-slate-300 hover:text-purple-400 font-medium transition py-2 text-lg'>About</a>
              <a href='#contact' onClick={() => setIsOpen(false)} className='text-slate-300 hover:text-purple-400 font-medium transition py-2 text-lg'>Contact</a>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <button className='flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] transition duration-300 w-full'>
                  Let's Start
                </button>
              </Link>
              <div className="flex justify-center mt-2">
                <span className='inline-flex items-center gap-1 bg-purple-500/10 px-4 py-2 rounded-full text-sm font-semibold text-purple-300 border border-purple-500/20'>
                  AI Powered
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Nav
