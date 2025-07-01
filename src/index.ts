import express from 'express';
import { dataSource } from './dbconfig';
import app from './server';

import { identify } from './controllers/identity_controller';

const { PORT } = process.env;

const identityRouter = express.Router({ mergeParams: true });

identityRouter.post('/identify', async (req, res) => {
  return await identify(req, res);
});

app.use('/', identityRouter);

app.use((_req, res) => {
  return res.json({
    message: 'Project is running successfully',
  });
});

async function main() {
  try {
    await dataSource.initialize();
  } catch (error) {
    console.log('error: ', error);
    throw new Error('Main error');
  }

  app.listen(PORT || 3000, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

main().catch((e) => console.log(e));
