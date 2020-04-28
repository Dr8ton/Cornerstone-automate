import puppeteer, { Browser } from 'puppeteer';
import { URLs } from "./URLs";
const CREDENTIALS = require('../secrets/key.json');

// Look here for answers : https://stackoverflow.com/questions/49236981/want-to-scrape-table-using-puppeteer-how-can-i-get-all-rows-iterate-through-ro

for (const site of URLs) {
    
}

async function getHTMLFromCrewScheduler(region: number): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 926 });
    await page.goto(generalReportURL);


    await page.waitForSelector('#ddlReport');
    await page.select('#ddlReport', '313');

    const html = await page.$eval('#DataGrid1', (element) => {
        return element.innerHTML
    })
    const htmlAsStirng = `'${html}'`
    browser.close();
    return htmlAsStirng;
}

async function waitUntilPageIsLoaded(page: puppeteer.Page): Promise<boolean> {
    await Promise.all([
        page.click('[name=btnGo]'),
        page.waitForNavigation({
            timeout: 30000,
            waitUntil: "networkidle0"
        }),
        page.waitForNavigation({
            timeout: 30000,
            waitUntil: "load"
        }),
        page.waitForNavigation({
            timeout: 30000,
            waitUntil: "domcontentloaded"
        })
    ]);
    return false;
}

async function loginToCornerstone(page: puppeteer.Page): Promise<boolean> {
    await page.type('#tbCompany', crew_scheduler.crew_scheduler.company);
    await page.type('#tbUserName', crew_scheduler.crew_scheduler.username);
    await page.type('#tbPassword', crew_scheduler.crew_scheduler.password);
    await page.click('#btnLogin');


    return false; 
}