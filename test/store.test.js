const rimraf = require('rimraf');
const assert = require('chai').assert;
const store = require('../lib/file-store');

describe('file store', () => {

    const testDir = 'testDir';

    const removeDir = done => rimraf(testDir, done);
    before(removeDir);
    after(removeDir);
    
    before(() => {
        store.config(testDir);
    });

    const felix = {
        name: 'felix',
        type: 'tuxedo',
        lives: 5
    };

    const garfield = {
        name: 'garfield',
        type: 'orange tabby',
        lives: 9
    };

    const tom = {
        name: 'tom',
        type: 'grey',
        lives: 1
    };

    it('returns empty array when no resources', done => {

        store.all()
            .then(cats => {
                assert.isOk(cats);
                assert.equal(cats.length, 0);
                done();
            })
            .catch(done);

    });

    it('saves and gets single object', done => {

        store.save(felix)
            .then(identifier => {
                assert.equal(identifier, felix.name);
                return store.get(identifier);
            })
            .then(cat => {
                assert.deepEqual(cat, felix);
                done();
            })
            .catch(done);
    });


    it('raises error on non-existant identifer', done => {

        store.get('notgood')
            .then(() => done('expected error from store.get'))
            .catch(err => {
                assert.match(err, /"notgood" is not a valid identifier/);
                done();
            });

    });

    it('retrieves all objects', done => {

        Promise.all([store.save(tom), store.save(garfield)])
            .then(() => {
                return store.all();
            })
            .then(cats => {
                assert.equal(cats.length, 3);
                assert.deepEqual(cats[0], felix);
                assert.deepEqual(cats[1], garfield);
                assert.deepEqual(cats[2], tom);
                done();
            })
            .catch(done);
    });

    it('deletes items', done => {
        store.remove(felix.name)
            .then(deleted => {
                assert.isOk(deleted);
                return store.all();
            })
            .then(cats => {
                assert.equal(cats.length, 2);
                done();
            })
            .catch(done);
    });

});