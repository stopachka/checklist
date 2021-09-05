export default function Button({ className, ...restProps }) {
  return (
    <button
      className={`
        p-2
        bg-blue-800 
        cursor-pointer
        hover:bg-blue-800 
        focus:outline-none 
        focus:border-none 
        focus:ring-2 
        focus:ring-blue-600 
        focus:ring-opacity-50  
        font-bold
        ${className}
    `}
      {...restProps}
    />
  );
}