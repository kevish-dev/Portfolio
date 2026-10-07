"use client";

import { useEffect, useState } from "react";
import { GITHUB_USERNAME } from "@/data/site";

interface GitHubStats {
  publicRepos: number;
  followers: number;
  following: number;
  totalStars: number;
  accountAge: number;
  contributionsThisMonth: number;
  longestStreak: number;
  currentStreak: number;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionWeek {
  days: ContributionDay[];
}

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

interface User {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
}

interface StarredRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export default function GitHubContributions() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [contributions, setContributions] = useState<ContributionWeek[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("contributions");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [animatedCells, setAnimatedCells] = useState<Set<string>>(new Set());
  const [hoveredCell, setHoveredCell] = useState<{
    weekIdx: number;
    dayIdx: number;
    x: number;
    y: number;
  } | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [starredRepos, setStarredRepos] = useState<StarredRepo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingTab, setLoadingTab] = useState<string | null>(null);

  const username = GITHUB_USERNAME;

  useEffect(() => {
    fetchGitHubData();
  }, []);

  useEffect(() => {
    if (contributions.length > 0 && !loading && activeTab === "contributions") {
      const totalCells = contributions.reduce(
        (acc, week) => acc + week.days.length,
        0,
      );
      let cellIndex = 0;

      const animateInterval = setInterval(() => {
        if (cellIndex >= totalCells) {
          clearInterval(animateInterval);
          return;
        }

        let currentIndex = 0;
        for (let weekIdx = 0; weekIdx < contributions.length; weekIdx++) {
          for (
            let dayIdx = 0;
            dayIdx < contributions[weekIdx].days.length;
            dayIdx++
          ) {
            if (currentIndex === cellIndex) {
              setAnimatedCells((prev) =>
                new Set(prev).add(`${weekIdx}-${dayIdx}`),
              );
            }
            currentIndex++;
          }
        }
        cellIndex++;
      }, 5);

      return () => clearInterval(animateInterval);
    }
  }, [contributions, loading, activeTab]);

  // GitHub API calls go through /api/github (server-side token + caching).
  const fetchWithAuth = (url: string) => fetch(url);

  const calculateStreak = (contributions: ContributionDay[]) => {
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const sortedContributions = [...contributions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    for (let i = 0; i < sortedContributions.length; i++) {
      if (sortedContributions[i].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    for (const day of contributions) {
      if (day.count > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak, longestStreak };
  };

  const calculateThisMonthContributions = (
    contributions: ContributionDay[],
  ) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return contributions
      .filter((day) => new Date(day.date) >= firstDayOfMonth)
      .reduce((acc, day) => acc + day.count, 0);
  };

  const fetchGitHubData = async () => {
    try {
      const userResponse = await fetchWithAuth(
        `/api/github/users/${username}`,
      );
      const userData = await userResponse.json();

      const accountCreationDate = new Date(userData.created_at);
      const accountAge = Math.floor(
        (new Date().getTime() - accountCreationDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const reposResponse = await fetchWithAuth(
        `/api/github/users/${username}/repos?per_page=100&sort=updated`,
      );
      const reposData = await reposResponse.json();

      const totalStars = Array.isArray(reposData)
        ? reposData.reduce(
            (acc: number, repo: { stargazers_count?: number }) =>
              acc + (repo.stargazers_count || 0),
            0,
          )
        : 0;

      await fetchContributions(userData, totalStars, accountAge);
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      generatePlaceholderData();
    } finally {
      setLoading(false);
    }
  };

  const fetchContributions = async (
    userData: any,
    totalStars: number,
    accountAge: number,
  ) => {
    try {
      const response = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      );
      const data = await response.json();

      if (data && data.contributions) {
        const allContributions = data.contributions.flat();
        const weeksToShow = 52;
        const daysNeeded = weeksToShow * 7;
        const recentDays = allContributions.slice(-daysNeeded);

        const weeks: ContributionWeek[] = [];
        for (let i = 0; i < recentDays.length; i += 7) {
          const weekDays = recentDays.slice(i, i + 7);
          weeks.push({
            days: weekDays.map(
              (day: { date: string; count: number; level: number }) => ({
                date: day.date,
                count: day.count,
                level: day.level,
              }),
            ),
          });
        }

        setContributions(weeks);
        const total =
          data.total?.lastYear ||
          allContributions.reduce(
            (acc: number, day: { count: number }) => acc + day.count,
            0,
          );
        setTotalContributions(total);

        const { currentStreak, longestStreak } =
          calculateStreak(allContributions);
        const thisMonthContributions =
          calculateThisMonthContributions(allContributions);

        setStats({
          publicRepos: userData.public_repos || 0,
          followers: userData.followers || 0,
          following: userData.following || 0,
          totalStars: totalStars,
          accountAge: accountAge,
          contributionsThisMonth: thisMonthContributions,
          longestStreak: longestStreak,
          currentStreak: currentStreak,
        });

        if (recentDays.length > 0) {
          const startDate = new Date(recentDays[0].date);
          const endDate = new Date(recentDays[recentDays.length - 1].date);
          setStartMonth(
            startDate.toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            }),
          );
          setEndMonth(
            endDate.toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            }),
          );
        }
      }
    } catch (error) {
      console.error("Error fetching contributions:", error);
      generatePlaceholderData();
    }
  };

