export function HomeIndicator({ className = "bg-neutral-900/80" }: { className?: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-30 flex justify-center">
      <div className={`h-[5px] w-[134px] rounded-full ${className}`} />
    </div>
  );
}
