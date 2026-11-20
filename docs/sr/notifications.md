# Obaveštenja

Obaveštenje je kratka poruka koju aplikacija ostavi jednom korisniku: posao koji je završen, nešto što čeka da se pogleda. Svaki korisnik vidi samo svoja.

## Zvonce

Zvonce u zaglavlju nosi broj nepročitanih obaveštenja. Broj se čita kad uđete u aplikaciju, a posle toga server sam javlja svaku promenu: novo obaveštenje, ili obaveštenje označeno kao pročitano u bilo kom tabu, menja broj bez osvežavanja strane.

Klik na zvonce otvara nepročitana, najnovija prva, svako sa naslovom, vremenom kad je stiglo i prva dva reda poruke. Klik na jedno otvara celu poruku i označava je kao pročitanu; broj na zvoncu se smanji za jedan. *Sva obaveštenja* na dnu vode na stranu sa svim obaveštenjima, pročitanim i nepročitanim. Klik bilo gde van liste, ili Esc, zatvara je.

Na telefonu lista zauzima širinu ekrana ispod zaglavlja.

## Poruka

Dijalog prikazuje naslov, datum i celu poruku, red po red kako je napisana.

Obaveštenje može imati link. Tada pored *Zatvori* stoji *Idi na link*:

- link koji počinje sa `http://` ili `https://` je adresa van aplikacije, i ispisan je ispod poruke, da vidite kuda vodi pre nego što odete;
- svaki drugi link je strana same Formuvie — `job/list` otvara *Poslove* — i aplikacija prelazi na nju bez ponovnog učitavanja.

Bez linka dijalog ima samo *Zatvori*.

## Sva obaveštenja

*Obaveštenja* u meniju, ispod *Poslova*, prikazuju sva vaša obaveštenja, prvo nepročitana pa najnovija. To je tabela kao i svaka druga ([Rad sa tabelama](/sr/tables)): po stranama, sa sortiranjem, pretragom i izvozom u Excel.

| | |
|---|---|
| **Pročitano** | *Da* kad je poruka otvorena ili označena |
| **Datum** | kad je obaveštenje stiglo |
| **Naslov** | o čemu se radi |
| **Poruka** | sam tekst |
| **Link** | kuda vodi *Idi na link*, ako vodi |

👁 na redu otvara poruku, isto kao zvonce. Meni ⋯ označava obaveštenje kao pročitano ili nepročitano bez otvaranja — nepročitano se vraća pod zvonce, za ono što ne sme da se zaboravi.

Obaveštenja pravi aplikacija, pa strana nema *Dodaj* i ništa se sa nje ne briše.
