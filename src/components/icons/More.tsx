const More = ({ className, orientation = 'left' }: { className?: string, orientation?: 'left' | 'right' }) => {
  return (
    <svg aria-label="More" role="img" viewBox="0 0 24 24" fill="currentColor" height="24px" width="24px" className={className}>
      <title>More</title>
      <rect rx="1.25" x="3" y="7" width="21px" height="2.5px"></rect>
      <rect rx="1.25" x={`${orientation === 'left' ? '3' : '10'}`} y="15" width="14px" height="2.5px"></rect>
    </svg>
  )
}

export default More
