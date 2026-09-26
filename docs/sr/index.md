---
layout: home

hero:
  name: Formuvia
  text: Tabele definišete iz same aplikacije
  tagline: Opišete tabelu i njena polja na ekranu, a Formuvia ih napravi u bazi — bez migracija i bez ponovnog deploy-a.
  actions:
    - theme: brand
      text: Počnite ovde
      link: /sr/getting-started
    - theme: alt
      text: Rad sa tabelama
      link: /sr/tables

features:
  - title: Tabele bez programera
    details: Dodate tabelu u model i Formuvia je napravi u bazi, sa njenim poljima, vezama i ulogama koje smeju da je koriste.
    link: /sr/model
  - title: Forma se slaže klikom
    details: Svako polje postavite u mrežu, izaberete tip podatka, date mu podrazumevanu vrednost ili listu vrednosti iz baze.
    link: /sr/form-design
  - title: Svaka tabela radi isto
    details: Filtriranje, napredna pretraga, sortiranje, straničenje, izmena u tabeli, istorija i export u Excel.
    link: /sr/tables
---

## Šta je Formuvia

Formuvia je aplikacija koju oblikujete iz nje same.

Opišete šta vam treba — meni, tabelu, polja na njenoj formi — a Formuvia napravi tabelu u bazi: kolone, strane ključeve, ograničenja. Nema skripte za migraciju i nema ponovnog deploy-a. Tabela dodata u **Modelu** postoji u bazi onog trenutka kad je snimite.

Oko toga stoji ono što poslovnoj aplikaciji ionako treba: nalozi i uloge, zapis o svakoj izmeni, filtriranje i sortiranje koje radi server, i export u Excel onoga što trenutno gledate.

## Kome je ovo uputstvo namenjeno

- **Ako unosite i pretražujete podatke**, pročitajte [Prijavu](/sr/getting-started) i [Rad sa tabelama](/sr/tables). To je sve što vam treba.
- **Ako gradite aplikaciju**, nastavite sa [Modelom](/sr/model) i [Dizajnom forme](/sr/form-design), a ljude podesite u [Korisnicima i ulogama](/sr/administration).

## Dokle je Formuvia stigla

Formuvia se još razvija, a ovo uputstvo opisuje ono što stvarno radi, ne ono što je planirano. Dve stvari vredi znati pre nego što počnete:

- **Ugrađeni ekrani** — Korisnici, Uloge i Model — su gotovi, kao i podtabele do kojih se stiže iz ⋯ menija reda.
- Tabela koju definišete u **Modelu** pravi se u bazi, pojavljuje se u meniju i otvara kao lista koja se filtrira, sortira, straniči i izvozi u Excel. Zapisi se unose, menjaju i brišu kroz formu koju ste složili u [Dizajnu forme](/sr/form-design). Dugme ⋯ na redu otvara istoriju tog zapisa, kao i svuda drugde. Ono što takva tabela još nema jeste izmena u samoj listi (dvoklik i *Brza izmena*) i podtabele u meniju.

Svaka strana uputstva kaže koji delovi onoga što definišete već imaju dejstvo.

## Pre nego što počnete

Treba vam adresa na kojoj Formuvia radi i nalog. Prvi nalog je `admin`, napravljen pri prvom pokretanju sistema — lozinku mu je postavio onaj ko je Formuviu instalirao.

Instalacija i deploy opisani su u samim repozitorijumima: [FormuviaFront](https://github.com/natasablagojevic88/FormuviaFront#installation) za web klijent i [Formuvia](https://github.com/natasablagojevic88/Formuvia#installation) za server.
