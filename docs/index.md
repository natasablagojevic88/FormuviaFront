---
layout: home

hero:
  name: Formuvia
  text: Define your tables from inside the application
  tagline: Describe a table and its fields on screen, and Formuvia creates them in the database — no migration, no deployment in between.
  actions:
    - theme: brand
      text: Start here
      link: /getting-started
    - theme: alt
      text: Working with tables
      link: /tables

features:
  - title: Tables without a developer
    details: Add a table to the model and Formuvia creates it in the database, with its fields, its links and the roles that may use it.
    link: /model
  - title: Lay out a form by clicking
    details: Place each field on a grid, choose its data type, give it a default value or a list of values from the database.
    link: /form-design
  - title: Every table screen works the same
    details: Filtering, advanced search, sorting, paging, editing in the table, history and export to Excel.
    link: /tables
---

## What Formuvia is

Formuvia is an application you shape from inside the application itself.

You describe what you need — a menu, a table, the fields on its form — and Formuvia creates the table in the database: the columns, the foreign keys, the constraints. There is no migration script to write and nothing to redeploy. A table added in the **Model** exists in the database the moment you save it.

Around that sits everything a business application needs anyway: accounts and roles, a record of every change, filtering and sorting done on the server, and an Excel export of whatever you are looking at.

## Who this guide is for

- **If you enter and look up data**, read [Signing in](/getting-started) and [Working with tables](/tables). That is everything you need.
- **If you build the application**, continue with [Model](/model) and [Form design](/form-design), and set people up in [Users and roles](/administration).

## Where Formuvia is today

Formuvia is still being built, and this guide describes what actually works rather than what is planned. Two things are worth knowing before you start:

- The **built-in screens** — Users, Roles and Model — are complete, and so are the subtables you reach from a row's ⋯ menu.
- A table you define in the **Model** is created in the database, appears in the menu, and opens as a list you can filter, sort, page through and export. Its entry form is now drawn from what you laid out in [Form design](/form-design): **Add** and **Edit** open a dialog with your grid, the field labels in your language and the lists of values. The last step is still being finished on the server — storing what you enter — so for now the form opens and fills in but saving does not go through, and a record cannot be deleted. Subtables are not in the menu yet either.

Each page of this guide says which parts of what you define are already in effect.

## Before you start

You need an address where Formuvia is running and an account. The very first account is `admin`, created when the system is first started — whoever installed Formuvia set its password.

Installing and deploying Formuvia is described in the repositories themselves: [FormuviaFront](https://github.com/natasablagojevic88/FormuviaFront#installation) for the web client and [Formuvia](https://github.com/natasablagojevic88/Formuvia#installation) for the server.
