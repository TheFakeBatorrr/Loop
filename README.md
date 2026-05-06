# Boundless 🎓

> A diákönkormányzat (IDÖ) kezelőrendszere — eseményektől az értékelésekig.

Boundless egy modern, webalapú platform amely segíti az iskolai diákönkormányzatok mindennapi működését. Eseményeket lehet létrehozni, staff-ot toborozni, adminisztrálni és értékelni — mindezt egy helyen.

---

## Technológiák

**Frontend**
- [Next.js 14](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- `react-icons`

**Backend**
- [Laravel 11](https://laravel.com/)
- Laravel Sanctum (token alapú auth)
- MySQL

---

## Funkciók

### Szerepkörök
| Szerepkör | Leírás |
|-----------|--------|
| `Diák` | Eseményeket böngész, értékel, IDÖ-be jelentkezhet |
| `IDÖ-s` | Staff gyűjtés alatt lévő eseményekre jelentkezhet, szervezőként vesz részt |
| `Elnök` | Eseményeket hoz létre és kezel, staff-ot fogad el, csatlakozási kérelmeket bírál el |
| `Admin` | Teljes rendszerfelügyelet — esemény jóváhagyás, elnök átadás, évfolyam bump |

### Esemény lifecycle
```
draft → staff_gathering → pending_review → published → ended
         (csak IDÖ+Iskolai típusnál)
```
- `external` típusú esemény: `draft → published` (admin direkt jóváhagyja)
- `ido_only` típusú esemény: `draft → published` (elnök direkt publikálja)

### Főbb modulok
- 🔐 **Auth** — regisztráció, bejelentkezés, email verifikáció, jelszó visszaállítás
- 📅 **Eseménykezelés** — létrehozás, staff toborzás, jóváhagyási folyamat
- 👥 **Staff rendszer** — szervező és főszervező szerepkörök, elfogadás/elutasítás
- ⭐ **Értékelés** — lezárt eseményekre csillagos + szöveges értékelés
- 📁 **Archívum** — lezárt események pénzügyi adatokkal (bevétel/kiadás)
- 👑 **Elnök átadás** — admin tud IDÖ tagot elnökké kinevezni
- 🎓 **Évfolyam bump** — tanév végi +1 év minden diáknak

---

## Projekt struktúra

```
Boundless/
├── FrontEnd/
│   └── loopfrontend/
│       ├── app/
│       │   ├── admin/          # Admin panel
│       │   ├── dashboard/      # Irányítópult (diák / IDÖ-s / elnök nézet)
│       │   ├── main/           # Főoldal (carousel, szűrő, értékelés, archívum)
│       │   ├── login/          # Bejelentkezés + regisztráció
│       │   ├── forgot-password/
│       │   └── reset-password/
│       └── components/
│           ├── AuthProvider.tsx
│           ├── ThemeProvider.tsx
│           ├── navbar.tsx
│           └── footer.tsx
└── BackEnd/
    └── (Laravel projekt)
```

---

## Készítette

Szakmai vizsgaprojekt — 2025/2026-os tanév

| | |
|---|---|
| **Frontend** | *TheFakeBatorrr* |
| **Backend** | *GerhatNorbert* |

---

> *"Boundless — ahol a diákok hangja számít."*
