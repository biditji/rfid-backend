import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  // Return the path that will be served by the static route
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
};
