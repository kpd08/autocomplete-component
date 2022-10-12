import Autocomplete from ".";
import { GithubRepo, GithubUser } from "./types";
import { render, screen } from "@testing-library/react";
import githubClient from "./lib/githubClient";
import userEvent from "@testing-library/user-event";

const mockRepos: Array<GithubRepo> = [
  { name: "a_repo", html_url: "a_repo.url" },
  { name: "b_repo", html_url: "b_repo.url" },
];

const mockUsers: Array<GithubUser> = [
  { login: "a_user", html_url: "a_user.url" },
  { login: "b_user", html_url: "b_user.url" },
];

const fetchUsersSpy = jest.spyOn(githubClient, "fetchUsers");
const fetchReposSpy = jest.spyOn(githubClient, "fetchRepos");
const querySelectorSpy = jest.spyOn(document, "querySelector");

describe("Autocomplete", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render as expected", () => {
    expect(render(<Autocomplete />).container).toMatchSnapshot();
  });

  it("should display results", async () => {
    jest.useFakeTimers();
    const scrollMock = jest.fn();
    fetchReposSpy.mockResolvedValue(mockRepos);
    fetchUsersSpy.mockResolvedValue(mockUsers);
    querySelectorSpy.mockReturnValue({ scrollIntoView: scrollMock } as any);

    render(<Autocomplete />);

    const phrase = "abc";
    const input = screen.getByPlaceholderText(
      "Search usernames or repositories"
    );
    await userEvent.type(input, phrase);
    await screen.findByText("loading...");
    const links = await screen.findAllByRole("link");

    expect(fetchReposSpy).toHaveBeenNthCalledWith(1, phrase);
    expect(fetchUsersSpy).toHaveBeenNthCalledWith(1, phrase);
    expect(links[0]).toHaveAttribute("data-autocomplete-active", "true");
    expect(links[0]).toHaveAttribute("href", "a_repo.url");
    expect(scrollMock).toHaveBeenCalledTimes(1);
  });
});
