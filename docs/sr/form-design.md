# Dizajn forme

Ovde tabela dobija svoja polja. Otvara se iz drveta modela: ⋯ na tabeli → **Dizajn forme**.

Svako polje koje ovde dodate jeste dve stvari odjednom — **kolona u tabeli u bazi** i **polje za unos na formi**. Zato dodavanje traži trenutak razmišljanja, a brisanje nosi podatke sa sobom.

::: info Šta danas ima dejstvo
Sve što se tiče **baze** dešava se odmah: dodavanje polja pravi kolonu, izbor šifarnika pravi strani ključ, brisanje polja briše kolonu i njene podatke.

Polja koja dodate odmah se vide i kao kolone liste te tabele u meniju, redosledom i sa nazivima koje ste im dali, a *Prikaži u tabeli* određuje koja se tamo pojavljuju.

**Dijalog za unos** koji ovde složite je ono što korisnici zaista dobiju: u tabeli iz Modela *Dodaj* i *Izmeni* otvaraju formu sa vašom mrežom, svakim poljem na svom mestu, nazivima na jeziku koji su izabrali, listama vrednosti i podrazumevanim vrednostima, a ono što unesu upisuje se u tabelu koju ste definisali.
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
| **Vreme** | samo doba dana, bez datuma |
| **Fajl** | dokument koji se čuva uz zapis |
| **Veza na šifarnik** | vrednost koja se bira iz druge tabele |

**Redosled sortiranja** i **Smer** određuju kako se tabela otvara: kolona sa redosledom 1 sortira se prva, pa 2, i tako redom; ostavite redosled prazan i kolona u tome ne učestvuje. Kolona u kojoj stoji identifikator — veza na šifarnik ili fajl — ne može da se koristi, jer to što je u njoj upisano nije tekst koji se prikazuje.

### Fajl

Polje je dugme koje otvara izbor fajla na vašem računaru ili telefonu. Fajl se šalje na server odmah kad ga izaberete, a zapis pamti sačuvani fajl; naziv fajla stoji pored dugmeta, a **×** ga uklanja iz polja. Uklanjanje fajla koji zapis već ima se prvo potvrđuje, jer u tabeli dejstvuje odmah; fajl koji je tek izabran se uklanja bez pitanja. Kad je zapis snimljen, pored naziva se pojavi i malo dugme **preuzmi**, koje vam fajl vraća. PDF ima i **oko**: otvara se u čitaču unutar aplikacije, pa ne mora da se snima da bi se pročitao.

Ako na zapisu koji već ima fajl izaberete drugi, novi postaje fajl tog zapisa. Prethodni se ne baca: Formuvia ga pamti kao stariju verziju tog fajla, mada se za čitanje i preuzimanje nudi samo trenutni.

U listi takva kolona prikazuje spajalicu sa nazivom fajla i ista dva dugmeta. Po fajlu se ne sortira i ne filtrira, ali se menja i iz same tabele: dvoklik na ćeliju, kao i *Brza izmena*, nude isto dugme za izbor fajla kao forma.

Fajl se samo bira i čuva, pa kolona sa fajlom nema upit za podrazumevanu vrednost, nema listu vrednosti, nema *Dugačak tekst* i ne ulazi u opis šifarnika — te opcije se za nju ni ne nude.

### Veza na šifarnik

Kad izaberete ovaj tip, birate i koja tabela je šifarnik. Formuvia pravi strani ključ u bazi, pa je veza obezbeđena tamo, a ne samo na formi.

Ono što se u izboru *prikazuje* dolazi iz same šifarničke tabele — vidi [Deo opisa u šifarniku](#deo-opisa-u-sifarniku) niže.

#### Šifarnik koji je i sam podtabela

Ako je šifarnik podtabela neke druge tabele — gradovi ispod okruga, okruzi ispod država — polje nije jedan izbor nego **lanac**, odozgo na dole:

```
Država   [ Srbija        ▾ ]
Okrug    [ Beogradski    ▾ ]
Grad     [ Zemun         ▾ ]
```

Svaki nivo nudi samo ono što pripada nivou iznad, nivo je zatvoren dok se onaj iznad ne izabere, a promena nivoa prazni sve ispod njega — tako zapis ne može da završi pod roditeljem koji nije izabran. U koloni se čuva samo poslednji nivo; oni iznad služe da se do njega dođe. Kad otvorite postojeći zapis, ceo lanac se popuni sam, od upisane vrednosti naviše.

Lanac ide koliko god duboko model ide, i radi isto u formi za unos i u *Brzoj izmeni* u tabeli, gde red jednostavno poraste u visinu.

## Gde polje stoji

**Red**, **Kolona** i **Širina u kolonama** postavljaju polje u mrežu. Širina omogućava da polje zauzme više kolona — dugačak opis preko cele forme, dva kratka polja jedno pored drugog.

Formuvia neće dozvoliti da postavite polje tamo gde je već drugo, niti da jedno visi van ivice mreže.

Polje koje je isključeno opcijom *Prikaži na formi* ostaje na svom mestu u dizajnu — iscrtava se isprekidanom linijom i označeno je malim minusom, pa se vidi da je tu bez traženja po svim poljima.

## Opcije

| Opcija | Dejstvo |
|---|---|
| **Opciono** | polje sme ostati prazno; kad je isključite, polje je obavezno |
| **Prikaži u tabeli** | da li se kolona vidi u listi, ili samo na formi |
| **Prikaži na formi** | kad je isključite, polje se na formi za unos uopšte ne iscrtava; vrednost koju zapis već ima ostaje kakva je, a nov zapis je može dobiti samo iz upita za podrazumevanu vrednost |
| **Može se menjati** | kad je isključite, polje se vidi ali se u njega ne unosi, ni pri unosu ni kasnije; vrednost mu daje upit za podrazumevanu vrednost |
| **Dugačak tekst** | višered umesto jednog reda (samo za tekstualna polja) |
| **Deo opisa u šifarniku** | vidi niže |

*Opciono* se zaključava pošto je kolona napravljena, jer ograničenje u bazi već postoji.

### Deo opisa u šifarniku {#deo-opisa-u-sifarniku}

Ova opcija se tiče **drugih** tabela, ne ove.

Kad druga tabela poveže ovu kao šifarnik, njen izbor mora da prikaže nešto čitljivo umesto internog identifikatora. Uključite ovu opciju na poljima čije vrednosti treba da čine taj opis. Uključite ih više i vrednosti se spajaju razmakom, redosledom kojim polja stoje na formi — na primer šifra i naziv, što daje `PAR-001 Acme d.o.o.` u svakom izboru koji pokazuje ovamo.

Opis se već gradi i održava na serveru kad god se šifarnik promeni i šalje se uz kolonu; izbori koji će ga prikazivati deo su generisanog dijaloga za unos koji tek dolazi.

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

Polje tipa **Da / Ne** nema listu vrednosti — njegove dve vrednosti su da i ne — pa se za taj tip i ne nudi.

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