  const fetchRepositories = async () => {
    setLoadingTab("repositories");
    try {
      const response = await fetchWithAuth(
        `/api/github/users/${username}/repos?per_page=100&sort=updated`,
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setRepositories(data);
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
    } finally {
      setLoadingTab(null);
    }
  };

  const fetchFollowers = async () => {
    setLoadingTab("followers");
    try {
      const response = await fetchWithAuth(
        `/api/github/users/${username}/followers?per_page=100`,
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setFollowers(data);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    } finally {
      setLoadingTab(null);
    }
  };

  const fetchFollowing = async () => {
    setLoadingTab("following");
    try {
      const response = await fetchWithAuth(
        `/api/github/users/${username}/following?per_page=100`,
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setFollowing(data);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    } finally {
      setLoadingTab(null);
    }
  };

  const fetchStarredRepos = async () => {
    setLoadingTab("stars");
    try {
      const response = await fetchWithAuth(
        `/api/github/users/${username}/starred?per_page=100`,
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setStarredRepos(data);
      }
    } catch (error) {
      console.error("Error fetching starred repos:", error);
    } finally {
      setLoadingTab(null);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    if (tabId === "repositories" && repositories.length === 0) {
      fetchRepositories();
    } else if (tabId === "followers" && followers.length === 0) {
      fetchFollowers();
    } else if (tabId === "following" && following.length === 0) {
      fetchFollowing();
    } else if (tabId === "stars" && starredRepos.length === 0) {
      fetchStarredRepos();
    }
  };

  const generatePlaceholderData = () => {
    const weeks: ContributionWeek[] = [];
    const today = new Date();
    const weeksToShow = 52;
    let total = 0;

    for (let w = weeksToShow - 1; w >= 0; w--) {
      const weekDays: ContributionDay[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const count = Math.floor(Math.random() * 10);
        total += count;
        weekDays.push({
          date: date.toISOString().split("T")[0],
          count,
          level:
            count === 0
              ? 0
              : count <= 2
                ? 1
                : count <= 5
                  ? 2
                  : count <= 8
                    ? 3
                    : 4,
        });
      }
      weeks.push({ days: weekDays });
    }

    setContributions(weeks);
    setTotalContributions(total);

    setStats({
      publicRepos: 0,
      followers: 0,
      following: 0,
      totalStars: 0,
      accountAge: 0,
      contributionsThisMonth: 0,
      longestStreak: 0,
      currentStreak: 0,
    });

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - weeksToShow * 7);
    setStartMonth(
      startDate.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
    );
    setEndMonth(
      today.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    );
  };

  const getLevelColor = (level: number, isAnimated: boolean) => {
    if (!isAnimated) return "#ebedf0";
    switch (level) {
      case 1:
        return "#d4f0c4";
      case 2:
        return "#a8e085";
      case 3:
        return "#7cc754";
      case 4:
        return "#c5f467";
      default:
        return "#ebedf0";
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return past.toLocaleDateString();
  };

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ),
  );

  const ShimmerCard = () => (
    <div className="bg-white rounded p-2 border border-gray-100">
      <div className="flex items-start gap-2 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  const widgetHeader = (
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-0.5">
          GitHub
        </p>
        <h2 className="text-lg font-semibold text-gray-900">@{username}</h2>
      </div>
      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${username} on GitHub`}
        className="text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </a>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          {widgetHeader}
          {/* Distinct keys stop React reusing skeleton nodes for real content, which caused a layout shift */}
          <div key="skeleton" className="animate-pulse space-y-3">
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
              ))}
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "contributions", label: "Contributions", count: totalContributions },
    { id: "overview", label: "Overview" },
    { id: "repositories", label: "Repositories", count: stats?.publicRepos },
    { id: "followers", label: "Followers", count: stats?.followers },
    { id: "following", label: "Following", count: stats?.following },
    { id: "stars", label: "Stars", count: stats?.totalStars },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        {widgetHeader}

        <div key="tabs" className="flex flex-wrap gap-1.5 mb-4 border-b border-gray-200 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-xs ${
                    activeTab === tab.id ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  ({formatNumber(tab.count)})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="">
          {activeTab === "overview" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  {
                    label: "Contributions",
                    value: formatNumber(totalContributions),
                    tooltip: "Total contributions in the last year",
                  },
                  {
                    label: "Repositories",
                    value: formatNumber(stats?.publicRepos || 0),
                    tooltip: "Public repositories",
                  },
                  {
                    label: "Followers",
                    value: formatNumber(stats?.followers || 0),
                    tooltip: "GitHub followers",
                  },
                  {
                    label: "Following",
                    value: formatNumber(stats?.following || 0),
                    tooltip: "Accounts you follow",
                  },
                  {
                    label: "Total Stars",
                    value: formatNumber(stats?.totalStars || 0),
                    tooltip: "Total stars across all repositories",
                  },
                  {
                    label: "Account Age",
                    value: `${stats?.accountAge || 0}d`,
                    tooltip: "Days on GitHub",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded p-2 border border-gray-200 hover:border-gray-300 transition-all group relative"
                    title={stat.tooltip}
                  >
                    <p className="text-lg font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded p-3 border border-gray-200">
                <h3 className="text-sm font-semibold mb-2">Streaks</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-base font-bold text-gray-900">
                      {stats?.contributionsThisMonth || 0}
                    </p>
                    <p className="text-xs text-gray-600">This Month</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-base font-bold text-gray-900">
                      {stats?.longestStreak || 0}
                    </p>
                    <p className="text-xs text-gray-600">Longest</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-base font-bold text-gray-900">
                      {stats?.currentStreak || 0}
                    </p>
                    <p className="text-xs text-gray-600">Current</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "repositories" && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search repositories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 pl-9 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                />
                <svg
                  className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {loadingTab === "repositories" ? (
                <div className="grid gap-2">
                  {[...Array(6)].map((_, i) => (
                    <ShimmerCard key={i} />
                  ))}
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded border border-gray-200">
                  <p className="text-gray-600 text-sm">No repositories found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Try adjusting your search
                  </p>
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                  {filteredRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="bg-gray-50 rounded p-3 border border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors flex-1 truncate"
                        >
                          {repo.name}
                        </a>
                        <div className="flex items-center gap-2 text-xs text-gray-600 ml-2">
                          <span title="Stars">
                            ★ {formatNumber(repo.stargazers_count)}
                          </span>
                          <span title="Forks">
                            ⑂ {formatNumber(repo.forks_count)}
                          </span>
                        </div>
                      </div>
                      {repo.description && (
                        <p className="text-gray-600 text-xs mb-1.5 line-clamp-1">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {repo.language && (
                          <span className="px-1.5 py-0.5 bg-white rounded">
                            {repo.language}
                          </span>
                        )}
                        <span className="text-[10px]">
                          Updated{" "}
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {activeTab === "contributions" && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Total", value: formatNumber(totalContributions) },
                {
                  label: "This Month",
                  value: formatNumber(stats?.contributionsThisMonth || 0),
                },
                { label: "Longest", value: `${stats?.longestStreak || 0}d` },
                { label: "Current", value: `${stats?.currentStreak || 0}d` },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded p-2 border border-gray-200 text-center"
                >
                  <p className="text-base font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded p-3 border border-gray-200">
              <h3 className="text-sm font-semibold mb-2">Contribution Graph</h3>

              <div className="relative">
                <div className="overflow-x-auto pb-2">
                  <div className="inline-flex gap-[2px] min-w-max">
                    {contributions.map((week, weekIdx) => (
                      <div key={weekIdx} className="flex flex-col gap-[2px]">
                        {week.days.map((day, dayIdx) => {
                          const cellKey = `${weekIdx}-${dayIdx}`;
                          const isAnimated = animatedCells.has(cellKey);
                          const isHovered =
                            hoveredCell?.weekIdx === weekIdx &&
                            hoveredCell?.dayIdx === dayIdx;

                          return (
                            <div
                              key={dayIdx}
                              className="w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-all duration-150 hover:scale-125"
                              style={{
                                backgroundColor: getLevelColor(
                                  day.level,
                                  isAnimated,
                                ),
                                transform: isAnimated ? "scale(1)" : "scale(0)",
                                opacity: isAnimated ? 1 : 0,
                              }}
                              onMouseEnter={(e) => {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                setHoveredCell({
                                  weekIdx,
                                  dayIdx,
                                  x: rect.left,
                                  y: rect.top,
                                });
                              }}
                              onMouseLeave={() => setHoveredCell(null)}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                {hoveredCell && (
                  <div
                    className="fixed bg-gray-900 text-white py-1.5 px-2.5 rounded text-[11px] shadow-lg pointer-events-none z-[9999] whitespace-nowrap"
                    style={{
                      top: `${hoveredCell.y - 50}px`,
                      left: `${Math.min(window.innerWidth - 200, hoveredCell.x)}px`,
                    }}
                  >
                    <div className="font-semibold">
                      {contributions[hoveredCell.weekIdx]?.days[
                        hoveredCell.dayIdx
                      ]?.count || 0}{" "}
                      contribution
                      {(contributions[hoveredCell.weekIdx]?.days[
                        hoveredCell.dayIdx
                      ]?.count || 0) !== 1
                        ? "s"
                        : ""}
                    </div>
                    <div className="text-gray-400 text-[10px]">
                      {formatDate(
                        contributions[hoveredCell.weekIdx]?.days[
                          hoveredCell.dayIdx
                        ]?.date || "",
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>{startMonth}</span>
                <span>{endMonth}</span>
              </div>

              <div className="flex items-center justify-end gap-1 mt-2 text-xs text-gray-600">
                <span className="text-[10px]">Less</span>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#ebedf0]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#d4f0c4]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#a8e085]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#7cc754]"></div>
                <div className="w-2.5 h-2.5 rounded-sm bg-[#c5f467]"></div>
                <span className="text-[10px]">More</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "followers" && (
          <div>
            {loadingTab === "followers" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <ShimmerCard key={i} />
                ))}
              </div>
            ) : followers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded border border-gray-200">
                <p className="text-gray-600 text-sm">No followers yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Start contributing to grow your network!
                </p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {followers.map((follower) => (
                    <a
                      key={follower.id}
                      href={follower.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-50 rounded p-2 border border-gray-200 hover:shadow-md transition-all flex items-center gap-2"
                    >
                      <img
                        src={follower.avatar_url}
                        alt={follower.login}
                        className="w-8 h-8 rounded-full border border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs text-gray-900 truncate">
                          {follower.name || follower.login}
                        </p>
                        <p className="text-[10px] text-gray-600 truncate">
                          @{follower.login}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "following" && (
          <div>
            {loadingTab === "following" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <ShimmerCard key={i} />
                ))}
              </div>
            ) : following.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded border border-gray-200">
                <p className="text-gray-600 text-sm">
                  Not following anyone yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Start following developers to stay updated!
                </p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {following.map((user) => (
                    <a
                      key={user.id}
                      href={user.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-50 rounded p-2 border border-gray-200 hover:shadow-md transition-all flex items-center gap-2"
                    >
                      <img
                        src={user.avatar_url}
                        alt={user.login}
                        className="w-8 h-8 rounded-full border border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs text-gray-900 truncate">
                          {user.name || user.login}
                        </p>
                        <p className="text-[10px] text-gray-600 truncate">
                          @{user.login}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "stars" && (
          <div>
            {loadingTab === "stars" ? (
              <div className="grid gap-2">
                {[...Array(6)].map((_, i) => (
                  <ShimmerCard key={i} />
                ))}
              </div>
            ) : starredRepos.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded border border-gray-200">
                <p className="text-gray-600 text-sm">
                  No starred repositories yet
                </p>
                <p className="text-xs text-gray-400 mt-1">Exploring soon...</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                {starredRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-50 rounded p-2 border border-gray-200 hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <img
                      src={repo.owner.avatar_url}
                      alt={repo.owner.login}
                      className="w-8 h-8 rounded-full border border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-gray-900 truncate">
                        {repo.name}
                      </p>
                      <p className="text-[10px] text-gray-600 truncate">
                        by @{repo.owner.login}
                      </p>
                    </div>
                    <span className="flex items-center gap-0.5 text-xs text-gray-600">
                      ★ {formatNumber(repo.stargazers_count)}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
