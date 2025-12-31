import { ImageResponse } from "next/og";
import { RenderIMGEl } from "~/components/OGImgEl";
import { siteUrl } from "~/config/site";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hasLocale = searchParams.has("locale");
  const locale = hasLocale ? searchParams.get("locale") : "";

  try {
    return new ImageResponse(
      RenderIMGEl({
        logo: siteUrl + "/chad-next.png",
        locale: locale as string,
        image: siteUrl + "/chadnext-homepage.png",
      }),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
