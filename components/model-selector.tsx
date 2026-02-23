type Props = {
    model: string;
    setModel: React.Dispatch<React.SetStateAction<string>>;
}

export function ModelSelector({model, setModel}: Props) {

    const handleChangeModelSelector = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setModel(e.target.value);
    }

    return (
        <>
            <h2 className="bg-gray-700 text-white px-3">モデル選択</h2>
            <select
                value={model}
                onChange={handleChangeModelSelector}
                className="border border-gray-300 mx-3"
            >
                <option value="gemini-3-flash-preview">Gemini 3 flash preview</option>
                <option value="gemini-2.5-pro">Gemini 2.5 pro</option>
                <option value="gemini-2.5-flash">Gemini 2.5 flash</option>
                <option value="gemini-2.5-flash-preview-09-2025">Gemini 2.5 flash preview</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 flash lite</option>
                <option value="gemini-2.5-flash-lite-preview-09-2025">Gemini 2.5 flash lite preview</option>
                <option value="gemma-3-27b-it">Gemma 3</option>
            </select>
        </>
    )
}