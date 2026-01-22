import Image from 'next/image';

import ChartHover from './ChartHover';

import Box from './Box';
import { NewHeading } from '../common/NewHeading';
import { seumeiTexts } from '~/app/lib/seumei-texts';

export default function BottomFour() {
  return (
    <div className="container mx-auto mt-44 flex flex-col gap-16">
      <div className="flex flex-col items-center justify-center">
        <NewHeading>
          {seumeiTexts.bottomFour.title}
        </NewHeading>
      </div>
      <div className="flex flex-row flex-wrap">
        <div className="mb-6 w-full lg:h-[640px] lg:w-1/2 xl:h-[720px]">
          <div className="h-full lg:pr-3">
            <Box
              title={seumeiTexts.bottomFour.cards[0].title}
              bullets={seumeiTexts.bottomFour.cards[0].bullets}
            >
              <Image src="/bottom-four/fine-grained-branching.svg" alt="lines with dots" width={400} height={300} />
            </Box>
          </div>
        </div>
        <div className="mb-6 w-full lg:h-[640px] lg:w-1/2 xl:h-[720px]">
          <div className="h-full lg:pl-3">
            <div className="relative h-full">
              <ChartHover />
              <Box
                title={seumeiTexts.bottomFour.cards[1].title}
                bullets={seumeiTexts.bottomFour.cards[1].bullets}
              >
                <div className="relative px-10 pb-10">
                  <div className="flex flex-col gap-14">
                    <div className="flex flex-row items-center gap-2">
                      <div className="w-[32px] text-right font-inter text-xs">
                        1,950
                      </div>
                      <div className="w-full border-b opacity-10"></div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <div className="w-[32px] text-right font-inter text-xs">
                        1,350
                      </div>
                      <div className="w-full border-b opacity-10"></div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <div className="w-[32px] text-right font-inter text-xs">
                        650
                      </div>
                      <div className="w-full border-b opacity-10"></div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <div className="w-[32px] text-right font-inter text-xs">
                        0
                      </div>
                      <div className="w-full border-b opacity-10"></div>
                    </div>
                  </div>
                </div>
              </Box>
            </div>
          </div>
        </div>
        <div className="mb-3 w-full lg:h-[720px] lg:w-1/2">
          <div className="h-full overflow-hidden lg:pr-3">
            <Box
              title={seumeiTexts.bottomFour.cards[2].title}
              bullets={seumeiTexts.bottomFour.cards[2].bullets}
            >
              <div className="relative h-[255px] origin-top-left scale-[0.534] pl-10 pt-10 md:scale-[0.634] lg:origin-left lg:scale-[.74] lg:pt-0 xl:scale-[0.841] 2xl:scale-100">
                <div
                  className="absolute"
                  style={{
                    transform: 'translate(0px, 186px)',
                  }}
                >
                  <Image src="/bottom-four/table-1.svg" alt="graphs" width={200} height={150} />
                </div>
                <div>
                  <Image
                    className="absolute"
                    src="/bottom-four/table-2.svg"
                    alt="graphs"
                    width={200}
                    height={150}
                    style={{
                      transform: 'translate(420px, 44px)',
                    }}
                  />
                </div>
                <div className="absolute">
                  <Image
                    src="/bottom-four/table-3.svg"
                    alt="graphs"
                    width={200}
                    height={150}
                    style={{
                      transform: 'translate(420px, 210px)',
                    }}
                  />
                </div>
                <div className="absolute">
                  <Image src="/bottom-four/table-4.svg" alt="graphs" width={200} height={150} />
                </div>
                <div className="absolute">
                  <Image
                    src="/bottom-four/link-1.svg"
                    alt="graphs"
                    width={100}
                    height={50}
                    style={{
                      transform: 'translate(320px, 120px)',
                    }}
                  />
                </div>
                <div className="absolute">
                  <Image
                    src="/bottom-four/link-2.svg"
                    alt="graphs"
                    width={100}
                    height={50}
                    style={{
                      transform: 'translate(322px, 50px)',
                    }}
                  />
                </div>
                <div className="absolute">
                  <Image
                    src="/bottom-four/link-3.svg"
                    alt="graphs"
                    width={100}
                    height={50}
                    style={{
                      transform: 'translate(386px, 128px)',
                    }}
                  />
                </div>
              </div>
            </Box>
          </div>
        </div>
        <div className="mb-3 w-full lg:h-[720px] lg:w-1/2">
          <div className="h-full lg:pl-3">
            <Box
              title={seumeiTexts.bottomFour.cards[3].title}
              bullets={seumeiTexts.bottomFour.cards[3].bullets}
            >
              <div className="flex items-center justify-center px-8">
                <Image src="/bottom-four/backups.svg" alt="linked databases invert" width={400} height={300} />
              </div>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}
