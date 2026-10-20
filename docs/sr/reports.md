# Izveštaji

**Izveštaji** su ono što Formuvia pravi iz onoga što je u bazi: spisak podataka, posao nad tim podacima ili dokument koji se predaje kao PDF. Do njih se stiže preko *Administracija / Izveštaji*.

Izveštaj uvek pripada **grupi**. Grupa stoji zbog dve stvari: drži izveštaje urednim i kaže kome su dostupni — grupa nosi jednu ulogu, a izveštaje iz nje dobija samo korisnik koji tu ulogu ima.

## Grupe

Spisak prikazuje naziv grupe, ulogu koja uz nju ide i njenu ikonu. To je isti spisak kao svuda u Formuvia-i: pretraga, sortiranje, strane, izvoz u Excel i ⋯ na redu sa *Izveštajima*, *Istorijom* i *Obriši*. Naziv grupe može i da se menja pravo u spisku — *Režim izmene* u toolbar-u ili dvoklik na ćeliju; ćelija sa ikonom otvara isti izbor kao forma.

### Dodavanje grupe

*Dodaj* traži:

- **Naziv** — ono što ljudi čitaju nad izveštajima grupe. Dve grupe ne mogu nositi isti naziv; Formuvia to kaže kad je naziv zauzet.
- **Uloga** — uloga koja sme da čita izveštaje grupe. Uloge se vode u [Korisnicima i ulogama](/sr/administration).
- **Ikona** — nije obavezna, bira se iz spiska sa pretragom: sličica koja stoji uz grupu u meniju, tamo gde se njeni izveštaji i nude.

Naziv i uloga su obavezni. Izborom uloge je pravilo pristupa završeno: ko ima tu ulogu dobija izveštaje grupe, ko je nema ne vidi ih nikada.

### Izmena i brisanje grupe

⋯ → *Izmeni* otvara istu formu; naziv, uloga i ikona mogu da se menjaju kad god, a promena uloge od tog trenutka menja i to kome su izveštaji dostupni. ⋯ → *Obriši* skida grupu zajedno sa izveštajima u njoj.

## Izveštaji grupe

⋯ → **Izveštaji** na grupi otvara izveštaje te grupe. *Nazad* u zaglavlju vodi ponovo na spisak grupa.

Spisak prikazuje vrstu, naziv i opis svakog izveštaja grupe. *Dodaj* i *Izmeni* otvaraju njegovu formu, a ⋯ na redu nosi *Parametre*, *Istoriju* i *Obriši*. Naziv, opis i sam upit mogu i da se menjaju pravo u spisku, isto kao u grupama; za duži upit je forma udobnija.

### Šta izveštaj može da bude

**Vrsta** odlučuje šta izveštaj radi, a forma to prati:

| | |
|---|---|
| **SELECT upit** | jedan `SELECT`; izveštaj prikazuje redove koje upit vrati |
| **UPDATE upit ili procedura** | jedan `CALL`, `UPDATE`, `INSERT` ili `DELETE`; izveštaj odradi posao i kaže kako je prošlo |
| **Jasper izveštaj** | izveštaj preveden u Jaspersoft Studiju (`.jasper`), predaje se kao PDF |

### Dodavanje izveštaja

- **Naziv** — ono što ljudi čitaju u spisku grupe. Dva izveštaja iste grupe ne mogu nositi isti naziv.
- **Vrsta** — jedna od tri gore, i bira se ovde, pri dodavanju izveštaja. Sačuvan izveštaj svoju vrstu samo prikazuje: nosi ili upit ili fajl, a jedno se posle ne menja za drugo.
- **Ikona** — sličica koja stoji uz izveštaj u meniju, bira se iz istog spiska sa pretragom kao i ikona grupe. Može da ostane prazna.
- **Opis** — nije obavezan, red o tome čemu izveštaj služi.
- **Upit** — traže ga samo prve dve vrste. Čita se u trenutku snimanja: mora biti jedna naredba, one vrste koju vrsta dozvoljava, i posle tačke i zapeta ne sme da stoji ništa. Upit koji se ne može pročitati, upit pogrešne vrste i druga naredba podmetnuta posle prve — svaki se odbija, sa objašnjenjem.
- **Fajl izveštaja** — traži ga samo Jasper izveštaj, i za nov izveštaj je obavezan: izveštaj preveden u Jaspersoft Studiju, sa ekstenzijom `.jasper`. Fajl druge ekstenzije se odmah prijavi kao pogrešan; onaj koji se primi odlazi na server u trenutku izbora, a čita se pri snimanju izveštaja, pa se fajl koji nije preveden izveštaj tada odbija.

Jasper izveštaj nema upit, a prve dve vrste ne čuvaju fajl. Izmena Jasper izveštaja bez izbora fajla zadržava postojeći — forma to i kaže — a nov fajl dolazi na mesto starog.

## Parametri izveštaja

⋯ → **Parametri** na izveštaju otvara parametre tog izveštaja. *Nazad* u zaglavlju vodi ponovo na izveštaje grupe.

Parametar je ono što izveštaj traži pre pokretanja: datum od kog se gleda, komitent, ogranak. U upitu stoji kao `:sifra`, tamo gde bi inače stajala vrednost:

```sql
select * from racun where datum >= :datum_od and komitent = :komitent
```

Spisak prikazuje redosled, tip podatka, šifru, naziv i da li je vrednost obavezna. *Dodaj* i *Izmeni* otvaraju formu, ⋯ na redu nosi *Istoriju* i *Obriši*, a sve se može menjati i pravo u spisku.

