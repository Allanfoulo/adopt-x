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
    return { feeds: validateFeeds(input), unconfiguredKeys: [] };
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
