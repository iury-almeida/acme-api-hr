'use strict';

const repository = require('./staffRepository');

module.exports = {
    create,
    update,
    select,
    selectById,
    remove
}

async function create(params) {
    try {
        let result = await repository.create(params);
        return {
            result: result,
            message: "Staff created"
        };
    } catch (error) {
        return error;
    }
}

async function update(params) {
    try {
        let result = await repository.update(params);
        return {
            result: result,
            message: "Staff updated"
        };;
    } catch (error) {
        return error;
    }
}

async function select(params) {
    try {
        let result = await repository.select();
        return {
            result: result,
            message: "Staffs found"
        };
    } catch (error) {
        return error;
    }
}

async function selectById(params) {
    try {
        let result = await repository.selectById(params);
        return {
            result: result,
            message: "Staff found"
        };
    } catch (error) {
        return error;
    }
}

async function remove(params) {
    try {
        let result = await repository.remove(params);
        return {
            result: result,
            message: "Staff fired"
        };
    } catch (error) {
        return error;
    }
}
