import { Block } from '../block';
import { NewHeading } from '../common/NewHeading';
import HoverEffect from './HoverEffect';
import { seumeiTexts } from '~/app/lib/seumei-texts';

export default function EmbeddingsCost() {
  return (
    <div className="container mx-auto mt-32 xl:px-24">
      <div className="flex flex-col gap-16">
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center">
            <NewHeading>
              {seumeiTexts.embeddingsCost.title}
            </NewHeading>
          </div>
          <div>
            <div className="flex flex-col items-center justify-center">
              <div className="max-w-[823px] text-center text-[16px] leading-[20px] xl:text-[24px] xl:leading-[24px]">
                {seumeiTexts.embeddingsCost.description}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-20 lg:flex-row">
          <div className="flex flex-1 flex-col gap-6">
            <div className="rounded-[20px] bg-orange">
              <Block
                title={seumeiTexts.embeddingsCost.cards[0].title}
                subTitle={seumeiTexts.embeddingsCost.cards[0].subtitle}
                href={seumeiTexts.embeddingsCost.cards[0].href}
              />
            </div>
            <div className="rounded-[20px] bg-purple">
              <Block
                title={seumeiTexts.embeddingsCost.cards[1].title}
                subTitle={seumeiTexts.embeddingsCost.cards[1].subtitle}
                href={seumeiTexts.embeddingsCost.cards[1].href}
              />
            </div>
            <div className="rounded-[20px] bg-blue">
              <Block
                title={seumeiTexts.embeddingsCost.cards[2].title}
                subTitle={seumeiTexts.embeddingsCost.cards[2].subtitle}
                href={seumeiTexts.embeddingsCost.cards[2].href}
              />
            </div>
          </div>
          <HoverEffect />
        </div>
      </div>
    </div>
  );
}
