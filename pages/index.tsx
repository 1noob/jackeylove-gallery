import type { NextPage } from "next";
import cloudinary from "@/utils/cloudinary";
import type { ImageProps } from "@/utils/types";
import { Image } from "@nextui-org/react";
import React, { useLayoutEffect, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import Script from "next/script";
import shuffle from "lodash.shuffle";
import { JackeyLoveLogo } from "@/components/icon";

const Home: NextPage = ({ images }: { images: ImageProps[] }) => {
  const [loaded, setStatus] = useState(false);
  const nodeRef = useRef(null);

  const [data, setData] = useState(shuffle(images).slice(0, 160));

  if (typeof document === "undefined") {
    React.useLayoutEffect = React.useEffect;
  }

  // This will run one time after the component mounts
  useLayoutEffect(() => {
    // callback function to call when event triggers
    const onPageLoad = () => {
      setStatus(true);
    };

    // Check if the page has already loaded
    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad, false);
      // Remove the event listener when component unmounts
      return () => window.removeEventListener("load", onPageLoad);
    }
  }, []);

  return (
    <>
      <Script
        async
        src="https://us.umami.is/script.js"
        data-website-id="61824479-8621-45cf-981c-867d2ac2066d"
      />
      <CSSTransition
        in={loaded}
        timeout={500}
        classNames="loading-page"
        unmountOnExit
      >
        <main>
          <div className="gallery">
            <div className="animate-[scy_80s_linear_infinite] transform-gpu w-max grayscale-[50%]">
              <div className="float-left grid grid-rows-8 grid-flow-col">
                {data.map(({ public_id, format }) => (
                  <Image
                    rel="preload"
                    radius="none"
                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/ar_1:1,c_fill,g_auto,q_30,w_1000/${public_id}.${format}`}
                    width={180}
                    alt={"JackeyLove, TES, IG, LOL, LPL"}
                    loading="eager"
                  />
                ))}
              </div>
              <div className="grid grid-rows-8 grid-flow-col">
                {data.map(({ public_id, format }) => (
                  <Image
                    radius="none"
                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/ar_1:1,c_fill,g_auto,q_30,w_1000/${public_id}.${format}`}
                    width={180}
                    alt={"JackeyLove, TES, IG, LOL , LPL"}
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </CSSTransition>
      <CSSTransition
        in={!loaded}
        timeout={800}
        classNames="loading-page"
        unmountOnExit
        nodeRef={nodeRef}
      >
        {/* 
          使用 safe-area 进行定位会导致抖动
          使用 lvh 会先出现 svh 再延伸为 lvh
        */}
        <div
          className="bg-blur backdrop-blur-xl fixed top-0 w-full h-lvh z-[999]"
          ref={nodeRef}
        >
          <JackeyLoveLogo
            size={300}
            className="h-svh absolute top-0 left-[30%] md:left-[35%] lg:left-[40%] dark:brightness-150 w-[40%] md:w-[30%] lg:w-[20%] m-auto"
          />
        </div>
      </CSSTransition>
    </>
  );
};

export default Home;

export async function getStaticProps() {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by("public_id", "desc")
    .max_results(500)
    .execute();
  let reducedResults: ImageProps[] = [];

  for (let result of results.resources) {
    reducedResults.push({
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
    });
  }

  return {
    props: {
      images: reducedResults,
    },
  };
}