'use client'

import { useState } from "react"

type View = 'compact' | 'reviews' | 'staff' | 'join'


export default function Dashboard(){

    const [ view , setView] = useState<View>('compact')


    return(
        <div>

            {view === 'compact' && (
                <div className="">

                    <div>
                        <h1>Értékelések</h1>

                        leadott értékelések:
                        mennyiség:

                        legutóbbi 3 értékelések

                        <button className={`bg-white text-[#6034e3] font-bold py-3 rounded-xl transition-all duration-500`}
                        onClick={() => setView('reviews')}
                        >További Értékelések
                        </button>
                    </div>

                    <div> {/* Ha nem IDÖs | ha igen itt annak is egy kompakt listája kell */}
                        <h1>Diákönkormányzat</h1>
                        <p>Érdekel hogyan lehet egy eseményt lebonyolítani?</p>
                        <p>Tudsz csapatban dolgozni?</p>
                        <p>Újraélnéd a gólyatábort szervezőként?</p>
                        <button
                        onClick={() => setView('join')}
                        >
                        Itt a helyed!
                        </button>
                    </div>

                </div>
            )}

        </div>    
    )
}