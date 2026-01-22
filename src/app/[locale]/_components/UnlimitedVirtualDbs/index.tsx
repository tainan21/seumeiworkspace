import Image from 'next/image';
import { NewHeading } from '../common/NewHeading';
import { seumeiTexts } from '~/app/lib/seumei-texts';
function Cuber() {
  return (
    <>
      <div className="base absolute bottom-0 left-0 right-0 top-0 h-[219px] w-[203px]">
        <Image src="/cube.svg" alt="3d cube" width={203} height={219} />
      </div>
      <div className="hover absolute bottom-0 left-0 right-0 top-0 h-[219px] w-[203px]">
        <Image src="/cube_purple.svg" alt="3d cube" width={203} height={219} />
      </div>
    </>
  );
}
export default function UnlimitedVirtualDbs() {
  return (
    <div className="container mx-auto mt-20">
      <div className="flex flex-col justify-center gap-16">
        <div className="flex w-full flex-col items-center justify-center">
          <NewHeading>{seumeiTexts.unlimitedVirtualDbs.title1}</NewHeading>
          <NewHeading>{seumeiTexts.unlimitedVirtualDbs.title2}</NewHeading>
        </div>
        <div className="boxes pointer-events-none relative -ml-28 flex w-full shrink-0 justify-center sm:-ml-10 lg:pointer-events-auto lg:pt-16">
          <div className="relative scale-[.42] md:scale-50 lg:scale-100">
            <div className="pointer-events-none absolute -z-10 hidden h-full w-full bg-overlay opacity-20 blur-[240px] lg:flex"></div>

            <div className="boxes-bg pointer-events-none absolute left-0 top-0 hidden h-full w-full opacity-0 transition-opacity duration-500 lg:flex">
              <Image
                src="/cube_bottom_right.svg"
                alt="3d cube"
                className="absolute left-[0px] top-[223px]"
                width={203}
                height={219}
              />
              <Image
                src="/cube_bottom_left.svg"
                alt="3d cube"
                className="absolute left-[486px] top-[292px]"
                width={203}
                height={219}
              />
              <div className="absolute -bottom-[180px] -left-2 -right-2 h-56 bg-fade"></div>
            </div>

            <div className="pointer-events-none max-w-none opacity-0 lg:max-w-max lg:opacity-100">
              <Image
                src="/cube_backdrop.svg"
                alt="perspective gradient lined platform"
                width={800}
                height={600}
              />
            </div>
            <div className="cube cube-1 absolute left-0 top-0">
              <Cuber />
            </div>
            <div className="cube cube-2 absolute left-0 top-0">
              <Cuber />
            </div>
            <div className="cube cube-3 absolute left-0 top-0">
              <Cuber />
            </div>
            <div className="cube cube-4 absolute left-0 top-0">
              <Cuber />
            </div>
            <div className="cube cube-5 absolute left-0 top-0">
              <Cuber />
            </div>
            <div className="cube cube-6 absolute left-0 top-0">
              <Cuber />
            </div>
          </div>
        </div>

        <div className="-10 relative z-10 flex flex-col items-center justify-center gap-6 md:flex-row md:items-start">
          <div className="max-w-[400px] border-l-4 border-orange pl-5 text-[20px] leading-[24px] xl:text-[24px]">
            {seumeiTexts.unlimitedVirtualDbs.benefits[0]}
          </div>
          <div className="max-w-[400px] border-l-4 border-purple pl-5 text-[20px] leading-[24px] xl:text-[24px]">
            {seumeiTexts.unlimitedVirtualDbs.benefits[1]}
          </div>
          <div className="max-w-[400px] border-l-4 border-blue pl-5 text-[20px] leading-[24px] xl:text-[24px]">
            {seumeiTexts.unlimitedVirtualDbs.benefits[2]}
          </div>
        </div>
      </div>
    </div>
  );
}
