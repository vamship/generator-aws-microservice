'use strict';

const _fs = require('fs');
const _path = require('path');
const Promise = require('bluebird').Promise;

const _statFile = Promise.promisify(_fs.stat);
const _readDir = Promise.promisify(_fs.readdir);

function _traverse(dirPath, select) {
    const resultList = [];
    return _statFile(dirPath).then((stats) => {
        const result = select(dirPath, stats);
        if(result) {
            resultList.push(result);
        }
        if(stats.isDirectory()) {
            return _readDir(dirPath).then((fileList) => {
                return Promise.map(fileList, (fileName) => {
                    const childPath = _path.join(dirPath, fileName);
                    return _traverse(childPath, select);
                });
            });
        }
        return [];
    }).then((data) => {
        return data.reduce((result, record) => {
            return result.concat(record);
        }, resultList);
    });
}

/**
 * Module that exposes commonly required file system utils.
 */
module.exports = {
    /**
     * Returns a list of sub directory paths under the specified directory path
     * This method will perform a recursive traversal of all directories under
     * the directory path, and return full paths of all sub directories.
     *
     * @param {String} dirPath The path to the start directory.
     *
     * @return {Object} A promise that will be rejected or resolved based
     *         on the outcome of this operation. If resolved, an array
     *         of directories will be contained in the resolution args.
     */
    getSubDirectoryPaths: function(dirPath) {
        if(typeof dirPath !== 'string' || dirPath.length <= 0) {
            throw new Error('Invalid dirPath specified (arg #1)');
        }
        return _traverse(dirPath, (path, stats) => stats.isDirectory()?path:null);
    },

    /**
     * Returns a list of files in the specified directory, after applying a
     * transform to the file names.
     *
     * @param {String} dirPath The path to the directory
     * @param {Function} [select=(parent, file, stats) => path] An optional
     *        selector function that selects the output value.
     *
     * @return {Object} A promise that will be rejected or resolved based on
     *         the outcome of the operation. If resolved an array of values
     *         will be returned.
     */
    getFilesInDir: function(dirPath, select){
        if(typeof dirPath !== 'string' || dirPath.length <= 0) {
            throw new Error('Invalid dirPath specified (arg #1)');
        }
        if(typeof select !== 'function') {
            throw new Error('Invalid selection function specified (arg #2)');
        }
        return _readDir(dirPath).then((fileList) => {
            return Promise.map(fileList, (fileName) => {
                const childPath = _path.join(dirPath, fileName);
                return _statFile(childPath).then((stats) => {
                    return select(dirPath, fileName, stats);
                });
            });
        });
    }

};
