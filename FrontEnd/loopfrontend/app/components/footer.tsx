import Logo from '../assets/logo.png'
import Image from "next/image"
import Link from 'next/link'
import { FaInstagram, FaFacebook, FaXTwitter } from 'react-icons/fa6'

export default function footer(){

    return(

        <footer style={{borderTop:'1px white solid'}} className=" w-full bg-[#6034e3] text-center py-4">
            <div className="max-w-7xl mx-auto ">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex text-white items-center">

                    <div className='mb-3'>
                        <Image className="h-20 w-auto m-auto" src={Logo} alt="" />
                        <p>Loop© 2026 minden jog fenntartva</p>
                        
                    </div>
                    <div className='mb-3'> 
                        <p className="my-3">Kövesd a Loop-ot!</p>
                        <div className="flex gap-4 justify-center">
                            <a className="hover:scale-145 transition-transform duration-300" href="#"><FaInstagram size={24} /></a>
                            <a className="hover:scale-145 transition-transform duration-300" href="#"><FaFacebook size={24} /></a>
                            <a className="hover:scale-145 transition-transform duration-300" href="#"><FaXTwitter size={24} /></a>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <p className='mt-3'>Szeretné, hogy a Loop iskolájában is segítse a diákok életét?</p>
                        <a className="text-white underline hover:text-[#FFD700] transition-colors duration-300"  href="mailto:info@loop.hu">Vegye fel velünk a kapcsolatot!</a>
                        <br />
                        <Link className="text-white underline hover:text-[#FFD700] transition-colors duration-300" href="/sellout">Ismerje meg a Loop-ot</Link>
                    </div>

                </div>
            </div>
        </footer>

    )
}
