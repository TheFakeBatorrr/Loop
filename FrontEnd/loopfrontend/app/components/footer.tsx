import { create } from "domain"
import Logo from '../assets/logo.png'
import Image from "next/image"
import { FaInstagram, FaFacebook, FaXTwitter } from 'react-icons/fa6'

export default function footer(){

    return(

        <footer className=" w-full bg-[#6034e3] text-center py-4">
            <div className="max-w-7xl mx-auto ">
                <div className="grid grid-cols-3 md:grid-cols-3 gap-4 flex items-center">

                    <div>
                        <Image className="h-20 w-auto m-auto" src={Logo} alt="" />
                        <p>Loop© 2026 minden jog fenntartva</p>
                        
                    </div>
                    <div>
                        <p>Kövesd a Loop-ot</p>
                        <div className="flex gap-4 justify-center">
                            <a href="#"><FaInstagram size={24} /></a>
                            <a href="#"><FaFacebook size={24} /></a>
                            <a href="#"><FaXTwitter size={24} /></a>
                        </div>
                    </div>
                    <div>
                        <p>Szeretné, hogy a Loop iskolájában is segítse a diákok életét?</p>
                        <a className="text-white underline hover:text-[#8643eb] transition-colors duration-300"  href="mailto:info@loop.hu">Vegye fel velünk a kapcsolatot!</a>
                        <br />
                        <a className="text-white underline hover:text-[#8643eb] transition-colors duration-300" href="">Ismerje meg a Loop-ot</a>
                    </div>

                </div>
            </div>
        </footer>

    )
}
