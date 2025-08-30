import { Radio } from "@material-tailwind/react";

interface serviceListProps {
    options: string[],
    value:string,
    onChange: (option: string) => void;
}

function CustomRadio({options, name, value, onChange}: serviceListProps) {
    return (<>
        {options.map(option => (
            <label className="flex items-center border border-input rounded-[20px] gap-5 p-5 cursor-pointer  has-[:checked]:border-[#222831]">
                <input
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={() => onChange(option.value)}
                    className="h-4 w-4 appearance-none rounded-full border border-gray-400 checked:bg-[#222831] checked:ring-2 checked:ring-[#222831] checked:border-white"
                />
                <div className="flex flex-col">
                    <span className="font-medium text-[#222831]">{option.title}</span>
                    <span className="font-thin text-[#393E46]">{option.sub}</span>
                </div>
            </label>
        ))}
    </>);
}

export { CustomRadio };
