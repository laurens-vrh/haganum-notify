import Chalk from "chalk";

export function info(log, { scope, timestamp = Date.now() }: { scope?: string; timestamp?: number } = {}) {
	console.log(`   [${Chalk.gray(new Date(timestamp).toLocaleString("nl-NL"))} ${Chalk.cyan("INFO")}${scope ? " " + scope : ""}]	${Chalk.blue(log)}`);
}

export function warn(log, { scope, timestamp = Date.now() }: { scope?: string; timestamp?: number } = {}) {
	console.log(`   [${Chalk.gray(new Date(timestamp).toLocaleString("nl-NL"))} ${Chalk.yellow("WARN")}${scope ? " " + scope : ""}]	${Chalk.yellow(log)}`);
}

export function error(log, { scope, timestamp = Date.now(), consoleError }: { scope?: string; timestamp?: number; consoleError?: boolean } = {}) {
	console.log(`   [${Chalk.gray(new Date(timestamp).toLocaleString("nl-NL"))} ${Chalk.bgRed("ERROR")}${scope ? " " + scope : ""}]	${Chalk.red(log)}`);
	if (consoleError) console.error(log);
}

export function success(log, { scope, timestamp = Date.now() }: { scope?: string; timestamp?: number } = {}) {
	console.log(`   [${Chalk.gray(new Date(timestamp).toLocaleString("nl-NL"))} ${Chalk.bgGreen("INFO")}${scope ? " " + scope : ""}]	${Chalk.green(log)}`);
}
