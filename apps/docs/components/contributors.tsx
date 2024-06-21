import Image from "next/image";
const cont = [
  { name: "sahil", profile: "https://github.com/sahilm416.png" },
  { name: "sahil", profile: "https://github.com/github.png" },
  { name: "sahil", profile: "https://github.com/nextjs.png" },
  { name: "sahil", profile: "https://github.com/shadcn.png" },
  { name: "sahil", profile: "https://github.com/rauchg.png" },
];
const Contributors = () => {
  return (
    <div className="w-full flex flex-col gap-5 items-center">
      <h1 className="text-4xl font-semibold">Contributors</h1>
      <div className="flex gap-2">
        {cont.map((c, i) => {
          return (
            <div key={i}>
              <Image
                src={c.profile}
                height={50}
                width={50}
                alt="profile"
                className="rounded-full cursor-pointer border"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Contributors;
