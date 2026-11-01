# Administracija

Ekrani pod *Administracijom* odlučuju ko ulazi u Formuviu i šta sme kad uđe — **Korisnici** i **Uloge** — i drže podešavanja same aplikacije, kao što su **serveri za poštu** preko kojih šalje.

Korisnici i uloge su obični ekrani sa tabelom, pa sve iz [Rada sa tabelama](/sr/tables) — filtriranje, sortiranje, istorija, export u Excel — važi i za njih.

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

## Serveri za poštu

*Administracija / Serveri za poštu* čuva servere preko kojih aplikacija šalje poštu: probnu poruku iz menija reda, i sve što [posao izveštaja](/sr/reports#poslovi-izvestaj-koji-ide-sam) šalje sam — izveštaj, i javljanje o poslu koji nije prošao. To je obična tabelarna strana, pa pretraga, sortiranje, strane, istorija i izvoz u Excel rade kao i svuda.

*Dodaj* traži:

- **Naziv** — kako se server zove unutar Formuvia-e. Dva servera ne mogu nositi isti naziv.
- **Pošiljalac** — adresa sa koje pošta odlazi, na primer `info@firma.rs`.
- **Server** — adresa servera za poštu, na primer `smtp.gmail.com`.
- **Port** — broj na kom server sluša: najčešće 25 bez zaštite, 587 za STARTTLS i 465 za SSL/TLS.
- **Zaštita** — kako je veza zaštićena: *Bez zaštite*, *STARTTLS* ili *SSL/TLS*.
- **Prijava** — uključuje se kad server traži korisnika. Tada se traže i **korisničko ime** i **lozinka**.

Lozinka se samo upisuje: sa servera nikad ne izlazi, pa je polje prazno svaki put kad se forma otvori. Ostavljena prazna pri izmeni, sačuvana lozinka ostaje kakva je; mora se uneti kad server tek počne da se prijavljuje. Isključena *Prijava* briše i korisničko ime i lozinku.

### Proba servera

U ⋯ meniju reda stoji **Probna pošta**. Traži jednu adresu i aplikacija preko tog servera pošalje jednu jedinu poruku. Ako poruka stigne, podešavanja su dobra.

Ako server ne primi poruku, crvena poruka nosi ono što je sam server rekao — najčešće se svede na pogrešan port, pogrešnu vrstu zaštite ili korisničko ime i lozinku koje server nije prihvatio. Svaka proba se upisuje na serveru, i uspela i neuspela, zajedno sa razlogom.

## Promena sopstvene lozinke

Svako može promeniti svoju lozinku bez administratora: klik na svoje ime na dnu menija pa **Promena lozinke**. Nova lozinka se unosi dvaput i dva unosa moraju da se poklope.

## Sesije

Prijava postavlja sesiju koja se obnavlja dok radite. Kad ipak istekne, Formuvia vas vraća na stranu za prijavu; sve što je snimljeno je bezbedno.

Koliko sesija traje je podešavanje na serveru, izabrano pri instalaciji.
