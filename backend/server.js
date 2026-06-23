import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 DzHotels API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

start();

// Safety nets
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection: ${err.message}`);
  process.exit(1);
});
