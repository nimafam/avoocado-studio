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
interface CloudflareEnv {
    DB: D1Database;
    ADMIN_PASSWORD: string;
    ADMIN_SESSION_SECRET: string;
    UPLOAD_API_URL: string;
    UPLOAD_API_SECRET: string;
}

declare module "cloudflare:workers" {
    export const env: CloudflareEnv;
}
