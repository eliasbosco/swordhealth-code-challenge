import { Api } from './api';
import { Session } from './helpers/session';

export class Task {
    constructor() {
        this.API_URI = '/task';
    }

    async create(date, summary) {
        try {
            const _data = await Api.create().post(this.API_URI + '/task', new URLSearchParams({
                date,
                summary,
            }));
            window.toast(_data.data.message, 'info');
            return true;
        } catch (e) {
            console.log(e);
            window.toast(e.response.data.message, 'danger');
            return false;
        }
    }

    async findAll() {
        try {
            const user = await Session.getUserSession();
            const _data = await Api.create().get(this.API_URI + '/tasks');

            let html = `<div class="col-10">
                <div class="card mt-2 bg-light">
                    <div class="card-header">
                        <h2>Listing tasks</h2>
                    </div>
                    <div class="card-body">`;

            if (_data.status === 200 && _data.data?.data?.length > 0) {
                html += `<table class="table table-striped">`;
                for (const [key1, row] of Object.entries(_data.data.data)) {
                    if (key1 === '0') {
                        html += `<thead><tr>`;
                        for (const [key2, _] of Object.entries(row)) {
                             html += `<th scope="col">${key2}</th>`;
                        }
                        html += `<th>Actions</th>`;
                        html += `</thead></tr><tbody>`;
                    }
                    html += `<tr id="${row['id']}">`;
                    for (const [_, col] of Object.entries(row)) {
                        html += `<td>${col}</td>`;
                    }
                    html += `<td class="col-2"><button type="button" class="btn btn-primary mx-2" id="edit-button">Edit</button>`;
                    // only if user is manager
                    html += user.role === 0 ? `<button type="button" class="btn btn-danger" id="remove-button">Remove</button>` : '';
                    html += `</td>`;
                    html += `</tr>`;
                }
                html += `</tbody></table>`;
            } else {
                html = `<div class="alert alert-warning" role="alert">No records found</div>`;
            }
            html += `</div>
                </div>
            </div>`;
            return html;
        } catch (e) {
            const msg = e.response ? e.response.data.message : e.message;
            window.toast(msg, 'danger');
            return '';
        }
    }

    async edit(id) {
        try {
            const _data = await Api.create().get(this.API_URI + `/task/${id}`);
            const data = _data.data?.data;
            if (_data.status === 200 && data) {
                return `<div class="col-8">
                    <div class="card mt-2 bg-light">
                        <div class="card-header">
                            <h2>Editing task</h2>
                        </div>
                        <div class="card-body">
                            <form id="create-form" onsubmit="return null;">
                                <div class="form-control col-auto">
                                    <label for="date" class="form-label">Date Time</label>
                                    <input type="datetime-local" class="form-control" name="date"
                                        placeholder="Date Time" id="date"
                                        value="${data.date.split('.')[0]}"/>
                                </div>
                                <div class="form-control col-auto mt-2">
                                    <label for="summary" class="form-label">Summary</label>
                                    <textarea class="form-control" name="summary" maxlength="2500"
                                        placeholder="Summary" id="summary" style="height: 100px">${data.summary}</textarea>
                                </div>
                                <button type="button" class="btn btn-primary mt-2" id="edit-save-button">Save</button>
                            </form>
                        </div>
                    </div>
                </div>`;
            }
            return '';
        } catch (e) {
            window.toast(e.response.data.message, 'danger');
            return '';
        }
    }

    async update(id, date, summary) {
        try {
            const _data = await Api.create().put(this.API_URI + `/task/${id}`, new URLSearchParams({
                date,
                summary,
            }));
            window.toast(_data.data.message, 'info');
        } catch (e) {
            window.toast(e.response.data.message, 'danger');
        }
    }

    async delete(id) {
        try {
            const _data = await Api.create().delete(this.API_URI + `/task/${id}`);
            window.toast(_data.data.message, 'info');
        } catch (e) {
            window.toast(e.response.data.message, 'danger');
        }
    }

    getCreateForm() {
        return `<div class="col-8">
            <div class="card mt-2 bg-light">
                <div class="card-header">
                    <h2>Adding task</h2>
                </div>
                <div class="card-body">
                    <form id="create-form" onsubmit="return null;">
                        <div class="form-control col-auto">
                            <label for="date" class="form-label">Date Time</label>
                            <input type="datetime-local" class="form-control" name="date"
                                placeholder="Date Time" id="date" value="${new Date().toISOString().split('.')[0]}"/>
                        </div>
                        <div class="form-control col-auto mt-2">
                            <label for="summary" class="form-label">Summary</label>
                            <textarea class="form-control" name="summary" maxlength="2500" placeholder="Summary" id="summary" style="height: 100px"></textarea>
                        </div>
                        <button type="button" class="btn btn-primary mt-2" id="create-button">Save</button>
                    </form>
                </div>
            </div>
        </div>`;
    }
}