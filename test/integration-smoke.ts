import { buildCdnImageUrl } from "../src/cdn.js";
import { loadConfig } from "../src/config.js";
import { MotomarksClient } from "../src/motomarks-client.js";

const config = loadConfig();
const client = new MotomarksClient(config);

const result = await client.searchBrands("toyota", 1);

if (result.count < 1) {
  throw new Error("Expected at least one Motomarks brand for integration smoke test.");
}

const slug = result.data[0].slug;
const url = buildCdnImageUrl({
  slug,
  token: config.publicKey,
  imageBaseUrl: config.imageBaseUrl,
});

console.error(`Integration smoke test passed for ${slug}: ${url}`);
