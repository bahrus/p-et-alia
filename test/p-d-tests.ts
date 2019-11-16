import { IXtalTestRunner, IXtalTestRunnerOptions } from 'xtal-test/index.js';
const xt = require('xtal-test/index') as IXtalTestRunner;
const test = require('tape');
import { Page } from "puppeteer"; //typescript
import { Test } from "tape";
async function customTests(page: Page) {
    await page.waitFor(4000);
    const errorTag = await page.$('[err=true]');
    const ending = await page.$('[ending]');
    const TapeTestRunner = {
        test: test
    } as Test;
    TapeTestRunner.test('testing dev.html', (t: any) => {
        t.equal(errorTag, null);
        t.notEqual(ending, null);
        t.end();
    });

}

(async () => {
    await xt.runTests({
        path: 'test/fly.html'
    }, customTests);
})();

