import { useEffect, useState } from 'react';

function PopUpMessage({ showPanel, animate, message }) {
    const shortLine = 8; // Length of short part of checkmark
    const longLine = 12; // Length of long part of checkmark

    const animateCheck = `
    .success-checkmark {
        width: 20px;
        height: 28.75px; /* 115px ÷ 4 */
        margin: 0 auto;
        .check-icon {
            width: 20px;
            height: 20px;
            position: relative;
            border-radius: 50%;
            box-sizing: content-box;
            border: 1px solid #222831; /* 4px ÷ 4 */
            &::before {
                top: 0.75px; /* 3px ÷ 4 */
                left: -0.5px; /* -2px ÷ 4 */
                width: 7.5px; /* 30px ÷ 4 */
                transform-origin: 100% 50%;
                border-radius: 25px 0 0 25px; /* 100px ÷ 4 */
            }
            &::after {
                top: 0;
                left: 7.5px; /* 30px ÷ 4 */
                width: 15px; /* 60px ÷ 4 */
                transform-origin: 0 50%;
                border-radius: 0 25px 25px 0; /* 100px ÷ 4 */
                animation: rotate-circle 4.25s ease-in;
            }
            &::before, &::after {
                content: '';
                height: 25px; /* 100px ÷ 4 */
                position: absolute;
                background: #FFFFFF;
                transform: rotate(-45deg);
            }
            .icon-line {
                height: 1.25px; /* 5px ÷ 4 */
                background-color: #222831;
                display: block;
                border-radius: 0.5px; /* 2px ÷ 4 */
                position: absolute;
                z-index: 10;
                &.line-tip {
                    top: 11.5px; /* 46px ÷ 4 */
                    left: 3.5px; /* 14px ÷ 4 */
                    width: 6.25px; /* 25px ÷ 4 */
                    transform: rotate(45deg);
                    animation: icon-line-tip 0.75s;
                }
                &.line-long {
                    top: 9.5px; /* 38px ÷ 4 */
                    right: 2px; /* 8px ÷ 4 */
                    width: 11.75px; /* 47px ÷ 4 */
                    transform: rotate(-45deg);
                    animation: icon-line-long 0.75s;
                }
            }
            .icon-circle {
                top: -1px; /* -4px ÷ 4 */
                left: -1px; /* -4px ÷ 4 */
                z-index: 10;
                width: 20px; /* 80px ÷ 4 */
                height: 20px; /* 80px ÷ 4 */
                border-radius: 50%;
                position: absolute;
                box-sizing: content-box;
                border: 1px solid #393E46; /* 4px ÷ 4 */
            }
            .icon-fix {
                top: 2px; /* 8px ÷ 4 */
                width: 1.25px; /* 5px ÷ 4 */
                left: 6.5px; /* 26px ÷ 4 */
                z-index: 1;
                height: 21.25px; /* 85px ÷ 4 */
                position: absolute;
                transform: rotate(-45deg);
                background-color: #FFFFFF;
            }
        }
    }
    @keyframes rotate-circle {
        0% {
            transform: rotate(-45deg);
        }
        5% {
            transform: rotate(-45deg);
        }
        12% {
            transform: rotate(-405deg);
        }
        100% {
            transform: rotate(-405deg);
        }
    }
    @keyframes icon-line-tip {
        0% {
            width: 0;
            left: 0.25px; /* 1px ÷ 4 */
            top: 4.75px; /* 19px ÷ 4 */
        }
        54% {
            width: 0;
            left: 0.25px; /* 1px ÷ 4 */
            top: 4.75px; /* 19px ÷ 4 */
        }
        70% {
            width: 12.5px; /* 50px ÷ 4 */
            left: -2px; /* -8px ÷ 4 */
            top: 9.25px; /* 37px ÷ 4 */
        }
        84% {
            width: 4.25px; /* 17px ÷ 4 */
            left: 5.25px; /* 21px ÷ 4 */
            top: 12px; /* 48px ÷ 4 */
        }
        100% {
            width: 6.25px; /* 25px ÷ 4 */
            left: 3.5px; /* 14px ÷ 4 */
            top: 11.25px; /* 45px ÷ 4 */
        }
    }
    @keyframes icon-line-long {
        0% {
            width: 0;
            right: 11.5px; /* 46px ÷ 4 */
            top: 13.5px; /* 54px ÷ 4 */
        }
        65% {
            width: 0;
            right: 11.5px; /* 46px ÷ 4 */
            top: 13.5px; /* 54px ÷ 4 */
        }
        84% {
            width: 13.75px; /* 55px ÷ 4 */
            right: 0px; /* 0px ÷ 4 */
            top: 8.75px; /* 35px ÷ 4 */
        }
        100% {
            width: 11.75px; /* 47px ÷ 4 */
            right: 2px; /* 8px ÷ 4 */
            top: 9.5px; /* 38px ÷ 4 */
        }
    }
    `;

    const [animationKey, setAnimationKey] = useState(0);

    // Only update key when showPanel changes from false to true
    useEffect(() => {
        if (showPanel) {
            setAnimationKey(prev => prev + 1);
        }
    }, [showPanel]);

    return (<>
        <style dangerouslySetInnerHTML={{ __html: animateCheck }} />
        <div className="right-0 top-0 p-2 absolute">
            {showPanel && (
                <div className={`relative w-full max-w-sm border border-sidebar-border text-[#222831] dark:text-[#ffffff] shadow-lg transform transition-transform duration-300 flex items-center justify-center bg-[#ffffff] dark:bg-[#393E46] rounded-lg p-3 gap-3
                    ${animate ? "translate-x-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                    {/* <svg width="24" height="24" className="flex-shrink-0" key={ animationKey }> */}
                    {/*     <circle */}
                    {/*     cx="12"        // Center at half of SVG width (50/2 = 25) */}
                    {/*     cy="12"        // Center at half of SVG height (50/2 = 25) */}
                    {/*     r="10" */}
                    {/*     fill="none" */}
                    {/*     stroke="#393E46" */}
                    {/*     strokeWidth="2" */}
                    {/*     className="animate-draw-circle" */}
                    {/*     /> */}
                    {/**/}
                    {/*     <path */}
                    {/*         d="M8 12 L10.5 14.5 L16 9" */}
                    {/*         fill="none" */}
                    {/*         stroke="#393E46" */}
                    {/*         strokeWidth="2.5" */}
                    {/*         strokeLinecap="round" */}
                    {/*         strokeLinejoin="round" */}
                    {/*         className="animate-checkmark" */}
                    {/*     /> */}
                    {/* </svg> */}
                    {/* <div className="w-5 h-5 rounded-full border border-[#393E46] border-t-transparent animate-[wiggle_1s_ease-in-out_infinite] 2s linear forwards flex items-center justify-center"></div> */}
                    <div className="success-checkmark">
                        <div className="check-icon">
                            <span className="icon-line line-tip"></span>
                            <span className="icon-line line-long"></span>
                            <div className="icon-circle"></div>
                            <div className="icon-fix"></div>
                        </div>
                    </div>

                    <div className="whitespace-nowrap">
                        {message}
                    </div>
                </div>
            )}
        </div>

    </>);
}

export { PopUpMessage };
