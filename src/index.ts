import puppeteer from 'puppeteer';
import { URLs } from "./URLs";

const CREDENTIALS = require('../secrets/key.json');

main();
// Look here for answers : https://stackoverflow.com/questions/49236981/want-to-scrape-table-using-puppeteer-how-can-i-get-all-rows-iterate-through-ro
async function main() {
    for (const site of URLs) {
        let page = await navToSite(site.rosterUrl);
        await loginToCornerstone(page);
    }

}

// async function getHTMLFromCrewScheduler(region: number): Promise<string> {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.setViewport({ width: 900, height: 926 });
//     await page.goto(generalReportURL);


//     await page.waitForSelector('#ddlReport');
//     await page.select('#ddlReport', '313');

//     const html = await page.$eval('#DataGrid1', (element) => {
//         return element.innerHTML
//     })
//     const htmlAsStirng = `'${html}'`
//     browser.close();
//     return htmlAsStirng;
// }

async function navToSite(url: string): Promise<puppeteer.Page> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 926 });
    await page.goto(url);
    return page;

}

// async function waitUntilPageIsLoaded(page: puppeteer.Page): Promise<boolean> {
//     await Promise.all([
//         page.waitForNavigation({
//             timeout: 30000,
//             waitUntil: "networkidle0"
//         }),
//         page.waitForNavigation({
//             timeout: 30000,
//             waitUntil: "load"
//         }),
//         page.waitForNavigation({
//             timeout: 30000,
//             waitUntil: "domcontentloaded"
//         })
//     ]);
//     return false;
// }

async function loginToCornerstone(page: puppeteer.Page): Promise<puppeteer.Page> {
    await page.type('#userNameBox', CREDENTIALS.cornerstone.login);
    await page.type('#passWordBox', CREDENTIALS.cornerstone.password);
    await page.click('#submit');
    return page;
}