interface TimeListProps {
    times: string[];
    value: string; // current selected time
    onChange: (time: string) => void;
}

function TimeList({times, name, value, onChange}: TimeListProps) {
    return (<>
        {times.map(time => (
            <label key={time} className="group flex items-center justify-center border border-input rounded-[8px] p-1 cursor-pointer  has-[:checked]:border-[#222831] has-[:checked]:bg-[#222831]">
                <input
                    type="radio"
                    name={name}
                    value={time}
                    checked={value === time}
                    onChange={() => onChange(time)}
                    className="appearance-none"
                />
                <div className="flex items-center justify-center">
                <span className="font-thin text-[13px] text-[#222831] group-has-[:checked]:text-[#ffffff]">{time}</span>
                </div>
            </label>
        ))}
    </>)
}

export { TimeList };
