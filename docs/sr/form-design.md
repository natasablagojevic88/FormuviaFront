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

Ako na zapisu koji već ima fajl izaberete drugi, novi postaje fajl tog zapisa. Prethodni se ne baca: Formuvia ga pamti kao stariju verziju. **Sat** pored polja, i pored fajla u listi, otvara te verzije — svaku sa nazivom, tipom i vremenom kad je sačuvana, od najnovije. Svaka se može preuzeti svojim dugmetom **preuzmi**, a PDF i otvoriti **okom**, pa se stariji fajl pročita bez diranja onog koji zapis sada drži. Verzija se briše **korpom**, uz pitanje; poslednja ne može da se obriše, a ako obrišete onu na koju zapis pokazuje, zapis se vraća na verziju sačuvanu pre nje.

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

## Vrednost koju izračunava baza

Polje može imati **funkciju baze** iza sebe. Polje *Vrednost koju izračunava baza* nudi funkcije koje baza ima; izaberite jednu i, kad god neko promeni to polje na formi za unos, Formuvia joj preda zapis onakav kakav je u tom trenutku popunjen, a forma preuzme zapis koji funkcija vrati.

Tako jedno polje popunjava ili ispravlja druga: porez iz stope i osnovice, rok plaćanja iz datuma računa, vrednost prepisana sa drugog mesta. Dugme **i** pored polja otvara celo uputstvo sa primerom; ovo je ukratko:

- Funkcija prima **jedan argument tipa `json`** i vraća **`json`**. Samo takve se i nude, pa funkcija napisana drugačije uopšte ne stigne u listu.
- Dobija zapis sa **nazivima kolona tabele**. `json_populate_record` nad tipom reda tabele ga pretvara u zapis sa kojim se radi, a `to_json` ga vraća nazad.
- Kolona o kojoj odgovor ne kaže ništa **ostaje kako stoji na formi**, pa funkcija može vratiti ceo zapis ili samo ono što je promenila. Ključ koji tabela nema se ignoriše.
- **Pražnjenje polja je takođe promena**: poništavanje izbora, brisanje onoga što je ukucano ili vađenje fajla pokreću funkciju isto kao i unos vrednosti, pa ono što je izračunato iz stare vrednosti može da se poništi.
- Pokreće se **samo kad neko promeni polje**. Otvaranje zapisa na izmenu prikazuje ono što je sačuvano i ne računa ponovo, pa se sačuvana vrednost nikad ne pregazi samim otvaranjem forme.
- Polje sa **fajlom** takođe pokreće funkciju, čim je fajl poslat i čim se izvadi iz polja — polje tada dobije vrednost, pa je to promena kao i svaka druga. Funkcija dobija identifikator fajla: sačuvanog, ili onog iz slanja za tek izabran fajl, pa se do snimanja zapisa po njemu nema šta tražiti. Postavljanje fajla funkcija ne može.
- Funkcija **ništa ne upisuje**. Ono što vrati samo se prikaže na formi, a u bazu ide kad se zapis sačuva, kao i sve ostalo što je popunjeno.

```sql
CREATE OR REPLACE FUNCTION izracunaj_porez(zapis json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
declare
  pRow racun%rowtype;
  BEGIN
    pRow := json_populate_record(null::racun, zapis);

    pRow.porez := coalesce(pRow.osnovica, 0) * coalesce(pRow.stopa, 0) / 100;

    return to_json(pRow);
  END;
$function$;
```

Polje koje funkcija popunjava obično je ono u koje niko ne treba da upisuje, pa na njemu ugasite **Može da se menja**: zaključano polje čuva ono što u njemu stoji, i to se i sačuva.

Kad se funkcija pita zavisi od načina unosa, da kucanje ne bi pokretalo poziv po slovu:

| Polje | Funkcija se pita |
|---|---|
| Da / Ne | čim se prekidač prebaci |
| Lista vrednosti, veza na šifarnik | čim se vrednost izabere |
| Datum, datum i vreme | kad se polje napusti, ili odmah kad se datum izabere iz kalendara |
| Tekst, dugačak tekst, broj, vreme | kad se polje napusti |
| Fajl | čim je fajl poslat, i čim se izvadi iz polja |

Još dve stvari zadržavaju pozive. Dok se čeka odgovor, ništa se ne pita: polje promenjeno u međuvremenu pita se tek kad taj odgovor stigne, pa držanje strelica na polju sa brojem završi jednim dodatnim pozivom, a ne jednim po kliku. I ništa se ne pita dvaput za isti zapis, pa napuštanje polja u koje niste ništa ukucali, ili ponovni izbor iste vrednosti, ne košta ništa.

Dok baza računa, forma to kaže u dnu, a *Sačuvaj* čeka odgovor.

## Uslovi

Polje ne mora da se ponaša isto sve vreme. Otvorite već sačuvano polje i na dnu njegovog dijaloga dodajte **uslov**: polje se tada prikazuje, ili se može menjati, samo dok tako kaže vrednost **drugog polja iste forme**.

Uslov je jedan red i čita se kao rečenica:

