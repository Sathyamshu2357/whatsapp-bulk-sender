const { ipcRenderer } = require("electron/renderer");
let csvToJson = require("convert-csv-to-json");

const handleLogin = () => {
    const loginSection = document.querySelector("#whatsapp-login");
    const mainSection = document.querySelector("#main");
    loginSection.classList.add("is-hidden");
    mainSection.classList.remove("is-hidden");
    document.getElementById("send").addEventListener("click", sendButtonHandler);
    document.getElementById("sendAll").addEventListener("click", sendAllButtonHandler);
}

const handleQrData = (qrData) => {
    console.log(qrData);
    const loginSection = document.querySelector("#whatsapp-login");
    loginSection.querySelector(".progress").classList.add("is-hidden");
    loginSection.querySelector(".image").classList.remove("is-hidden");
    loginSection.querySelector(".image").querySelector("img").setAttribute("src", qrData);
}

ipcRenderer.on("connected", () => handleLogin());
ipcRenderer.on("qr", (e, qrData) => handleQrData(qrData));

window.onload = () => {
    // Tabs Start
    document.querySelectorAll('.tabs').forEach((tab) => {
        tab.querySelectorAll('li').forEach((li) => {
            li.onclick = () => {
                tab.querySelector('li.is-active').classList.remove('is-active')
                li.classList.add('is-active')
                tab.nextElementSibling.querySelector('.tab-pane.is-active').classList.remove('is-active')
                tab.nextElementSibling.querySelector('.tab-pane#' + li.firstElementChild.getAttribute('id'))
                    .classList.add("is-active")
            }
        })
    })

    // Handle form tab
    document.getElementById("add-number-entry").addEventListener("click", addNumberEntry)

    // Handle file selection
    let fileInputs = document.querySelectorAll('.file.has-name')
    for (let fileInput of fileInputs) {
        let input = fileInput.querySelector('.file-input')
        let name = fileInput.querySelector('.file-name')
        input.addEventListener('change', () => {
            let files = input.files
            if (files.length === 0) {
                name.innerText = 'No file selected'
            } else {
                name.innerText = files[0].name
            }
        })
    }
}

const addNumberEntry = async () => {
    var newopt = document.createElement("input");
    newopt.setAttribute("class", "input is-small my-1");
    newopt.setAttribute("type", "text");
    newopt.setAttribute("placeholder", "9999999998");
    document.getElementById("numbers-form").appendChild(newopt);
}

const handleCSVFile = async () => {
    csvFilePath = document.getElementById("csv-file").files[0].path;
    let json = csvToJson.getJsonFromCsv(csvFilePath);
    var keys = Object.keys(json[0])[0].split(',');
    var colnames = document.getElementById("sheetcols");
    colnames.innerHTML = "";
    for(each in keys) { 
        var newopt = document.createElement("option");
        newopt.setAttribute("value", keys[each]);
        newopt.innerText = keys[each];
        colnames.appendChild(newopt);
    }
}

const handleCSVCols = async () => {
    csvFilePath = document.getElementById("csv-file").files[0].path;
    let json = csvToJson.getJsonFromCsv(csvFilePath);
    var keys = Object.keys(json[0])[0].split(',');  
    var attr = document.getElementById("sheetcols").value;  
    var idx = keys.findIndex(check);
    function check(key) { return key == attr };

    document.getElementById("number-list").innerHTML = "";
    for(each in json) {
        var vals = Object.values(json[each])[0].split(',');
        var newopt = document.createElement("option");
        newopt.setAttribute("value",vals[idx]);
        newopt.innerText = vals[idx];
        document.getElementById("number-list").appendChild(newopt);
    }
}



const handleNumberFormInput = async () => {
    const numbers = Array.from(document.getElementById("numbers-form").elements).map((e) => e.value);
    document.getElementById("number-list").innerHTML = "";
    numbers.forEach((number) => {
        var newopt = document.createElement("option");
        newopt.setAttribute("value",`${number}`);
        newopt.innerText = `${number}`;
        document.getElementById("number-list").appendChild(newopt);
    })
}

