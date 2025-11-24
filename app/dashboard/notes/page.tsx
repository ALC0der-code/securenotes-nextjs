
import dynamic from "next/dynamic";

const NotesPage = dynamic(() => import("@/components/notes-page-client"), {
  ssr: false,
});

export default function Notes() {
  return <NotesPage />;
}