| Deo | Značenje |
|---|---|
| **Dejstvo** | *Prikazano dok* sklanja polje kad uslov ne važi; *Izmenljivo dok* ga ostavlja na formi, ali zaključano; *Obavezno dok* traži polje samo dok uslov važi |
| **Zavisi od polja** | drugo polje ove forme čija se vrednost gleda |
| **Uslov** | poređenje — jednako, sadrži, veće od, prazno… tačno ona koja napredna pretraga nudi za taj tip podatka |
| **Vrednost** | sa čim se vrednost poredi; *između* traži dve |

Na primer, na fakturi: *Datum plaćanja* — **Prikazano dok** — *Status* — **je jednako** — `PLAĆENO`.

Nude se samo poređenja koja imaju smisla za tip podatka drugog polja: **fajl** se pita samo da li uopšte postoji (*prazno* / *nije prazno*), **veza na šifarnik** i polje sa **listom vrednosti** porede se sa *je jednako*, tekst zna i *sadrži*, *počinje sa* i *završava se sa*, a brojevi, datumi i vreme obična *veće od*, *manje od* i *između*.

Kada polje od kog uslov zavisi vodi na **šifarnik** ili ima **listu vrednosti**, vrednost se ne upisuje nego se bira sa istog spiska koji nudi i forma za unos, pa izaberete *Acme d.o.o.*, a ne oznaku koja se pod tim čuva. Uslov se u listi tada i čita tim tekstom.


Polje može imati više uslova. Unutar jednog dejstva svi moraju da važe istovremeno — dva uslova *Obavezno dok* znače da se polje traži tek kad oba važe — a tri dejstva se broje odvojeno, pa polje može biti prikazano, zaključano i uz to obavezno.

Uslovi se snimaju zasebno, čim ih potvrdite, a ne zajedno sa ostatkom polja — zato se i dodaju samo na polje koje već postoji. Klik na uslov u listi ga otvara za izmenu, korpica ga briše. Polje bez uslova ponaša se tačno onako kako kažu njegove opcije.

### Šta uslov radi dok se unosi zapis

Uslov je tačnija reč o polju, pa gde njega ima on odlučuje, a prekidač iznad ne: polje kome je **Prikaži na formi** isključeno, a ima uslov *Prikazano dok*, crta se kad god taj uslov važi, i polje kome je **Može se menjati** isključeno, a ima uslov *Izmenljivo dok*, menja se kad god taj važi. Prekidači odlučuju samo za polje koje nema uslov tog dejstva. Uslov *Obavezno dok* može samo da doda obavezu, nikad da je skine: polje koje baza ne dozvoljava prazno ostaje obavezno šta god uslov govorio. Iz istog razloga kolona koja ne dozvoljava prazno ne treba da nosi uslov *Prikazano dok* — sakriveno polje se snima prazno, pa baza odbija ceo zapis. Neka takva kolona dozvoli prazno, a neka je traži uslov *Obavezno dok*. Isključeno **Nije obavezno** je za ono malo kolona bez kojih zapis stvarno ne postoji.

Na formi za unos uslovi se računaju pri svakoj promeni, nad vrednostima koje u tom trenutku stoje na formi:

- Polje čiji uslovi *Prikazano dok* ne važe **nestaje sa forme**. Njegovo mesto u mreži ostaje prazno, a polje se vraća čim uslov ponovo bude ispunjen.
- Polje čiji uslovi *Izmenljivo dok* ne važe ostaje na formi, ali je **zaključano**, uz napomenu ispod njega zašto.
- Polje čiji uslovi *Obavezno dok* važe **mora da se popuni**: nosi crvenu oznaku i zapis se bez njega ne snima. Kad uslovi prestanu da važe, oznaka nestaje i polje sme da ostane prazno.
- Polje koje nije na formi **se ne traži** ni kad je obavezno, pa zapis nikad ne blokira polje koje niko ne vidi. Sakriveno je jače od obaveznog.
- Red koji ostane bez ijednog iscrtanog polja **ne zauzima mesto**: redovi ispod njega se pomeraju gore, pa forma ne otvara prazninu u sredini.
- Polje koje uslov sakrije **se prazni** i zapis se snima bez te vrednosti: vidite je kako odlazi pre snimanja, pa forma nikad ne pokazuje ono što zapis ne drži. Polje koje sam dizajn nikad ne prikazuje — **Prikaži na formi** isključeno i bez uslova — se ne dira i zadržava svoju vrednost.
- Zaključano polje **zadržava ono što u njemu stoji** i to se i snima. Zaključavanje se tiče kucanja, ne vrednosti: forma u polje može sama da upiše vrednost, a vi je vidite pre snimanja.

Prazno polje ne zadovoljava nijedno poređenje: dok u *Statusu* ništa nije izabrano, uslov *Status je jednako PLAĆENO* ne važi, pa je polje koje od njega zavisi sakriveno ili zaključano. To je isto pravilo po kom radi i pretraga.

U listi, gde se zapisi menjaju pravo u tabeli, jedna ćelija ne može da nestane a da kolona ostane. Tamo **i prikazano i izmenljivo zaključavaju ćeliju**: kolonu čiji uslov za taj red ne važi dvoklik ne otvara i zaključana je u *Brzoj izmeni*. *Obavezno dok* tamo radi kao i na formi — red se ne snima dok je takva ćelija prazna.

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
