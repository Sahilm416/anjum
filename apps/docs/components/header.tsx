import Link from "next/link";

const Header = () => {
  return (
    <div className="border rounded-md m-5 sm:p-5 p-2">
      <div className="p-5 flex flex-col gap-4">
        <h1 className="sm:text-7xl text-5xl font-semibold">
          Project{" "}
          <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
            anjum
          </span>
        </h1>
        <p className="text-zinc-600">Simple email-password auth for next.js</p>
        <div className="flex justify-center gap-2">
          <Link
            href={"/docs"}
            className="w-[130px] hover:border-blue-500 border text-center bg-zinc-900 p-2 rounded-full text-white"
          >
            read docs
          </Link>
          <Link
          target="blanc"
            href={"https://github.com/sahilm416/anjum"}
            className="w-[130px] hover:border-blue-500 flex justify-center gap-2 border text-center bg-zinc-900 p-2 rounded-full text-white"
          >
            <GitHubLogo />
            github
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;

const GitHubLogo = () => {
  return (
    <svg
      className="fill-white w-[25px] h-[25px]"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 97.6 96"
    >
      <path
        d="M48.9,0C21.8,0,0,22,0,49.2C0,71,14,89.4,33.4,95.9c2.4,0.5,3.3-1.1,3.3-2.4c0-1.1-0.1-5.1-0.1-9.1
	c-13.6,2.9-16.4-5.9-16.4-5.9c-2.2-5.7-5.4-7.2-5.4-7.2c-4.4-3,0.3-3,0.3-3c4.9,0.3,7.5,5.1,7.5,5.1c4.4,7.5,11.4,5.4,14.2,4.1
	c0.4-3.2,1.7-5.4,3.1-6.6c-10.8-1.1-22.2-5.4-22.2-24.3c0-5.4,1.9-9.8,5-13.2c-0.5-1.2-2.2-6.3,0.5-13c0,0,4.1-1.3,13.4,5.1
	c3.9-1.1,8.1-1.6,12.2-1.6s8.3,0.6,12.2,1.6c9.3-6.4,13.4-5.1,13.4-5.1c2.7,6.8,1,11.8,0.5,13c3.2,3.4,5,7.8,5,13.2
	c0,18.9-11.4,23.1-22.3,24.3c1.8,1.5,3.3,4.5,3.3,9.1c0,6.6-0.1,11.9-0.1,13.5c0,1.3,0.9,2.9,3.3,2.4C83.6,89.4,97.6,71,97.6,49.2
	C97.7,22,75.8,0,48.9,0z"
      />
    </svg>
  );
};