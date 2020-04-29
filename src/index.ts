import puppeteer from 'puppeteer';
import { URLs } from "./URLs";

const CREDENTIALS = require('../secrets/key.json');

main();
// Look here for answers : https://stackoverflow.com/questions/49236981/want-to-scrape-table-using-puppeteer-how-can-i-get-all-rows-iterate-through-ro

async function main() {

    for (const site of URLs) {

        console.log(site.name);

        const browser = await puppeteer.launch({ headless: false });// slow down by 250ms 
        const page = await browser.newPage();
        await page.setViewport({ width: 1000, height: 1000 });

        let loginPage = await navToSite(site.rosterUrl, page);
        let rosterPage = await loginToCornerstone(loginPage);
        let report = await scrapeTable(rosterPage);

        console.log(report);

        browser.close();
    }

}

async function scrapeTable(page: puppeteer.Page): Promise<string[]> {
    let listOfAllStudentInTable = [];



    await page.waitForSelector('table.CsListWithLines > tbody > tr')
    let trs = await page.$$('td.Panel_contentMiddle > table.CsListWithLines > tbody > tr');

    for (const tr of trs) {
        let tds = await tr.$$('td');

        let name = await tds[0].$eval('b', node => node.innerHTML)
        let score = await tds[5].evaluate(node => node.innerHTML.trim())
        let attachmentLink = await tds[8].$eval('a.action-attachment', a => a.getAttribute('href'))

        listOfAllStudentInTable.push({
            name,
            score,
            attachmentLink,
            hasNewSubmission: false
        })
    }

    let nextPageButton = await page.$('#ctl00_ctl00_ContentPlaceHolder1_RosterContent_pg_nextPageLink');
    if (nextPageButton) {
        nextPageButton.click();
        console.log('next page button clicked')
    }




    let newSubmissions = [];
    for (const student of listOfAllStudentInTable) {
        if (student.score === '') {
            //check for attachment  
            await navToSite(student.attachmentLink, page)

            try {
                await page.waitForSelector('#ucAttachment_upAttachments > div > span', { timeout: 5000 })
                console.log('element found')
            } catch (error) {
                console.log('element NOT found')
                student.hasNewSubmission = true;
                newSubmissions.push(student.name);
            }


            // let attachementNotFound = await page.$('#ucAttachment_upAttachments > div > span');

            // if (!attachementNotFound) {
            //     student.hasNewSubmission = true;
            //     newSubmissions.push(student.name);
            // }
        }

    }
    console.log('newsub ', newSubmissions);
    return newSubmissions;
}



async function navToSite(url: string | null, page: puppeteer.Page): Promise<puppeteer.Page> {
    if (url) {


        await page.goto(url);
        return page;
    } else {
        page.goto('www.google.com');
        return page;
    }



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