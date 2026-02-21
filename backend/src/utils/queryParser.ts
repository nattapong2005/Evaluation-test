export interface QueryParams {
  skip: number;
  take: number;
  orderBy?: any;
  where?: any;
}

export const parseQueryParams = (query: any, searchFields: string[] = []): QueryParams => {
  const page = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.pageSize as string) || 10;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  let orderBy: any = undefined;
  if (query.sort) {
    const [field, direction] = (query.sort as string).split(':');
    if (field && (direction === 'asc' || direction === 'desc')) {
      orderBy = { [field]: direction };
    }
  }

  let where: any = {};
  if (query.q && searchFields.length > 0) {
    where.OR = searchFields.map((field) => ({
      [field]: { contains: query.q as string }, // Removed insensitive mode for broader compatibility
    }));
  }

  return { skip, take, orderBy, where };
};
