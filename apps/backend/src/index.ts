import 'dotenv/config';
import { connectDB } from './config/db';
import { createApp } from './app';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`\n🚀 EMS Backend running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   CORS origin:  ${process.env.FRONTEND_URL}\n`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
