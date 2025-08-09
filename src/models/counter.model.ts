import {FastifyInstance} from "fastify";

type CounterDocument = {
    _id: string;
    seq: number;
};

export class CounterModel {
    private fi: FastifyInstance;

    constructor(fi: FastifyInstance) {
        this.fi = fi;
    }

    private collection() {
        return this.fi.mongo.db!.collection<CounterDocument>("counters");
    }

    async init() {
        await this.collection().updateOne(
            { _id: 'groupCode' },
            { $setOnInsert: { seq: 0 } },
            { upsert: true }
        );
        this.fi.log.info('✅ Counter "groupCode" initialized');
    }

    async ensureInitialized() {
        const existing = await this.collection().findOne({ _id: 'groupCode' as any });
        if (!existing) {
            await this.init();
        }
    }

    async generateUniqueGroupCode(): Promise<string> {
        // Ensure counter is initialized
        await this.ensureInitialized();
        
        const result = await this.collection().findOneAndUpdate(
            { _id: 'groupCode' },
            { $inc: { seq: 1 } },
            { returnDocument: 'after', upsert: true }
        );

        const value: any = result && 'value' in result ? result.value : result;

        if (!value) {
            throw new Error(`Counter groupCode not found`);
        }

        const padded = String(value.seq).padStart(3, '0');
        return `HF-${padded}`;
    }
}

declare module 'fastify' {
    interface FastifyInstance {
        counterModel: CounterModel;
    }
}