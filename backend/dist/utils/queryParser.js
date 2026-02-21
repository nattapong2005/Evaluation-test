"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseQueryParams = void 0;
const parseQueryParams = (query, searchFields = []) => {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    let orderBy = undefined;
    if (query.sort) {
        const [field, direction] = query.sort.split(':');
        if (field && (direction === 'asc' || direction === 'desc')) {
            orderBy = { [field]: direction };
        }
    }
    let where = {};
    if (query.q && searchFields.length > 0) {
        where.OR = searchFields.map((field) => ({
            [field]: { contains: query.q }, // Removed insensitive mode for broader compatibility
        }));
    }
    return { skip, take, orderBy, where };
};
exports.parseQueryParams = parseQueryParams;
