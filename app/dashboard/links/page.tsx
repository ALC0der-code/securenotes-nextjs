
import dynamic from "next/dynamic";

const LinksPage = dynamic(() => import("@/components/links-page-client"), {
  ssr: false,
});

export default function Links() {
  return <LinksPage />;
}
