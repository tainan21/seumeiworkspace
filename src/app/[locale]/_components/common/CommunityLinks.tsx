import Image from 'next/image';
import Link from 'next/link';

export function CommunityLinks() {
  return (
    <div className="flex w-full flex-col items-center justify-between gap-10 lg:flex-row">
      <Link
        href="https://github.com/niledatabase/niledatabase/discussions"
        target="_blank"
      >
        <div className="itemDivider flex max-w-[296px] flex-col gap-10 p-8">
          <Image
            src="/github-text.svg"
            alt="github text in black and white gradient"
            width={122}
            height={34}
            className="relative z-10"
          />
          <div className="relative z-10 w-[320px] bg-gradient-white bg-clip-text text-center text-[20px] text-transparent">
            Join Github discussions for roadmap and issues
          </div>
        </div>
      </Link>
      <Link href="https://discord.gg/8UuBB84tTy" target="_blank">
        <div className="itemDivider flex max-w-[296px] flex-col gap-10 p-8">
          <Image
            src="/discord.svg"
            alt="github text in black and white gradient"
            width={189}
            height={52}
            className="relative z-10"
          />
          <div className="relative z-10 w-[320px] bg-gradient-white bg-clip-text text-center text-[20px] text-transparent">
            Participate in online conversations and forums
          </div>
        </div>
      </Link>
      <Link href="https://x.com/niledatabase" target="_blank">
        <div className="itemDivider flex max-w-[296px] flex-col gap-10 p-8">
          <Image
            src="/x.svg"
            alt="github text in black and white gradient"
            width={47}
            height={44}
            className="relative z-10"
          />
          <div className="relative z-10 w-[280px] bg-gradient-white bg-clip-text text-center text-[20px] text-transparent">
            Follow us on X to learn and network
          </div>
        </div>
      </Link>
    </div>
  );
}
