// client/src/components/Loading.tsx

export default function Loading() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mountain-blue"></div>
      <span className="ml-4 text-mountain-blue font-semibold">Loading...</span>
    </div>
  );
}