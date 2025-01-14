import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-bold text-th-red">Page not found.</h1>
      <Link href="/">
        <Button variant="outline" className="mt-4">
          Go Back
        </Button>
      </Link>
    </div>
  );
}
