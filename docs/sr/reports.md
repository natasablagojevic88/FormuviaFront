# Izveštaji

**Izveštaji** su ono što Formuvia pravi iz onoga što je u bazi: spisak podataka, posao nad tim podacima ili dokument koji se predaje kao PDF. Do njih se stiže preko *Administracija / Izveštaji*.

Izveštaj uvek pripada **grupi**. Grupa stoji zbog dve stvari: drži izveštaje urednim i kaže kome su dostupni — grupa nosi jednu ulogu, a izveštaje iz nje dobija samo korisnik koji tu ulogu ima.

::: info Šta danas ima dejstvo
Grupe, izveštaji i parametri se čuvaju, prikazuju, menjaju i brišu, a izveštaj prve dve vrste može i da se pokrene iz menija. Na serveru se dovršavaju dve stvari: fajl Jasper izveštaja, pa se takav izveštaj još ne predaje kao PDF, i vrednosti parametara, koje se čitaju onako kako stignu — parametar tipa datum, vreme ili veza na šifarnik se zato za sada odbija uz poruku o tipovima, dok tekst, brojevi i da/ne prolaze.
:::

## Grupe

Spisak prikazuje naziv grupe i ulogu koja uz nju ide. To je isti spisak kao svuda u Formuvia-i: pretraga, sortiranje, strane, izvoz u Excel i ⋯ na redu sa *Izveštajima*, *Istorijom* i *Obriši*. Naziv grupe može i da se menja pravo u spisku — *Režim izmene* u toolbar-u ili dvoklik na ćeliju.

### Dodavanje grupe

*Dodaj* traži dve stvari:

- **Naziv** — ono što ljudi čitaju nad izveštajima grupe. Dve grupe ne mogu nositi isti naziv; Formuvia to kaže kad je naziv zauzet.
- **Uloga** — uloga koja sme da čita izveštaje grupe. Uloge se vode u [Korisnicima i ulogama](/sr/administration).

Oba su obavezna. Izborom uloge je pravilo pristupa završeno: ko ima tu ulogu dobija izveštaje grupe, ko je nema ne vidi ih nikada.

### Izmena i brisanje grupe

⋯ → *Izmeni* otvara istu formu; i naziv i uloga mogu da se menjaju kad god, a promena uloge od tog trenutka menja i to kome su izveštaji dostupni. ⋯ → *Obriši* skida grupu zajedno sa izveštajima u njoj.

## Izveštaji grupe

⋯ → **Izveštaji** na grupi otvara izveštaje te grupe. *Nazad* u zaglavlju vodi ponovo na spisak grupa.

Spisak prikazuje vrstu, naziv i opis svakog izveštaja grupe. *Dodaj* i *Izmeni* otvaraju njegovu formu, a ⋯ na redu nosi *Parametre*, *Istoriju* i *Obriši*. Vrsta, naziv, opis i sam upit mogu i da se menjaju pravo u spisku, isto kao u grupama; za duži upit je forma udobnija.

### Šta izveštaj može da bude

**Vrsta** odlučuje šta izveštaj radi, a forma to prati:

| | |
|---|---|
| **SELECT upit** | jedan `SELECT`; izveštaj prikazuje redove koje upit vrati |
| **UPDATE upit ili procedura** | jedan `CALL`, `UPDATE`, `INSERT` ili `DELETE`; izveštaj odradi posao i kaže kako je prošlo |
| **Jasper izveštaj** | izveštaj preveden u Jaspersoft Studiju (`.jasper`), predaje se kao PDF |

### Dodavanje izveštaja

- **Naziv** — ono što ljudi čitaju u spisku grupe. Dva izveštaja iste grupe ne mogu nositi isti naziv.
- **Vrsta** — jedna od tri gore.
- **Opis** — nije obavezan, red o tome čemu izveštaj služi.
- **Upit** — traže ga samo prve dve vrste. Čita se u trenutku snimanja: mora biti jedna naredba, one vrste koju vrsta dozvoljava, i posle tačke i zapeta ne sme da stoji ništa. Upit koji se ne može pročitati, upit pogrešne vrste i druga naredba podmetnuta posle prve — svaki se odbija, sa objašnjenjem.

Jasper izveštaj nema upit; njegov `.jasper` fajl se ovde još ne šalje.

## Parametri izveštaja

⋯ → **Parametri** na izveštaju otvara parametre tog izveštaja. *Nazad* u zaglavlju vodi ponovo na izveštaje grupe.

