import Header from "../components/header";
import Contributors from "@/components/contributors";
import Downloads from "@/components/downloads";
export default function HomePage() {
  return (
    <main className="flex h-screen flex-col sm:justify-center items-center text-center w-full">
      <div className="w-full max-w-[800px] flex flex-col p-5">
        <Header />
        <div className="flex sm:flex-row gap-10 flex-col p-5">
          <Contributors />
          <Downloads />
        </div>
      </div>
    </main>
  );
}
