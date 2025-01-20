export const ActivitySuggestions = ({
    activities,
  }: {
    activities?: string[];
  }) => {
    return (
      <div className="flex flex-col gap-2">
        {activities && activities.length > 0 ? (
          activities.map((activity, idx) => (
            <div
              key={idx}
              className="bg-muted/50 p-3 rounded-md text-zinc-800 dark:text-zinc-300"
            >
              {activity}
            </div>
          ))
        ) : (
          <div className="text-zinc-500 dark:text-zinc-400">
            Loading activity suggestions...
          </div>
        )}
      </div>
    );
  };
  