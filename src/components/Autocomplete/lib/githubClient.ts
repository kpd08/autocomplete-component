import { GithubRepo, GithubSearchResponse, GithubUser } from "../types";

const API_URL = process.env.REACT_APP_GITHUB_SEARCH_API;

const defaultOptions: RequestInit = {
  headers: {
    Accept: "application/vnd.github+json",
  },
};

const defaultParams = { per_page: "50" };

const createGetRequest =
  <T = any>(path: string) =>
  async (phrase: string, params = defaultParams): Promise<Array<T>> => {
    try {
      const query = new URLSearchParams({
        ...params,
        q: encodeURIComponent(phrase),
      });
      const url = `${API_URL}${path}?${query.toString()}`;
      const res = await fetch(url, defaultOptions);
      if (res.ok) {
        const { items }: GithubSearchResponse<T> = await res.json();
        return items;
      } else {
        throw new Error();
      }
    } catch (error) {
      throw new Error("Request has failed");
    }
  };

interface GithubSearchClient {
  fetchRepos: (query: string) => Promise<Array<GithubRepo>>;
  fetchUsers: (query: string) => Promise<Array<GithubUser>>;
}

const githubSearchClient: GithubSearchClient = {
  fetchRepos: createGetRequest<GithubRepo>("/repositories"),
  fetchUsers: createGetRequest<GithubUser>("/users"),
};

export default githubSearchClient;
