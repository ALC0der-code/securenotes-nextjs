
import dynamic from "next/dynamic";

const PasswordsPage = dynamic(() => import("@/components/passwords-page-client"), {
  ssr: false,
});

export default function Passwords() {
  return <PasswordsPage />;
}
