import { BiLoaderAlt } from "react-icons/bi";

export default function Loader() {
    return (
        <div className="flex w-full h-full items-center justify-center">
            
            <BiLoaderAlt className="animate-spin text-5xl text-blue-400" />
        </div>
    );
}
