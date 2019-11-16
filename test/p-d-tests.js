const xt = require('xtal-test/index');
const test = require('tape');
async function customTests(page) {
    await page.waitFor(4000);
    const errorTag = await page.$('[err=true]');
    const ending = await page.$('[ending]');
    const TapeTestRunner = {
        test: test
    };
    TapeTestRunner.test('testing dev.html', (t) => {
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
