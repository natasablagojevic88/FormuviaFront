# Procesi

**Proces** je put kojim ide zapis tabele kad se unese: ko treba da ga odobri, šta baza usput radi sa njim i ko se o tome obaveštava. Zahtev za nabavku, na primer, prvo ide šefu; ako je iznos veliki, ide dalje direktoru; kad se odobri, pravi se narudžbenica i obaveštava nabavka, a ako se odbije, obaveštava se onaj ko je tražio.

Tabela može imati više procesa. Do njih se stiže iz [Modela](/sr/model): ⋯ → **Procesi** na tabeli.

::: info Šta danas ima dejstvo
Procesi mogu da se nacrtaju, provere i sačuvaju, i ostaju uz tabelu. Zapisi još ne prolaze kroz njih: unos zapisa ne pokreće proces i niko ne dobija zadatak da prihvati ili odbije. Ova strana opisuje dizajner; praćenje pokrenutog procesa biće dodato kad zapisi počnu da prolaze kroz procese.
:::

## Spisak procesa

Strana prikazuje procese tabele po nazivu, sa početnom i završnom procedurom. *Dodaj* otvara dizajner za nov proces, *Izmeni* otvara dizajner za taj proces, a ⋯ → *Obriši* briše proces zajedno sa svim njegovim koracima.

## Dizajner

Dizajner ima dva dela: **tablu**, na kojoj se proces crta odozgo nadole, i **panel** pored nje (ispod nje na telefonu), u kom se podešava kutija na koju ste kliknuli. Ništa ne ide na server dok ne kliknete **Sačuvaj** na vrhu; tačka na dugmetu kaže da ima nesačuvanih izmena, a *Nazad* pita pre nego što ih odbaci.

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

Svaki korak mora imati naziv, i dva koraka istog procesa ne smeju imati isti; polje za naziv to kaže čim upišete ime koje je zauzeto. Kad isti korak treba da dođe i posle nekog drugog koraka, ne pravite drugi sa istim imenom: povežite onaj koji već postoji, kako je opisano u [Korak posle više koraka](#korak-posle-vise-koraka).

### Grane i kraj

Šta dolazi posle koraka podešava se na dnu njegovog panela:

- posle **zadatka** postoje dve grane: **Posle prihvatanja** (zelena linija na tabli) i **Posle odbijanja** (crvena linija)
- posle bilo kog drugog koraka postoji jedna: **Posle ovog koraka** (siva linija)

U svakoj grani ili dodate sledeći korak — *Zadatak*, *Procedura* ili *Obaveštenje* — ili uključite **Završava proces**, što na tablu stavlja malu kutiju *Kraj*. Grana može da se podeli na više koraka; svaki od njih može imati **uslov za ulazak**, pa se ulazi samo u korake čiji uslov važi. Prekidač je zaključan dok u toj grani slede koraci: obrišite ih, ili uklonite njihove strelice, da bi se proces tu završio.

**Uslov za ulazak (SQL)** je `SELECT`. Piše se u panelu koraka koji čuva i prikazuje se na liniji koja vodi do tog koraka. Ako je prazan, u korak se ulazi uvek.

### Korak posle više koraka

Ispod *Dodajte sledeći korak* postoji i **Ili korak koji već postoji**: grana tada ide na korak koji je već na tabli umesto na nov. Taj korak sada dolazi posle više koraka; ostaje jedna kutija, sa linijom od svakog od njih. Nude se samo koraci koji ne bi zatvorili krug — nikad sam korak ni neki koji dolazi pre njega.

Korak do kog vodi više koraka pokazuje koliko ih čeka, na primer **2/3** u gornjem levom uglu. U njegovom panelu **Dolazi posle više koraka** nabraja te korake sa odlukom kojom vode do njega, i podešava koliko njih mora da stigne: **Ulazi se kad se stigne sa bar N od M**. U korak se ulazi jednom, čim ih toliko dovede do njega. Kad se doda druga strelica, korak čeka sve; smanjite broj kad je jedan dovoljan, na primer *1 od 2* kad oba puta vode do istog obaveštenja, ili *2 od 3* kad su dovoljna dva od tri odobrenja.

::: warning Korak u koji se možda nikad neće ući
Prethodni korak ne vodi ovde sigurno kad ima uslov za ulazak (može biti preskočen), ili kad je zadatak čija druga odluka ide dalje umesto da završi proces. Kad je koraka koji sigurno vode ovde manje od broja koji korak čeka, njegova oznaka na tabli postaje narandžasta, a panel kaže koji su to koraci: u korak se možda nikad neće ući, i zapis bi tu čekao. To je samo upozorenje i ne sprečava čuvanje; smanjite broj ili neka druga odluka završava proces, kad to ne sme da se desi.
:::

Dugme pored prethodnog koraka uklanja njegovu strelicu. Poslednja strelica ne može da se ukloni: korak mora da dolazi posle nečega.

### Šta još fali

Ispod table dizajner odjednom nabraja sve što bi server odbio: korak bez naziva, zadatak o kom niko ne odlučuje, obaveštenje bez primalaca, granu koja nikud ne vodi, korak koji čeka više koraka nego što ih vodi do njega ili proces koji se nikad ne završava. Klik na stavku otvara korak na koji se odnosi; korak kom nešto fali nosi i narandžastu oznaku na tabli. Proces se čuva tek kad je spisak prazan i kaže da je proces potpun.

### Brisanje koraka

*Obriši korak* na dnu panela briše korak. Koraci posle njega do kojih ništa drugo ne vodi brišu se zajedno sa njim, a dizajner pre toga kaže koliko ih je; korak do kog vodi još neki korak ostaje i gubi samo strelicu od obrisanog. Kao i svaka druga izmena u dizajneru, konačno je tek posle *Sačuvaj*.
