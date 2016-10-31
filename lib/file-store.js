const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');

function writeFile(filePath, serialized) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, serialized, err => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
}

function readDir(filePath) {
    return new Promise((resolve, reject) => {
        fs.readdir(filePath, (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    });
}

function removeFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, err => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function makeDir(dir) {
    return new Promise((resolve, reject) => {
        mkdirp(dir, err => {
            if (err) return reject(err);
            resolve();
        });
    });
}

module.exports = function makeStore(root) {

    const getFilePath = name => path.join(root, name + '.json');
    
    return {
        save: function(resource) {
            const name = resource.name;
            if (!name) return Promise.reject('resource must have a name property');

            const filePath = getFilePath(name);
            const serialized = JSON.stringify(resource);

            return makeDir(root)
                .then(() => writeFile(filePath, serialized))
                .then(() => name);
        },
        get: function(name) {
            const filePath = getFilePath(name);
            return readFile(filePath)
                .catch(err => {
                    if (err.code === 'ENOENT') {
                        throw new Error('"' + name + '" is not a valid identifier');
                    }
                    else {
                        throw err;
                    }
                })
                .then(data => {
                    return JSON.parse(data);
                });
        },
        remove: function(name) {
            const filePath = getFilePath(name);
            return removeFile(filePath)
                .catch(err => {
                    if (err.code === 'ENOENT') {
                        return false;
                    }
                    else {
                        throw err;
                    }
                })
                .then(() => {
                    return true;
                });
        },
        all: function() {

            return readDir(root)
                .then(files => {
                    const identifiers = files.map(f => path.basename(f, '.json'));
                    const promises = identifiers.map(id => this.get(id));
                    return Promise.all(promises);
                }, err => {
                    if (err.code === 'ENOENT') return [];
                    else throw err;
                });
        }
    };
    
};