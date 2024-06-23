import { Octokit } from "@octokit/rest";
import Link from "next/link";

const Contributors = async () => {
  const octokit = new Octokit();

  const res = await octokit.rest.repos.listContributors({
    owner: "sahilm416",
    repo: "anjum",
  });

  if (!res || !res.data || res.data.length < 1) {
    return (
      <div className="text-2xl text-red-500 p-5">
        <h2>Failed to load contributors!</h2>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 items-center">
      <h1 className="text-4xl font-semibold">Contributors</h1>
      <div className="flex gap-2">
        {res.data.map((c, i) => {
          return (
            <div className="border rounded-full" key={i}>
              <Link target="blanc" href={c.html_url!}>
                <img
                  src={c.avatar_url}
                  width={50}
                  height={50}
                  className="rounded-full"
                  title={c.login}
                />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Contributors;
