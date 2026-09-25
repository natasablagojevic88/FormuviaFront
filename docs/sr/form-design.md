# Dizajn forme

Ovde tabela dobija svoja polja. Otvara se iz drveta modela: ⋯ na tabeli → **Dizajn forme**.

Svako polje koje ovde dodate jeste dve stvari odjednom — **kolona u tabeli u bazi** i **polje za unos na formi**. Zato dodavanje traži trenutak razmišljanja, a brisanje nosi podatke sa sobom.

::: info Šta danas ima dejstvo
Sve što se tiče **baze** dešava se odmah: dodavanje polja pravi kolonu, izbor šifarnika pravi strani ključ, brisanje polja briše kolonu i njene podatke.

Ono što se čuva ali se još ne iscrtava jeste **sama forma** — mreža, položaji, podrazumevana vrednost, lista vrednosti i naziv iz šifarnika se snimaju i proveravaju, ali ih još nijedan generisani dijalog za unos ne čita. Složite formu kako želite; dejstvo dobija kad taj ekran stigne.
:::

## Radna površina

Sredina ekrana je dijalog za unos, nacrtan u svojoj pravoj širini, sa mrežom od onoliko kolona i redova koliko je tabeli dato.

- **klik na prazno mesto** → novo polje, već postavljeno tu
- **klik na polje** → izmena polja
- polja prikazuju svoj naziv, tip podatka i naziv kolone ispod; `*` znači da je polje obavezno, a male ikonice označavaju polja koja su sakrivena iz tabele ili se ne mogu menjati

Iznad radne površine su **Kolone**, **Redovi** i **Širina dijaloga**. Kad ih promenite, mreža se odmah precrtava da vidite rezultat; **Sačuvaj** to zadržava, a **Poništi** vraća na staro. Ako bi izmena izbacila postojeća polja van mreže, Formuvia upozorava i ne dozvoljava snimanje dok ne stanu.

## Dodavanje polja

### Naziv i naziv kolone

**Naziv** je ono što se čita pored polja za unos. **Naziv kolone u bazi** je tehnički naziv: mala slova, cifre i donja crta, počinje slovom.

Kad kolona jednom postoji, njen naziv je zaključan — kao i tip podatka, i šifarnik ako ga ima. Baza već drži podatke pod njima.

### Tip podatka

| Tip | Za |
|---|---|
| **Tekst** | nazive, šifre, sve što se piše |
| **Ceo broj** | količine, brojanje |
| **Ceo broj (veliki)** | kad ceo broj može biti jako veliki |
| **Decimalan broj** | iznose i mere — uz njega se zadaje i broj decimala |
| **Da / Ne** | prekidač |
| **Datum** | dan |
| **Datum i vreme** | dan i vreme |
| **Veza na šifarnik** | vrednost koja se bira iz druge tabele |

### Veza na šifarnik

Kad izaberete ovaj tip, birate i koja tabela je šifarnik. Formuvia pravi strani ključ u bazi, pa je veza obezbeđena tamo, a ne samo na formi.

Ono što se u izboru *prikazuje* dolazi iz same šifarničke tabele — vidi [Deo opisa u šifarniku](#deo-opisa-u-sifarniku) niže.

## Gde polje stoji

**Red**, **Kolona** i **Širina u kolonama** postavljaju polje u mrežu. Širina omogućava da polje zauzme više kolona — dugačak opis preko cele forme, dva kratka polja jedno pored drugog.

Formuvia neće dozvoliti da postavite polje tamo gde je već drugo, niti da jedno visi van ivice mreže.

## Opcije

| Opcija | Dejstvo |
|---|---|
| **Opciono** | polje sme ostati prazno; kad je isključite, polje je obavezno |
| **Prikaži u tabeli** | da li se kolona vidi u listi, ili samo na formi |
| **Može se menjati** | kad je isključite, vrednost se posle unosa ne menja |
| **Dugačak tekst** | višered umesto jednog reda (samo za tekstualna polja) |
| **Deo opisa u šifarniku** | vidi niže |

*Opciono* se zaključava pošto je kolona napravljena, jer ograničenje u bazi već postoji.

### Deo opisa u šifarniku {#deo-opisa-u-sifarniku}

Ova opcija se tiče **drugih** tabela, ne ove.

Kad druga tabela poveže ovu kao šifarnik, njen izbor mora da prikaže nešto čitljivo umesto internog identifikatora. Uključite ovu opciju na poljima čije vrednosti treba da čine taj opis. Uključite ih više i vrednosti se spajaju razmakom, redosledom kojim polja stoje na formi — na primer šifra i naziv, što daje `PAR-001 Acme d.o.o.` u svakom izboru koji pokazuje ovamo.

Opis se već gradi i održava na serveru kad god se šifarnik promeni; izbori koji će ga prikazivati deo su generisane forme koja tek dolazi.

## Podrazumevana vrednost i lista vrednosti

Dva polja na dnu forme primaju SQL upit. Oba su neobavezna i oba se proveravaju pre snimanja.

**Podrazumevana vrednost (SQL)** — `SELECT` koji vraća tačno **jednu** kolonu. Njena vrednost popunjava polje pri unosu novog zapisa:

```sql
select now()
```

**Lista vrednosti (SQL)** — `SELECT` koji vraća tačno **dve** kolone: prva je ono što se snima, druga je ono što čovek vidi u izboru. Ostavite prazno i polje se unosi slobodno:

```sql
select id, name from partner order by name
```

::: warning Pravila za oba upita
- mora biti `SELECT`, ništa drugo
- `select *` nije dozvoljen — navedite kolone
- broj kolona mora biti tačan: jedna za podrazumevanu vrednost, dve za listu vrednosti

Formuvia sve ovo proverava pri snimanju i kaže šta nije u redu.
:::

## Brisanje polja

Dugme **Obriši** na formi polja uklanja polje sa forme **i briše njegovu kolonu iz baze, sa svakom vrednošću koja je u njoj bila**.

Formuvia navede naziv polja i traži potvrdu. Povratka nema — podaci odlaze zajedno sa kolonom.

## Primer

Recimo da hoćete tabelu **Partneri** i tabelu **Fakture**, gde svaka faktura pokazuje na partnera.

1. U [Modelu](/sr/model) dodajte obe tabele.
2. Otvorite *Dizajn forme* nad **Partnerima** i dodajte `code` i `name`. Uključite **Deo opisa u šifarniku** na oba, da bi izbor prikazivao `PAR-001 Acme d.o.o.` umesto identifikatora.
3. Otvorite *Dizajn forme* nad **Fakturama** i dodajte polje tipa **Veza na šifarnik**, sa **Partnerima** kao šifarnikom.
4. Dodajte polje `date` tipa *Datum i vreme* sa `select now()` kao podrazumevanom vrednošću, da se današnji dan sam popuni.

U bazi sada imate `partner` i `invoice`, gde `invoice.partner_id` pokazuje na `partner.id` pravim stranim ključem, i spreman opis za svakog partnera na serveru.
