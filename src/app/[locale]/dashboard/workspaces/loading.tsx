import { LoadingState } from "~/components/features/shared";

export default function WorkspacesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="bg-muted h-9 w-64 animate-pulse rounded-md" />
        <div className="bg-muted h-5 w-96 animate-pulse rounded-md" />
      </div>
      <LoadingState variant="card" count={4} />
    </div>
  );
}
