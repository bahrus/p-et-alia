"use strict";
const xtaleditor = document.querySelector('xtal-json-editor');
const de = xtaleditor.dispatchEvent.bind(xtaleditor);
xtaleditor.dispatchEvent = e => {
    console.log(e);
    return de(e);
};
