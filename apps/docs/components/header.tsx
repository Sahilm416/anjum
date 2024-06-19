import Image from "next/image";
import headerImage from "../public/header.jpeg";
import Link from "next/link";

const header = () => {
  return (
    <div className="w-full flex sm:flex-row flex-col sm:justify-between justify-center items-center sm:max-w-full max-w-[400px] border shadow-md rounded-md overflow-hidden">
      <div className="text-start p-5 flex flex-col gap-4">
        <h1 className="text-5xl font-semibold">
          Project{" "}
          <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">
            anjum
          </span>
        </h1>
        <p className="text-zinc-600">Simple email-password auth for nextjs.</p>
        <Link
          href={"/docs"}
          className="w-[130px] text-center bg-zinc-900 p-2 rounded-full text-white"
        >
          read docs
        </Link>
      </div>
      <div>
        <Image
          loading="lazy"
          className="w-[400px] h-[400px]"
          src={headerImage}
          height={100}
          width={100}
          alt="header image"
        />
      </div>
    </div>
  );
};

export default header;
