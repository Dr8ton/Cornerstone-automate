import puppeteer from 'puppeteer';
// import { URLs } from "./URLs";

const CREDENTIALS = require('../secrets/key.json');


main();
// Look here for answers : https://stackoverflow.com/questions/49236981/want-to-scrape-table-using-puppeteer-how-can-i-get-all-rows-iterate-through-ro

async function main() {
    let URLs = [
        {
        name: "CPR - SU20", 
        rosterUrl: "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=fa21d00f-7721-4f44-a5f7-a4aa7ed37bbf&back=INSTRUCTOR",
            all: [{}]
    },
    // {
    //     name: "Physical - SU20",
    //     rosterUrl: "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=a9727b3e-cefe-4406-8167-f449b774de0f&back=INSTRUCTOR"
    // },
    // {
    //     name: "Diploma - SU20",
    //     rosterUrl: "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=4fbc2180-84f8-4b19-afeb-c559fd1f3603&back=INSTRUCTOR"
    // },
    {
        name: "BEMS - SU20",
        rosterUrl: "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=d64c64a5-a89f-48fd-8d0b-4fd1d4dde710&back=INSTRUCTOR",
    },
    // {
    //     name: "auth - SP20",
    //     rosterUrl: "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=226c4044-9f6d-4904-86c7-b5eca5b81e46&back=INSTRUCTOR"
    // }
    ]
    for (let site of URLs) {

        console.log(site.name);

        const browser = await puppeteer.launch({ headless: false });// slow down by 250ms 
        const page = await browser.newPage();
        await page.setViewport({ width: 1000, height: 1000 });

        let loginPage = await navToSite(site.rosterUrl, page);
        let rosterPage = await loginToCornerstone(loginPage);
        let data = await scrapeTable(rosterPage);
        site.all = data; 

        browser.close();
    }
console.log(URLs)
}

async function scrapeTable(page: puppeteer.Page): Promise<string[]> {
    let listOfAllStudentInTable: any[] = [];
    let lastPageNumber = 2;
    for (let index = 0; index < lastPageNumber; index++) {


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
        if (index != lastPageNumber - 1) {
            await page.click('#ctl00_ctl00_ContentPlaceHolder1_RosterContent_pg_nextPageLink');
        }
    }
    // let nextPageButton = await page.$('#ctl00_ctl00_ContentPlaceHolder1_RosterContent_pg_nextPageLink');
    // if (nextPageButton) {
    //    await nextPageButton.click();
    //     console.log('next page button clicked')
    // }




    // let newSubmissions = [];
    // for (const student of listOfAllStudentInTable) {
    //     if (student.score === '') {
    //         //check for attachment  
    //         await navToSite(student.attachmentLink, page)

    //         try {
    //             await page.waitForSelector('#ucAttachment_upAttachments > div > span', { timeout: 5000 })
    //             console.log('element found')
    //         } catch (error) {
    //             console.log('element NOT found')
    //             student.hasNewSubmission = true;
    //             newSubmissions.push(student.name);
    //         }


    // let attachementNotFound = await page.$('#ucAttachment_upAttachments > div > span');

    // if (!attachementNotFound) {
    //     student.hasNewSubmission = true;
    //     newSubmissions.push(student.name);
    // }
    // }

    // }
    return listOfAllStudentInTable;
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