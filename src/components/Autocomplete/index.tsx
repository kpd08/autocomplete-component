import {
  ChangeEvent,
  FC,
  useState,
  KeyboardEvent,
  useRef,
  useEffect,
  useMemo,
} from "react";
import classNames from "classnames";
import { Keys, AutcompleteEntry, EntryType } from "./types";
import { DEBOUNCE_WAIT_MS, MIN_PHRASE_LENGTH } from "./settings";
import { mapUsersAndReposToResults } from "./utils";
import githubSearchClient from "./lib/githubClient";
import debounce from "lodash.debounce";

interface AutocompleteProps {}

const Autocomplete: FC<AutocompleteProps> = () => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [entries, setEntries] = useState<Array<AutcompleteEntry>>([]);
  const [activeEntry, setActiveEntry] = useState<AutcompleteEntry | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (activeEntry) {
      const activeElement = document.querySelector(
        "[data-autocomplete-active=true]"
      );
      (activeElement as HTMLAnchorElement)?.scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
    }
  }, [activeEntry]);

  const handleInputChange = async (evt: ChangeEvent<HTMLInputElement>) => {
    const phrase = evt.target.value;
    setInputValue(phrase);
    if (phrase.length < MIN_PHRASE_LENGTH) {
      clearState(true);
    } else {
      fetchData(phrase);
    }
  };

  const fetchData = useMemo(
    () =>
      debounce(async (phrase: string) => {
        try {
          setIsLoading(true);
          clearState();
          const [users, repos] = await Promise.all([
            githubSearchClient.fetchUsers(phrase),
            githubSearchClient.fetchRepos(phrase),
          ]);
          const results = mapUsersAndReposToResults(users, repos);
          const isEmpty = results.length === 0;
          setEmptyMessage(isEmpty ? "Repositories or users not found" : null);
          setActiveEntry(isEmpty ? null : results[0]);
          setEntries(results);
        } catch (error) {
          const defaultErrorMessage = "Something went wrong";
          if (error instanceof Error) {
            setErrorMessage(error?.message || defaultErrorMessage);
          } else {
            setErrorMessage(defaultErrorMessage);
          }
        } finally {
          setIsLoading(false);
        }
      }, DEBOUNCE_WAIT_MS),
    []
  );

  const handleInputKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === Keys.Enter && activeEntry) {
      evt.preventDefault();
      window.open(activeEntry.url, "_blank");
    }

    if (evt.key === Keys.ArrowDown && entries.length) {
      evt.preventDefault();
      const index = entries.findIndex((result) => result === activeEntry);
      const nextItem = entries[index + 1] || entries[0];
      setActiveEntry(nextItem);
    }

    if (evt.key === Keys.ArrowUp && entries.length) {
      evt.preventDefault();
      const index = entries.findIndex((result) => result === activeEntry);
      const nextItem = entries[index - 1] || entries[entries.length - 1];
      setActiveEntry(nextItem);
    }
  };

  const clearState = (clearEntries?: boolean) => {
    setEmptyMessage(null);
    setActiveEntry(null);
    setErrorMessage(null);
    if (clearEntries) {
      setEntries([]);
    }
  };

  const renderResults = () => {
    if (emptyMessage) {
      return <div className="text-center p-3">{emptyMessage}</div>;
    }

    return entries.map((entry) => (
      <a
        className={classNames(
          "flex flex-nowrap justify-between items-center w-full p-3 outline-none",
          { "bg-slate-50": activeEntry === entry }
        )}
        key={entry.url}
        href={entry.url}
        target="_blank"
        rel="noreferrer"
        data-autocomplete-active={activeEntry === entry}
        onMouseEnter={() => setActiveEntry(entry)}
      >
        <span className="overflow-clip">{entry.name}</span>
        <span
          className={classNames(
            "ml-2 rounded px-2 py-1 text-xs flex items-center capitalize text-white",
            {
              "bg-green-600": entry.type === EntryType.User,
              "bg-blue-600": entry.type === EntryType.Repo,
            }
          )}
        >
          {entry.type}
        </span>
      </a>
    ));
  };

  return (
    <div className="flex flex-col items-center">
      <input
        onChange={handleInputChange}
        value={inputValue}
        placeholder="Search usernames or repositories"
        className={classNames(
          "border-2 rounded p-4 max-w-md w-full outline-none",
          {
            "border-red-500": errorMessage,
            "rounded-b-none": isLoading || errorMessage || entries.length,
          }
        )}
        ref={inputRef}
        onKeyDown={handleInputKeyDown}
      />
      <div className="flex flex-col max-w-md w-full max-h-autocompleteResults overflow-auto shadow-md rounded-b-md">
        {isLoading && <div className="text-center p-3">loading...</div>}
        {!isLoading && errorMessage && (
          <div className="text-center p-3">{errorMessage}</div>
        )}
        {!isLoading && !errorMessage && renderResults()}
      </div>
    </div>
  );
};

export default Autocomplete;
