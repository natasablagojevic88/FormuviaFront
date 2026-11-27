# Model: meniji i tabele

**Model** je mesto gde živi sama struktura Formuvie. Ono što ovde dodate postaje stavka menija sa leve strane, a za tabelu i prava tabela u bazi.

Do njega se stiže preko *Administracija / Model*. To je drvo, i to drvo jeste aplikacija.

::: warning
Sve na ovoj strani menja bazu. Dodavanje tabele je pravi, brisanje tabele je briše sa svim što je u njoj. Pročitajte [Brisanje](#brisanje) pre nego što upotrebite ⋯ → *Obriši*.
:::

## Kako se drvo gradi

Koren je **Model**. Ispod njega su pravila fiksna:

- ispod korena idu **meniji** — meni samo grupiše stvari u navigaciji, nema sopstvene podatke
- ispod menija idu **tabele**
- ispod tabele idu **podtabele** — tabela čiji zapisi pripadaju zapisu tabele iznad

Podtabela je ono što u ⋯ meniju reda pravi *Povezane tabele*: otvorite kupca i stignete do njegovih porudžbina. Lanac može biti dubok koliko treba.

Svaki red drveta ima dugme **+** koje dodaje odgovarajuće dete — *Dodaj meni*, *Dodaj tabelu* ili *Dodaj podtabelu*, u zavisnosti od toga gde ste — i dugme ⋯ sa stavkama *Izmeni*, *Obriši*, *Dizajn forme* i *[Procesi](/sr/processes)* (samo za tabele), *Uvoz iz foldera* (samo tabela direktno ispod menija) i *Istorija*.

![Drvo modela sa otvorenim ⋯ menijem tabele](/screenshots/sr/model-tree.png)

## Dodavanje menija

Meniju trebaju samo **naziv** i **ikona**. Naziv je ono što ljudi vide u navigaciji, a ikona se bira iz liste sa pretragom.

![Dijalog Dodaj meni](/screenshots/sr/model-add-menu.png)

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

Neko može imati pravo da unosi porudžbine a da ih ne sme brisati. Same uloge se vode u [Korisnicima i ulogama](/sr/administration#uloge).

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

![Dijalog Dodaj tabelu kod dijaloga za unos, sa pregledom mreže i četiri uloge](/screenshots/sr/model-add-table.png)

### Procedure

U dnu dijaloga stoje **Procedure**: procedure baze koje se mogu pokrenuti nad jednim zapisom ove tabele. Procedura je posao koji baza radi sama — preračunavanje dokumenta, zatvaranje perioda, numerisanje fakture — a Formuvia je samo okida i prikazuje rezultat.

Ovaj deo se pojavljuje kad je tabela sačuvana. **Dodaj proceduru** traži tri stvari:

- **Naziv** — ono što korisnik vidi u ⋯ meniju liste. Dajte naziv koji kaže šta radi: *Preračunaj*, *Zatvori*.
- **Ikona** — sličica koja stoji uz taj naziv u meniju, bira se isto kao ikona tabele. Ako se ostavi prazna, procedura dobija zupčanike.
- **Procedura baze** — bira se među procedurama koje baza ima. Ovde može da stoji samo procedura koja prima **jedan parametar, identifikator zapisa**; naziv koji baza ne poznaje Formuvia odbija.

Klik na proceduru u spisku je otvara za izmenu, a korpa je skida sa tabele. Skidanjem se briše samo stavka u Formuvia-i — sama procedura ostaje u bazi.

Ko sme da je pokrene prati tabelu: ista uloga koja sme da **menja** zapis sme i da pokrene proceduru nad njim, jer to procedura i radi. Nudi se na dva mesta: u ⋯ meniju liste i u ježičku pored dugmeta *Sačuvaj* u dijalogu za unos. Kako se pokreće piše u [Rad sa tabelama](/sr/tables#sta-jos-red-moze).

### Trigeri

Ispod procedura stoje **Trigeri**: funkcije baze koje baza sama pokreće kad se upisuje red ove tabele. Ništa u Formuvia-i ih ne okida — za njih nema ni dugmeta ni stavke u meniju. Triger je za ono što mora da se odigra svaki put, bez obzira na to ko upisuje red i odakle: upis zbira u zaglavlje, pečat na zapisu, odbijanje vrednosti koju forma sama ne može da proveri.

Ovaj deo se pojavljuje kad je tabela sačuvana. **Dodaj triger** traži naziv, trenutak, radnju i funkciju, a uslovom može i da se suzi:

- **Naziv** — naziv koji triger dobija u bazi: mala slova, cifre i donja crta, počinje slovom. Posle se ne menja; da bi se preimenovao, obriše se i doda ponovo. Dva naziva su zauzeta: `create_audit` i `table_listen` stoje na svakoj tabeli zbog istorije i javljanja izmene, pa ih Formuvia odbija.
- **Kada** — *Pre upisa* ili *Posle upisa*. Pre upisa funkcija još drži red u rukama i može da ga promeni ili odbije; posle upisa red je već zapisan i funkcija radi oko njega. Između toga nema ničega, a kad dva trigera stoje na istom trenutku, baza odlučuje kojim redom se pokreću — pa na taj red ne treba računati.
- **Na** — šta ga okida: unos, izmena, oboje, brisanje ili bilo šta od toga troje.
- **Funkcija baze** — bira se među funkcijama koje baza ima i koje **vraćaju `trigger`**. Takva funkcija ne prima parametre i radi nad `NEW` i `OLD`. Naziv koji baza ne poznaje Formuvia odbija.
- **Uslov** — nije obavezan, piše se nad `NEW` i `OLD` bez `WHEN`, na primer `NEW.iznos <> OLD.iznos`. Ako se ostavi prazan, triger radi nad svakim redom.

Klik na triger u spisku ga otvara za izmenu, a korpa ga skida sa tabele. Skidanje trigera **briše ga i iz baze** — to je razlika od procedure, gde se briše samo stavka u Formuvia-i. Sama funkcija u bazi ostaje u oba slučaja.

Ono što triger upiše odmah je u zapisu: dijalog za unos se posle snimanja ponovo popunjava, pa vrednost koju je baza upisala stoji u formi i u listi, a da je niko nije tražio.

### Izveštaji

Poslednji deo su **Izveštaji**: JasperReports izveštaji vezani za ovu tabelu, svaki se pravi nad jednim njenim redom.

Ovaj deo se pojavljuje kad tabela bude sačuvana. **Dodaj izveštaj** traži dve stvari:

- **Naziv izveštaja** — ono što korisnik čita nad zapisom. Jedinstven je u okviru tabele.
- **Fajl izveštaja** — izveštaj preveden u Jaspersoft Studiju, onaj sa ekstenzijom `.jasper`; izvorni `.jrxml` se ne prima. Fajl se čita u trenutku slanja i prihvata se samo ako je zaista preveden izveštaj i ako ima parametar **`id` tipa `Object`** — taj parametar je zapis nad kojim se izveštaj pravi. Sve drugo se odbija, sa objašnjenjem. Identifikator se predaje kakav je, pa upit izveštaja kaže šta je: `where id = cast($P{id} as uuid)`.

Klik na izveštaj u spisku ga otvara za izmenu. Izmena samo naziva zadržava postojeći fajl, a izbor novog fajla ga zamenjuje. Korpa skida izveštaj sa tabele i sa njim ide i fajl izveštaja.

Izveštaj se zatim nudi u ⋯ meniju svakog reda te tabele, pod svojim nazivom: kad ga izaberete, pravi se nad tim zapisom, a gotov PDF se otvori u čitaču unutar aplikacije. Nudi se svakome ko sme da čita tabelu, jer pravljenje izveštaja ništa ne menja. Ježičak pored dugmeta *Sačuvaj* u dijalogu za unos nudi iste te, kao *Sačuvaj i štampaj*: zapis se snimi i izveštaj se odmah napravi nad njim. Vidi [Šta još red može](/sr/tables#sta-jos-red-moze).

::: tip
Ako u izveštaju ne navedete font, dobiće onaj koji server nudi, a u njemu ima š, đ, č, ć i ž. Izveštaj koji navede svoj font traži taj isti font i na serveru; ako ga tamo nema, pravljenje izveštaja pukne i kaže koji font fali.
:::

## Uvoz iz foldera

Tabela može da dobija podatke i iz fajlova, ne samo od ljudi. ⋯ → **Uvoz iz foldera** na tabeli otvara poslove koji to rade: svaki u zadato vreme pogleda u folder na serveru, uzme popunjene [šablone za unos](/sr/tables#sablon-za-unos) ove tabele koje tamo nađe i upiše njihove redove u tabelu. Ko god pravi podatke — drugi program, kolega, izvoz iz starog sistema — treba samo da ostavi fajl u tom folderu.

Stavka stoji samo na tabeli koja je direktno ispod menija. Podtabela je nema: njeni redovi pripadaju zapisu tabele iznad nje, a fajl ostavljen u folderu ne može da kaže kom zapisu.

### Kako ide

Strana to kaže na vrhu, pod *Kako radi uvoz*, i uvek su to ista četiri koraka:

1. **Popunite šablon.** Preuzima se iz liste tabele dugmetom *Šablon* i popunjava kao i inače. Preuzmite ga ponovo kad se promeni dizajn forme, inače uvoz neće prepoznati njegove kolone.
2. **Stavite fajl u folder posla.** Uzimaju se samo `.xlsx` fajlovi. Kad posao ima naziv fajla, uzimaju se samo fajlovi čije ime počinje njime: uz `konta` ulaze i `konta.xlsx` i `konta-mart.xlsx`, a `racuni.xlsx` ne.
3. **Posao ga uvozi** — u vreme zadato rasporedom, odmah dugmetom ▶ na strani [Poslovi](/sr/jobs), ili kad drugi program pozove njegov webhook.
4. **Proverite ishod.** Fajl koji je ušao premešta se u folder `backup` unutar foldera posla; fajl koji nije ušao premešta se u `error`. U oba slučaja ga više nema u folderu, pa ga sledeće pokretanje ne uzima ponovo.

Svaki fajl ulazi **u celini**, isto kao kod *Uvoza* u listi: ako jedan red nije prihvaćen, iz tog fajla se ne upisuje ništa. Ostali fajlovi istog pokretanja zbog toga ne čekaju. Pokretanje u kom neki fajl nije ušao označeno je sa *Nije prošao*, njegova greška navodi te fajlove i stiže na adresu za greške posla.

Greška posla kaže koji fajl, ne i koji red. Da vidite red i šta u njemu ne valja, uvezite isti taj fajl ručno dugmetom *Uvoz* u listi tabele — tamošnja poruka to kaže — pa ispravite fajl i vratite ga u folder posla.

::: tip
Strana se otvara sa raširena četiri koraka dok tabela još nema nijedan posao, a sa skupljenim čim ga ima, da lista dobije prostor. Klik na naslov ih otvara ili skuplja; strana pamti izbor.
:::

### Forma posla uvoza

*Dodaj* otvara kraću formu od one za izveštaj: posao uvoza samo uvozi, pa mu se vrsta ne bira, i ništa o pošti ili vrsti fajla se ne pita.

- **Naziv** — pod njim posao stoji u rasporedu i posle se ne menja, isto kao kod [poslova izveštaja](/sr/reports#poslovi-izvestaj-koji-ide-sam).
- **Folder** — folder **na serveru**, napisan ceo, na primer `/var/formuvia/import/konta`. Ne folder na vašem računaru: posao radi na serveru i tamo gleda. Server mora smeti da čita folder i da piše u njega, jer sam pravi `backup` i `error` u njemu.
- **Naziv fajla** — nije obavezan. Uvoze se samo fajlovi čije ime počinje njime; ako ostane prazan, uvozi se svaki `.xlsx` iz foldera.
- **Server za poštu** i **Adresa za greške** — kuda ide vest kad pokretanje ne prođe; bez njih se greška samo upiše.
- **Uloga**, **Uključen** i **raspored** — isto kao kod svakog drugog posla; vidi [Kada se pokreće](/sr/reports#kada-se-pokrece).

Posao upisuje redove ne pitajući za ulogu za dodavanje u tabelu: posao pravi administrator, a od tada svako ko može da stavi fajl u folder unosi podatke u tabelu. Folder birajte imajući to u vidu.

Webhook ključevi posla uvoza su u meniju reda, pod *Webhook*, isto kao kod posla izveštaja ([Pokretanje posla izvan aplikacije](/sr/jobs#pokretanje-posla-izvan-aplikacije)).

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
