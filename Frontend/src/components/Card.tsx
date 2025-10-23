import { useEffect, useState } from "react";
import { ShareIcon } from "../icons/ShareIcon";

interface CardType {
  title: string,
  type: string,
  link: string,
  id?: string
}

export const Card = (props: CardType) => {
    const [, setYoutubeLink] = useState(props.link);
    const [, setTwitterLink] = useState(props.link);

    const embedUrl = (link: string) => {
      const videoId = new URL(link).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`
    }

    useEffect(() => {
      if(props.type == "youtube") {
        const embeddedUrl = embedUrl(props.link);
        setYoutubeLink(embeddedUrl);
      } else {
        setTwitterLink(link => link.replace("x.com", "twitter.com"))
      }
      console.log(props.type);
    }, []);
    
  return (
    <div className="bg-black w-72 p-4 h-100 overflow-hidden rounded-2xl border border-gray-800 hover:bg-amber-900 transition-all duration-200">
      <div className="flex justify-between w-full h-fit items-center">
        <div className="text-gray-500 hover:text-white transition-colors cursor-pointer">
          <ShareIcon size="size-5"/>
        </div>
        <div className="flex items-center justify-center w-32 text-center text-white font-semibold text-sm">
          {props.title}
        </div>
        <div className="flex gap-2 text-gray-500">
          <div className="hover:text-white transition-colors cursor-pointer">
            <ShareIcon size="size-5"/>
          </div>
          <div className="hover:text-red-500 transition-colors cursor-pointer">
            <ShareIcon size="size-5" />
          </div>
        </div>
      </div>
      {/* <div className="w-full mt-5 h-fit">
        <div className="w-full h-80 no-scrollbar overflow-y-auto">
          {
            props.type == "tweet" &&
            <blockquote className="twitter-tweet" data-theme="dark" data-conversation="none" data-cards="hidden">
                <a href={twitterLink}></a> 
            </blockquote>
          }
          {
            props.type == "youtube" && 
            <iframe
                className="w-full rounded-lg"
                src={youtubeLink}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
            ></iframe>
          }
        </div>
      </div> */}
    </div>
  );
};
