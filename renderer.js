const { ipcRenderer } = require("electron/renderer");

const response = document.getElementById("response");

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

const loginButtonHandler = () => {
    console.log("hey")
    const qrResponse = ipcRenderer.sendSync("qr", "ping");
    response.innerText = qrResponse;
    document.getElementById("container").innerHTML += `<img src="${qrResponse}"/>`;
}

const sendButtonHandler = () => {
    const number = document.getElementById("number").value;
    const msg = document.getElementById("msg").value;
    console.log(number, msg);
    const res = ipcRenderer.sendSync("msg", number, msg);
    console.log(res);
}

// document.getElementById("request").addEventListener("click", loginButtonHandler);
// document.getElementById("send").addEventListener("click", sendButtonHandler);