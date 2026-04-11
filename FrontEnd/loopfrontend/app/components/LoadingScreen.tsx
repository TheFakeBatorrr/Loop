'use client'

import Image from 'next/image'
import Logo from '../assets/logo.png'

export default function LoadingScreen() {
  return (
    <div className="z-[100] flex items-center justify-center">
      <Image
        src={Logo}
        alt="Loop"
        width={100}
        height={100}
        className="animate-[spin_0.6s_linear_2]"
        priority
      />
    </div>
  )
}