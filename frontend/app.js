import 'regenerator-runtime/runtime';
import { connect, StringCodec } from 'nats.ws';
import * as boostrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css'; // Import precompiled Bootstrap css
import { Auth } from './src/auth';
import { Task } from './src/task';

let natsConnect = null;

const auth = new Auth();
const task = new Task();

// create a nats connection
const sc = StringCodec();

(async () => {
    natsConnect = await connect({
        name: 'client-sword',
        servers: 'ws://127.0.0.1:9222',
        token: '3secret',
        timeout: 2000,
        noEcho: true,
        maxReconnectAttempts: 10,
        pingInterval: 3000,
        maxPingOut: 2,
    });

    // simple subscriber, if the message has a reply subject
    // send a reply
    const sub = await natsConnect.subscribe('task');
    for await (const m of sub) {
        // show message only if Role is Manager: 0
        const data = await auth.isLogged();
        if (data?.role === 0) {
            window.toast(sc.decode(m.data), 'info');
        }
    }
})().then();

(async () => {
    // check if session is already logged in
    if (await auth.isLogged()) {
        openTaskList();
    } else {
        toggleMenu(false);
        const container = document.getElementById('container');
        container.innerHTML = auth.getLoginForm();
        document.getElementById('login-button').addEventListener('click',
            async () => loginFormSubmit());
    }
})().then();

// close the connection
window.onbeforeunload = function () {
    console.log('Closing Nats ws service connection');
    natsConnect.close();
};

/**
 * toast Bootstrap Toast
 * @param title {String} Title to be shown
 * @param titleColor {String} primary, secondary, success, danger, warning, info, dark
 * @param icon {String} success, danger, warning, info
 */
window.toast = (title, titleColor= 'info') => {
    const toastContainer = document.getElementById('toast-container');

    const htmlMarkup = `<div class="toast alert-${titleColor} position-relative mt-2 mx-2 d-block end-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${title}
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`.trim();
    const template = document.createElement('template');
    template.innerHTML = htmlMarkup;
    const html = template.content.firstChild;


    toastContainer.appendChild(html);

    const act = new boostrap.Toast(html);
    act.show();
};

// cleanup useless toasts each 5 sec
setInterval(() => {
    const toastContainer = document.getElementById('toast-container');
    [].forEach.call(toastContainer.getElementsByClassName('hide'), old => old.remove());
}, 5000);

document.getElementById('menu-logout').addEventListener('click', async () => {
    if (await auth.logout()) {
        toggleMenu(false);
        const container = document.getElementById('container');
        container.innerHTML = auth.getLoginForm();
        document.getElementById('login-button').addEventListener('click',
            async () => loginFormSubmit());
    }
});

document.getElementById('menu-task-findall').addEventListener('click', async () => {
    openTaskList();
});

document.getElementById('menu-task-create').addEventListener('click', async () => {
    toggleMenu(true);
    document.getElementById('container').innerHTML = task.getCreateForm();
    document.getElementById('create-button').addEventListener('click',
        async () => {
            const date = document.getElementById('date').value;
            const summary = document.getElementById('summary').value;
            task.create(date, summary);
            setTimeout(() => openTaskList(), 1000);
        });
});

async function loginFormSubmit() {
    const emailAddress = document.getElementById('emailAddress').value;
    const pass = document.getElementById('password').value;
    if (await auth.login(emailAddress, pass)) {
        openTaskList();
    }
}

async function openTaskList() {
    toggleMenu(true);
    const container = document.getElementById('container');
    container.innerHTML = await task.findAll();
    [].filter.call(document.getElementsByTagName('tr'),
            tr => tr.getAttribute('id') !== null)
        .forEach(tr => {
            const id = tr.getAttribute('id');
            [].forEach.call(tr.getElementsByTagName('button'), btn =>
                btn.addEventListener('click',
                    async () => btn.getAttribute('id') === 'edit-button' ?
                        taskEdit(id) :
                        taskDelete(id)));
        });
}

async function taskEdit(id) {
    document.getElementById('container').innerHTML = await task.edit(id);
    document.getElementById('edit-save-button').addEventListener('click',
        async () => taskEditSave(id));
}

async function taskEditSave(id) {
    const date = document.getElementById('date').value;
    const summary = document.getElementById('summary').value;
    await task.update(id, date, summary);
    setTimeout(() => openTaskList(), 1000);
}

async function taskDelete(id) {
    await task.delete(id);
    await openTaskList();
}

function toggleMenu(show) {
    const menu = document.getElementById('menu');
    menu.setAttribute('style', `${show ? '' : 'display: none;'}`);
}