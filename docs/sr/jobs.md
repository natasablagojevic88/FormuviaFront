# Poslovi

**Poslovi** su jedno mesto na kom stoji sve što Formuvia pokreće sama. Dolazi se iz menija, preko *Poslovi*, i za to nije potrebna posebna uloga: svaki korisnik dobija poslove vezane za ulogu koju ima, a posao bez uloge vidi samo administrator.

Sam posao se unosi uz izveštaj kom pripada — u *Administraciji / Izveštaji*, u meniju reda izveštaja, pod *Poslovi* ([Izveštaji](/sr/reports#poslovi-izvestaj-koji-ide-sam) opisuju šta forma traži). Ova strana je druga strana toga: šta je raspored napravio od tih poslova i kako su prolazili.

## Šta spisak pokazuje

Jedan red je jedan posao iz rasporeda, sa svim što je o njemu pročitano u trenutku otvaranja strane:

| | |
|---|---|
| **Naziv** | naziv pod kojim posao stoji u rasporedu |
| **Uključen** | *Da* dok posao ima svoje mesto u rasporedu; *Ne* za posao koji je isključen |
| **Poslednje pokretanje** | kada je raspored poslednji put preuzeo posao |
| **Sledeće pokretanje** | kada ga preuzima ponovo, po rasporedu tog posla |
| **Ishod** | kako se poslednje pokretanje završilo: *Prošao*, *Nije prošao* ili *U toku* dok još radi |
| **Završeno** | kada je to poslednje pokretanje bilo gotovo |

Posao koji se još nikad nije pokretao to i piše umesto ishoda. Isključen posao zadržava poslednje pokretanje i ishod — samo sledeće pokretanje nema šta da pokaže, jer ga nema.

Ceo spisak dolazi odjednom, bez strana: poslovi jedne aplikacije se broje u desetinama, ne u hiljadama. *Osveži* u zaglavlju čita sve ponovo, i to je način da se vidi kako se završio posao koji je upravo radio.

## Pronalaženje posla

Polje iznad spiska traži po **nazivu**, i traži dok se piše. Gleda u spisak koji je već na ekranu, pa se serveru ništa ne šalje, a iks vraća ceo spisak.

## Pokretanje posla odmah

Dugme ▶ u redu prvo pita — posao se pokreće stvarno, a pošta koja je otišla ne vraća se — pa onda predaje posao rasporedu bez čekanja. To je isto pokretanje koje bi raspored sam započeo — ista pošta, isti fajl, isti posao nad podacima — samo ne čeka svoje vreme. Raspored se pri tome ne pomera: *Sledeće pokretanje* ostaje gde je bilo.

Dugme govori samo da je posao preuzet, ne i da je završen: pokretanje ide dalje samo, i može trajati koliko traje izveštaj. Red se čita ponovo u trenutku predaje, pa pokretanje koje još nije završeno tamo stoji kao *U toku*; ⟳ u redu, ili *Osveži* u zaglavlju, pokazuje kako se završilo.

Pokretanje rukom se upisuje kao i svako drugo, pa stoji u *Ishodu* i stiže na adresu za greške koju posao nosi ako ne prođe.

## Kada posao ne prođe

Pokretanje koje nije prošlo nosi grešku sa sobom, a ⚠ pored ishoda je otvara: prvo poruku, a pod njom trag koji je server upisao. To je isti tekst koji posao šalje na svoju *Adresu za greške*, pa se ništa ne gubi time što ona nije uneta.

## Sva pokretanja posla

Spisak nosi **poslednje** pokretanje posla; ona pre njega otvara 🕘 u redu. Pokretanja tamo stoje od najnovijeg, svako svoj red:

| | |
|---|---|
| **Počelo** | kada je raspored preuzeo posao |
| **Završeno** | kada je pokretanje bilo gotovo; pokretanje koje još traje tu nema ništa |
| **Ishod** | *Prošao*, *Nije prošao* ili *U toku* |
| **Greška** | na čemu je puklo pokretanje koje nije prošlo; ono koje je prošlo tu nema ništa |

To je uobičajena tabela aplikacije, pa se pokretanja sortiraju po bilo kojoj koloni, pretražuju kroz *Naprednu pretragu* (po ishodu, ili po danu kada je pokretanje počelo), čitaju stranu po stranu i izvoze u Excel. Pokretanje pokrenuto rukom preko ▶ upisuje se isto kao ono koje je započeo raspored, pa ovde stoje jedno uz drugo.

## Izmena posla

✎ u redu otvara formu posla, istu koju otvara i strana izveštaja. Stoji samo za posao koji još pripada izveštaju, i samo korisniku koji može da dođe do *Administracije / Izveštaji* — posao se menja tamo gde je unet, a ta strana pripada administratoru.

Ono što se izmeni — raspored među tim — ima dejstvo odmah: red se posle snimanja čita ponovo, pa je novo *Sledeće pokretanje* na ekranu bez učitavanja celog spiska.

::: tip
Posao iza kog nema izveštaja ne može se odavde pokrenuti, niti menjati: posao radi nad izveštajem, a njega nema. Ono što je upisano o njegovim ranijim pokretanjima ostaje i čita se preko 🕘.
:::
