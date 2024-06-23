"use client";
import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';

const Downloads = () => {
  const [downloads, setDownloads] = useState(0);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/anjum`, { next: { revalidate: 100 } });
        const packageInfo = await res.json();
        setDownloads(packageInfo.downloads);
      } catch (error) {
        console.error("Failed to fetch download data:", error);
      }
    };

    fetchDownloads();
  }, []);

  return (
    <div className="p-5 flex flex-col gap-5 justify-center items-center border rounded-md">
      <h1 className="text-4xl font-semibold dark:text-zinc-300 text-zinc-700">Weekly Downloads</h1>
      <div className="w-[200px] h-20 p-5 dark:bg-white bg-black flex justify-center items-center rounded-lg">
        <p className="text-2xl dark:text-black text-white font-bold">
          <CountUp end={downloads} duration={2} />
        </p>
      </div>
    </div>
  );
};

export default Downloads;