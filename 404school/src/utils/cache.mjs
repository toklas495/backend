class Cache {
    constructor(fastify, service, namespace = "404school") {
        this.cache = fastify.redis;
        this.service = service;
        this.namespace = namespace;
        this.versions = [this.service];
    }

    useVersionOf(service) {
        if (!this.versions.includes(service)) {
            this.versions.push(service);
        }
        return this;
    }

    async build(...keyparams) {
        const keys = this.versions.map(
            (version) => `${this.namespace}:${version}:version`
        );

        const values = await this.cache.mget(keys);

        const keyParts = this.versions
            .map((version, index) => `${version}-${values[index] || "1"}`)
            .join(":");

        return `${this.namespace}:${keyParts}:${this.service}:${keyparams.join("-")}`;
    }

    async cacheData(...keyparams) {
        const key = await this.build(...keyparams);
        const value = await this.cache.get(key);
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    async set(data, ttl = 900, ...keyparams) {
        const key = await this.build(...keyparams);
        await this.cache.set(key, JSON.stringify(data), "EX", ttl);
    }

    async updateInc(service = this.service) {
        const version = `${this.namespace}:${service}:version`;
        await this.cache.incr(version);
    }

    async removeKey(...keyparams){
        const key = await this.build(...keyparams);
        return await this.cache.del(key);
    }
}

export default Cache;
