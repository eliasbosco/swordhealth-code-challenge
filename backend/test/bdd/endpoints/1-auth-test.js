const mocha = require('mocha');
const { describe } = mocha;

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../app');
const expect = chai.expect;
const uri = '/api/v1';
chai.use(chaiHttp);

global.sessionManager = '';
global.sessionTechnician = '';

describe('BDD TESTS', () => {
    it(`POST /auth - Testing authentication with user manager@swordhealth.com, role: 0 - manager`, () => {
        return new Promise(resolve => {
            chai
                .request(app)
                .post(uri + '/auth/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({ emailAddress: 'manager@swordhealth.com', password: 'abc123' })
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    expect(res.get('Set-Cookie')).to.be.not.null;

                    global.sessionManager = res.get('Set-Cookie')[0];
                    expect(global.sessionManager).to.contains('session_token');

                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('data');
                    expect(result.data).to.be.not.empty;
                    expect(result.data.emailAddress).to.be.equal('manager@swordhealth.com');
                    expect(result.data.role).to.be.equal(0);
                    resolve();
                });
        })
        .catch(err => {
            expect(err).to.be.null;
            resolve();
        });
    });

    it(`POST /auth - Testing authentication with user technician@swordhealth.com, role: 1 - technician`, () => {
        return new Promise(resolve => {
            chai
                .request(app)
                .post(uri + '/auth/login')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({ emailAddress: 'technician@swordhealth.com', password: 'abc123' })
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    expect(res.get('Set-Cookie')).to.be.not.null;

                    global.sessionTechnician = res.get('Set-Cookie')[0];
                    expect(global.sessionTechnician).to.contains('session_token');

                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('data');
                    expect(result.data).to.be.not.empty;
                    expect(result.data.emailAddress).to.be.equal('technician@swordhealth.com');
                    expect(result.data.role).to.be.equal(1);
                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.be.null;
                resolve();
            });
    });

    it(`GET /auth/is-logged - Testing if the user manager@swordhealth.com is already logged in`, () => {
        return new Promise(resolve => {
            chai
                .request(app)
                .get(uri + '/auth/is-logged')
                .set('cookie', global.sessionManager)
                .send()
                .end((err, res) => {
                    if (err !== null) {
                        throw err;
                    }

                    const result = JSON.parse(res.text.trim());
                    expect(result).to.have.property('data');
                    expect(result.data).to.be.not.empty;
                    expect(result.data.emailAddress).to.be.equal('manager@swordhealth.com');
                    expect(result.data.role).to.be.equal(0);
                    resolve();
                });
        })
            .catch(err => {
                expect(err).to.be.null;
                resolve();
            });
    });
});