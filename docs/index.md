---
layout: home

hero:
  name: Formuvia
  text: Build business applications on PostgreSQL
  tagline: Model your data, lay out its forms, add procedures and triggers of the database, make reports, leave routine work to scheduled jobs and start them from other systems through webhooks — all from inside the application.
  actions:
    - theme: brand
      text: Start here
      link: /getting-started
    - theme: alt
      text: Build a table
      link: /model

features:
  - title: Tables without a developer
    details: Add a table to the model and Formuvia creates it in the database, with its fields, its links and the roles that may use it. No migration, nothing to redeploy.
    link: /model
  - title: Lay out a form by clicking
    details: Place each field on a grid, give it a default value or a list of values from the database, let the database work a value out, and lock a field until a condition holds.
    link: /form-design
  - title: Logic stays in the database
    details: Put a procedure of the database on a table and run it over a record, or a trigger that the database runs on every write.
    link: /model#procedures
  - title: Reports
    details: A query, a procedure or a Jasper report, with parameters and lists to pick from — shown in a table, taken into Excel or handed over as a PDF.
    link: /reports
  - title: Work that runs by itself
    details: A job sends a report by mail, writes it into a file or imports filled-in Excel templates from a folder, on its own timetable or through a webhook from another system.
    link: /jobs
  - title: Every table screen works the same
    details: Filtering, advanced search, sorting, totals, editing straight in the list, history of every record, Excel export and an Excel template for entering data.
    link: /tables
---

## What Formuvia is

Formuvia is a platform for business applications over a PostgreSQL database, shaped from inside the application itself.

You describe what you need — a menu, a table, the fields on its form — and Formuvia creates the table in the database: the columns, the foreign keys, the constraints. There is no migration script to write and nothing to redeploy. A table added in the **Model** exists in the database the moment you save it, appears in the menu and opens as a list with its form.

The rules of the business stay where the data is. A field can take its value from a function of the database while a record is being entered, a procedure can be run over a record from its menu, and a trigger runs on every write without anyone asking for it.

On top of the data sit the **reports** — queries, procedures and Jasper reports, with parameters — and the **jobs** that run them on a timetable: a report goes out by mail or into a file, filled-in Excel templates are imported from a folder, and another system can start any job through a webhook.

Around all of that sits everything a business application needs anyway: accounts and roles, a record of every change, filtering, sorting and totals done on the server, and an Excel export of whatever you are looking at.

## Who this guide is for

- **If you enter and look up data**, read [Signing in](/getting-started) and [Working with tables](/tables). That is everything you need.
- **If you build the application**, continue with [Model](/model) and [Form design](/form-design), set people up in [Administration](/administration), write the reports of the application in [Reports](/reports), and watch what runs by itself in [Jobs](/jobs).

## Where Formuvia is today

Formuvia is still being built, and this guide describes what actually works rather than what is planned. Where something can already be defined but does not take effect yet, the page says so in a box headed *What is in effect today*.

## Before you start

You need an address where Formuvia is running and an account. The very first account is `admin`, created when the system is first started — whoever installed Formuvia set its password.

Installing and deploying Formuvia is described in the repositories themselves: [FormuviaFront](https://github.com/natasablagojevic88/FormuviaFront#installation) for the web client and [Formuvia](https://github.com/natasablagojevic88/Formuvia#installation) for the server.
