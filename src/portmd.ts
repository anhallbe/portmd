#!/usr/bin/env node

import fs from "fs";
import marked from "marked";
import path from "path";
import puppeteer from "puppeteer";

(async () => {
	try {
		debug("Reading input file");
		const { name, content } = getInputFile();
		debug("Parsing markdown");
		const markdown = toMarkdown(content);
		debug("Creating pdf");
		const pdf = await toPdf(markdown);
		debug("Writing to output file");
		fs.writeFileSync(`${name}.pdf`, pdf);
		debug("done");
	} catch (error) {
		log(`Error: ${error.message}`);
		debug(error);
		process.exit(1);
	}
})();

function getInputFile() {
	debug("Getting input file");
	const [inputFile] = process.argv.slice(2);
	debug("Checking if inputFile was given");
	if (!inputFile) {
		debug("inputFile was not given");
		throw new Error("Input file must be given");
	}
	debug("Checking if inputFile exists");
	if (!fs.existsSync(inputFile)) {
		debug("inputFile does not exist");
		throw new Error(`Input file ${inputFile} does not exist.`);
	}
	debug("checking if file ends in .md");
	if (path.extname(inputFile) !== ".md") {
		debug("file does not end in .md");
		throw new Error(`Input file ${inputFile} does not seem to be markdown`);
	}

	const content = fs.readFileSync(inputFile);
	const name = path.basename(inputFile, ".md");
	return { name, content };
}

async function toPdf(content: Buffer): Promise<Buffer> {
	const browser = await puppeteer.launch();
	const tempFilePath = writeTempFile(content);
	try {
		const pages = await browser.pages();
		const page = pages[0];
		await page.goto(`file://${tempFilePath}`);
		const pdf = await page.pdf({ format: "A4" });
		return pdf;
	} finally {
		await browser.close();
		removeTempFile(tempFilePath);
	}
}

function toMarkdown(content: Buffer): Buffer {
	const parsed = marked.parse(content.toString(), { gfm: true, tables: true });
	return Buffer.from(parsed);
}

type TempFilePath = string;

function writeTempFile(content: Buffer): TempFilePath {
	const filePath = path.resolve("portmd_tmp.html");
	debug(`Writing temporary file ${filePath}`);
	fs.writeFileSync(filePath, content);
	return filePath;
}

function removeTempFile(filePath: TempFilePath) {
	debug(`Removing temporary file ${filePath}`);
	fs.unlinkSync(filePath);
}

function debug(...args: unknown[]) {
	if (process.argv.some(arg => arg === "--debug" || arg === "-d")) {
		console.log(...args);
	}
}

function log(...args: unknown[]) {
	console.log(...args);
}
