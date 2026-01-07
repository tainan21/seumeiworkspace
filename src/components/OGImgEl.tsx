/* eslint-disable @next/next/no-img-element */

import { Logo } from "~/components/seumei/logo";
export const RenderIMGEl = ({
  logo,
  image,
  locale,
}: {
  logo: string;
  locale: string;
  image: string;
}) => {
  return (
    <div tw="flex relative flex-col p-12 w-full h-full rounded bg-gray-900 text-white items-center">
      <div tw="flex  items-center my-5">
        <Logo size="sm" />
        <div tw="text-xl font-bold tracking-tight text-white">Seumei</div>
        <div
          style={{
            marginLeft: 10,
          }}
        >
          {locale ? "/" + locale : ""}
        </div>
      </div>
      <Logo size="sm" />
    </div>
  );
};
