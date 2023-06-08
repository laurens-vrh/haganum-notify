import Express from "express";
import Path from "path";
import fs from "fs";
import * as Magister from "./Magister.js";
import * as Database from "./Database.js";
import * as Mailer from "./Mailer.js";

import options from "./options.js";
options.inProduction = !fs.existsSync("./request.rest");

if (!fs.existsSync("./authCode.json")) fs.writeFileSync("./authCode.json", '""');
const authCodeFile = fs.readFileSync("./authCode.json");
options.authCode = JSON.parse(authCodeFile);

// Database.init();
const app = Express();
app.use("/api", Express.json());

app.get("/api/users", async (req, res) => {
	return res.status(200).send({
		users: await Database.getUserCount()
	});
});

app.post("/api/account", async (req, res) => {
	if (!req.body.username || !req.body.password) return res.status(400).send("Gegevens missen.");
	req.body.username = req.body.username.toLowerCase();

	var accountData;
	var tryAgain = true;
	while (tryAgain) {
		tryAgain = false;
		try {
			const tokens = await Magister.getTokens({
				authCode: options.authCode,
				username: req.body.username,
				password: req.body.password
			});
			accountData = await Magister.getUserdata({ tokens });
		} catch (error) {
			if (error.message.includes("AuthCodeValidation")) {
				await refreshAuthCode();
				tryAgain = true;
			} else return res.status(401).send("Ongeldige gegevens. (waarschijnlijk)");
		}
	}

	const name = accountData.Persoon.Roepnaam + " " + accountData.Persoon.Achternaam;
	Database.saveAccount({ name, magister_username: req.body.username, magister_password: req.body.password, stamnummer: accountData.Persoon.StamNr, magister_id: accountData.Persoon.Id });
	Mailer.sendSignupEmail({ name, stamnummer: accountData.Persoon.StamNr });

	console.log(`[INFO]	User registered: ${req.body.username}`);
	res.status(200).send({ name });
});

app.delete("/api/account", async (req, res) => {
	if (!req.body.username || !req.body.password) return res.status(400).send("Gegevens missen.");
	req.body.username = req.body.username.toLowerCase();

	const change = Database.deleteAccount({ magister_username: req.body.username, magister_password: req.body.password });
	if (!change) return res.status(401).send("Ongeldige gegevens. (waarschijnlijk)");

	Mailer.sendSignoutEmail({ name: change.name, stamnummer: change.stamnummer });
	res.status(200).send("Account removed.");
	console.log(`[INFO]	User deleted: ${req.body.username}`);
});

app.post("/api/force_update", async (req, res) => {
	if (req.body.secret !== options.secret) return res.status(401).send("Ongeldige gegevens.");

	console.log(`[INFO]	Forcing grade update.`);
	res.status(200).send("Forcing grade update.");
	updateGrades();
});

app.use("/", Express.static(Path.join(Path.resolve(), "/web/")));

app.listen(options.port, () => {
	console.log(`[INFO]	Server online (port: ${options.port})`);
});

setInterval(updateGrades, options.updateInterval);
async function updateGrades() {
	console.log("[INFO]	Updating grades...");

	const users = Database.getUsers();
	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		var grades;
		try {
			const tokens = await Magister.getTokens({
				authCode: options.authCode,
				username: user.magister_username,
				password: user.magister_password
			});
			grades = (
				await Magister.getGrades({
					id: user.magister_id,
					tokens
				})
			).items;
		} catch (error) {
			if (error.message.includes("AuthCodeValidation")) {
				await refreshAuthCode();
				i--;
			}
			continue;
		}

		if (!grades[0]) continue;
		if (!user.last_grade) {
			Database.setLastGrade({ magister_username: user.magister_username, last_grade: new Date() });
			continue;
		}
		const oldGrade = new Date(user.last_grade || grades[0].ingevoerdOp);
		grades.forEach((grade) => {
			if (oldGrade.getTime() < new Date(grade.ingevoerdOp).getTime()) {
				Database.setLastGrade({ magister_username: user.magister_username, last_grade: grade.ingevoerdOp });

				Mailer.sendGradeEmail({ name: user.name, stamnummer: user.stamnummer, grade });
				console.log(`[INFO]	Nieuw cijfer: ${user.magister_username} (${grade.vak.code}: ${grade.waarde})`);
			}
		});

		await sleep(options.requestDelay);
	}

	console.log(`[INFO]	Grades updated.`);
}

async function refreshAuthCode() {
	console.log("[INFO] Refreshing auth code...");
	options.authCode = await Magister.getAuthCode(options);
	fs.writeFileSync("./authCode.json", JSON.stringify(options.authCode));
	console.log("[INFO] Auth code refreshed.");
	return;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
