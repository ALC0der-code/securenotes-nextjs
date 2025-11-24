
import dynamic from "next/dynamic";

const SettingsPage = dynamic(() => import("@/components/settings-page-client"), {
  ssr: false,
});

export default function Settings() {
  return <SettingsPage />;
}
