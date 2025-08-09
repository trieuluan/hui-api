import { FastifyPluginAsync } from 'fastify';
import { authMiddleware } from '@/middlewares/authMiddleware';
import { z } from 'zod';

const settingsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all settings by category
  fastify.get('/settings/:category', {
    preHandler: authMiddleware,
    schema: {
      params: z.object({
        category: z.string(),
      }),
    },
  }, async (request, reply) => {
    const { category } = request.params as { category: string };
    
    try {
      const settings = await fastify.settingsService.getSettingsByCategory(category);
      return reply.send({ settings });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to fetch settings' });
    }
  });

  // Get specific setting
  fastify.get('/settings/:category/:key', {
    preHandler: authMiddleware,
    schema: {
      params: z.object({
        category: z.string(),
        key: z.string(),
      }),
    },
  }, async (request, reply) => {
    const { category, key } = request.params as { category: string; key: string };
    const settingId = `${category}_${key}`;
    
    try {
      const value = await fastify.settingsService.getSetting(settingId);
      if (value === null) {
        return reply.status(404).send({ error: 'Setting not found' });
      }
      return reply.send({ value });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to fetch setting' });
    }
  });

  // Update setting
  fastify.patch('/settings/:category/:key', {
    preHandler: authMiddleware,
    schema: {
      params: z.object({
        category: z.string(),
        key: z.string(),
      }),
      body: z.object({
        value: z.any(),
      }),
    },
  }, async (request, reply) => {
    const { category, key } = request.params as { category: string; key: string };
    const { value } = request.body as { value: any };
    const settingId = `${category}_${key}`;
    
    try {
      await fastify.settingsService.updateSetting(settingId, value);
      return reply.send({ message: 'Setting updated successfully' });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to update setting' });
    }
  });

  // Create new setting
  fastify.post('/settings', {
    preHandler: authMiddleware,
    schema: {
      body: z.object({
        id: z.string(),
        category: z.string(),
        key: z.string(),
        value: z.any(),
        description: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    const setting = request.body as any;
    
    try {
      const newSetting = await fastify.settingsService.createSetting(setting);
      return reply.status(201).send({ setting: newSetting });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to create setting' });
    }
  });
};

export default settingsRoutes; 