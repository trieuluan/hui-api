import { FastifyPluginAsync } from 'fastify';
import { SettingsService } from '../services/settings.service';

declare module 'fastify' {
  interface FastifyInstance {
    settingsService: SettingsService;
  }
}

const settingsPlugin: FastifyPluginAsync = async (fastify) => {
  const settingsService = new SettingsService(fastify.settingsModel);
  fastify.decorate('settingsService', settingsService);
};

export default settingsPlugin; 