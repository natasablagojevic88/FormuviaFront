# Rad sa tabelama

Svaki ekran sa tabelom u Formuvii radi isto. Naučite jednom i važi za sve: **Korisnike**, **Uloge** i podtabele do kojih se stiže iz ⋯ menija reda.

::: info
Tabele koje sami definišete u [Modelu](/sr/model) prave se u bazi, ali još nemaju svoj ekran, pa se ova strana na njih ne odnosi. Vidi [Dokle je Formuvia stigla](/sr/#dokle-je-formuvia-stigla).
:::

Ekran sa tabelom ima tri dela: **zaglavlje** sa naslovom i dugmetom *Dodaj*, **traku** sa pretragom i exportom, i samu **listu** sa straničenjem na dnu.

## Kako da nađete zapis

### Filtriranje po koloni

Ispod svakog zaglavlja kolone stoji malo polje za pretragu. Kucate u njemu i lista se sužava u hodu. Filteri na više kolona rade zajedno — red mora da zadovolji sve.

Ikonica metle na desnom kraju tog reda briše sve filtere odjednom.

### Napredna pretraga

**Napredna pretraga** u traci služi za pitanja na koja polja po kolonama ne mogu da odgovore: opseg datuma, sve što je prazno, sve što *nije* jednako nečemu.

Dodate uslov, izaberete kolonu, izaberete šta se poredi i unesete vrednost:

| Uslov | Pronalazi |
|---|---|
| jednako / nije jednako | tačnu vrednost |
| sadrži / počinje sa / završava se sa | deo teksta |
| manje od / veće od | i varijante *ili jednako*, za brojeve i datume |
| između | opseg — dva polja, *Od* i *Do* |
| prazno / nije prazno | zapise kod kojih u toj koloni nema ničega |

Svi uslovi moraju da važe istovremeno. **Primeni** pokreće pretragu, a uslovi ostaju vidljivi kao čipovi u traci, da se vidi šta filtrira listu; × na čipu uklanja taj jedan uslov, a **Obriši sve** uklanja ih sve.

### Sortiranje i straničenje

Klik na zaglavlje kolone sortira po njoj, drugi klik obrće redosled. Na dnu birate koliko redova staje na stranu i krećete se kroz strane.

Filtriranje, sortiranje i straničenje rade na serveru, pa tabela sa mnogo redova ostaje brza kao i mala.

## Unos i izmena podataka

### Kroz formu

**Dodaj** u zaglavlju strane otvara formu za unos. **Izmeni** na redu otvara istu formu sa tim zapisom u njoj. Polja označena sa `*` moraju biti popunjena da bi forma mogla da se snimi.

Nazivi polja na toj formi dolaze sa servera, na jeziku koji ste izabrali, pa forma i tabela uvek koriste iste reči za istu stvar.

### Pravo u tabeli

Dvoklik na ćeliju, izmenite vrednost, `Enter` snima a `Esc` odustaje. Na telefonu prvo dodirnete red pa onda ćeliju.

Na dvoklik reaguju samo ćelije koje smeju da se menjaju; kolonu koju server označi kao nepromenljivu dvoklik ne otvara.

### Brza izmena

**Brza izmena** u traci služi za unos više zapisa jedan za drugim, bez otvaranja dijaloga svaki put.

Kad je uključena, prikazuje sve izmenljive kolone, ne samo one koje se inače vide. **Izmeni** tada otvara red u samoj tabeli, a **Nov red** ubacuje prazan red na vrh, spreman za popunjavanje. Kad je isključite, tabela se ponaša kao i pre.

## Šta još red može

Dugme ⋯ pored *Izmeni* nosi sve ostalo:

**Istorija** — ko je i kada menjao ovaj zapis, sa starom i novom vrednošću svakog polja koje se promenilo, u panelu koji se izvlači s desne strane. Brisanja i unosi se takođe beleže, pa panel priča celu priču o zapisu.

**Povezane tabele** — ako tabela ima podtabele, svaka je navedena ovde. Kad je otvorite, vidite samo redove koji pripadaju zapisu iz kog ste došli, a putanja na vrhu vodi nazad. Lanac može ići koliko god duboko model ide.

**Obriši** — prvo traži potvrdu, jer se ne može poništiti.

## Export u Excel

**Export u Excel** preuzima listu kao `.xlsx` fajl.

Dobijate tačno ono što filteri i redosled sortiranja opisuju, a **ne** samo stranu koja je na ekranu: suzite na prošli mesec, sortirajte po iznosu, i fajl sadrži sve te redove, tim redosledom, sa prevedenim nazivima kolona.

## Tabele na telefonu

Ispod otprilike 900 px tabela se pretvara u **kartice** — jedna kartica po zapisu, svaka vrednost sa nazivom kolone pored sebe, a akcije reda na dnu kartice.

Zaglavlja kolona nestaju zajedno sa izgledom tabele, pa se dve stvari koje su u njima živele sele:

- **sortiranje** — kolonu i smer birate u traci iznad liste
- **filtriranje** — kroz *Naprednu pretragu*

Sve ostalo, uključujući izmenu ćelije i ⋯ meni, radi kao i na računaru.
