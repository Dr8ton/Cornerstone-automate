import puppeteer from 'puppeteer';
// import { URLs } from "./URLs";

const CREDENTIALS = require('../secrets/key.json');

interface studentRow {
    name: string,
    score: string,
    attachmentLinkURL: string | null,
    hasNewSubmission: boolean
}
let URLs = [
    "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=4fbc2180-84f8-4b19-afeb-c559fd1f3603&back=INSTRUCTOR", // HS
    "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=d64c64a5-a89f-48fd-8d0b-4fd1d4dde710&back=INSTRUCTOR", // Auth
    "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=fa21d00f-7721-4f44-a5f7-a4aa7ed37bbf&back=INSTRUCTOR", // CPR
    "https://acadian.csod.com/LMS/ILT/event_session_roster.aspx?loId=a9727b3e-cefe-4406-8167-f449b774de0f&back=INSTRUCTOR", // Physical
]

async function main() {
    for (let url of URLs) {
console.log("************************************************************")
        const browser = await puppeteer.launch({ headless: false });// slow down by 250ms 
        const page = await browser.newPage();
        await page.setViewport({ width: 1000, height: 1000 });

        let loginPage = await navToSite(url, page);
        let rosterPage = await loginToCornerstone(loginPage);
        let rows: studentRow[] = await scrapeTable(rosterPage);

        for (const row of rows) {
            //if score is not set
            console.log(row.name, " scored: ", row.score)
            if (!row.score) {
                let tab = await browser.newPage();
                await navToSite(row.attachmentLinkURL, tab);
                try {
                    let attachement = await tab.waitForSelector('#ucAttachment_dlAttachment_ctl01_lbFile', { timeout: 1000 })
                    await attachement.click(); 
                    console.log('     attachment found')
                    row.hasNewSubmission = true;
                } catch (error) {
                    console.log('     attachment not found')
                    await tab.close()
                }
                
                // try {
                //     await tab.waitForSelector('#ucAttachment_upAttachments > div > span', { timeout: 5000 })
                //     console.log('attachment not found')
                //     await tab.close()
                // } catch (error) {
                //     console.log('attachment found')
                //     row.hasNewSubmission = true;
                // }
            }else{
                console.log("     skipped")
            }
            // open attachment in new tab
            //check for attachment
            //if attchment not found, close the tab
        }

    }


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
async function loginToCornerstone(page: puppeteer.Page): Promise<puppeteer.Page> {
    await page.type('#userNameBox', CREDENTIALS.cornerstone.login);
    await page.type('#passWordBox', CREDENTIALS.cornerstone.password);
    await page.click('#submit');
    return page;
}

async function scrapeTable(page: puppeteer.Page): Promise<studentRow[]> {
    let listOfAllStudentInTable: studentRow[] = [];
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
    //    


    // let attachementNotFound = await page.$('#ucAttachment_upAttachments > div > span');

    // if (!attachementNotFound) {
    //     student.hasNewSubmission = true;
    //     newSubmissions.push(student.name);
    // }
    // }

    // }
    return listOfAllStudentInTable;
}

main();
