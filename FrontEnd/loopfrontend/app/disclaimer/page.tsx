'use client'

import {useState} from "react";

export default function DisclaimerPage() {
    return (
    <div className="w-full border-t border-[#6034e3] bg-white px-4 py-10 sm:px-6 lg:px-8">
        <DisclaimerContent />
    </div>
    );
}

function DisclaimerContent() {
    const [language, setLanguage] = useState<"hu" | "en">("hu");

    const content = {
        hu: {
        title: "Jogi nyilatkozat",
        text: `Ez a felület kizárólag iskolai projekt céljából készült, és nem minősül valódi, kereskedelmi forgalomba szánt terméknek vagy szolgáltatásnak. A rendszer jelenleg fejlesztési és demonstrációs állapotban van, nem használatra kész, és semmilyen valós üzleti tevékenységet nem szolgál.

A projektből jelenleg semmilyen bevételünk nem származik, és a tartalom kizárólag oktatási, bemutatási és vizsgaprojekt célokat szolgál. Az itt megjelenített funkciók, dizájnelemek és folyamatok nem tekinthetők végleges vagy hivatalos szolgáltatásnak.

A projekt célja kizárólag a fejlesztési készségek bemutatása és tanulmányi követelmények teljesítése.`
    },
    en: {
        title: "Disclaimer",
        text: `This interface has been created solely for educational and school project purposes and does not represent a real commercial product or service. The system is currently in a development and demonstration phase, is not ready for public use, and does not support any real business operations.

This project does not generate any revenue, and all content is intended only for educational, presentation, and examination purposes. Any displayed features, design elements, and workflows should not be considered final or officially available services.

The purpose of this project is solely to demonstrate development skills and fulfill academic requirements.`
    }
    };

    return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <h2 className="text-2xl font-bold text-[#6034e3] sm:text-3xl">
            {content[language].title}
        </h2>

        <div className="flex gap-3">
            <button
            onClick={() => setLanguage("hu")}
            className={`rounded-xl border px-5 py-2 text-sm font-semibold transition-all ${
                language === "hu"
                ? "border-[#6034e3] bg-[#6034e3] text-white"
                : "border-[#6034e3] bg-white text-[#6034e3]"
            }`}
            >
            Magyar
            </button>

            <button
                onClick={() => setLanguage("en")}
                className={`rounded-xl border px-5 py-2 text-sm font-semibold transition-all ${
                language === "en"
                ? "border-[#6034e3] bg-[#6034e3] text-white"
                : "border-[#6034e3] bg-white text-[#6034e3]"
                }`}
            >
            English
            </button>
        </div>
    </div>

        <div className="rounded-2xl border-2 border-[#6034e3] bg-white p-5 shadow-sm sm:p-8">
            <p className="whitespace-pre-line text-sm leading-7 text-black sm:text-base">
            {content[language].text}
            </p>
        </div>
    </div>
    );
}
