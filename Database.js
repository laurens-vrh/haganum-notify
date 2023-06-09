import Database from "better-sqlite3";
import * as Logger from "./Logger.js";

const db = new Database("database.db", {});

export function init() {
	Logger.info("Initializing database...");
	db.prepare("CREATE TABLE Accounts (magister_username varchar(255) PRIMARY KEY NOT NULL, magister_password varchar(255) NOT NULL, magister_id int NOT NULL, name varchar(255) NOT NULL, last_grade varchar(255), stamnummer int NOT NULL, magister_token varchar(2048));").run();
	Logger.success("Initialized database.");
}

export function getUserCount() {
	return db.prepare("SELECT COUNT() FROM Accounts").get()["COUNT()"];
}

export function getUsers() {
	return db.prepare("SELECT * FROM Accounts").all();
}

export function saveAccount({ magister_username, magister_password, magister_id, name, stamnummer, magister_token }) {
	return db.prepare("REPLACE INTO Accounts (magister_username, magister_password, magister_id, name, stamnummer, magister_token) VALUES(?, ?, ?, ?, ?, ?);").run(magister_username, magister_password, magister_id, name, stamnummer, magister_token);
}

export function deleteAccount({ magister_username, magister_password }) {
	return db.prepare("DELETE FROM Accounts WHERE magister_username=? AND magister_password=? RETURNING *;").get(magister_username, magister_password);
}

export function getLastGrade({ magister_username }) {
	return db.prepare("SELECT last_grade FROM Accounts WHERE magister_username=?;").get(magister_username).last_grade;
}

export function setLastGrade({ magister_username, last_grade }) {
	return db.prepare("UPDATE Accounts SET last_grade=? WHERE magister_username=?;").run(last_grade, magister_username);
}

export function getToken({ magister_username, magister_password }) {
	return db.prepare("SELECT magister_token FROM Accounts WHERE magister_username=? AND magister_password=?;").get(magister_username, magister_password)?.magister_token;
}

export function setToken({ magister_username, magister_token }) {
	return db.prepare("UPDATE Accounts SET magister_token=? WHERE magister_username=?;").run(magister_token, magister_username);
}
