export const Textarea = ({ placeholder, onChange, reference, className, rows = 4 }: {
    placeholder: string, 
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, 
    reference?: any,
    className?: string,
    rows?: number
}) => {
    return <div className="mb-4 mt-4">
        <textarea 
            ref={reference} 
            placeholder={placeholder} 
            onChange={onChange} 
            rows={rows}
            className={`${className} w-full bg-black text-white border border-gray-800 py-3 px-4 rounded-lg placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors resize-none`}
        />
    </div> 
}
