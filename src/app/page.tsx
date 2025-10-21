import { redirect } from "next/navigation";
import Image from "next/image";

export default function Home() {
  return (
   redirect('/inicio') // Redirect to the 'inicio' page
  );
}
