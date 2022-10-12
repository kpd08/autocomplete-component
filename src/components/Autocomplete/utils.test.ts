import { GithubRepo, GithubUser } from "./types";
import { mapUsersAndReposToResults } from "./utils";

const mockRepos: Array<GithubRepo> = [
  { name: "a_repo", html_url: "mock.url" },
  { name: "b_repo", html_url: "mock.url" },
];

const mockUsers: Array<GithubUser> = [
  { login: "a_user", html_url: "mock.url" },
  { login: "b_user", html_url: "mock.url" },
];

describe("mapUsersToResponse", () => {
  it("should map users and repos to result", () => {
    const results = mapUsersAndReposToResults(mockUsers, mockRepos);
    expect(results).toMatchSnapshot();
  });

  it("should return empty array if args are not provided", () => {
    const results = mapUsersAndReposToResults();
    expect(results).toEqual([]);
  });

  it("should limit result to 50 entries", () => {
    const userLong = new Array(100).fill(null).map(() => mockUsers[0]);
    expect(mapUsersAndReposToResults(userLong, mockRepos)).toHaveLength(50);
  });
});
