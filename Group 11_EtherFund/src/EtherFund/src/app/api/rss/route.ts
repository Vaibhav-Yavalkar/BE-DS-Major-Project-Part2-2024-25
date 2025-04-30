import { NextResponse } from "next/server";
import { parseString } from "xml2js";

const RSS_FEEDS = [
  "https://www.crowdfundinsider.com/feed/",
  "https://www.kickstarter.com/blog?format=rss",
  "https://go.indiegogo.com/blog/feed",
  "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml",
  "https://cointelegraph.com/rss",
  "https://bitcoinmagazine.com/.rss/full/",
];

export async function GET() {
  try {
    console.log("🔍 Fetching multiple RSS feeds...");

    const timestamp = new Date().getTime();
    const requests = RSS_FEEDS.map((url) =>
      fetch(`${url}?t=${timestamp}`, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/rss+xml, application/xml, text/xml",
        },
        cache: "no-store",
      }).then((res) => res.text())
    );

    const responses = await Promise.all(requests);
    let allNews: any[] = [];

    responses.forEach((text, index) => {
      parseString(text, (err: any, result: any) => {
        if (err) {
          console.error(`❌ Error parsing RSS from ${RSS_FEEDS[index]}:`, err);
          return;
        }

        if (result?.rss?.channel?.[0]?.item) {
          const items = result.rss.channel[0].item
            .map((news: any) => {
              let imageUrl = "";

              if (news.enclosure && news.enclosure[0].$?.url) {
                imageUrl = news.enclosure[0].$.url;
              } else if (news["media:content"] && news["media:content"][0].$?.url) {
                imageUrl = news["media:content"][0].$.url;
              } else {
                return null; // 🚨 Skip items without images
              }

              return {
                title: news.title?.[0] || "No title",
                link: news.link?.[0] || "#",
                contentSnippet: news.description ? news.description[0].replace(/<[^>]+>/g, "") : "No description available",
                image: imageUrl,
              };
            })
            .filter((item) => item !== null); // ✅ Filter out news without images

          allNews.push(...items);
        }
      });
    });

    allNews = allNews.sort(() => Math.random() - 0.5);

    console.log("✅ Fetched & Parsed News:", allNews.slice(0, 5));
    return NextResponse.json(allNews);
  } catch (error) {
    console.error("❌ API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}