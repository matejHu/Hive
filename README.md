# Včelín 🐝
Včelín je webová aplikace pro správu úlů a jejich komponent včelařského systému. Slouží k efektivní evidenci úlů, boxů, matek a pravidelných kontrol, což usnadňuje správu včelínů pro včelaře a další nadšence. Díky vizualizaci a přehlednému uspořádání komponent si můžete snadno udržet přehled o každém úlu, jeho umístění a aktuálním stavu.

## Funkce
- **Správa úlů a jejich komponent**: aplikace umožňuje vytvářet, ukládat a organizovat úly, přidávat k nim volné boxy a přiřazovat matky.
- **Evidování kontrol**: každému úlu lze přiřadit kontroly (checkupy), které evidují datum, typ a poznámky ke každé kontrole.
- **Interaktivní vizualizace úlů**: zobrazení úlů a boxů jako obdélníkové boxy, které umožňuje rychlý přehled o struktuře jednotlivých úlů.
- **Inventář nevyužitých boxů**: inventář volných boxů lze přistupovat a přiřazovat úlům pomocí drag-and-drop funkcionality.
- **Přidávání komponent pomocí kontextového menu**: kliknutím pravým tlačítkem na úl můžete přidávat kontroly, matky a boxy.
- **Přesouvání úlů a boxů**: snadné přesouvání komponent mezi úly a lokacemi s aktualizací údajů v databázi.

## Technologie
Aplikace je postavena na HTML, CSS, JavaScriptu a běží na Node.js serveru s Express.js frameworkem. Data jsou ukládána do databáze PostgreSQL.
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js (API pro správu dat)
- **Databáze**: PostgreSQL
