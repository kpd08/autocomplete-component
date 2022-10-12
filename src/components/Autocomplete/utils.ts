import { MAX_ENTRIES_COUNT } from "./settings";
import { GithubRepo, GithubUser, AutcompleteEntry, EntryType } from "./types";

const mapUsersAndReposToResults = (
  users: Array<GithubUser> = [],
  repos: Array<GithubRepo> = []
): Array<AutcompleteEntry> => {
  const usersResults: Array<AutcompleteEntry> = users.map((user) => ({
    name: user.login,
    type: EntryType.User,
    url: user.html_url,
  }));

  const reposResults: Array<AutcompleteEntry> = repos.map((repo) => ({
    name: repo.name,
    type: EntryType.Repo,
    url: repo.html_url,
  }));

  return usersResults
    .concat(reposResults)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, MAX_ENTRIES_COUNT);
};

export { mapUsersAndReposToResults };
