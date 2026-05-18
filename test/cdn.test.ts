import { describe, expect, it } from "vitest";
import { buildCdnImageUrl } from "../src/cdn.js";

describe("buildCdnImageUrl", () => {
  it("omits default CDN params and includes token", () => {
    expect(
      buildCdnImageUrl({
        slug: "toyota",
        token: "pk_00000000000000000000000000000000",
      }),
    ).toBe("https://motomarks.io/img/toyota?token=pk_00000000000000000000000000000000");
  });

  it("adds non-default CDN params", () => {
    expect(
      buildCdnImageUrl({
        slug: "mercedes-benz",
        token: "pk_00000000000000000000000000000000",
        type: "badge",
        format: "png",
        size: "lg",
        aspect: "height",
      }),
    ).toBe(
      "https://motomarks.io/img/mercedes-benz?type=badge&format=png&size=lg&aspect=height&token=pk_00000000000000000000000000000000",
    );
  });
});
