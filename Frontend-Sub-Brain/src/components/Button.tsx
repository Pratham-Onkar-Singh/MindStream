interface ButtonProps {
    variant: "primary" | "secondary";
    size: "sm" | "md" | "lg";
    text: string;
    disabled?: boolean;
    startIcon?: any;
    endIcon?: any;
    onClick?: () => void;
    className?: string
}

const variantStyles = {
    "primary": "bg-white text-black font-bold hover:bg-gray-200",
    "secondary": "bg-black border border-gray-700 text-white hover:bg-zinc-900"
}

const sizeStyles = {
    "sm": "w-fit h-9 text-[0.9rem] px-6 py-5",
    "md": "w-fit h-12 text-[1.1rem] p-3 gap-2",
    "lg": "w-50 h-15 text-[1.2rem] p-5"
}

export const Button = (props: ButtonProps) => {
    // if(props.variant == "primary") {
        return (
            <button 
                onClick={props.onClick}
                disabled={props.disabled || false}
            >
                <div className={`${variantStyles[props.variant]} ${sizeStyles[props.size]} text-md cursor-pointer flex justify-evenly rounded-xl items-center ${props.className}`}>
                    {
                        props.startIcon ? 
                        <div className="flex justify-center items-center">
                            {props.startIcon}
                        </div> : null
                    }
                    <div className="flex font-[350] justify-center items-center">
                        {props.text}
                    </div>
                </div>
            </button>
        )    
    // }
    // return (
    //     <button></button>
    // )
}

{/* <Button variant="primary" text="Add content" size="lg" startIcon={"+"} endIcon={""} onClick={()=>{}}/> */}
