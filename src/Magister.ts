import fetch from "node-fetch";
import { AuthManager } from "magister-openid";
import Puppeteer from "puppeteer";

import { MagisterGrades, MagisterUser } from "./types.js";
import * as Database from "./Database.js";

import options from "../options.js";
const authManager = new AuthManager(options.school.id);

export async function getSchools(query: string) {
	query = query.replace(/\d/g, "").trim().replace(/ +/g, "+");
	if (query.length < 3) return Promise.resolve([]);

	return fetch(options.school.baseUrl + `/challenges/tenant/search?key=${query}`).then((res) => res.json());
}

export async function getTokens({ authCode, username, password }) {
	var tokens = {
		token_type: "Bearer",
		access_token: await Database.getToken({ magister_username: username, magister_password: password })
	};
	if (!tokens.access_token) {
		tokens = await authManager.login(username, password, authCode);
		Database.setToken({ magister_username: username, magister_token: tokens.access_token });
	}

	return tokens;
}

export async function getUserdata({ tokens }): Promise<MagisterUser> {
	const accountData: any = await fetch(options.school.baseUrl + "/api/account", {
		headers: { Authorization: `${tokens.token_type} ${tokens.access_token}` }
	}).then((res) => res.json());
	if (accountData === "SecurityToken Expired") throw Error("SecurityToken Expired");
	const profileData = await fetch(options.school.baseUrl + `/api/personen/${accountData.Persoon.Id}/opleidinggegevensprofiel`, {
		headers: { Authorization: `${tokens.token_type} ${tokens.access_token}` }
	}).then((res) => res.json());
	accountData.Persoon = Object.assign(accountData.Persoon, profileData);
	return accountData;
}

export async function getGrades({ id, tokens }): Promise<MagisterGrades> {
	return await fetch(options.school.baseUrl + `/api/personen/${id}/cijfers/laatste?top=${options.gradeCheck}`, {
		headers: { Authorization: `${tokens.token_type} ${tokens.access_token}` }
	}).then((res) => res.json());
}

export async function getAuthCode({ inProduction }) {
	const browser = await Puppeteer.launch(inProduction ? { headless: "new", executablePath: "/usr/bin/chromium", args: ["--no-sandbox"] } : { headless: "new" });
	const page = await browser.newPage();
	await page.setRequestInterception(true);

	var authCode: string;

	page.on("request", (request) => {
		if (request.method() !== "POST" || !request.url().includes("accounts.magister.net/challenges/current")) return request.continue();

		authCode = JSON.parse(request.postData()).authCode;
		request.continue();
	});

	await page.goto("https://accounts.magister.net/");
	await browser.close();

	return authCode;
}
