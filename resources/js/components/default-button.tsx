import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';

function PrimaryButton({ text, onClick, processing, type = "submit", withLoadingAnimation = false, hoverEffect = true, className = "" }) {
    return (
        <Button type={ type } className={`cursor-pointer border-2 border-[#fc1304] bg-[#fc1304] text-[#ffffff] whitespace-nowrap p-[0.5rem] rounded-[5px] ${ hoverEffect ? "hover:bg-[#ffffff] hover:text-[#fc1304] hover:border-[#fc1304] transition duration-[0.5s]":"hover:bg-[#fc1304] hover:text-[#ffffff] hover:border-[#fc1304]"} ${ className }`} onClick={ onClick } disabled={processing}>
            {(processing && withLoadingAnimation) && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
            { text }
        </Button>
    );
}

function SecondaryButton({ text, onClick, processing, type = "submit", withLoadingAnimation = false, hoverEffect = true, className = "" }) {
    return (
        <Button type={ type } className={`cursor-pointer border-2 border-[#393E46] bg-[#ffffff] text-[#393E46] whitespace-nowrap p-[0.5rem] rounded-[5px] ${ hoverEffect ? "hover:bg-[#393E46] hover:text-[#ffffff] transition duration-[0.5s]":"hover:bg-[#ffffff] hover:text-[#393E46] hover:border-[#393E46]"} ${ className }`} onClick={ onClick } disabled={processing}>
            {(processing && withLoadingAnimation) && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
            { text }
        </Button>
    );
}

export { PrimaryButton, SecondaryButton };