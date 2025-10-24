const textareaStyles = {
    "default": "w-full bg-black text-white border border-gray-800 py-3 px-4 rounded-lg placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
}

export const Input = ({ placeholder, onChange, reference, className, type = "text" }: {
    placeholder: string, 
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void, 
    reference?: any,
    className?: string,
    type?: string
}) => {
    return <div className="mb-4 mt-4">
        <input type={type} ref={reference} placeholder={placeholder} onChange={onChange} className={`${textareaStyles.default} ${className} `}>
        </input>
    </div> 
}