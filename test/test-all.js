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
        },
        {
            path: 'test/fly-w.html',
            expectedNoOfSuccessMarkers: 1
        },
        {
            path: 'test/fly-u.html',
            expectedNoOfSuccessMarkers: 2
        }
    ]);
    if (passed) {
        console.log("Tests Passed.  Have a nice day.");
    }
})();