- **Šifra** — ono pod čim parametar stoji u upitu, bez dvotačke. Za upitni izveštaj su dozvoljena mala slova, cifre i donja crta, a šifra počinje slovom — isto pravilo kao za šifru kolone u Modelu; i šifra mora stvarno da stoji u upitu, jer parametar koji se u upitu ne pojavljuje nikad ne bi bio popunjen. Za Jasper izveštaj je šifra naziv parametra iz `.jasper` fajla, napisan tačno kako tamo stoji, pa i velikim slovima; parametar koji preveden izveštaj ne nosi se odbija. Dva parametra istog izveštaja ne mogu nositi istu šifru.
- **Naziv** — ono što čita onaj ko pokreće izveštaj, nad poljem za unos.
- **Tip podatka** — koja se vrednost traži: tekst, broj, datum, da/ne. Fajl ne može da se traži, a ne može ni veza na zapis: takva vrednost se ne predaje kao identifikator. Parametar koji bira zapis iz šifarnika se zato traži kao tekst — njegova lista vrednosti i daje identifikator kakav je — a u upitu se kaže šta je: `komitent = cast(:komitent as uuid)`.
- **Redosled** — kojim redom se parametri traže. Nudi se prvi slobodan broj, a dva parametra istog izveštaja ne mogu imati isti.
- **Nije obavezno** — izveštaj može da se pokrene i bez te vrednosti.
- **Podrazumevana vrednost (SQL)** — `SELECT` upit sa tačno jednom kolonom; njegova vrednost se nudi u polju kad se izveštaj zatraži, na primer `select now()`. Može ostati prazno.
- **Lista vrednosti (SQL)** — `SELECT` upit sa tačno dve kolone: prva je vrednost koja se koristi, druga je tekst koji se vidi u spisku, na primer `select id, naziv from partner order by naziv`. Prazno znači slobodan unos.

Oba upita se čitaju pri snimanju, po istom pravilu kao kod kolone u Modelu: moraju biti `SELECT`, bez `*`, sa tačno jednom odnosno tačno dve kolone.

Parametar koji korisnik sme da ostavi prazan mora u upitu da stoji sa izrečenim tipom, jer prazna vrednost sama po sebi bazi ne kaže šta je:

```sql
select * from racun
where (cast(:datum_od as date) is null or datum >= :datum_od)
```

Tako napisan izveštaj radi i sa datumom i bez njega. Bez `cast`-a baza odbija upit u trenutku kad polje ostane prazno.

Jasper izveštaj nema upit, pa se njegov parametar traži u samom `.jasper` fajlu: parametar koji preveden izveštaj ne nosi se odbija, a parametri koje JasperReports postavlja sam se ne računaju. Podrazumevana vrednost i lista vrednosti za njega rade isto kao za upitni izveštaj. U fajlu se parametar koji nosi identifikator postavlja kao `Object` i u upitu izveštaja se kaže šta je, isto kao i svuda drugde: `cast($P{komitent} as uuid)`.

## Pokretanje izveštaja

Svaki izveštaj stoji u meniju, pod nazivom i ikonom svoje grupe, sa svojom ikonom pored sebe ako je izabrana: ko ima ulogu grupe vidi njene izveštaje, ko je nema ne vidi ih. Strana izveštaja ima dve strane: levo ono što izveštaj traži, desno ono što je vratio.

Levo stoje parametri, onim redom kojim su uneti. Parametar sa podrazumevanom vrednošću je već popunjen njom, parametar sa listom vrednosti se bira iz te liste, datum se bira iz kalendara, a da/ne se bira kao da ili ne. Parametar koji ne sme da ostane prazan nosi crvenu zvezdicu i dok svi takvi nisu popunjeni dugme je ugašeno; parametar označen kao *Nije obavezno* može da ostane prazan i tada se šalje kao ništa.

*Prikaži* onda pokreće izveštaj, a šta dugme piše zavisi od vrste izveštaja:

- **SELECT upit** — redovi koje upit vrati se prikažu desno. Dolaze svi odjednom: nema strana, a redosled je onaj koji daje sam upit. Pod kolonom decimalnih brojeva stoji njen zbir, po svim redovima koji su došli. *Izvoz u Excel* daje iste redove kao `.xlsx` fajl; fajl se pravi na serveru, od istih vrednosti parametara.
- **UPDATE upit ili procedura** — dugme piše *Pokreni*, i izveštaj odradi posao nad podacima. Nema šta da se prikaže, pa desna strana samo kaže da je izveštaj pokrenut.
- **Jasper izveštaj** — server popuni prevedeni `.jasper` fajl unetim vrednostima i od njega napravi PDF; dokument se prikaže desno, u istom čitaču kao svuda u Formuvia-i, sa svojim listanjem, uvećanjem, štampom i snimanjem. Ponovno *Prikaži* pravi izveštaj nad novim vrednostima, a dokument koji dođe dolazi na mesto onog desno.

Na telefonu dve strane idu jedna pod drugu: prvo ono što izveštaj traži, pa ono što je vratio, a svaki red odgovora je kartica sa nazivom kolone uz svaku vrednost. PDF stoji ispod parametara na isti način, visok koliko ekran dozvoljava.

## Izveštaj nad jednim zapisom je druga stvar

Izveštaji sa ove strane stoje sami za sebe: biraju se iz menija i prave se nad onim što izveštaj sam pročita iz baze.

Izveštaj koji se pravi nad **jednim zapisom jedne tabele** — faktura iz fakture koja je otvorena, karta komitenta koji se gleda — ne postavlja se ovde. On se stavlja na samu tabelu, u Modelu; vidi [Izveštaji tabele](/sr/model#izvestaji).
