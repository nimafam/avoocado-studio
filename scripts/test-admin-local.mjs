import { readFileSync } from "node:fs";

const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3031";
const variables = Object.fromEntries(readFileSync(".dev.vars", "utf8").split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf("=");
    return [line.slice(0, separator), line.slice(separator + 1)];
}));

async function request(path, init = {}) {
    const response = await fetch(`${baseUrl}${path}`, init);
    const body = response.headers.get("content-type")?.includes("application/json") ? await response.json() : await response.arrayBuffer();
    if (!response.ok) throw new Error(`${init.method ?? "GET"} ${path}: ${response.status} ${JSON.stringify(body)}`);
    return { response, body };
}

const login = await request("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: variables.ADMIN_PASSWORD }) });
const cookie = login.response.headers.get("set-cookie")?.split(";")[0];
if (!cookie) throw new Error("Login did not return a session cookie");
const authHeaders = { Cookie: cookie };

let collectionId;
let designId;
try {
    const createdCollection = await request("/api/admin/catalog", { method: "POST", headers: { ...authHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ entity: "collection", slug: "integration-test", nameFa: "تست یکپارچه", nameEn: "Integration Test", active: true }) });
    collectionId = createdCollection.body.categories.find((item) => item.slug === "integration-test")?.id;
    if (!collectionId) throw new Error("Collection was not created");

    const uploadForm = new FormData();
    uploadForm.append("file", new Blob([readFileSync("public/models/tshirts/colors/loose-fit-white-front.png")], { type: "image/png" }), "test.png");
    const upload = await request("/api/admin/upload", { method: "POST", headers: authHeaders, body: uploadForm });

    const createdDesign = await request("/api/admin/catalog", { method: "POST", headers: { ...authHeaders, "Content-Type": "application/json" }, body: JSON.stringify({ entity: "design", slug: "integration-test-artwork", name: "Integration Test Artwork", description: "Temporary automated test", basePrice: 100, artworkKey: upload.body.key, collectionId, placements: ["left", "center"], active: true }) });
    designId = createdDesign.body.designs.find((item) => item.slug === "integration-test-artwork")?.id;
    if (!designId) throw new Error("Design was not created");

    const publicCatalog = await request("/api/catalog");
    const publicDesign = publicCatalog.body.designs.find((item) => item.slug === "integration-test-artwork");
    if (!publicDesign || publicDesign.placements !== "center,left" && publicDesign.placements !== "left,center") throw new Error("Public catalog did not expose the active design and placements");
    await request(`/api/artwork/${upload.body.key}`);
    console.log("Admin integration test passed: login, collection CRUD, upload, design CRUD, public catalog and placements.");
} finally {
    if (designId) await request(`/api/admin/catalog?entity=design&id=${designId}`, { method: "DELETE", headers: authHeaders });
    if (collectionId) await request(`/api/admin/catalog?entity=collection&id=${collectionId}`, { method: "DELETE", headers: authHeaders });
}