Parametar je ono što izveštaj traži pre pokretanja: datum od kog se gleda, komitent, ogranak. U upitu stoji kao `:sifra`, tamo gde bi inače stajala vrednost:

```sql
select * from racun where datum >= :datum_od and komitent = :komitent
```

Spisak prikazuje redosled, tip podatka, šifru, naziv i da li je vrednost obavezna. *Dodaj* i *Izmeni* otvaraju formu, ⋯ na redu nosi *Istoriju* i *Obriši*, a sve se može menjati i pravo u spisku.

- **Šifra** — ono pod čim parametar stoji u upitu, bez dvotačke. Dozvoljena su mala slova, cifre i donja crta, a šifra počinje slovom — isto pravilo kao za šifru kolone u Modelu. Šifra mora stvarno da stoji u upitu: parametar koji se u upitu ne pojavljuje se ne prima, jer izveštaj onda ne bi mogao da se pokrene. Dva parametra istog izveštaja ne mogu nositi istu šifru.
- **Naziv** — ono što čita onaj ko pokreće izveštaj, nad poljem za unos.
- **Tip podatka** — koja se vrednost traži: tekst, broj, datum, da/ne, veza na šifarnik. Fajl ne može da se traži.
- **Redosled** — kojim redom se parametri traže. Nudi se prvi slobodan broj, a dva parametra istog izveštaja ne mogu imati isti.
- **Nije obavezno** — izveštaj može da se pokrene i bez te vrednosti.
- **Podrazumevana vrednost (SQL)** — `SELECT` upit sa tačno jednom kolonom; njegova vrednost se nudi u polju kad se izveštaj zatraži, na primer `select now()`. Može ostati prazno.
- **Lista vrednosti (SQL)** — `SELECT` upit sa tačno dve kolone: prva je vrednost koja se koristi, druga je tekst koji se vidi u spisku, na primer `select id, naziv from partner order by naziv`. Prazno znači slobodan unos.

Oba upita se čitaju pri snimanju, po istom pravilu kao kod kolone u Modelu: moraju biti `SELECT`, bez `*`, sa tačno jednom odnosno tačno dve kolone.

Jasper izveštaj svoje parametre nosi u samom `.jasper` fajlu, pa se za njega i ne proverava da li šifra stoji u upitu — upita nema.

## Pokretanje izveštaja

Svaki izveštaj stoji u meniju, pod nazivom svoje grupe: ko ima ulogu grupe vidi njene izveštaje, ko je nema ne vidi ih. Strana izveštaja ima dve strane: levo ono što izveštaj traži, desno ono što je vratio.

Levo stoje parametri, onim redom kojim su uneti. Parametar sa podrazumevanom vrednošću je već popunjen njom, parametar sa listom vrednosti se bira iz te liste, datum se bira iz kalendara, a da/ne se bira kao da ili ne. Parametar koji ostane prazan se šalje kao ništa.

*Prikaži* onda pokreće izveštaj, a šta dugme piše zavisi od vrste izveštaja:

- **SELECT upit** — redovi koje upit vrati se prikažu desno. Dolaze svi odjednom: nema strana, a redosled je onaj koji daje sam upit. Pod kolonom decimalnih brojeva stoji njen zbir, po svim redovima koji su došli. *Izvoz u Excel* daje iste redove kao `.xlsx` fajl; fajl se pravi na serveru, od istih vrednosti parametara.
- **UPDATE upit ili procedura** — dugme piše *Pokreni*, i izveštaj odradi posao nad podacima. Nema šta da se prikaže, pa desna strana samo kaže da je izveštaj pokrenut.
- **Jasper izveštaj** — još se ne pokreće odavde; desna strana to i kaže.

Na telefonu dve strane idu jedna pod drugu: prvo ono što izveštaj traži, pa ono što je vratio, a svaki red odgovora je kartica sa nazivom kolone uz svaku vrednost.

## Izveštaj nad jednim zapisom je druga stvar

Izveštaji sa ove strane stoje sami za sebe: biraju se iz menija i prave se nad onim što izveštaj sam pročita iz baze.

Izveštaj koji se pravi nad **jednim zapisom jedne tabele** — faktura iz fakture koja je otvorena, karta komitenta koji se gleda — ne postavlja se ovde. On se stavlja na samu tabelu, u Modelu; vidi [Izveštaji tabele](/sr/model#izvestaji).
