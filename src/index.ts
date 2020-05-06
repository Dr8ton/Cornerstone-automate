import puppeteer from 'puppeteer';
// import { URLs } from "./URLs";

const CREDENTIALS = require('../secrets/key.json');

interface roster {
    name: string, 
    rosterURL: string, 
    data: string[]; 
}

main();
// Look here for answers : https://stackoverflow.com/questions/49236981/want-to-scrape-table-using-puppeteer-how-can-i-get-all-rows-iterate-through-ro

async function main() {
    let URLs = [
        {
            name: "CPR - SU20",
            rosterUrl: "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=fa21d00f-7721-4f44-a5f7-a4aa7ed37bbf&back=INSTRUCTOR",
            data: [''] 
        },
        // {
        //     name: "Physical - SU20",
        //     rosterUrl: "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=a9727b3e-cefe-4406-8167-f449b774de0f&back=INSTRUCTOR"
        //     ,data: [{}]
        //     
        // },
        // {
        //     name: "Diploma - SU20",
        //     rosterUrl: "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=4fbc2180-84f8-4b19-afeb-c559fd1f3603&back=INSTRUCTOR"
        // ,data: [{}]

        // },
        {
            name: "BEMS - SU20",
            rosterUrl: "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=d64c64a5-a89f-48fd-8d0b-4fd1d4dde710&back=INSTRUCTOR",
            data: ['']
        }
    ]
    for (let site of URLs) {

        const browser = await puppeteer.launch({ headless: false });// slow down by 250ms 
        const page = await browser.newPage();
        await page.setViewport({ width: 1000, height: 1000 });

        let loginPage = await navToSite(site.rosterUrl, page);
        let rosterPage = await loginToCornerstone(loginPage);
        let data = await scrapeTable(rosterPage);
        site.data = data;

        browser.close();
    }

    for (let site of URLs) {
        //open roster page
        const browser = await puppeteer.launch({ headless: false });// slow down by 250ms 
        const page = await browser.newPage();
        await page.setViewport({ width: 1000, height: 1000 });

        let loginPage = await navToSite(site.rosterUrl, page);
        let rosterPage = await loginToCornerstone(loginPage);

        for (const student of site.data) {
            if (student.score === '') {
                let page1 = await browser.newPage();
                let attachmentPage = await navToSite(student.attachmentLinkURL, page1);
                //open attachment link in new tab. 
                //check for attachment
                //if attachment not found , close tab

            }
        }
        //if score is not set
        // open attachment in new tab
        //check for attachment
        //if attchment not found, close the tab
    }

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
            let attachmentLinkURL = await tds[8].$eval('a.action-attachment', a => a.getAttribute('href'))

            listOfAllStudentInTable.push({
                name,
                score,
                attachmentLinkURL,
                hasNewSubmission: false
            })
        }
        if (index != lastPageNumber - 1) {
            await page.click('#ctl00_ctl00_ContentPlaceHolder1_RosterContent_pg_nextPageLink');
        }
    }





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