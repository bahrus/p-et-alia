const xt = require('xtal-test/index');
(async () => {
    const passed = await xt.runTests([
        {
            path: 'test/fly-d.html',
            expectedNoOfSuccessMarkers: 4,
        },
        {
            path: 'test/fly-unt.html',
            expectedNoOfSuccessMarkers: 1
        }
    ]);
    if (passed) {
        console.log("Tests Passed.  Have a nice day.");
    }
})();
