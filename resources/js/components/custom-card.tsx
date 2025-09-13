import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/icon";
import { PrimaryButton } from "@/components/default-button";

function CustomCard({icon, iconColor, title, content, buttonText, onButtonClick}) {
    const colorClasses = {
        blue: ["bg-blue-500/30", "text-blue-700"],
        green: ["bg-green-500/30", "text-green-700"],
        purple: ["bg-purple-500/30", "text-purple-700"]
    };

    return (
        <Card className="lg:w-[400px] w-full bg-white shadow-lg m-4 border border-transparent">
            <CardHeader>
                <Avatar className={`h-12 w-12 text-black flex items-center justify-center ${colorClasses[iconColor][0]}`}>
                    <Icon iconNode={icon} className={colorClasses[iconColor][1]} strokeWidth={2} />
                </Avatar>
                <CardTitle className="text-lg font-semibold text-[#222831]">{ title }</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-[20px]">
                { content && content.map((item, index) => (
                    <p key={index} className="flex justify-between text-[#393E46] text-[0.8rem]">
                        <span>{item.name}</span>
                        <span className="font-semibold">{item.price}</span>
                    </p>
                ))}
            </CardContent>

            {/* <div className="w-[100%] pl-[20px] pr-[20px]"> */}
            {/*     <PrimaryButton text={ buttonText } onClick={ onButtonClick } className="w-[100%]" /> */}
            {/* </div> */}
        </Card>
    );
}

export { CustomCard };
