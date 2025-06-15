import {FastifyPluginAsync} from "fastify";
import fp from 'fastify-plugin';
import Backend from 'i18next-fs-backend';
import {handle, LanguageDetector} from "i18next-http-middleware";
import i18next, { TFunction } from 'i18next';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

declare module 'fastify' {
    interface FastifyRequest {
        t: TFunction;
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const i18nPlugin: FastifyPluginAsync = fp(
    async (fastify) => {
        await i18next
            .use(Backend)
            .use(LanguageDetector)
            .init({
                fallbackLng: 'vi',
                preload: ['en', 'vi'],
                backend: {
                    loadPath: join(__dirname, '../locales/{{lng}}/translation.json')
                },
                detection: {
                    order: ['header', 'querystring'],
                    caches: false
                }
            });

        fastify.addHook('onRequest', (req, res, done) => {
            handle(i18next)(req.raw, res.raw, () => {
                (req as any).t = (req.raw as any).t; // Set `t` early
                done();
            });
        });

        // fastify.addHook('preHandler', async (request) => {
        //     request.t = (request.raw as any).t;
        //     console.log(request.t);
        // });
        fastify.log.info('✅ i18n initialized with i18next');
    }
)

export default i18nPlugin;