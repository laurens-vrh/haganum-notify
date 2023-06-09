import Chalk from "chalk";

export function info(log, scope, timestamp = Date.now()) {
	console.log(`   [${Chalk.gray(new Date(timestamp).toLocaleString("nl-NL"))} ${Chalk.cyan("INFO")}${scope ? " " + scope : ""}]  ${Chalk.blue(log)}`);
}

export function warn(log, scope, timestamp = Date.now()) {
	console.log(`   [${Chalk.gray(new Date(timestamp).toLocaleString("nl-NL"))} ${Chalk.yellow("WARN")}${scope ? " " + scope : ""}]    ${Chalk.yellow(log)}`);
}

export function error(log, scope, timestamp = Date.now()) {
	console.log(`   [${Chalk.gray(new Date(timestamp).toLocaleString("nl-NL"))} ${Chalk.bgRed("ERROR")}${scope ? " " + scope : ""}]    ${Chalk.red(log)}`);
}

export function success(log, scope, timestamp = Date.now()) {
	console.log(`   [${nChalk.gray(new Date(timestamp).toLocaleString("nl-NL"))} ${Chalk.bgGreen("INFO")}${scope ? " " + scope : ""}]    ${Chalk.green(log)}`);
}
