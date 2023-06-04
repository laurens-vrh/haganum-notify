const elements = {
	output: document.querySelector("[data-ref='output']"),
	username: document.querySelector("[data-ref='username']"),
	password: document.querySelector("[data-ref='password']")
};

function saveAccount() {
	const username = elements.username.value;
	const password = elements.password.value;
	if (!username || !password) return (elements.output.innerText = "Ongeldige gegevens.");

	fetch("/haganum_notify/api/account", {
		method: "post",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: elements.username.value,
			password: elements.password.value
		})
	}).then(async (res) => {
		if (res.status === 200) {
			elements.output.innerText = `Successvol ingeschreven, ${(await res.json()).name}!`;
			elements.username.value = "";
			elements.password.value = "";
			return;
		} else {
			const text = await res.text();
			if (text.contains("Ongeldige gegevens.")) {
				elements.username.value = "";
				elements.password.value = "";
			}
			return (elements.output.innerText = `Er is iets misgegaan: ${text}`);
		}
	});
}
function deleteAccount() {
	const username = elements.username.value;
	const password = elements.password.value;
	if (!username || !password) return (elements.output.innerText = "Ongeldige gegevens.");

	fetch("/haganum_notify/api/account", {
		method: "delete",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: elements.username.value,
			password: elements.password.value
		})
	}).then(async (res) => {
		if (res.status === 200) return (elements.output.innerText = `Successvol uitgeschreven.`);
		else return (elements.output.innerText = `Er is iets misgegaan: ${await res.text()}`);
	});
}
