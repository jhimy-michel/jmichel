const RocketIcon = (props) => {
  return (
    <svg
      width={20}
      height={20}
      className="w-5 inline-block transition-transform group-hover:rotate-[20deg]"
      viewBox="0 0 40 40"
      fill="currentColor"
      {...props}
    >
      <circle cx="20" cy="20" r="18" fill="#FF5733" />

      <circle cx="20" cy="20" r="14" fill="#FFC0CB" />
      {/* Rocket Nose (optional) */}
      {/* <path
        fill="#4A90E2" // You can change the color
        d="M24.9,9.3c-5.6,5.6-9.7,11.2-12.3,18.7c-0.3,1-0.2,1.9,0.3,2.6c0.5,0.7,1.3,1.2,2.3,1.4c0.2,0,0.4,0,0.6,0c7.5-2.6,13.1-6.7,18.7-12.3c1.1-1.1,1.1-2.9,0-4C27.8,8.2,26,8.2,24.9,9.3z"
      /> */}
    </svg>
  )
}

export default RocketIcon
