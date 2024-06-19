import Header from "@/components/header";
export default function HomePage() {
  return (
    <main className="flex h-screen flex-col justify-center items-center text-center w-full">
        <div className="w-full max-w-[800px] flex justify-center sm:p-0 p-5">
           <Header/>
        </div>
    </main>
  );
}
