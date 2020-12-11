const { ipcRenderer } = require("electron/renderer");

const handleLogin = () => {
    const loginSection = document.querySelector("#whatsapp-login");
    const mainSection = document.querySelector("#main");
    loginSection.classList.add("is-hidden");
    mainSection.classList.remove("is-hidden");
    document.getElementById("send").addEventListener("click", sendButtonHandler);
}

const handleQrData = (qrData) => {
    console.log(qrData);
    const loginSection = document.querySelector("#whatsapp-login");
    loginSection.querySelector(".progress").classList.add("is-hidden");
    loginSection.querySelector(".image").classList.remove("is-hidden");
    loginSection.querySelector(".image").querySelector("img").setAttribute("src", qrData);
}


const sendButtonHandler = async () => {
    const number = document.getElementById("number").value;
    const msg = document.getElementById("msg").value;
    console.log(number, msg);
    const res = await ipcRenderer.invoke("call", "send", number, msg);
    console.log(res);
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
}

const handleMsgInput = () => {
    const x = document.getElementById("msg").value;
    document.getElementById("preview").innerHTML = x;
}

window.handleMsgInput = handleMsgInput;