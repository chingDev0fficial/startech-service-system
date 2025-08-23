function TimeList({times}) {
    return (<>
        {times.map(time => (
            <label className="group flex items-center justify-center border border-input rounded-[8px] p-1 cursor-pointer  has-[:checked]:border-[#222831] has-[:checked]:bg-[#222831]">
                <input
                    name="time"
                    type="radio"
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
