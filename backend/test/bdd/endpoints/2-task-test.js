const mocha = require('mocha');
const { describe } = mocha;

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../app');
const expect = chai.expect;
const uri = '/api/v1';
chai.use(chaiHttp);

let managerTask = {};
let technicianTask = {};
describe('BDD TESTS', () => {
    it(`POST /tasks - Add task based on user role: Manager`, () => {
        return new Promise(resolve => {
            const date = new Date().toISOString().split('.')[0];
            const summary = `Task test summary ${Math.random()}`;

            chai
                .request(app)
                .post(uri + '/task/task')
                .set('cookie', global.sessionManager)
                .send({ date, summary })
                .end(async (err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('data');
                    expect(result).to.have.property('message');
                    expect(result.data).not.be.empty;
                    expect(result.message).to.be.equal('Task added successfully');
                    expect(result.data.id).to.be.greaterThan(0);
                    expect(result.data.summary).to.be.equal(summary);
                    expect(result.data.date).not.be.empty;
                    expect(result.data.date.split('T')[0]).to.be.equal(date.split('T')[0]);

                    managerTask = result.data;

                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.be.null;
                resolve();
            });
    });

    it(`POST /tasks - Add task based on user role: Technician`, () => {
        return new Promise(resolve => {
            const date = new Date().toISOString().split('.')[0];
            const summary = `Task test summary ${Math.random()}`;

            chai
                .request(app)
                .post(uri + '/task/task')
                .set('cookie', global.sessionTechnician)
                .send({ date, summary })
                .end(async (err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('data');
                    expect(result).to.have.property('message');
                    expect(result.data).not.be.empty;
                    expect(result.message).to.be.equal('Task added successfully');
                    expect(result.data.id).to.be.greaterThan(0);
                    expect(result.data.summary).to.be.equal(summary);
                    expect(result.data.date).not.be.empty;
                    expect(result.data.date.split('T')[0]).to.be.equal(date.split('T')[0]);

                    technicianTask = result.data;

                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.be.null;
                resolve();
            });
    });

    it(`GET /tasks - List all tasks based on user role: Manager`, () => {
        return new Promise(resolve => {
            chai
                .request(app)
                .get(uri + '/task/tasks')
                .set('cookie', global.sessionManager)
                .send()
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('data');
                    expect(result.data).not.be.empty;
                    expect(result.data).to.be.lengthOf(2);

                    expect(result.data[0].id).to.be.equal(technicianTask.id);
                    expect(result.data[1].id).to.be.equal(managerTask.id);

                    resolve();
                });
        })
        .catch(err => {
            expect(err).to.deep.equal(null);
            resolve();
        });
    });

    it(`GET /tasks - List all tasks based on user role: Technician`, () => {
        return new Promise(resolve => {
            chai
                .request(app)
                .get(uri + '/task/tasks')
                .set('cookie', global.sessionTechnician)
                .send()
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('data');
                    expect(result.data).not.be.empty;
                    expect(result.data).to.be.lengthOf(1);

                    expect(result.data[0].id).to.be.equal(technicianTask.id);

                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.deep.equal(null);
                resolve();
            });
    });

    it(`GET /task/:id - List task by id and technician is not able to see manager's tasks`, () => {
        return new Promise(resolve => {
            chai
                .request(app)
                .get(`${uri}/task/task/${managerTask.id}`)
                .set('cookie', global.sessionTechnician)
                .send()
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('data');
                    expect(result.data).to.be.null;

                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.deep.equal(null);
                resolve();
            });
    });

    it(`GET /task/:id - List task by id and manager is able to see any task`, () => {
        return new Promise(resolve => {
            chai
                .request(app)
                .get(`${uri}/task/task/${technicianTask.id}`)
                .set('cookie', global.sessionManager)
                .send()
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('data');
                    expect(result.data).not.be.null;
                    expect(result.data.id).to.be.equal(technicianTask.id);
                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.deep.equal(null);
                resolve();
            });
    });

    it(`PUT /task/:id - User role: "technician", can only change its own tasks`, () => {
        return new Promise(resolve => {
            const date = new Date().toISOString().split('.')[0];
            const summary = `Task test summary ${Math.random()}`;
            chai
                .request(app)
                .put(`${uri}/task/task/${technicianTask.id}`)
                .set('cookie', global.sessionTechnician)
                .send({ date, summary })
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    expect(res.status).to.be.equal(200);
                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('message');
                    expect(result.message).to.be.equal('Task changed successfully');
                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.deep.equal(null);
                resolve();
            });
    });

    it(`PUT /task/:id - User role: "technician", can't change manager's tasks`, () => {
        return new Promise(resolve => {
            const date = new Date().toISOString().split('.')[0];
            const summary = `Task test summary ${Math.random()}`;
            chai
                .request(app)
                .put(`${uri}/task/task/${managerTask.id}`)
                .set('cookie', global.sessionTechnician)
                .send({ date, summary })
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    expect(res.status).to.be.equal(403);
                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('message');
                    expect(result.message).to.have.string(`Task #${managerTask.id} can't be changed`);
                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.deep.equal(null);
                resolve();
            });
    });

    it(`PUT /task/:id - User role: "manager", can change any task`, () => {
        return new Promise(resolve => {
            const date = new Date().toISOString().split('.')[0];
            const summary = `Task test summary ${Math.random()}`;
            chai
                .request(app)
                .put(`${uri}/task/task/${technicianTask.id}`)
                .set('cookie', global.sessionManager)
                .send({ date, summary })
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    expect(res.status).to.be.equal(200);
                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('message');
                    expect(result.message).to.have.string(`Task changed successfully`);
                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.deep.equal(null);
                resolve();
            });
    });

    it(`DELETE /task/:id - User role: "technician", can't remove any task`, () => {
        return new Promise(resolve => {
            const date = new Date().toISOString().split('.')[0];
            const summary = `Task test summary ${Math.random()}`;
            chai
                .request(app)
                .delete(`${uri}/task/task/${technicianTask.id}`)
                .set('cookie', global.sessionTechnician)
                .send({ date, summary })
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    expect(res.status).to.be.equal(403);
                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('message');
                    expect(result.message).to.have.string(`Task #${technicianTask.id} can't be removed`);
                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.deep.equal(null);
                resolve();
            });
    });

    it(`DELETE /task/:id - User role: "manager", can remove any task`, () => {
        return new Promise(resolve => {
            const date = new Date().toISOString().split('.')[0];
            const summary = `Task test summary ${Math.random()}`;
            chai
                .request(app)
                .delete(`${uri}/task/task/${technicianTask.id}`)
                .set('cookie', global.sessionManager)
                .send({ date, summary })
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    expect(res.status).to.be.equal(200);
                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('message');
                    expect(result.message).to.have.string(`deleted row(s):`);
                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.deep.equal(null);
                resolve();
            });
    });
});