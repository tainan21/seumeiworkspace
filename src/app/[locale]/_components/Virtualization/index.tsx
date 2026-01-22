import Video from '../Video';
import { Block } from '../block';
import { NewHeading } from '../common/NewHeading';
import { seumeiTexts } from '~/app/lib/seumei-texts';

export default function Virtualization() {
  return (
    <div className="container mx-auto mt-48">
      <div className="flex flex-col items-center justify-center gap-16">
        <NewHeading>
          {seumeiTexts.virtualization.title}
        </NewHeading>
        <div className="lg:px-28 lg:py-12">
          <Video src="table.mp4" poster={'table.webp'} />
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="rounded-[20px] bg-orange">
            <Block
              title={seumeiTexts.virtualization.cards[0].title}
              subTitle={seumeiTexts.virtualization.cards[0].subtitle}
              href={seumeiTexts.virtualization.cards[0].href}
            />
          </div>
          <div className="rounded-[20px] bg-purple">
            <Block
              title={seumeiTexts.virtualization.cards[1].title}
              subTitle={seumeiTexts.virtualization.cards[1].subtitle}
              href={seumeiTexts.virtualization.cards[1].href}
            />
          </div>
          <div className="rounded-[20px] bg-blue">
            <Block
              title={seumeiTexts.virtualization.cards[2].title}
              subTitle={seumeiTexts.virtualization.cards[2].subtitle}
              href={seumeiTexts.virtualization.cards[2].href}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
