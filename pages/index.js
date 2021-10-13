import { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
} from "@heroicons/react/outline";
import Header from "/components/Header";

const preloadScreenshot = async (url) => {
  return await fetch(
    `https://api.apiflash.com/v1/urltoimage?access_key=fa344043e257465ea72e274ee6f519c1&full_page=true&scroll_page=true&url=${url}`
  );
};

const jsonFetcher = (url, options) => fetch(url, options).then((r) => r.json());

const fetchNextPage = async (offset) => {
  const pageSize = 20;
  return await jsonFetcher("/api/airtable", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pageSize,
      offset,
    }),
  });
};

export default function Home() {
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [startups, setStartups] = useState();
  const [offset, setOffset] = useState();
  const numToPreload = 2;

  // Load init content
  useEffect(async () => {
    const r = await fetchNextPage();
    setStartups(r.startups);
    setOffset(r.offset);

    await preloadScreenshot(r.startups[0].url); // preload first screenshot
    setIsLoading(false); // set loading as false so that first screenshot is rendered

    // preload next 2 screenshots to cache
    for (let i = 1; i <= numToPreload; i++) {
      preloadScreenshot(r.startups[i].url);
    }
  }, []);

  const incrementIndex = async () => {
    const newIdx = index + 1;
    setIndex(newIdx);

    // if only x more startups left in array, get next page of startups
    if (newIdx >= startups.length - (numToPreload + 1)) {
      const next = await fetchNextPage(offset);
      const newStartupsArr = startups.concat(next.startups);
      setStartups(newStartupsArr);
      setOffset(next.offset);
    }
  };

  return (
    <div className="h-screen">
      <Header />
      {isLoading ? (
        <p className="py-24 text-center">Loading...</p>
      ) : (
        <div className='bg-gray-200 px-8 h-full pt-12'> 
        <div className="flex items-center h-full">
          <div className="rounded-lg w-2/3 h-3/4 overflow-y-scroll shadow-lg bg-white">
            <img
              src={`https://api.apiflash.com/v1/urltoimage?access_key=fa344043e257465ea72e274ee6f519c1&full_page=true&scroll_page=true&url=${startups[index].url}`}
            />
          </div>
          <div className="py-16 px-4 mx-auto space-y-4 w-1/3">
            <h1 className="font-semibold text-3xl text-center text-gray-700">
              {startups[index].name}
            </h1>

              <a
                href={startups[index].url}
                target="_blank"
                className="py-2 lg:px-8 mx-8 xl:mx-16 flex justify-center items-center bg-teal-500 font-semibold text-white text-center rounded-3xl shadow-lg hover:bg-teal-600"
              >
                <span className="text-xs md:text-base">View full website</span>
                <ExternalLinkIcon className="mx-1 w-4 h-4 md:w-5 md:h-5" />
              </a>
            <div className="flex justify-between">
              <button
                className="button flex items-center gap-2 p-2 rounded-lg text-teal-600 hover:text-teal-500 disabled:text-gray-300 disabled:cursor-default"
                disabled={index <= 0}
                id="prev"
                onClick={() => setIndex(index - 1)}
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="tracking-wide">PREV</span>
              </button>
              <button
                className="button flex items-center gap-2 p-2 rounded-lg text-teal-600 hover:text-teal-500 disabled:text-gray-300 disabled:cursor-default"
                id="next"
                disabled={index >= startups.length - 1}
                onClick={async () => {
                  incrementIndex();
                  // preload and cache next screenshot
                  preloadScreenshot(startups[index + numToPreload + 1].url);
                }}
              >
                <span className="tracking-wide">NEXT</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
