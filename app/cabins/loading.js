import Spinner from "@/app/_components/Spinner";

export default function Loading() {
  return (
    <div className="grid items-center justify-center">
      <Spinner />
      <p className="xl">Loading Cabin Data...</p>
    </div>
  );
}
