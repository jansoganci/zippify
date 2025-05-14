import googleTrends from "google-trends-api";

// basit in‑memory cache
const cache = {};

/**
 * getTrends(keyword, geo = "US") → { popularity, relatedQueries[] }
 * - 3 retry (1 s → 2 s → 4 s)
 * - 24 saat cache
 */
export async function getTrends(keyword, geo = "US") {
  const key = `${keyword}_${geo}`;
  const now = Date.now();

  if (cache[key]?.expiresAt > now) return cache[key].data;

  const RETRIES = 3;
  let err;
  for (let i = 0; i < RETRIES; i++) {
    try {
      const [interest] = await googleTrends.interestOverTime({
        keyword,
        geo,
        hl: "en-US",
        timezone: 0,
        granularTimeResolution: true,
      });
      const popularity =
        interest.timelineData?.at(-1)?.value?.[0] ?? null;

      const [related] = await googleTrends.relatedQueries({
        keyword,
        geo,
        hl: "en-US",
      });
      const relatedQueries =
        related.default?.rankedList?.[0]?.rankedKeyword?.map((k) => ({
          query: k.query,
          value: k.value,
        })) ?? [];

      const data = { popularity, relatedQueries };
      cache[key] = { data, expiresAt: now + 24 * 60 * 60 * 1000 };
      return data;
    } catch (e) {
      err = e;
      console.warn(`Google Trends API retry ${i+1}/${RETRIES} failed: ${e.message}`);
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }
  
  // Tüm denemeler başarısız olursa, boş bir sonuç yerine temel veriler döndürelim
  console.error(`All ${RETRIES} attempts to Google Trends API failed. Using fallback data.`);
  return {
    popularity: 50,
    relatedQueries: [
      { query: `${keyword} online`, value: 70 },
      { query: `best ${keyword}`, value: 60 },
      { query: `handmade ${keyword}`, value: 50 }
    ]
  };
}