const handleSheetIdInput = async () => {
    const sheetId = document.getElementById("sheet-id").value;
    const credPath = document.getElementById("cred-file").files[0].path;
    const sheetTitles = await ipcRenderer.invoke("call", "fetchSheets", sheetId, credPath);
    document.getElementById("sheet").innerHTML = "";
    sheetTitles.forEach((sheetTitle) => {
        document.getElementById("sheet").innerHTML += `<option value="${sheetTitle}">${sheetTitle}</option>\n`
    })
}

const handleSheetSelect = async () => {
    const sheetId = document.getElementById("sheet-id").value;
    const credPath = document.getElementById("cred-file").files[0].path;
    const sheet = document.getElementById("sheet").value;
    console.log(`sheet selected: ${sheet}`);
    const sheetColumns = await ipcRenderer.invoke("call", "fetchColumns", sheetId, credPath, sheet);
    document.getElementById("column").innerHTML = "";
    sheetColumns.forEach((column) => {
        document.getElementById("column").innerHTML += `<option value="${column}">${column}</option>\n`
    })
}

const handleColumnSelect = async () => {
    const sheetId = document.getElementById("sheet-id").value;
    const credPath = document.getElementById("cred-file").files[0].path;
    const sheet = document.getElementById("sheet").value;
    const column = document.getElementById("column").value;
    console.log(`column selected: ${column}`);
    const phoneNumbers = await ipcRenderer.invoke("call", "fetchNumbers", sheetId, credPath, sheet, column);
    document.getElementById("number-list").innerHTML = "";
    phoneNumbers.forEach((number) => {
        document.getElementById("number-list").innerHTML += `<option value="${number}">${number}</option>\n`
    })
}

const handleNumberSelect = () => {
    const number = document.getElementById("number-list").value;
    console.log(`number selected: ${number}`);
}

const handleMsgInput = () => {
    const x = document.getElementById("msg").value;
    document.getElementById("preview").innerHTML = x;
}

const handleImgCaptionInput = () => {
    const imgPath = document.getElementById("image-file").files[0].path;
    const x = document.getElementById("image-caption").value;
    document.getElementById("preview").innerHTML = `<img src="${imgPath}">` + "\n" + x;
}

const getMsgArgs = (numberOrNumbers) => {
    const msgType = document.getElementById("msg-type").querySelector('li.is-active').querySelector('a').id;
    let args;
    if (msgType === "msg-text") {
        const msg = document.getElementById("msg").value;
        console.log(numberOrNumbers, msg);
        args = ["TEXT", numberOrNumbers, msg];
    } else if (msgType === "msg-image") {
        const imgPath = document.getElementById("image-file").files[0].path;
        const captionText = document.getElementById("image-caption").value;
        args = ["IMAGE", numberOrNumbers, imgPath, "SAMPLE-NAME", captionText];
    } 
    return args;
}

const sendButtonHandler = async () => {
    const number = document.getElementById("number-list").value;
    console.log(number);
    const res = await ipcRenderer.invoke("call", "send", ...getMsgArgs(number));
    console.log(res);
}

const sendAllButtonHandler = async () => {
    const numbers = Array.from(document.getElementById("number-list").options).map(o => o.value);
    console.log(numbers);
    const res = await ipcRenderer.invoke("call", "sendAll", ...getMsgArgs(numbers));
    console.log(res);
}

window.handleNumberFormInput = handleNumberFormInput;
window.handleSheetIdInput = handleSheetIdInput;
window.handleMsgInput = handleMsgInput;
window.handleImgCaptionInput = handleImgCaptionInput;
window.handleSheetSelect = handleSheetSelect;
window.handleColumnSelect = handleColumnSelect;
window.handleNumberSelect = handleNumberSelect;