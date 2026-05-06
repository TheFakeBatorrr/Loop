ide minden ötet szófosás gondolat

todo:

trigger backend-re hogy ha egy event státusz published és a dátum után vagyunk akkor magától legyen endedí azért csak ne keljen már manuálisan lezárni az eventeket.

célcsoportot valahogy meg kéne oldani, mert lehet minden diák, X. évfolyam, Technikum, X.X oszátly stb és ezt stringből csúnya jól leszűrni + hibálanul kell hozzá gépelni

Archivumhoz avg rating!

admin-nél is működjön a státusz ugratás

Gondolatok:
-Kurva jó lenne egy panel view az archivált eventekre, ahol látszik az adott event típus, téma, avg rating, kik voltak még staffok (ez egy baszó query lesz), bevétel/kiadás, stb ami fontos lehet  

-main oldalon kéne látnuk egy archívum-ot ahol pl kidobná a legutóbbi 10 eventet, hogy tudják értékelni is mivel nincs kiépítve a részvételi rész szóval nem tudjuk, hogy ki mit tud ratelni, össz visz a célcsoport alapján. Amit lehetne csinálni, hogy legutóbbi 5 event és külön a legutóbbi 10 ahol a felhasználó volt a célcsoport mert arra kicsi az esély, hogy nem látja a lényeget. 



Student:
- eventek amikre értékelést adott le.
-> célzott lekérés PIPA /api/ertekeles/myreviews
asszem ennyi


Idos:
Itt teljesen ki kell építeni a frontend panel kinézetét mert az sehogy nem áll.
amit látnia kéne:
- olyan eventek amire staff-ot gyűjtenek
- archivált eventek

Elnok:

Admin:
funkciók bekötése

Profil:
Student - semmi, mennyi értékelést addott le, milyen osztályos (ide csak a fetch-et kell bekötni meg a query kell)
Idos - az előbb felsoroltak meg egy lenyíló ablak, hogy milyen evenetken volt staff és milyen szerepben (lil achievement list)
Elnok - same as IDOs + egy kis korona, hogy most ő a jelenlegi elnök



