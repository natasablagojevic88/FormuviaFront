# Model: meniji i tabele

**Model** je mesto gde živi sama struktura Formuvie. Ono što ovde dodate postaje stavka menija sa leve strane, a za tabelu i prava tabela u bazi.

Do njega se stiže preko *Administracija / Model*. To je drvo, i to drvo jeste aplikacija.

::: warning
Sve na ovoj strani menja bazu. Dodavanje tabele je pravi, brisanje tabele je briše sa svim što je u njoj. Pročitajte [Brisanje](#brisanje) pre nego što upotrebite ⋯ → *Obriši*.
:::

## Kako se drvo gradi

::: info Šta danas ima dejstvo
Tabela dodata ovde zaista se pravi u bazi, sa svojom šifrom, kolonama i dozvolama, i [Dizajn forme](/sr/form-design) radi nad njom. Ono što još nije gotovo jeste sopstveni ekran tabele: ne pojavljuje se u navigaciji, a dijalog za unos se čuva ali se još ne iscrtava. Veličina koju podesite ispod sačuvana je za trenutak kad se to pojavi.
:::

Koren je **Model**. Ispod njega su pravila fiksna:

- ispod korena idu **meniji** — meni samo grupiše stvari u navigaciji, nema sopstvene podatke
- ispod menija idu **tabele**
- ispod tabele idu **podtabele** — tabela čiji zapisi pripadaju zapisu tabele iznad

Podtabela je ono što u ⋯ meniju reda pravi *Povezane tabele*: otvorite kupca i stignete do njegovih porudžbina. Lanac može biti dubok koliko treba.

Svaki red drveta ima dugme **+** koje dodaje odgovarajuće dete — *Dodaj meni*, *Dodaj tabelu* ili *Dodaj podtabelu*, u zavisnosti od toga gde ste — i dugme ⋯ sa stavkama *Izmeni*, *Obriši*, *Dizajn forme* (samo za tabele) i *Istorija*.

## Dodavanje menija

Meniju trebaju samo **naziv** i **ikona**. Naziv je ono što ljudi vide u navigaciji, a ikona se bira iz liste sa pretragom.

## Dodavanje tabele

Tabeli treba više, jer je tabela stvarna.

### Naziv i šifra

**Naziv** je ono što se čita. **Šifra** je naziv tabele u bazi: mala slova, cifre i donja crta, počinje slovom, najviše 56 znakova.

Birajte šifru pažljivo — kad tabela jednom postoji u bazi, ne može da se preimenuje i polje je od tada zaključano.

### Ko šta sme

Tabela ima četiri uloge, i one su namerno odvojene:

| | |
|---|---|
| **Uloga za pregled** | sme da otvori tabelu i čita je |
| **Uloga za unos** | sme da unosi nove zapise |
| **Uloga za izmenu** | sme da menja postojeće zapise |
| **Uloga za brisanje** | sme da briše zapise |

Neko može imati pravo da unosi porudžbine a da ih ne sme brisati. Same uloge se vode u [Korisnicima i ulogama](/sr/administration).

### Dijalog za unos

Poslednji deo opisuje formu za unos podataka u ovu tabelu — koliko je široka i koliko mesta ima za polja:

- **Širina dijaloga** u pikselima, najmanje 400
- **Broj kolona u dijalogu** — od 1 do 12
- **Broj redova u dijalogu** — najmanje 1

Pregled ispod polja prikazuje mrežu dok menjate brojeve. Ovde još ne postavljate polja; to je [Dizajn forme](/sr/form-design). Ovde samo odlučujete koliko je forma velika.

::: tip
Ako tabela već ima polja, mreža ne može da se smanji ispod onoga što ta polja zauzimaju. Formuvia kaže koji je najmanji broj koji još staje. Prvo pomerite ili obrišite polja, pa onda smanjite mrežu.
:::

Tabela se pravi u bazi onog trenutka kad snimite.

## Izmena

⋯ → *Izmeni* otvara istu formu. Naziv, opis, ikona, uloge i veličina dijaloga za unos mogu se menjati kad god.

**Šifra ne može** — tabela u bazi postoji pod tim imenom.

## Brisanje

⋯ → *Obriši* nad tabelom **briše tabelu iz baze zajedno sa svim zapisima u njoj**. To se ne može poništiti, i Formuvia to kaže pre nego što uradi.

Meni koji još ima stavke ispod sebe ne može da se obriše; prvo obrišite ono što je u njemu.

## Istorija

⋯ → *Istorija* prikazuje izmene nad tim čvorom modela — ko je dodao tabelu, ko je menjao njene uloge, ko je proširio njen dijalog i kada. Ista ona istorija koju ima i svaki običan zapis.

## Šta dalje

Tabela sada postoji, ali još nema polja. Otvorite ⋯ → **Dizajn forme** i postavite ih.
