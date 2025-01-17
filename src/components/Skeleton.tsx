/* eslint-disable react/no-array-index-key */
const Skeleton = () => {
  const getRandomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  return (
    <div className="flex flex-col gap-12 px-6 py-4">
      {[...Array(7)].map((_, index) => (
        <div key={index} className="grid grid-cols-[36px_minmax(0,_1fr)] gap-x-3">
          <div>
            <div
              aria-label="Loading..."
              role="status"
              className="size-9 animate-glimmer rounded-full bg-gray-4"
              tabIndex={-1}
              style={{
                animationDelay: `calc(${index} * 500ms)`,
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            {/* Line widths for each group */}
            {[
              { width: `${getRandomInRange(20, 25)}%` },
              { width: `${getRandomInRange(75, 95)}%` },
              { width: `${getRandomInRange(20, 80)}%` },
            ].map((style, innerIndex) => (
              <div key={innerIndex} className="" style={style}>
                <div
                  aria-label="Loading..."
                  role="status"
                  className="h-[15px] w-full animate-glimmer rounded-md bg-gray-4"
                  tabIndex={-1}
                  style={{
                    animationDelay: `calc(${innerIndex} * 500ms)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Skeleton
