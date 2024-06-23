const Title = () => {
    return (
      <div className="flex items-center gap-3 p-2">
        <div className="w-11 h-11 rounded-full overflow-hidden">
          <img
            className="object-cover hidden dark:block w-full h-full"
            src={"/dark.png"}
            alt="logo"
          />
          <img
            className="object-cover dark:hidden w-full h-full"
            src={"/light.png"}
            alt="logo"
          />
        </div>
        <p className="text-md font-semibold">Project anjum</p>
      </div>
    );
  };
  
  export default Title;
  