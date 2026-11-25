# Procesi

**Proces** je put kojim ide zapis tabele kad se unese: ko treba da ga odobri, šta baza usput radi sa njim i ko se o tome obaveštava. Zahtev za nabavku, na primer, prvo ide šefu; ako je iznos veliki, ide dalje direktoru; kad se odobri, pravi se narudžbenica i obaveštava nabavka, a ako se odbije, obaveštava se onaj ko je tražio.

Tabela može imati više procesa. Do njih se stiže iz [Modela](/sr/model): ⋯ → **Procesi** na tabeli.

::: info Šta danas ima dejstvo
Procesi mogu da se nacrtaju, provere i sačuvaju, i ostaju uz tabelu. Zapisi još ne prolaze kroz njih: unos zapisa ne pokreće proces i niko ne dobija zadatak da prihvati ili odbije. Ova strana opisuje dizajner; praćenje pokrenutog procesa biće dodato kad zapisi počnu da prolaze kroz procese.
:::

## Spisak procesa

Strana prikazuje procese tabele po nazivu, sa početnom i završnom procedurom. *Dodaj* otvara dizajner za nov proces, *Izmeni* otvara dizajner za taj proces, a ⋯ → *Obriši* briše proces zajedno sa svim njegovim koracima.

## Dizajner

Dizajner ima dva dela: **tablu**, na kojoj se proces crta kao drvo odozgo nadole, i **panel** pored nje (ispod nje na telefonu), u kom se podešava kutija na koju ste kliknuli. Ništa ne ide na server dok ne kliknete **Sačuvaj** na vrhu; tačka na dugmetu kaže da ima nesačuvanih izmena, a *Nazad* pita pre nego što ih odbaci.

### Početak: naziv i procedure

Plava kutija na vrhu je sam proces. Kliknite je da procesu date **naziv**, koji mora biti jedinstven u tabeli, i, ako vam trebaju:

- **Početnu proceduru** — proceduru baze koja se izvršava kad proces krene
- **Završnu proceduru** — onu koja se izvršava kad proces stigne do bilo kog kraja

Obe se biraju iz procedura koje postoje u bazi. U istom panelu *Dodajte prvi korak* stavlja prvu kutiju ispod početka.

### Vrste koraka

Svaka kutija ispod početka je korak, i to jedne od tri vrste, svaka svoje boje:

- **Zadatak** (plavo) — jedan korisnik ga prihvata ili odbija. Izaberite **ko odlučuje** i **polja koja korisnik sme da menja** dok odlučuje; ostala polja zapisa ostaju kakva jesu.
- **Procedura** (ljubičasto) — izvršava se procedura baze i proces ide dalje.
- **Obaveštenje** (narandžasto) — izabrani **primaoci** dobijaju obaveštenje sa **naslovom** i **tekstom** koje napišete, i proces ide dalje.

Vrsta može da se promeni u panelu u svakom trenutku. Korak koji od zadatka postane nešto drugo zadržava korake posle sebe, ali oni više ne zavise od odluke.

Svaki korak mora imati naziv, i dva koraka istog procesa ne smeju imati isti.

### Grane i kraj

Šta dolazi posle koraka podešava se na dnu njegovog panela:

- posle **zadatka** postoje dve grane: **Posle prihvatanja** (zelena linija na tabli) i **Posle odbijanja** (crvena linija)
- posle bilo kog drugog koraka postoji jedna: **Posle ovog koraka** (siva linija)

U svakoj grani ili dodate sledeći korak — *Zadatak*, *Procedura* ili *Obaveštenje* — ili uključite **Završava proces**, što na tablu stavlja malu kutiju *Kraj*. Grana može da se podeli na više koraka; svaki od njih može imati **uslov za ulazak**, pa se ulazi samo u korake čiji uslov važi. Prekidač je zaključan dok u toj grani slede koraci: prvo ih obrišite da bi se proces tu završio.

**Uslov za ulazak (SQL)** je `SELECT`. Piše se u panelu koraka koji čuva i prikazuje se na liniji koja vodi do tog koraka. Ako je prazan, u korak se ulazi uvek.

### Šta još fali

Ispod table dizajner odjednom nabraja sve što bi server odbio: korak bez naziva, zadatak o kom niko ne odlučuje, obaveštenje bez primalaca, granu koja nikud ne vodi ili proces koji se nikad ne završava. Klik na stavku otvara korak na koji se odnosi; korak kom nešto fali nosi i narandžastu oznaku na tabli. Proces se čuva tek kad je spisak prazan i kaže da je proces potpun.

### Brisanje koraka

*Obriši korak* na dnu panela briše korak. Kad posle njega slede drugi koraci, brišu se zajedno sa njim, a dizajner pre toga kaže koliko ih je. Kao i svaka druga izmena u dizajneru, konačno je tek posle *Sačuvaj*.
