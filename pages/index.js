import { useState, useEffect, useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  StarIcon as StarIconOutline,
  TrashIcon as TrashIconOutline,
  ExclamationIcon,
} from "@heroicons/react/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/solid";
import { RadioGroup } from "@headlessui/react";
import Header from "/components/Header";

const api_flash_key = "4580b98f4e77497998027cb605aba44c";
const preloadScreenshot = async (url) => {
  const res = await fetch(
    `https://api.apiflash.com/v1/urltoimage?access_key=${api_flash_key}&full_page=true&scroll_page=true&url=${url}`
  );
  return res;
};

const jsonFetcher = (url, options) => fetch(url, options).then((r) => r.json());

const fetchNextPage = async (offset) => {
  const pageSize = 10;
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

const updateStartupRating = async (startupId, rating, isJunk) => {
  const ratingVal = rating === 0 ? null : rating;
  return await jsonFetcher("/api/airtable", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startupId,
      rating: ratingVal,
      isJunk,
    }),
  });
};

const NextAndPrev = ({ startups, index }) => (
  // Hidden render of next and prev to ensure fast loading
  <div className="hidden">
    {index > 0 && (
      <img
        src={`https://api.apiflash.com/v1/urltoimage?access_key=${api_flash_key}&full_page=true&scroll_page=true&width=1200&url=${
          startups[index - 1].url
        }`}
      />
    )}
    <img
      src={`https://api.apiflash.com/v1/urltoimage?access_key=${api_flash_key}&full_page=true&scroll_page=true&width=1200&url=${
        startups[index + 1].url
      }`}
    />{" "}
  </div>
);

const StarRating = ({ startupId, starRating, setStarRating, onJunkClick }) => {
  const numStars = 5;
  return (
    <div className="flex gap-8 justify-end lg:block">
      <RadioGroup
        value={starRating}
        onChange={(rating) => {
          setStarRating(rating);
          updateStartupRating(startupId, rating);
        }}
        className="flex justify-center"
      >
        <RadioGroup.Label className="sr-only">Star Rating</RadioGroup.Label>
        {Array.from(Array(numStars).keys()).map((key) => {
          const val = key + 1;
          return (
            <div
              onClick={() => {
                // if clicked the already selected star value, reset to 0
                if (val === starRating) {
                  setStarRating(0);
                  updateStartupRating(startupId, null);
                }
              }}
            >
              <RadioGroup.Option key={val} value={val}>
                {val > starRating ? (
                  <StarIconOutline className="h-7 w-7 text-teal-600 cursor-pointer lg:h-8 lg:w-8" />
                ) : (
                  <StarIconSolid className="h-7 w-7 text-teal-600 cursor-pointer lg:h-8 lg:w-8" />
                )}
              </RadioGroup.Option>
            </div>
          );
        })}
      </RadioGroup>
      <TrashIconOutline
        className="h-7 w-7 text-gray-400 cursor-pointer hover:text-teal-400 lg:mt-8 lg:mx-auto  lg:h-8 lg:w-8"
        onClick={() => onJunkClick()}
      />
    </div>
  );
};

