# Rad sa tabelama

Svaki ekran sa tabelom u Formuvii radi isto. Naučite jednom i važi za sve: **Korisnike**, **Uloge** i podtabele do kojih se stiže iz ⋯ menija reda.

::: info Tabele iz Modela
Tabele koje sami definišete u [Modelu](/sr/model) pojavljuju se u meniju i otvaraju ekran kakav je ovde opisan. Pronalaženje zapisa, sortiranje, straničenje, export u Excel, kao i unos, izmena i brisanje zapisa kroz formu — sve radi. Dugme ⋯ na redu nudi i istoriju zapisa i podtabele te tabele, isto kao na ugrađenim ekranima. Ono što takva tabela još nema jeste izmena u samoj listi — dvoklik i *Brza izmena*. Vidi [Dokle je Formuvia stigla](/sr/#dokle-je-formuvia-stigla).
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

Klik na zaglavlje kolone sortira po njoj, drugi klik obrće redosled. Kolona koja pokazuje na šifarnik i kolona sa fajlom se ne sortiraju: u njima stoji identifikator, a ne tekst koji vidite, pa bi sortiranje poređalo listu po nečemu nevidljivom. Na dnu birate koliko redova staje na stranu i krećete se kroz strane.

Filtriranje, sortiranje i straničenje rade na serveru, pa tabela sa mnogo redova ostaje brza kao i mala.

## Unos i izmena podataka

::: tip Šta vidite zavisi od vaših uloga
Tabela iz Modela ima četiri odvojena prava: pregled, unos, izmena i brisanje. Bez prava na unos nema dugmeta **Dodaj**; bez prava na izmenu se olovka na redu pretvara u **oko**, pa se zapis otvara kao forma koja se čita ali ne menja; bez prava na brisanje u ⋯ meniju nema stavke *Obriši*.
:::

### Kroz formu

**Dodaj** u zaglavlju strane otvara formu za unos. **Izmeni** na redu otvara istu formu sa tim zapisom u njoj. Polja označena sa `*` moraju biti popunjena da bi forma mogla da se snimi.

Dugme **Sačuvaj** ima mali jezičak sa desne strane. U njemu je uvek **Sačuvaj i ostani** — zapis se snimi, a forma ostane otvorena i ponovo se popuni onim što je server upisao, pa se dugačka forma može snimati usput, a nov zapis jednostavno postane postojeći. Kad tabela ima podtabele, u jezičku stoji i po jedna stavka za svaku od njih. Kod **novog** zapisa piše *Sačuvaj i otvori: …* — zapis se snimi, a podtabela se otvori sa njim kao nadređenim, pa se zaglavlje i stavke unesu u jednom potezu. Kod **postojećeg** zapisa piše *Otvori: …*, jer je zapis već snimljen, a vi možda samo hoćete da ga pogledate i pređete na stavke; ako ste pre toga nešto izmenili na formi, dobićete upozorenje da te izmene neće biti sačuvane.

Nazivi polja na toj formi dolaze sa servera, na jeziku koji ste izabrali, pa forma i tabela uvek koriste iste reči za istu stvar.

Vrednost izabrana iz liste poništava se **×** na desnom kraju polja — isto radi i na formi, i u tabeli, i u filterima.

Polje tipa *Fajl* je dugme koje otvara izbor fajla. Fajl ide na server odmah kad ga izaberete, njegov naziv tada stoji pored dugmeta, a **×** ga vadi iz polja — za fajl koji zapis već ima pita se prvo, a tek izabran se uklanja odmah. Fajl koji je snimljen sa zapisom ima pored naziva dugme **preuzmi**, i na formi i na redu u listi, pa se fajl uzima bez otvaranja zapisa. PDF ima i **oko**, koje ga otvara u čitaču unutar aplikacije.

Polje koje pokazuje na šifarnik ima pored sebe malo **ⓘ**, i na formi i na redu u listi. Njime se otvara zapis iza izabrane vrednosti — ista forma, sa svim poljima zaključanim i bez snimanja — pa možete da proverite šta stoji iza šifre bez napuštanja onoga što radite.

### Pravo u tabeli

Dvoklik na ćeliju, izmenite vrednost, `Enter` snima a `Esc` odustaje. Na telefonu prvo dodirnete red pa onda ćeliju.

Na dvoklik reaguju samo ćelije koje smeju da se menjaju; kolonu koju server označi kao nepromenljivu dvoklik ne otvara. Kolona sa fajlom reaguje: u ćeliji dobijate isto dugme za izbor fajla kao na formi, a zapis se snima čim fajl izaberete.

### Brza izmena

**Brza izmena** u traci služi za unos više zapisa jedan za drugim, bez otvaranja dijaloga svaki put.

Kad je uključena, prikazuje sve izmenljive kolone, ne samo one koje se inače vide. **Izmeni** tada otvara red u samoj tabeli, a **Nov red** ubacuje prazan red na vrh, spreman za popunjavanje. Kad je isključite, tabela se ponaša kao i pre.

## Šta još red može

Dugme ⋯ pored *Izmeni* nosi sve ostalo:

**Istorija** — ko je i kada menjao ovaj zapis, sa starom i novom vrednošću svakog polja koje se promenilo, u panelu koji se izvlači s desne strane. Brisanja i unosi se takođe beleže, pa panel priča celu priču o zapisu.

**Podtabele** — ako tabela ima podtabele, svaka je navedena ovde. Kad je otvorite, vidite samo redove koji pripadaju zapisu iz kog ste došli, a u zaglavlju piše koji je to zapis: *Komitenti: Acme d.o.o.*, sa dugmetom **Nazad** pored. Lanac može ići koliko god duboko model ide.

**Nazad** vraća listu tačno onakvu kakvu ste ostavili — ista strana, isti filteri i sortiranje, i red u koji ste ušli i dalje označen — pa ne morate ponovo da tražite gde ste stali. Kad tu tabelu ponovo otvorite iz menija, ili osvežite stranu, kreće ispočetka.

**Obriši** — prvo traži potvrdu, jer se ne može poništiti.

## Export u Excel

**Export u Excel** preuzima listu kao `.xlsx` fajl.

Dobijate tačno ono što filteri i redosled sortiranja opisuju, a **ne** samo stranu koja je na ekranu: suzite na prošli mesec, sortirajte po iznosu, i fajl sadrži sve te redove, tim redosledom, sa prevedenim nazivima kolona.

## Šablon za unos

**Šablon**, pored izvoza, preuzima prazan `.xlsx` fajl za unos podataka u ovu tabelu. Pojavljuje se samo kod tabele u koju smete da dodajete zapise.

U fajlu je jedan red sa nazivima kolona — crvenim tamo gde je polje obavezno — i ništa drugo za popunjavanje. Svaka kolona već zna šta u nju ide: u broj se može upisati samo broj, u datum samo datum, a kolona vezana za šifarnik ili za listu vrednosti nudi izbor umesto kucanja. Vrednosti tih lista putuju sa fajlom, na listovima koji su skriveni, pa šablon radi i bez veze sa aplikacijom.

Nazivi i skriveni prvi red fajla su zaštićeni: po njima aplikacija prepoznaje koja je kolona koja kad se fajl vrati, pa se tabela prepoznaje i ako kolone preimenujete ili premestite. Sve ispod toga je vaše za popunjavanje.

## Brojevi

Ceo broj se prikazuje onako kako je upisan, bez razdvajanja hiljada — šifra, godina ili broj računa treba da se čitaju kako su uneti.

Decimalan broj prati jezik koji ste izabrali: na srpskom `1.234,56`, na engleskom `1,234.56`.

Isto važi i za unos. Kad je izabran srpski, decimalu kucate zarezom, na engleskom tačkom, a i polja na formi i polja za pretragu primaju oba — srpska tastatura vas ni u čemu ne ograničava.

Brojevi su poravnati desno, pa se cifre u koloni poklapaju i vrednosti se lako porede.

## Datumi

Datum se piše onako kako ga piše vaš jezik: na srpskom `23.09.2026`, na engleskom `09/23/2026`. Datum i vreme dodaju i vreme — `23.09.2026 16:50`, odnosno `09/23/2026 04:50 PM` na engleskom.

Kucate samo cifre: `23092026` se u hodu pretvara u `23.09.2026`, a datum sa vremenom ide istim putem — `230920261650` postaje `23.09.2026 16:50`. Možete i sami da kucate tačke, kao i skraćeno `23/9/26`, što se pri izlasku iz polja ispiše u punom obliku. Dugme sa kalendarom na desnom kraju polja otvara birač, a datum koji ne postoji — `31.02.` — polje oboji crveno.

Kolona tipa **vreme** prikazuje se onako kako jezik piše vreme — na srpskom `16:50`, na engleskom `04:50 PM` — a unosi se kroz nativno polje za vreme.

U filteru ispod kolone sa **datumom i vremenom** vreme nije obavezno: unesete samo datum i dobijete sve iz tog dana, dodate i vreme i dobijete baš taj minut.

## Tabele na telefonu

Ispod otprilike 900 px tabela se pretvara u **kartice** — jedna kartica po zapisu, svaka vrednost sa nazivom kolone pored sebe, a akcije reda na dnu kartice.

Zaglavlja kolona nestaju zajedno sa izgledom tabele, pa se dve stvari koje su u njima živele sele:

- **sortiranje** — kolonu i smer birate u traci iznad liste
- **filtriranje** — kroz *Naprednu pretragu*

Sve ostalo, uključujući izmenu ćelije i ⋯ meni, radi kao i na računaru.
