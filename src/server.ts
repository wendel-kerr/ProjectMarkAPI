import app from './app';
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`KB API on http://localhost:${port}`));
