import Image from 'next/image';
import AnimatedGradient from '../../AnimatedGradient';
import TextTyper from './TextTyper';
import { seumeiTexts } from '~/app/lib/seumei-texts';

export function HeroText() {
  return (
    <div className="flex flex-col gap-8">   
      <h1 className="flex flex-col gap-2 text-[42px] leading-[42px] lg:text-[96px] lg:leading-[96px]">
        <div className="flex flex-col items-start gap-2 font-medium lg:flex-row lg:items-center">
          {seumeiTexts.hero.main}{' '}
          <div className="gradient-dashed-border relative overflow-hidden rounded-[20px] px-6 py-3">
            <div className="overflow-hidden whitespace-nowrap bg-black bg-gradient-text bg-clip-text leading-[48px] text-transparent subpixel-antialiased lg:leading-[120px]">
              <TextTyper words={[...seumeiTexts.hero.rotatingWords]} />
            </div>
          </div>
        </div>
        <div>{seumeiTexts.hero.suffix}</div>
      </h1>
      <h2 className="text-[24px] leading-[24px] xl:text-[32px] xl:leading-[32px]">
        {seumeiTexts.hero.subtitle}
      </h2>
      <div className="flex items-center justify-start gap-4">
        <a href="https://console.thenile.dev" className="flex">
          <button className="flex h-11 flex-row items-center gap-2 rounded-[10px] bg-blue px-4 py-2 text-[16px] leading-[20px] text-black transition-colors">
            {seumeiTexts.hero.cta}
            <Image
              className="-ml-1 invert"
              src="/icons/arrow.svg"
              alt="arrow"
              width={16}
              height={16}
            />
          </button>
        </a>
      </div>
    </div>
  );
}

export function HeroBottom({
  cta = (
    <>
      <div className="flex shrink-0 flex-row text-[24px] leading-[28px] text-black lg:text-[48px] lg:leading-[52px]">
        {seumeiTexts.heroBottom.brand}.
      </div>
    </>
  ),
}: {
  cta?: React.ReactNode;
}) {
  return (
    <div className="container mx-auto">
      <div className="mt-20 w-full">
        <AnimatedGradient>
          <div className="flex flex-col gap-4 px-4 py-6 lg:p-10 lg:pt-48">
            <div className="flex flex-col gap-1">
              <div className="text-[24px] font-semibold leading-[28px] text-black lg:text-[48px] lg:leading-[52px]">
                {seumeiTexts.heroBottom.title}
              </div>
              <div className="flex flex-col gap-1 text-[24px] leading-[28px] text-black md:flex-row md:items-center lg:gap-2 lg:text-[48px] lg:leading-[52px]">
                <div className="whitespace-nowrap">{seumeiTexts.heroBottom.subtitle}</div>
                {cta}
              </div>
            </div>
            <div className="flex items-center justify-start gap-4">
              <a href="https://console.thenile.dev" className="flex">
                <button className="flex h-11 flex-row items-center gap-2 rounded-[10px] bg-blue px-4 py-2 text-[16px] leading-[20px] text-black transition-colors">
                  {seumeiTexts.heroBottom.cta}
                  <Image
                    className="-ml-1 invert"
                    src="/icons/arrow.svg"
                    alt="arrow"
                    width={16}
                    height={16}
                  />
                </button>
              </a>
            </div>
          </div>
        </AnimatedGradient>
      </div>
    </div>
  );
}
