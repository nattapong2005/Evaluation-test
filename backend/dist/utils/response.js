"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.success = void 0;
const success = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        status: 'success',
        message,
        data,
    });
};
exports.success = success;
const error = (res, message = 'Error', statusCode = 500, details) => {
    res.status(statusCode).json({
        status: 'error',
        message,
        details,
    });
};
exports.error = error;
