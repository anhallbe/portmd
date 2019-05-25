import fs from "fs";
import os from "os";
import path from "path";
import puppeteer from "puppeteer";

(async () => {
	await main();
})();

async function main() {
	const { name, content } = getInputFile();
	const pdf = await toPdf(Buffer.from(content));
	fs.writeFileSync(`${name}.pdf`, pdf);
}

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

	debug("reading content");
	const content = fs.readFileSync(inputFile);
	debug("content is", content.toString())
	debug("reading basename");
	const name = path.basename(inputFile, ".md");
	debug(`basename is ${name}`);
	return { name, content };
}

async function toPdf(content: Buffer): Promise<Buffer> {
	const browser = await puppeteer.launch();
	try {
		const tempFilePath = writeTempFile(content);
		const pages = await browser.pages();
		const page = pages[0];
		await page.goto(`file://${tempFilePath}`);
		const pdf = await page.pdf({ format: "A4" });
		return pdf;
	} finally {
		await browser.close();
	}
}

type TempFilePath = string;

function writeTempFile(content: Buffer): TempFilePath {
	const filePath = path.resolve(os.tmpdir(), "portmd_tmp.html");
	fs.writeFileSync(filePath, content);
	return filePath;
}

function debug(...args: unknown[]) {
	console.log(...args);
}
