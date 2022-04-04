export class Session {
    static getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    static async setUserSession(data) {
        if (data) {
            await window.localStorage.setItem('user', JSON.stringify(data));
        }
    }

    static async getUserSession() {
        return await (window.localStorage.getItem('user') ?
            JSON.parse(window.localStorage.getItem('user')) :
            null);
    }
}