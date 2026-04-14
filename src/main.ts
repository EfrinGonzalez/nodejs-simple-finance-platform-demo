import { buildContainer } from './bootstrap/container.js';
import { buildApp } from './interfaces/http/app.js';

const start = async () => {
  const container = buildContainer();
  const app = await buildApp(container);
  await app.listen({ port: 3000, host: '0.0.0.0' });
};

start();
