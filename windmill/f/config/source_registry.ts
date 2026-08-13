export type SourceClass = "primary_structured" | "secondary_signal" | "community";

export type FeedConfig = {
  key?: string;
  sourceType: string;
  publisher: string;
  url: string;
  sourceClass?: SourceClass;
  publisherReputation?: string;
};

export type SourceDefinition = FeedConfig & {
  status: "configured" | "planned";
};

// Only sources with verified feed URLs are configured by default.
export const sourceRegistry: readonly SourceDefinition[] = [
  {
    key: "sec_press_releases",
    sourceType: "sec_press_releases",
    publisher: "SEC",
    url: "https://www.sec.gov/news/pressreleases.rss",
    sourceClass: "primary_structured",
    publisherReputation: "High",
    status: "configured",
  },
  {
    key: "exchange_announcements",
    sourceType: "exchange_announcement",
    publisher: "Google News",
    url: "https://news.google.com/rss/search?q=%22market+announcement%22+OR+%22exchange+announcement%22+AI&hl=en-US&gl=US&ceid=US:en",
    sourceClass: "secondary_signal",
    publisherReputation: "Medium",
    status: "configured",
  },
  {
    key: "ir_pages",
    sourceType: "ir_release",
    publisher: "Google News",
    url: "https://news.google.com/rss/search?q=%22investor+relations%22+OR+%22company+press+release%22+OR+newsroom+AI&hl=en-US&gl=US&ceid=US:en",
    sourceClass: "secondary_signal",
    publisherReputation: "Medium",
    status: "configured",
  },
  {
    key: "pr_wires",
    sourceType: "press_release",
    publisher: "Google News",
    url: "https://news.google.com/rss/search?q=site%3Aprnewswire.com+OR+site%3Abusinesswire.com+AI+acquisition+OR+AI+partnership&hl=en-US&gl=US&ceid=US:en",
    sourceClass: "secondary_signal",
    publisherReputation: "Medium",
    status: "configured",
  },
  {
    key: "sector_press",
    sourceType: "sector_press",
    publisher: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    sourceClass: "secondary_signal",
    publisherReputation: "High",
    status: "configured",
  },
  {
    key: "business_press",
    sourceType: "business_press",
    publisher: "Dow Jones",
    url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
    sourceClass: "secondary_signal",
    publisherReputation: "High",
    status: "configured",
  },
  {
    key: "google_news_ai_adoption",
    sourceType: "ai_adoption_news",
    publisher: "Google News",
    url: "https://news.google.com/rss/search?q=AI+acquisition+OR+AI+partnership+OR+AI+investment&hl=en-US&gl=US&ceid=US:en",
    sourceClass: "secondary_signal",
    publisherReputation: "Medium",
    status: "configured",
  },
  {
    key: "google_news_ai_acquisitions",
    sourceType: "ai_acquisition_news",
    publisher: "Google News",
    url: "https://news.google.com/rss/search?q=AI+acquisition+OR+acquires+AI&hl=en-US&gl=US&ceid=US:en",
    sourceClass: "secondary_signal",
    publisherReputation: "Medium",
    status: "configured",
  },
  {
    key: "google_news_ai_partnerships",
    sourceType: "ai_partnership_news",
    publisher: "Google News",
    url: "https://news.google.com/rss/search?q=AI+partnership+OR+partners+AI&hl=en-US&gl=US&ceid=US:en",
    sourceClass: "secondary_signal",
    publisherReputation: "Medium",
    status: "configured",
  },
  {
    key: "google_news_ai_investments",
    sourceType: "ai_investment_news",
    publisher: "Google News",
    url: "https://news.google.com/rss/search?q=AI+investment+OR+invests+AI&hl=en-US&gl=US&ceid=US:en",
    sourceClass: "secondary_signal",
    publisherReputation: "Medium",
    status: "configured",
  },
];

export type SourceConfiguration = {
  feeds: FeedConfig[];
  unconfiguredKeys: string[];
};

type RegistryInput =
  | FeedConfig[]
  | {
      sourceKeys?: string[];
      feeds?: FeedConfig[];
    };

export function resolveSourceConfiguration(raw: string): SourceConfiguration {
  let input: RegistryInput;
  try {
    input = JSON.parse(raw) as RegistryInput;
  } catch {
    throw new Error("ADOPTX_FEEDS_JSON must be valid JSON");
  }

  if (Array.isArray(input)) {
    // Legacy arrays remain supported while inheriting newly configured registry sources.
    return {
      feeds: dedupeFeeds([
        ...sourceRegistry.filter((source) => source.status === "configured"),
        ...validateFeeds(input),
      ]),
      unconfiguredKeys: [],
    };
  }

  if (!input || typeof input !== "object") {
    throw new Error("ADOPTX_FEEDS_JSON must be an array or a source registry object");
  }

  const explicitFeeds = input.feeds ? validateFeeds(input.feeds) : [];
  const keys = input.sourceKeys ?? [];
  const registryByKey = new Map(sourceRegistry.map((source) => [source.key, source]));
  const unconfiguredKeys: string[] = [];
  const registryFeeds = keys.flatMap((key) => {
    const source = registryByKey.get(key);
    if (!source || source.status !== "configured") {
      unconfiguredKeys.push(key);
      return [];
    }
    return [source];
  });

  return {
    feeds: dedupeFeeds([...registryFeeds, ...explicitFeeds]),
    unconfiguredKeys,
  };
}

/** Resolves legacy feed-array entries to the registry key used by Settings. */
export function sourceKeyForFeed(feed: FeedConfig): string | null {
  if (feed.key) return feed.key;
  const match = sourceRegistry.find(
    (source) => source.url === feed.url || source.sourceType === feed.sourceType,
  );
  return match?.key ?? null;
}

function validateFeeds(feeds: FeedConfig[]): FeedConfig[] {
  if (!Array.isArray(feeds)) {
    throw new Error("Feed configuration must contain an array of feeds");
  }

  return feeds.map((feed, index) => {
    if (!feed || typeof feed !== "object") {
      throw new Error(`Feed ${index + 1} is not an object`);
    }
    if (!feed.publisher || !feed.sourceType || !feed.url) {
      throw new Error(`Feed ${index + 1} requires publisher, sourceType, and url`);
    }
    if (!/^https?:\/\//i.test(feed.url)) {
      throw new Error(`Feed ${feed.publisher} must use an http(s) URL`);
    }
    return feed;
  });
}

function dedupeFeeds(feeds: FeedConfig[]): FeedConfig[] {
  const seen = new Set<string>();
  return feeds.filter((feed) => {
    const identity = `${feed.publisher}:${feed.url}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}
