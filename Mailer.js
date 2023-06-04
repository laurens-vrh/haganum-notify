import nodemailer from "nodemailer";

import options from "./options.js";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: options.email.user,
		pass: options.email.password
	}
});

export async function sendEmail({ name, stamnummer, grade, vak }) {
	return await transporter.sendMail({
		from: '"Haganum Notify" <notificaties@haganum.net>',
		to: stamnummer + "@leerling.haganum.nl",
		subject: `Nieuw cijfer - ${grade.vak.code}: ${grade.waarde}`,
		text: `Hoi ${name.split(" ")[0]}. Je hebt een ${grade.waarde} voor ${grade.omschrijving} voor ${grade.vak.omschrijving}.\n\nP.S.: Als je deze notificaties niet meer wilt ontvangen, ga naar ${options.url}`
	});
}
