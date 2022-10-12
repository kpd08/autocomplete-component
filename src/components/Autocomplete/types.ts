enum Keys {
  ArrowDown = "ArrowDown",
  ArrowUp = "ArrowUp",
  Enter = "Enter",
}

enum EntryType {
  Repo = "repo",
  User = "user",
}

interface GithubUser {
  login: string;
  html_url: string;
}

interface GithubRepo {
  name: string;
  html_url: string;
}

interface AutcompleteEntry {
  name: string;
  type: EntryType;
  url: string;
}

interface GithubSearchResponse<T = any> {
  total_count: number;
  items: Array<T>;
  incomplete_results: boolean;
}

export type { AutcompleteEntry, GithubUser, GithubSearchResponse, GithubRepo };
export { Keys, EntryType };
