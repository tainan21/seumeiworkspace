import Image from 'next/image';
import AnimatedGradient from '../AnimatedGradient';
import { seumeiTexts } from '~/app/lib/seumei-texts';

export default function PurposeBuilt() {
  return (
    <div className="container mx-auto">
      <div className="mt-20 w-full">
        <AnimatedGradient>
          <div className="px-4 py-6 pt-24 lg:px-10 lg:py-10 lg:pt-48">
            <div className="flex gap-3">
              <div className="inline text-[28px] leading-[32px] text-black xl:text-[40px] xl:leading-[44px]">
                <span className="inline-flex w-[84px] shrink-0 items-center pr-1 lg:w-auto lg:pr-3">
                  <Image
                    src="/logo.svg"
                    alt="seumei logo"
                    width={162}
                    height={60}
                    className="translate-y-1 leading-[32px] brightness-0 lg:translate-y-2 xl:leading-[64px]"
                  />
                </span>
                <span>
                  {seumeiTexts.purposeBuilt.text}
                </span>
              </div>
            </div>
          </div>
        </AnimatedGradient>
      </div>
    </div>
  );
}
