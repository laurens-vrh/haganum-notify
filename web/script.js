const elements = {
	output: document.querySelector("[data-ref='output']"),
	username: document.querySelector("[data-ref='username']"),
	password: document.querySelector("[data-ref='password']"),
	saveButton: document.querySelector("[data-ref='save-button']"),
	deleteButton: document.querySelector("[data-ref='delete-button']")
};

function saveAccount() {
	const username = elements.username.value;
	const password = elements.password.value;
	if (!username || !password) return (elements.output.innerText = "Ongeldige gegevens.");

	setDisabled(true);
	fetch("api/account", {
		method: "post",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: elements.username.value,
			password: elements.password.value
		})
	})
		.then(async (res) => {
			setDisabled(false);
			if (res.status === 200) {
				elements.output.innerText = `Successvol ingeschreven, ${(await res.json()).name}!`;
				elements.username.value = "";
				elements.password.value = "";
				return;
			} else {
				const text = await res.text();
				if (text.includes("Ongeldige gegevens.")) {
					elements.username.value = "";
					elements.password.value = "";
				}
				return (elements.output.innerText = `Er is iets misgegaan: ${text}`);
			}
		})
		.catch((error) => {
			setDisabled(false);
			elements.output.innerText = `Er is iets misgegaan: ${error}`;
		});
}
function deleteAccount() {
	const username = elements.username.value;
	const password = elements.password.value;
	if (!username || !password) return (elements.output.innerText = "Ongeldige gegevens.");

	setDisabled(true);
	fetch("api/account", {
		method: "delete",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: elements.username.value,
			password: elements.password.value
		})
	})
		.then(async (res) => {
			setDisabled(false);
			if (res.status === 200) return (elements.output.innerText = `Successvol uitgeschreven.`);
			else return (elements.output.innerText = `Er is iets misgegaan: ${await res.text()}`);
		})
		.catch((error) => {
			setDisabled(false);
			elements.output.innerText = `Er is iets misgegaan: ${error}`;
		});
}

function setDisabled(disabled) {
	if (disabled) {
		elements.saveButton.setAttribute("disabled", true);
		elements.deleteButton.setAttribute("disabled", true);
		return;
	}
	elements.saveButton.removeAttribute("disabled");
	elements.deleteButton.removeAttribute("disabled");
}
