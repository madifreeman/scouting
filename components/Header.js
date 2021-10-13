import Link from "next/link";
import { LinkedInIcon, FacebookIcon, TwitterIcon } from "/public/icons";

export default function Header() {
  const socials = [
    {
      name: "LinkedIn",
      icon: <LinkedInIcon width="5" />,
      link: "https://www.linkedin.com/showcase/startupbootcamp-australia",
    },
    {
      name: "Facebook",
      icon: <FacebookIcon width="5" />,
      link: "https://www.facebook.com/sbcAUS",
    },
    {
      name: "Twitter",
      icon: <TwitterIcon width="5" />,
      link: "https://twitter.com/sbcaus",
    },
  ];
  return (
    <header className="z-30 w-full bg-gray-800 shadow py-3 px-6 flex justify-between absolute top-0">
      <img
        alt="Startupbootcamp Australia logo"
        src="https://www.startupbootcamp.com.au/_next/image?url=%2Fimg%2Flogos%2Fsbc-primary-teal-light.svg&w=384&q=75"
        className="w-auto h-8 mb-1"
      />
      <div className="flex items-center gap-3">
        {socials.map((social) => (
          <Link href={social.link} key={social.link}>
            <a className="text-white opacity-50">{social.icon}</a>
          </Link>
        ))}
      </div>
    </header>
  );
}
