'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Logo from '../assets/logo.png'
import { useAuth } from './AuthProvider'
import { useTheme } from './ThemeProvider'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const {theme, toggle } = useTheme()

  const {user} = useAuth()

  const links = [
  { href: '/main', label: 'Loop' },
  ...(user ? [{ href: '/dashboard', label: 'Irányítópult' }] : []),
  { href: '/sellout', label: 'Ismerd meg a Loop-ot' },
]
  
  return (
    <nav className="bg-[#fafafa] border-b-2 border-[#6034e3] relative">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-16">

        {/* Logo balra */}
        <Link href="/">
          <Image src={Logo} alt="Loop logo" height={55} width={55} />
        </Link>

        {/* Linkek középen */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-semibold text-base text-[#6034e3] pb-0.5 transition-all duration-300
                border-b-2 ${pathname === link.href ? 'border-[#6034e3]' : 'border-transparent hover:border-[#6034e3]'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Login gomb jobbra */}
        <div className="hidden md:flex ml-auto">
          <button className='mx-3 bg-[#6034e3] rounded-xl p-2' onClick={toggle}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user ? 
          (
            <Link
            href="/login"
            className="border-2 border-[#6034e3] my-auto text-[#6034e3] px-4 py-1 rounded-lg
            hover:bg-[#6034e3] hover:text-white hover:rounded-[21px] transition-all duration-500"
            >
              Profil
            </Link>
          )
          :
          (
            <Link
            href="/login"
            className="border-2 border-[#6034e3] my-auto text-[#6034e3] px-4 py-1 rounded-lg
            hover:bg-[#6034e3] hover:text-white hover:rounded-[21px] transition-all duration-500"
            >
            Bejelentkezés
          </Link>
          )}
        </div>

        {/* Hamburger - mobil */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 ml-auto"
          onClick={() => setOpen(!open)}
        >
          <span className={`block w-6 h-0.5 bg-[#6034e3] transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-[#6034e3] transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-[#6034e3] transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

      </div>

      {/* Mobil menü */}
      {open && (
        <div className="md:hidden text-center flex flex-col px-4 pb-4 gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-semibold text-[#6034e3] pb-0.5 border-b-2 transition-all duration-300
                ${pathname === link.href ? 'border-[#6034e3]' : 'border-transparent hover:border-[#6034e3]'}`}
            >
              {link.label}
            </Link>
          ))}
          <button className='bg-[#6034e3] rounded-xl  mx-auto w-12 p-2' onClick={toggle}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user ? 
          (
            <Link
            href="/login"
            className="border-2 border-[#6034e3] my-auto text-[#6034e3] px-4 py-1 rounded-lg
            hover:bg-[#6034e3] hover:text-white hover:rounded-[21px] transition-all duration-500"
            >
              Profil
            </Link>
          )
          :
          (
            <Link
            href="/login"
            className="border-2 border-[#6034e3] my-auto text-[#6034e3] px-4 py-1 rounded-lg
            hover:bg-[#6034e3] hover:text-white hover:rounded-[21px] transition-all duration-500"
            >
            Bejelentkezés
          </Link>
          )}
        </div>
      )}
    </nav>
  )
}