export default function Home() {
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [startups, setStartups] = useState();
  const [offset, setOffset] = useState();
  const [starRating, setStarRating] = useState(0);
  const [isImgError, setIsImgError] = useState(false);
  const [isScreenshotLoading, setIsScreenshotLoading] = useState(true);
  const previewRef = useRef(null);
  const numToPreload = 5;

  // On init load
  useEffect(async () => {
    const r = await fetchNextPage();
    setStartups(r.startups);
    setOffset(r.offset);

    await preloadScreenshot(r.startups[0].url); // preload first screenshot
    setIsLoading(false); // set loading as false so that first screenshot is rendered
  }, []);

  useEffect(() => {
    // add keyboard event listeners
    if (startups) {
      document.addEventListener("keydown", (e) => {
        if (e.code.startsWith("Digit")) {
          const rating = parseInt(e.code.slice(-1));
          if ((rating) => 0 && rating <= 5) {
            setStarRating(rating);
            updateStartupRating(startups[index].id, rating, false);
          }
        } else {
          if (e.code === "ArrowRight") setIndex(index + 1);
          if (e.code === "ArrowLeft" && index > 0) setIndex(index - 1);
        }
      });
    }
  });

  // When index changes
  useEffect(async () => {
    if (startups) {
      // set as screenshot is loading
      setIsScreenshotLoading(true);

      // reset scroll on preview
      previewRef.current.scrollTop = 0;

      // reset star rating
      setStarRating(0);

      // reset img error
      setIsImgError(false);

      // if only x more startups left in array, get next page of startups
      if (index >= startups.length - numToPreload) {
        const next = await fetchNextPage(offset);
        const newStartupsArr = startups.concat(next.startups);
        setStartups(newStartupsArr);
        setOffset(next.offset);
      }
    }
  }, [index]);

  return (
    <div className="h-screen">
      <Header />
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <img src="/loading-spinner.gif" className="h-12 w-12 mx-auto" />
        </div>
      ) : (
        <div className="bg-gray-200 px-8 h-full pt-12">
          <div className="h-full gap-4 space-y-8 lg:space-y-0 lg:flex lg:items-center ">
            {/* Website Preview  */}
            <NextAndPrev startups={startups} index={index} />
            <div
              id="previewWin"
              ref={previewRef}
              className="rounded-lg overflow-y-scroll shadow-xl bg-white h-3/5 mt-16 lg:mt-0 lg:w-2/3 lg:h-5/6 xl:w-3/4"
            >
              {isScreenshotLoading && (
                <div className="flex items-center justify-center h-full text-gray-500 bg-gray-100">
                  <div>
                    <img src="/loading-spinner.gif" className="h-12 w-12" />
                  </div>
                </div>
              )}

              {isImgError ? (
                <div className="flex items-center justify-center h-full text-gray-500 bg-gray-100">
                  <div>
                    <ExclamationIcon className="h-12 w-12 mx-auto" />
                    <p className="font-bold ">Website not found</p>
                  </div>
                </div>
              ) : (
                <img
                  src={`https://api.apiflash.com/v1/urltoimage?access_key=${api_flash_key}&full_page=true&scroll_page=true&width=1200&url=${startups[index].url}`}
                  onError={(e) => setIsImgError(true)}
                  onLoad={() => {
                    console.log("loaded");
                    setIsScreenshotLoading(false);
                  }}
                />
              )}
            </div>
            {/* Control Panel */}
            <div className="relative bg-white shadow-lg rounded-lg mx-auto h-1/4 lg:w-1/3 lg:h-5/6 xl:w-1/4">
              {/* Info & Rating */}
              <div className="flex lg:items-center lg:justify-center h-full lg:flex p-6 overflow-y-scroll">
                <div className="flex w-full justify-between lg:block">
                  <div className="flex flex-col ">
                    <h1 className="font-semibold text-gray-700 text-2xl lg:text-4xl lg:text-center ">
                      {startups[index].name}
                    </h1>

                    {/* Location */}
                    <div className="text-lg text-gray-400 lg:mt-3 lg:text-center lg:font-semibold">
                      <span>
                        {startups[index].city && `${startups[index].city}, `}
                      </span>
                      <span>
                        {startups[index].country &&
                          `${startups[index].country}`}
                      </span>
                    </div>

                    {/* Website Link */}
                    <div className="lg:mt-12 w-40 lg:w-60 lg:mx-auto">
                      <a
                        href={startups[index].url}
                        target="_blank"
                        className="mt-4 flex items-center font-semibold text-teal-600 rounded-3xl hover:text-teal-500 lg:py-2 lg:mt-0 lg:hover:text-white lg:hover:bg-teal-600 lg:justify-center lg:shadow-lg lg:text-white lg:text-center lg:px-8 lg:bg-teal-500"
                      >
                        <span className="text-sm lg:text-base">
                          View full website
                        </span>
                        <ExternalLinkIcon className="mx-1 w-4 h-4 md:w-5 md:h-5" />
                      </a>
                    </div>
                  </div>

                  {/* Rating and Junk */}
                  <div className="flex flex-col justify-between">
                    <div className="lg:mt-8 order-last lg:order-first">
                      <StarRating
                        startupId={startups[index].id}
                        onJunkClick={() => {
                          updateStartupRating(startups[index].id, null, true);
                          setIndex(index + 1);
                        }}
                        starRating={starRating}
                        setStarRating={setStarRating}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Page navigation */}
              <div className="flex justify-between bg-gray-100 absolute inset-x-0 bottom-0 p-3 lg:p-5 rounded-b-lg">
                <button
                  className="button flex items-center gap-2 rounded-lg text-teal-600 hover:text-teal-500 disabled:text-gray-300 disabled:cursor-default"
                  disabled={index <= 0}
                  id="prev"
                  onClick={() => setIndex(index - 1)}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  <span className="tracking-wide font-semibold">PREV</span>
                </button>
                <button
                  className="button flex items-center gap-2 rounded-lg text-teal-600 hover:text-teal-500 disabled:text-gray-300 disabled:cursor-default"
                  id="next"
                  disabled={index >= startups.length - 1}
                  onClick={async () => {
                    setIndex(index + 1);
                  }}
                >
                  <span className="tracking-wide font-semibold">NEXT</span>
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
