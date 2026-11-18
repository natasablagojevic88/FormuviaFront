---
layout: home

hero:
  name: Formuvia
  text: Poslovne aplikacije nad PostgreSQL bazom
  tagline: Modelujte podatke, složite njihove forme, dodajte procedure i trigere baze, pravite izveštaje, rutinski posao prepustite zakazanim poslovima i pokrećite ih iz drugih sistema preko webhook-a — sve iz same aplikacije.
  actions:
    - theme: brand
      text: Počnite ovde
      link: /sr/getting-started
    - theme: alt
      text: Napravite tabelu
      link: /sr/model

features:
  - title: Tabele bez programera
    details: Dodate tabelu u model i Formuvia je napravi u bazi, sa njenim poljima, vezama i ulogama koje smeju da je koriste. Bez migracija i bez ponovnog deploy-a.
    link: /sr/model
  - title: Forma se slaže klikom
    details: Svako polje postavite u mrežu, date mu podrazumevanu vrednost ili listu vrednosti iz baze, prepustite bazi da izračuna vrednost i zaključate polje dok ne važi uslov.
    link: /sr/form-design
  - title: Logika ostaje u bazi
    details: Na tabelu stavite proceduru baze i pokrenite je nad zapisom, ili triger koji baza pokreće pri svakom upisu.
    link: /sr/model#procedure
  - title: Izveštaji
    details: Upit, procedura ili Jasper izveštaj, sa parametrima i listama za izbor — prikazan u tabeli, izvezen u Excel ili predat kao PDF.
    link: /sr/reports
  - title: Posao koji ide sam
    details: Posao šalje izveštaj poštom, upisuje ga u fajl ili uvozi popunjene Excel šablone iz foldera, po svom rasporedu ili preko webhook-a iz drugog sistema.
    link: /sr/jobs
  - title: Svaka tabela radi isto
    details: Filtriranje, napredna pretraga, sortiranje, zbirovi, izmena pravo u listi, istorija svakog zapisa, export u Excel i Excel šablon za unos.
    link: /sr/tables
---

## Šta je Formuvia

Formuvia je platforma za poslovne aplikacije nad PostgreSQL bazom, koju oblikujete iz same aplikacije.

Opišete šta vam treba — meni, tabelu, polja na njenoj formi — a Formuvia napravi tabelu u bazi: kolone, strane ključeve, ograničenja. Nema skripte za migraciju i nema ponovnog deploy-a. Tabela dodata u **Modelu** postoji u bazi onog trenutka kad je snimite, pojavljuje se u meniju i otvara kao lista sa svojom formom.

Poslovna pravila ostaju tamo gde su podaci. Polje može da dobije vrednost iz funkcije baze dok se zapis unosi, procedura se pokreće nad zapisom iz njegovog menija, a triger radi pri svakom upisu, a da ga niko ne traži.

Nad podacima stoje **izveštaji** — upiti, procedure i Jasper izveštaji, sa parametrima — i **poslovi** koji ih pokreću po rasporedu: izveštaj odlazi poštom ili u fajl, popunjeni Excel šabloni se uvoze iz foldera, a drugi sistem može da pokrene bilo koji posao preko webhook-a.

Oko svega toga stoji ono što poslovnoj aplikaciji ionako treba: nalozi i uloge, zapis o svakoj izmeni, filtriranje, sortiranje i zbirovi koje radi server, i export u Excel onoga što trenutno gledate.

## Kome je ovo uputstvo namenjeno

- **Ako unosite i pretražujete podatke**, pročitajte [Prijavu](/sr/getting-started) i [Rad sa tabelama](/sr/tables). To je sve što vam treba.
- **Ako gradite aplikaciju**, nastavite sa [Modelom](/sr/model) i [Dizajnom forme](/sr/form-design), ljude podesite u [Administraciji](/sr/administration), izveštaje aplikacije napišite u [Izveštajima](/sr/reports), a ono što ide samo pratite u [Poslovima](/sr/jobs).

## Dokle je Formuvia stigla

Formuvia se još razvija, a ovo uputstvo opisuje ono što stvarno radi, ne ono što je planirano. Gde se nešto već može definisati, a još nema dejstvo, strana to kaže u okviru sa naslovom *Šta danas ima dejstvo*.

## Pre nego što počnete

Treba vam adresa na kojoj Formuvia radi i nalog. Prvi nalog je `admin`, napravljen pri prvom pokretanju sistema — lozinku mu je postavio onaj ko je Formuviu instalirao.

Instalacija i deploy opisani su u samim repozitorijumima: [FormuviaFront](https://github.com/natasablagojevic88/FormuviaFront#installation) za web klijent i [Formuvia](https://github.com/natasablagojevic88/Formuvia#installation) za server.
