const Kebab = ({ className }: { className?: string }) => {
  return (
    <svg aria-label="More" role="img" viewBox="0 0 24 24" fill="currentColor" height="20px" width="20px" className={className}>
      <title>More</title>
      <circle cx="12" cy="12" r="1.5"></circle>
      <circle cx="6" cy="12" r="1.5"></circle>
      <circle cx="18" cy="12" r="1.5"></circle>
    </svg>
  )
}

export default Kebab
