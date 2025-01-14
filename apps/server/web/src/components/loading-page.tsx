import { Loader } from "./icons";
export function LoadingPage() {
  return (
    <div className="h-screen w-full flex justify-center items-center gap-6 text-lg">
      <Loader size={30} className="animate-spin delay-500" />{" "}
      <span>Loading...</span>
    </div>
  );
}
