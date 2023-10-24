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
     {/* Rocket Body */}
     <path
       fill="#FF5733"  // You can change the color
       d="M15.8,31.8h8.4c0.9,0,1.7-0.8,1.7-1.7c0-6.6,2.6-12.9,7.2-17.6c5.2-5.2,12.2-8.2,19.6-8.2c0.9,0,1.7-0.8,1.7-1.7v-8.4c0-0.9-0.8-1.7-1.7-1.7C36.4,0,30,2.6,24.8,7.8c-4.9,4.9-7.7,11.4-7.8,18.3c-0.1,0.9,0.7,1.7,1.6,1.7H15.8z"
     />

     {/* Rocket Nose */}
     <path
       fill="#4A90E2"  // You can change the color
       d="M24.9,9.3c-5.6,5.6-9.7,11.2-12.3,18.7c-0.3,1-0.2,1.9,0.3,2.6c0.5,0.7,1.3,1.2,2.3,1.4c0.2,0,0.4,0,0.6,0c7.5-2.6,13.1-6.7,18.7-12.3c1.1-1.1,1.1-2.9,0-4C27.8,8.2,26,8.2,24.9,9.3z"
     />
   </svg>
 );
};

export default RocketIcon;
