export const ParentingTips = ({ tips }: { tips?: string[] }) => {
    return (
      <div className="flex flex-col gap-2">
        {tips && tips.length > 0 ? (
          tips.map((tip, idx) => (
            <div
              key={idx}
              className="bg-muted/50 p-3 rounded-md text-zinc-800 dark:text-zinc-300"
            >
              {tip}
            </div>
          ))
        ) : (
          <div className="text-zinc-500 dark:text-zinc-400">Loading tips...</div>
        )}
      </div>
    );
  };
  