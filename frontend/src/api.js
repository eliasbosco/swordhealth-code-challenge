import axios from 'axios';

export class Api {
    static create() {
        return axios.create({
            baseURL: 'http://127.0.0.1:8080/api/v1',
            withCredentials: true,
        });
    }
}