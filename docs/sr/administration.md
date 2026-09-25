# Korisnici i uloge

Dva ekrana pod *Administracijom* odlučuju ko ulazi u Formuviu i šta sme kad uđe: **Korisnici** i **Uloge**.

Oba su obični ekrani sa tabelom, pa sve iz [Rada sa tabelama](/sr/tables) — filtriranje, sortiranje, istorija, export u Excel — važi i za njih.

## Uloge

Uloga je naziv za dozvolu. Ima **šifru**, po kojoj aplikacija proverava pravo pristupa, i **opis**, koji ljudi čitaju kad je dodeljuju.

Dve uloge postoje od početka:

| | |
|---|---|
| `admin` | administracija — implicitno ima sve ostale uloge |
| `user` | običan korisnik |

Svoje dodajete kako aplikacija raste. U [Modelu](/sr/model) svaka tabela dobija četiri odvojene uloge — pregled, unos, izmena, brisanje — i one se biraju iz ove liste, pa se isplati nazvati ih po onome što dozvoljavaju: `faktura_pregled`, `faktura_izmena`.

::: warning Brisanje uloge
Brisanje uloge je uklanja i sa svakog korisnika koji je ima. Formuvia to kaže pre nego što uradi.
:::

## Korisnici

Korisnik ima podatke za prijavu i kontakt, i skup uloga.

**Dodaj** otvara formu za nov nalog. Kad **menjate** postojeći, polje za lozinku se ponaša drugačije od ostalih: **ostavite ga prazno i trenutna lozinka ostaje**. Popunite ga samo kad zaista hoćete da postavite novu.

Lozinke se nikad ne vraćaju pregledaču, ni administratoru — polje je uvek prazno kad se forma otvori.

### Dodela uloga

Na dnu forme korisnika uloge stoje kao čipovi. Dodate jednu iz liste, uklonite je preko × na čipu. Korisnik može imati koliko god mu treba.

Ono što korisnik vidi sledi direktno iz ovoga: meni se gradi iz njegovih uloga, kao i to šta sme unutar svake tabele. Neko ko ima `faktura_pregled` a nema `faktura_brisanje` otvori fakture i u ⋯ meniju nema *Obriši*.

Pošto `admin` implicitno ima sve uloge, administrator vidi sve i nije mu potrebno dodeljivati ništa drugo.

## Promena sopstvene lozinke

Svako može promeniti svoju lozinku bez administratora: klik na svoje ime na dnu menija pa **Promena lozinke**. Nova lozinka se unosi dvaput i dva unosa moraju da se poklope.

## Sesije

Prijava postavlja sesiju koja se obnavlja dok radite. Kad ipak istekne, Formuvia vas vraća na stranu za prijavu; sve što je snimljeno je bezbedno.

Koliko sesija traje je podešavanje na serveru, izabrano pri instalaciji.
