import { Api } from './api';
import { Session } from './helpers/session';

export class Auth {
    constructor() {
        this.API_URI = '/auth';
    }

    async login(emailAddress, password) {
        try {
            const _data = await Api.create().post(this.API_URI + '/login', new URLSearchParams({
                emailAddress,
                password,
            }));
            await Session.setUserSession(_data.data?.data);
            window.toast(_data.data.message, 'info');
            return true;
        } catch (e) {
            console.log(e);
            window.toast(e.response.data.message, 'danger');
            return false;
        }
    }

    async isLogged() {
        try {
            if (Session.getCookie('session_token')) {
                const _data = await Api.create().get(this.API_URI + '/is-logged');
                await Session.setUserSession(_data.data?.data);
                return _data.data?.data;
            } else {
                return null;
            }
        } catch (e) {
            window.toast(e.response.data.message, 'danger');
            return null;
        }
    }

    async logout() {
        try {
            const _data = await Api.create().post(this.API_URI + '/logout');
            window.toast(_data.data.message, 'info');
            window.localStorage.clear();

            return true;
        } catch (e) {
            window.toast(e.response.data.message, 'danger');
            return false;
        }
    }

    getLoginForm() {
        return `<div class="col-8">
            <form id="login-form" onsubmit="return null;">
                <div class="col-auto">
                    <label for="emailAddress" class="form-label">Email address</label>
                    <input type="email" class="form-control" id="emailAddress" aria-describedby="emailHelp">
                    <div id="emailHelp" class="form-text">Type your registered email</div>
                </div>
                <div class="col-auto">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password">
                </div>
                <button type="button" class="btn btn-primary mt-2" id="login-button">Login</button>
            </form>
        </div>`;
    }
}
