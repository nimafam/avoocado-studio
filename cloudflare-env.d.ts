interface D1Result<T = unknown> { results?: T[]; success: boolean; meta?: unknown }
interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    all<T = unknown>(): Promise<D1Result<T>>;
    first<T = unknown>(column?: string): Promise<T | null>;
    run<T = unknown>(): Promise<D1Result<T>>;
}
interface D1Database {
    prepare(query: string): D1PreparedStatement;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}
interface R2ObjectBody { body: ReadableStream; httpEtag: string; writeHttpMetadata(headers: Headers): void }
interface R2Bucket {
    get(key: string): Promise<R2ObjectBody | null>;
    put(key: string, value: ArrayBuffer | ReadableStream, options?: { httpMetadata?: { contentType?: string; cacheControl?: string }; customMetadata?: Record<string, string> }): Promise<unknown>;
    delete(key: string): Promise<void>;
}
interface CloudflareEnv {
    DB: D1Database;
    ARTWORKS: R2Bucket;
    ADMIN_PASSWORD: string;
    ADMIN_SESSION_SECRET: string;
}

declare module "cloudflare:workers" {
    export const env: CloudflareEnv;
}

