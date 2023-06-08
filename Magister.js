import fetch from "node-fetch";
import { AuthManager } from "magister-openid";
import Puppeteer from "puppeteer";

import options from "./options.js";
const baseUrl = "https://accounts.magister.net";
const authManager = new AuthManager(options.school.id);

export async function getSchools(query) {
	query = query.replace(/\d/g, "").trim().replace(/ +/g, "+");
	if (query.length < 3) return Promise.resolve([]);

	return fetch(options.school.baseUrl + `/challenges/tenant/search?key=${query}`).then((res) => res.json());
}

export async function getTokens({ authCode, username, password }) {
	return await authManager.login(username, password, authCode);
}

export async function getUserdata({ tokens }) {
	/*
{
  UuId: '9d470ce1-6ecc-4ea4-8b5c-61119a4291ec',
  Persoon: {
    "Studie":"04","Klas":"Klas 4d","StamNr":"6081","ExamenNr":null,"Profielen":"Economie en Maatschappij"
    Id: 8426,
    Roepnaam: 'Laurens',
    Tussenvoegsel: null,
    Achternaam: 'Verhaar',
    OfficieleVoornamen: 'Laurens Paul',
    Voorletters: 'L.P.',
    OfficieleTussenvoegsels: null,
    OfficieleAchternaam: 'Verhaar',
    Geboortedatum: '2008-11-08',
    GeboorteAchternaam: null,
    GeboortenaamTussenvoegsel: null,
    GebruikGeboortenaam: false
  },
  Groep: [ { Naam: 'Leerling', Privileges: [Array], Links: null } ],
  Links: []
}
*/

	const accountData = await fetch(options.school.baseUrl + "/api/account", {
		headers: { Authorization: `${tokens.token_type} ${tokens.access_token}` }
	}).then((res) => res.json());
	const profileData = await fetch(options.school.baseUrl + `/api/personen/${accountData.Persoon.Id}/opleidinggegevensprofiel`, {
		headers: { Authorization: `${tokens.token_type} ${tokens.access_token}` }
	}).then((res) => res.json());
	accountData.Persoon = Object.assign(accountData.Persoon, profileData);
	return accountData;
}

export async function getGrades({ id, tokens }) {
	/*{
  items: [
    {
      kolomId: 124438,
      omschrijving: 'Corvus',
      ingevoerdOp: '2023-05-31T11:50:35.0000000Z',
      vak: { code: 'entl', omschrijving: 'Engelse taal en literatuur' },
      waarde: '9,0',
      weegfactor: 2,
      isVoldoende: true,
      teltMee: true,
      moetInhalen: false,
      heeftVrijstelling: false,
      behaaldOp: null,
      links: {}
    }
  ],
  links: {
    voortgangscijfers: { href: '/api/aanmeldingen/20947/cijfers' },
    first: { href: '/api/personen/8426/cijfers/laatste?top=1' },
    next: { href: '/api/personen/8426/cijfers/laatste?top=1&skip=1' },
    last: { href: '/api/personen/8426/cijfers/laatste?top=1&skip=73' }
  },
  totalCount: 74
}*/

	return await fetch(options.school.baseUrl + `/api/personen/${id}/cijfers/laatste?top=${options.gradeCheck}`, {
		headers: { Authorization: `${tokens.token_type} ${tokens.access_token}` }
	}).then((res) => res.json());
}

export async function getAuthCode({ inProduction }) {
	const browser = await Puppeteer.launch(inProduction ? { headless: "new", executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] } : { headless: "new" });
	const page = await browser.newPage();
	await page.setRequestInterception(true);

	var authCode;

	page.on("request", (request) => {
		if (request.method() !== "POST" || !request.url().includes("accounts.magister.net/challenges/current")) return request.continue();

		authCode = JSON.parse(request.postData()).authCode;
		request.continue();
	});

	await page.goto("https://accounts.magister.net/");
	await browser.close();

	return authCode;
}
