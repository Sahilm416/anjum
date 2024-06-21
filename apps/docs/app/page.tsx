import Header from "../components/header";
import Contributors from "@/components/contributors";
export default function HomePage() {
  return (
    <main className="flex h-screen flex-col justify-center items-center text-center w-full">
        <div className="w-full max-w-[800px] flex flex-col gap-3 p-5">
           <Header/>
           <Contributors/>
        </div>
    </main>
  );
}
