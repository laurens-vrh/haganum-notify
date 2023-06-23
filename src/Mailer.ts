import nodemailer from "nodemailer";

import options from "../options.js";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL,
		pass: process.env.EMAIL_PASSWORD
	}
});

export async function sendGradeEmail({ name, stamnummer, grade }) {
	return await sendEmail({
		address: stamnummer + "@leerling.haganum.nl",
		subject: `Nuntia - Nieuw cijfer voor ${grade.vak.code}: ${grade.waarde}`,
		text: `Hoi ${name.split(" ")[0]}, je hebt een ${grade.waarde} voor ${grade.omschrijving} voor ${grade.vak.omschrijving}.\n\nP.S.: Als je deze notificaties niet meer wilt ontvangen, ga naar ${options.url}`
	});
}

export async function sendSignupEmail({ name, stamnummer }) {
	return await sendEmail({
		address: stamnummer + "@leerling.haganum.nl",
		subject: `Nuntia - Cijfernotificaties ingesteld`,
		text: `Hoi ${name.split(" ")[0]}, je hebt je zojuist ingeschreven voor cijfernotificaties. Vanaf nu krijg je een email bij elk nieuwe cijfer, zodra het op Magister staat.\n\nP.S.: Als je deze notificaties niet meer wilt ontvangen, ga naar ${options.url}`
	});
}

export async function sendSignoutEmail({ name, stamnummer }) {
	return await sendEmail({
		address: stamnummer + "@leerling.haganum.nl",
		subject: `Nuntia - Cijfernotificaties uitgeschakeld`,
		text: `Hoi ${name.split(" ")[0]}, je hebt je zojuist uitgeschreven voor cijfernotificaties. Vanaf nu krijg je geen email meer bij nieuwe cijfers. Om cijfernotificaties weer in te schakelen, ga naar ${options.url}`
	});
}

export async function sendEmail({ address, subject, text }) {
	return await transporter.sendMail({ from: '"Haganum Nuntia" <haganum-nuntia@laurensverhaar.nl>', to: address, subject, text });
}
