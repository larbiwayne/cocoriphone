import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = new IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (file) {
      const tempPath = file.filepath;
      const newFileName = `${Date.now()}-${file.originalFilename}`;
      const newPath = path.join(process.cwd(), 'public/uploads', newFileName);

      fs.rename(tempPath, newPath, (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        const photoUrl = `/uploads/${newFileName}`;
        res.status(200).json({ imageUrl: photoUrl });
      });
    } else {
      res.status(400).json({ error: 'No file uploaded' });
    }
  });
};

export default handler;
