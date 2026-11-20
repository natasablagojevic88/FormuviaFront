import { defineConfig } from "vitepress";

// Uputstvo za korisnike; engleski je primarni jezik, srpski je drugi locale (/sr/).
// Objavljuje se na https://www.formuvia.net/, u korenu servera, pa je base "/". Pod drugom putanjom
// gradi se sa promenljivom DOCS_BASE (npr. /docs/), ne sa --base: ikonica u head-u ne dobija base
// od VitePress-a, pa mora da je zna i konfiguracija.
const base = process.env.DOCS_BASE ?? "/";

export default defineConfig({
  title: "Formuvia",
  base,
  lastUpdated: true,
  // Strane zadržavaju .html: Tomcat ne nalazi model.html kad se traži /model, pa bi link otvoren
  // direktno ili F5 na podstrani dao 404.
  cleanUrls: false,
  head: [["link", { rel: "icon", href: `${base}formuvia.png` }]],

  themeConfig: {
    logo: "/formuvia.png",
    search: { provider: "local" },
    socialLinks: [{ icon: "github", link: "https://github.com/natasablagojevic88/FormuviaFront" }],
  },

  locales: {
    root: {
      label: "English",
      lang: "en-US",
      description: "User guide for Formuvia",
      themeConfig: {
        nav: [
          { text: "Guide", link: "/getting-started" },
          { text: "Install", link: "https://github.com/natasablagojevic88/FormuviaFront#installation" },
        ],
        sidebar: [
          {
            text: "Using Formuvia",
            items: [
              { text: "What Formuvia is", link: "/" },
              { text: "Signing in", link: "/getting-started" },
              { text: "Working with tables", link: "/tables" },
              { text: "Jobs", link: "/jobs" },
              { text: "Notifications", link: "/notifications" },
            ],
          },
          {
            text: "Building the application",
            items: [
              { text: "Model: menus and tables", link: "/model" },
              { text: "Form design", link: "/form-design" },
              { text: "Administration", link: "/administration" },
              { text: "Reports", link: "/reports" },
            ],
          },
        ],
        editLink: {
          pattern: "https://github.com/natasablagojevic88/FormuviaFront/edit/main/docs/:path",
          text: "Edit this page on GitHub",
        },
        docFooter: { prev: "Previous", next: "Next" },
        outline: { label: "On this page" },
        lastUpdatedText: "Last updated",
      },
    },

    sr: {
      label: "Srpski",
      lang: "sr-Latn-RS",
      description: "Uputstvo za korišćenje Formuvie",
      themeConfig: {
        nav: [
          { text: "Uputstvo", link: "/sr/getting-started" },
          { text: "Instalacija", link: "https://github.com/natasablagojevic88/FormuviaFront#installation" },
        ],
        sidebar: [
          {
            text: "Korišćenje Formuvie",
            items: [
              { text: "Šta je Formuvia", link: "/sr/" },
              { text: "Prijava na sistem", link: "/sr/getting-started" },
              { text: "Rad sa tabelama", link: "/sr/tables" },
              { text: "Poslovi", link: "/sr/jobs" },
              { text: "Obaveštenja", link: "/sr/notifications" },
            ],
          },
          {
            text: "Pravljenje aplikacije",
            items: [
              { text: "Model: meniji i tabele", link: "/sr/model" },
              { text: "Dizajn forme", link: "/sr/form-design" },
              { text: "Administracija", link: "/sr/administration" },
              { text: "Izveštaji", link: "/sr/reports" },
            ],
          },
        ],
        editLink: {
          pattern: "https://github.com/natasablagojevic88/FormuviaFront/edit/main/docs/:path",
          text: "Izmeni ovu stranu na GitHub-u",
        },
        docFooter: { prev: "Prethodno", next: "Sledeće" },
        outline: { label: "Na ovoj strani" },
        lastUpdatedText: "Poslednja izmena",
        returnToTopLabel: "Na vrh",
        darkModeSwitchLabel: "Tema",
      },
    },
  },
});
