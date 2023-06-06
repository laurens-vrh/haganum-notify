import Express from "express";
import Path from "path";
import * as Magister from "./Magister.js";
import * as Database from "./Database.js";
import * as Mailer from "./Mailer.js";

import options from "./options.js";

// Database.init();
const app = Express();
app.use("/api", Express.json());

app.post("/api/subscription", async (req, res) => {
	return console.log(req.body);
});

app.get("/api/users", async (req, res) => {
	return res.status(200).send({
		users: await Database.getUserCount()
	});
});

app.post("/api/account", async (req, res) => {
	if (!req.body.username || !req.body.password) return res.status(400).send("Gegevens missen.");
	req.body.username = req.body.username.toLowerCase();

	try {
		const tokens = await Magister.getTokens({
			authCode: options.authCode,
			username: req.body.username,
			password: req.body.password
		});
		const accountData = await Magister.getUserdata({ tokens });
	} catch (error) {
		return res.status(401).send("Ongeldige gegevens. (waarschijnlijk)");
	}
	const name = accountData.Persoon.Roepnaam + " " + accountData.Persoon.Achternaam;
	Database.saveAccount({ name, magister_username: req.body.username, magister_password: req.body.password, stamnummer: accountData.Persoon.StamNr, magister_id: accountData.Persoon.Id });
	Mailer.sendSignupEmail({ name, stamnummer: accountData.Persoon.StamNr });

	console.log(`[INFO] User registered: ${req.body.username}`);
	res.status(200).send({ name });
});

app.delete("/api/account", async (req, res) => {
	if (!req.body.username || !req.body.password) return res.status(400).send("Gegevens missen.");

	const change = Database.deleteAccount({ magister_username: req.body.username, magister_password: req.body.password });
	if (!change) return res.status(401).send("Ongeldige gegevens. (waarschijnlijk)");

	Mailer.sendSignoutEmail({ name: change.name, stamnummer: change.stamnummer });
	res.status(200).send("Account removed.");
	console.log(`[INFO] User deleted: ${req.body.username}`);
});

app.post("/api/force_update", async (req, res) => {
	if (req.body.secret !== options.secret) return res.status(401).send("Ongeldige gegevens.");

	console.log(`[INFO] Forcing grade update.`);
	res.status(200).send("Forcing grade update.");
	updateGrades();
});

app.use("/", Express.static(Path.join(Path.resolve(), "/web/")));

app.listen(options.port, () => {
	console.log(`[INFO] Server online (port: ${options.port})`);
});

setInterval(updateGrades, options.updateInterval);
async function updateGrades() {
	console.log(`[INFO] Updating grades...`);

	const users = Database.getUsers();
	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		var cont = false;
		const tokens = await Magister.getTokens({
			authCode: options.authCode,
			username: user.magister_username,
			password: user.magister_password
		}).catch((error) => {
			cont = true;
		});
		if (cont) continue;

		const grades = await Magister.getGrades({
			id: user.magister_id,
			tokens
		});

		const lastGrade = grades.items[0];
		const oldGrade = new Date(user.last_grade || lastGrade.ingevoerdOp);
		if (oldGrade.getTime() < new Date(lastGrade.ingevoerdOp).getTime()) {
			Database.setLastGrade({ magister_username: user.magister_username, last_grade: lastGrade.ingevoerdOp });

			Mailer.sendGradeEmail({ name: user.name, stamnummer: user.stamnummer, grade: lastGrade });
			console.log(`[INFO] Nieuw cijfer: ${user.magister_username} (${lastGrade.vak.code}: ${lastGrade.waarde})`);
		}

		await sleep(options.requestDelay);
	}
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
