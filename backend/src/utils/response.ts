import { Response } from 'express';

export const success = (res: Response, data: any, message: string = 'Success', statusCode: number = 200) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const error = (res: Response, message: string = 'Error', statusCode: number = 500, details?: any) => {
  res.status(statusCode).json({
    status: 'error',
    message,
    details,
  });
};
