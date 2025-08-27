import { app } from './app';

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Phase 5 server listening on http://localhost:${port}`);
});
