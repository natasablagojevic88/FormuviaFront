# Prijava na sistem

Otvorite adresu na kojoj Formuvia radi i unesite korisničko ime i lozinku. Ikonica oka pored polja za lozinku prikazuje ono što ste otkucali, za slučaj da je duga lozinka ušla pogrešno.

Ako vam sesija istekne dok radite, Formuvia vas vraća na stranu za prijavu. Ništa što ste snimili nije izgubljeno — samo ono što je ostalo nesnimljeno u otvorenom dijalogu.

::: tip Prva prijava
Prvi nalog je `admin`, sa lozinkom izabranom pri instalaciji. Promenite je odmah, prema [Promeni lozinke](#promena-sopstvene-lozinke).
:::

## Kako se snaći

**Meni** je sa leve strane. Šta je u njemu zavisi od vaših uloga — vidite samo ono što smete da otvorite. Na telefonu je meni sakriven; otvara se dugmetom u gornjoj traci i prelazi preko strane. Stavke koje nose druge stavke počinju skupljene, pa se ceo meni vidi odjednom; klik na stavku je raširava, a grupa u kojoj je strana na kojoj se nalazite širi se sama.

**Gornja traka** nosi jezik i temu, i naziv strane na kojoj se nalazite.

**Vaše ime** je na dnu menija. Klikom na njega menjate lozinku; ikonica pored njega vas odjavljuje.

## Pomoć na svakom ekranu

Ovo uputstvo ne mora da stoji otvoreno pored aplikacije — aplikacija sama pokazuje put:

- **Prvi ekran** posle prijave kaže odakle da krenete. Administrator dobija prve korake podešavanja Formuvie, redom kojim zavise jedan od drugog — uloge, korisnici, tabele, server za poštu, izveštaji — svaki sa *Otvori*, koje vodi na njegov ekran. Svi ostali dobijaju kratko objašnjenje kako se radi sa tabelom.
- **Kratko uputstvo** stoji na vrhu glavnih ekrana administracije, modela, dizajna forme i poslova: nekoliko koraka, ili šta radi koje dugme. Otvoreno je dok je ekran još prazan — u modelu još nema tabele, nema servera za poštu, nema posla — a skupljeno u jedan red čim u njemu nešto ima, da ne zauzima mesto listi. Klik na taj red ga otvara ili skuplja, a vaš izbor se pamti u browseru.
- **Pročitajte u uputstvu**, ispod naslova svakog ekrana, otvara stranu ovog uputstva o tom ekranu, u novom tabu i na vašem jeziku. Oba srpska pisma vode na srpsko uputstvo, koje je pisano latinicom.

![Ekran Uloge sa otvorenim kratkim uputstvom, menijem levo i jezikom i temom u gornjoj traci](/screenshots/sr/roles.png)

## Jezik

Formuvia govori tri jezika, biraju se u gornjoj traci:

| | |
|---|---|
| **English** | engleski |
| **Srpski** | latinica |
| **Српски** | ćirilica |

Izbor se pamti u pregledaču, pa sledeći put Formuvia otvara isti jezik. Važi za sve: dugmad, nazive kolona, stavke menija i poruke o greškama.

![Otvoren izbor jezika u gornjoj traci](/screenshots/sr/language.png)

## Svetla i tamna tema

Dugme pored jezika prolazi kroz tri stanja, ovim redom:

1. **Svetla tema**
2. **Tamna tema**
3. **Po sistemu** — Formuvia preuzima podešavanje računara ili telefona i menja se zajedno sa njim

I ovo se pamti po pregledaču. Na podatke ne utiče — menja samo izgled ekrana.

## Promena sopstvene lozinke

Kliknite na svoje ime na dnu menija i izaberite **Promena lozinke**. Novu lozinku unosite dvaput; dok se dva unosa ne poklope, dijalog neće dozvoliti snimanje.

![Dijalog Promena lozinke](/screenshots/sr/change-password.png)

## Na telefonu

Formuvia je pravljena da se koristi na telefonu, ne samo da na njega stane:

- meni prelazi preko strane umesto da zauzme trećinu ekrana
- tabele se prikazuju kao **kartice** — jedna kartica po redu, svaka vrednost sa nazivom svoje kolone pored sebe
- pošto nema zaglavlja kolona na koje bi se kliknulo, kolonu za sortiranje birate u traci iznad liste, a filtrirate kroz **Naprednu pretragu**
- dijalozi se skroluju iznutra umesto da izađu van ekrana

Sve što možete na računaru možete i na telefonu; neke stvari samo stoje na drugom mestu.

## Licenca i izvorni kod

Na dnu menija, i ispod kartice za prijavu, stoje dva sitna linka: **AGPL-3.0** i **Izvorni kod**.

Formuvia je slobodan softver pod licencom GNU Affero General Public License, verzija 3. Smete da je koristite za bilo šta, uključujući i posao, da proučavate kako radi i da je menjate. Licenca zauzvrat traži jedno: ko Formuviu izmeni i pusti druge ljude da tu izmenjenu verziju koriste preko mreže, mora tim ljudima ponuditi izvorni kod svoje verzije.

Drugi link je upravo ta ponuda. Vodi na izvorni kod verzije koju koristite, pa u instalaciji koju je neko menjao vodi na izvorni kod te izmenjene verzije. Adresu iza njega postavlja onaj ko je Formuviu instalirao; to je jedno podešavanje, opisano u README-u projekta.
